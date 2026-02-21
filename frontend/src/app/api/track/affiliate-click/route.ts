import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AffiliateClick from '@/models/AffiliateClick';

/**
 * AFFILIATE CLICK TRACKING API
 * Logs every affiliate link click for revenue tracking
 * 
 * POST /api/track/affiliate-click
 * Body: { productId, platform, title, price, affiliateLink, userIP }
 */

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      productId,
      platform,
      title,
      price,
      affiliateLink,
    } = body;

    // Get user IP (for tracking unique users)
    const userIP =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Create and save click record
    const click = await AffiliateClick.create({
      productId,
      platform,
      title,
      price,
      affiliateLink,
      timestamp: new Date(),
      userIP,
      converted: false,
    });

    // Estimate revenue based on commission rates
    const commissionRates: Record<string, number> = {
      Amazon: 0.03,
      Flipkart: 0.05,
      Myntra: 0.1,
      Ajio: 0.08,
    };

    const estimatedRevenue =
      price * (commissionRates[platform] || 0.02);

    return NextResponse.json({
      success: true,
      clickId: click._id,
      estimatedRevenue: Math.floor(estimatedRevenue),
      platform,
      message: `Click tracked for ${platform}`,
    });
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json(
      { error: 'Click tracking failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const platform = url.searchParams.get('platform');

    let query = {};

    if (platform) {
      query = { platform };
    }

    const clicks = await AffiliateClick.find(query)
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    const totalRevenue = clicks.reduce((sum, click: any) => {
      const commissionRates: Record<string, number> = {
        Amazon: 0.03,
        Flipkart: 0.05,
        Myntra: 0.1,
        Ajio: 0.08,
      };
      return (
        sum +
        click.price * (commissionRates[click.platform] || 0.02)
      );
    }, 0);

    return NextResponse.json({
      success: true,
      clicks: clicks.length,
      totalClicks: clicks.length,
      estimatedTotalRevenue: Math.floor(totalRevenue),
      lastClick: clicks[0]?.timestamp,
      data: clicks,
    });
  } catch (error) {
    console.error('Click retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve clicks', details: (error as Error).message },
      { status: 500 }
    );
  }
}
