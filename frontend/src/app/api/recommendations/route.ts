import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { generateRecommendations, getSimilarProducts, getTrendingByCategory } from '@/lib/recommendations';

/**
 * PERSONALIZED RECOMMENDATIONS API
 * Returns smart product recommendations for the user
 * 
 * POST /api/recommendations
 * Body: { searchHistory: string[], watchlist: string[], category?: string, productId?: string }
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { searchHistory = [], watchlist = [], category, productId } = body;

    await connectDB();

    let recommendations: any[] = [];

    // Case 1: General recommendations based on search history
    if (searchHistory.length > 0) {
      const baseRecs = generateRecommendations(
        searchHistory,
        watchlist,
        category
      );
      recommendations = baseRecs;
    }

    // Case 2: Similar products
    if (productId) {
      const currentProds = await Product.findOne({ ASIN: productId });
      const allProds = await Product.find({}).limit(100).lean();

      if (currentProds) {
        const similar = getSimilarProducts(
          {
            title: currentProds.title,
            category: currentProds.category || 'Other',
            price: currentProds.price,
          },
          allProds.map((p: any) => ({
            title: p.title,
            category: p.category || 'Other',
            price: p.price,
            ASIN: p.ASIN,
          }))
        );

        recommendations = similar.slice(0, 6).map((s) => ({
          productId: s.ASIN,
          reason: `${(s.similarity).toFixed(0)}% match with items you're viewing`,
          relevanceScore: Math.min(s.similarity, 100),
          category,
        }));
      }
    }

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || 'Electronics';

    const trending = getTrendingByCategory(category);

    return NextResponse.json({
      success: true,
      category,
      trending: trending.map((t) => ({
        title: t.title,
        trend: t.trend,
        potentialSavings: t.savings,
        recommendation: t.trend > 80 ? 'Buy Soon' : 'Monitor Price',
      })),
    });
  } catch (error) {
    console.error('Trending fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending', details: (error as Error).message },
      { status: 500 }
    );
  }
}
