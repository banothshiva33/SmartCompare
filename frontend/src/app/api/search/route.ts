import { NextResponse } from 'next/server';
import { searchAmazon } from '@/lib/amazon';
import { searchFlipkart, searchMyntra, searchOtherPlatforms } from '@/lib/flipkart';
import { normalizeAmazonItem } from '@/lib/normalize';
import { recognizeProductFromImage } from '@/lib/detect';
import { generateAffiliateLink } from '@/lib/affiliate';
import { savePriceHistory } from '@/lib/priceHistory';
import { withCache, getCache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rateLimit';
import { validateSearchQuery, validateImageFile } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    // ========== Security: Rate Limiting ==========
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const rateLimitResult = checkRateLimit(`search:${ip}`, 30, 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
          }
        }
      );
    }

    const formData = await req.formData();
    const searchType = formData.get('searchType') as string;
    let query = '';

    // ========== Security: Input Validation ==========
    if (!searchType || (searchType !== 'text' && searchType !== 'image')) {
      return NextResponse.json(
        { error: 'Invalid search type. Must be "text" or "image".' },
        { status: 400 }
      );
    }

    // Determine search query
    if (searchType === 'text') {
      const rawQuery = formData.get('query') as string;
      
      // Validate search query
      const validation = validateSearchQuery(rawQuery || '');
      if (!validation.isValid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }
      query = validation.sanitized || '';
    } else if (searchType === 'image') {
      const imageFile = formData.get('image') as File;

      if (!imageFile) {
        return NextResponse.json(
          { error: 'Image file is required for image search' },
          { status: 400 }
        );
      }

      // ========== Security: File Validation ==========
      const fileValidation = validateImageFile(imageFile);
      if (!fileValidation.isValid) {
        return NextResponse.json(
          { error: fileValidation.error },
          { status: 400 }
        );
      }

      // Read image buffer
      const buffer = await imageFile.arrayBuffer();
      const imageBuffer = Buffer.from(buffer);

      // Recognize product from image
      console.log('🖼️ Analyzing image...');
      query = await recognizeProductFromImage(imageBuffer);
      console.log('✅ Image analysis result:', query);

      // Validate the query generated from image
      const queryValidation = validateSearchQuery(query);
      if (!queryValidation.isValid) {
        return NextResponse.json(
          { error: 'Could not recognize product from image' },
          { status: 400 }
        );
      }
      query = queryValidation.sanitized || '';
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

    // ========== Security: Pagination Validation ==========
    const pageRaw = formData.get('page') as string | null;
    const pageSizeRaw = formData.get('pageSize') as string | null;
    let page = pageRaw ? parseInt(pageRaw, 10) : 1;
    let pageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : 20;

    // Validate pagination parameters
    if (!Number.isFinite(page) || page < 1) page = 1;
    if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 20;
    const MAX_PAGE_SIZE = 100; // Prevent abuse
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

      // Try quick read from cache
      const cached = await getCache(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const payload = {
        success: true,
        query: query,
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
        // Ignore cache errors - not critical
        console.warn('Cache error (non-critical):', e);
      }

      return NextResponse.json(payload);
    }

    return NextResponse.json({
      success: true,
      query: 'Image Search Results',
      products: paged,
      page,
      pageSize,
      total,
      count: paged.length,
      platforms: uniquePlatforms,
      imageSearch: isImage,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Search error:', err.message);
    
    // ========== Security: Error Handling ==========
    // Don't expose internal error details to client
    return NextResponse.json(
      {
        error: 'Search operation failed. Please try again later.',
      },
      { status: 500 }
    );
  }
}