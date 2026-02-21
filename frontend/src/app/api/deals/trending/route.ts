import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

/**
 * TRENDING DEALS FEED API
 * Returns hottest deals across all platforms
 * 
 * GET /api/deals/trending
 * Query params: ?category=Electronics&limit=20&sortBy=savingsPercent
 */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || 'Electronics';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const sortBy = url.searchParams.get('sortBy') || 'savingsPercent';

    await connectDB();

    let query: Record<string, any> = { savingsPercent: { $gte: 10 } };
    if (category && category !== 'All') {
      query.category = category;
    }

    const deals = await Product.find(query)
      .sort(
        sortBy === 'trending'
          ? { clicks: -1 }
          : { savingsPercent: -1 }
      )
      .limit(limit)
      .lean();

    // Format response
    const formattedDeals = deals.map((d: any) => ({
      productId: d.ASIN,
      title: d.title,
      price: d.price,
      originalPrice: d.originalPrice || d.price / (1 - (d.savingsPercent || 0) / 100),
      savingsPercent: d.savingsPercent || 0,
      platform: d.platform,
      image: d.image,
      rating: d.rating,
      clicks: d.clicks || 0,
      trending: d.savingsPercent > 20,
      category: d.category || 'Other',
      postedAt: d.createdAt || new Date(),
    }));

    return NextResponse.json({
      success: true,
      category,
      deals: formattedDeals,
      count: formattedDeals.length,
      message: `Found ${formattedDeals.length} trending deals`,
    });
  } catch (error) {
    console.error('Trending deals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending deals', details: (error as Error).message },
      { status: 500 }
    );
  }
}
