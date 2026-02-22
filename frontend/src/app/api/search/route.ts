import { NextResponse } from 'next/server';
import { searchAmazon } from '@/lib/amazon';
import { searchFlipkart, searchMyntra, searchOtherPlatforms } from '@/lib/flipkart';
import { normalizeAmazonItem } from '@/lib/normalize';
import { recognizeProductFromImage } from '@/lib/detect';
import { generateAffiliateLink } from '@/lib/affiliate';
import { savePriceHistory } from '@/lib/priceHistory';
import { withCache, getCache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const searchType = formData.get('searchType') as string;
    let query = '';

    // Determine search query
    if (searchType === 'text') {
      query = formData.get('query') as string;
    } else if (searchType === 'image') {
      const imageFile = formData.get('image') as File;
      if (!imageFile) {
        return NextResponse.json(
          { error: 'Image file is required' },
          { status: 400 }
        );
      }

      // Read image buffer
      const buffer = await imageFile.arrayBuffer();
      const imageBuffer = Buffer.from(buffer);

      // Recognize product from image
      console.log('🖼️  Analyzing image...');
      query = await recognizeProductFromImage(imageBuffer);
      console.log('✅ Image analysis result:', query);
    }

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Searching for:', query);

    // Search all platforms in parallel
    const [amazonResults, flipkartResults, myntraResults, otherResults] =
      await Promise.all([
        searchAmazon(query),
        searchFlipkart(query),
        searchMyntra(query),
        searchOtherPlatforms(query),
      ]);

    // Normalize and prepare products
    const amazonProducts = amazonResults.map((item: any) => {
      const normalized = normalizeAmazonItem(item);
      normalized.affiliateLink = generateAffiliateLink(normalized);
      return normalized;
    });

    const flipkartProducts = flipkartResults.map((item: any) => {
      item.affiliateLink = generateAffiliateLink(item);
      return item;
    });

    const myntraProducts = myntraResults.map((item: any) => {
      item.affiliateLink = generateAffiliateLink(item);
      return item;
    });

    const otherProducts = otherResults.map((item: any) => {
      item.affiliateLink = generateAffiliateLink(item);
      return item;
    });

    // Combine all results
    const allProducts = [
      ...amazonProducts,
      ...flipkartProducts,
      ...myntraProducts,
      ...otherProducts,
    ];

    // Sort by rating and price
    allProducts.sort((a, b) => {
      const ratingDiff = b.rating - a.rating;
      if (ratingDiff !== 0) return ratingDiff;
      return a.price - b.price;
    });

    // Save price history for top products (async, non-blocking)
    allProducts.slice(0, 10).forEach((product: any) => {
      savePriceHistory(product).catch((err) =>
        console.error('Price history save error:', err)
      );
    });

    // Pagination from form data (page, pageSize)
    const pageRaw = formData.get('page') as string | null;
    const pageSizeRaw = formData.get('pageSize') as string | null;
    let page = pageRaw ? parseInt(pageRaw, 10) : 1;
    let pageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : 20;
    if (!Number.isFinite(page) || page < 1) page = 1;
    if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 20;
    const MAX_PAGE_SIZE = 100;
    if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

    const total = allProducts.length;
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const paged = allProducts.slice(start, end);

    const uniquePlatforms = [
      ...new Set(allProducts.map((p) => p.platform)),
    ];

    const isImage = String(searchType) === 'image';

    // Only cache text searches (image searches contain binary/image-specific results)
    if (!isImage) {
      const cacheKey = `search:${query}:page=${page}:size=${pageSize}`;
      const ttl = 60; // seconds

        // try quick read from cache
        const cached = await getCache(cacheKey);
        if (cached) {
          return NextResponse.json(cached);
        }

        // Rate limit per IP for search
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
        const rl = checkRateLimit(`search:${ip}`, 30, 60);
        if (!rl.allowed) {
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

      const payload = {
        success: true,
        query: isImage ? 'Image Search Results' : query,
        products: paged,
        page,
        pageSize,
        total,
        count: paged.length,
        platforms: uniquePlatforms,
        imageSearch: isImage,
      };

      try {
        await withCache(cacheKey, ttl, async () => payload);
      } catch (e) {
        // ignore cache errors
      }

      return NextResponse.json(payload);
    }

    return NextResponse.json({
      success: true,
      query: isImage ? 'Image Search Results' : query,
      products: paged,
      page,
      pageSize,
      total,
      count: paged.length,
      platforms: uniquePlatforms,
      imageSearch: isImage,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}