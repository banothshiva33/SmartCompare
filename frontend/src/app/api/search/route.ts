import { NextResponse } from 'next/server';
import { searchAmazon } from '@/lib/amazon';
import { searchFlipkart, searchMyntra, searchOtherPlatforms } from '@/lib/flipkart';
import { normalizeAmazonItem } from '@/lib/normalize';
import { recognizeProductFromImage } from '@/lib/detect';
import { generateAffiliateLink } from '@/lib/affiliate';
import { savePriceHistory } from '@/lib/priceHistory';

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

    const uniquePlatforms = [
      ...new Set(allProducts.map((p) => p.platform)),
    ];

    return NextResponse.json({
      success: true,
      query: searchType === 'image' ? 'Image Search Results' : query,
      products: allProducts,
      count: allProducts.length,
      platforms: uniquePlatforms,
      imageSearch: searchType === 'image',
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