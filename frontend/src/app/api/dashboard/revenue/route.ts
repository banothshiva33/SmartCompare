import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AffiliateClick from '@/models/AffiliateClick';
import Watchlist from '@/models/Watchlist';

/**
 * REVENUE DASHBOARD API
 * Returns user revenue metrics from affiliate clicks and conversions
 * 
 * GET /api/dashboard/revenue?email=user@example.com
 */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email') || 'demo@example.com';

    await connectDB();

    // Get all affiliate clicks
    const allClicks = await AffiliateClick.find({}).lean();

    // Calculate statistics
    const totalClicks = allClicks.length;
    const clicksByPlatform = allClicks.reduce(
      (acc: Record<string, number>, click: any) => {
        acc[click.platform] = (acc[click.platform] || 0) + 1;
        return acc;
      },
      {}
    );

    // Calculate estimated revenue
    const commissionRates: Record<string, number> = {
      Amazon: 0.03,
      Flipkart: 0.05,
      Myntra: 0.1,
      Ajio: 0.08,
    };

    let totalRevenue = 0;
    const revenueByPlatform: Record<string, number> = {};

    allClicks.forEach((click: any) => {
      const rate = commissionRates[click.platform] || 0.02;
      const revenue = click.price * rate;
      totalRevenue += revenue;
      revenueByPlatform[click.platform] =
        (revenueByPlatform[click.platform] || 0) + revenue;
    });

    // Get watchlist data
    const watchlistItems = await Watchlist.find({ email }).sort({ createdAt: -1 }).lean();

    // Count price drop alerts sent
    const priceDropCount = watchlistItems.filter(
      (w: any) => w.priceDropNotified
    ).length;

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayClicks = allClicks.filter(
      (c: any) => new Date(c.timestamp) >= today
    ).length;

    const topProducts = allClicks
      .reduce(
        (acc: Record<string, { title: string; clicks: number; revenue: number }>, click: any) => {
          if (!acc[click.productId]) {
            acc[click.productId] = {
              title: click.title,
              clicks: 0,
              revenue: 0,
            };
          }
          acc[click.productId].clicks += 1;
          const rate = commissionRates[click.platform] || 0.02;
          acc[click.productId].revenue += click.price * rate;
          return acc;
        },
        {}
      );

    const topProductsList = Object.entries(topProducts)
      .map(([id, data]: any) => ({
        productId: id,
        title: data.title,
        clicks: data.clicks,
        revenue: Math.floor(data.revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      overview: {
        totalClicks,
        todayClicks,
        totalRevenue: Math.floor(totalRevenue),
        priceDropAlertsSent: priceDropCount,
        watchlistItems: watchlistItems.length,
      },
      byPlatform: Object.entries(clicksByPlatform).map(([platform, clicks]) => ({
        platform,
        clicks,
        revenue: Math.floor(revenueByPlatform[platform] || 0),
        commission: commissionRates[platform] ? `${(commissionRates[platform] * 100).toFixed(0)}%` : '2%',
      })),
      topProducts: topProductsList,
      revenueTarget: {
        daily: { target: 5000, achieved: Math.floor(totalRevenue / 30), percentage: Math.min(100, Math.floor((totalRevenue / 30 / 5000) * 100)) },
        monthly: { target: 150000, achieved: Math.floor(totalRevenue), percentage: Math.min(100, Math.floor((totalRevenue / 150000) * 100)) },
      },
    });
  } catch (error) {
    console.error('Revenue dashboard error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch revenue data',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
