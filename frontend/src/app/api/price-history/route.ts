import { NextResponse } from 'next/server';
import { getPriceHistory } from '@/lib/priceHistory';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const days = searchParams.get('days') || '30';

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    const history = await getPriceHistory(productId, parseInt(days));

    return NextResponse.json({
      success: true,
      productId,
      history,
    });
  } catch (error) {
    console.error('Price history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    );
  }
}
