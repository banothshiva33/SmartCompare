import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { withCache } from '@/lib/cache';

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
    const sortBy = url.searchParams.get('sortBy') || 'savingsPercent';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const pageSizeRaw = parseInt(url.searchParams.get('pageSize') || '20');
    const MAX_PAGE_SIZE = 100;
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.isFinite(pageSizeRaw) ? pageSizeRaw : 20));

    await connectDB();

    let query: Record<string, any> = { savingsPercent: { $gte: 10 } };
    if (category && category !== 'All') {
      query.category = category;
    }

    const total = await Product.countDocuments(query).catch(() => 0);
    const skip = (page - 1) * pageSize;

    const cacheKey = `trending:${category}:page=${page}:size=${pageSize}:sort=${sortBy}`;

    // Rate limit per IP for trending endpoint
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const { checkRateLimit } = await import('@/lib/rateLimit');
    const rl = checkRateLimit(`trending:${ip}`, 60, 60);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const deals = await withCache(cacheKey, 300, async () => {
      await connectDB();
      return await Product.find(query)
        .sort(
          sortBy === 'trending'
            ? { clicks: -1 }
            : { savingsPercent: -1 }
        )
        .skip(skip)
        .limit(pageSize)
        .lean();
    });

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
      page,
      pageSize,
      total,
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
