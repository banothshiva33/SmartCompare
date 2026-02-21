import { NextResponse } from 'next/server';
import { getPriceDropDetection } from '@/lib/priceHistory';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    const dropData = await getPriceDropDetection(productId);

    if (!dropData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not enough price data to detect drop',
          hasDropped: false,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      productId,
      ...dropData,
    });
  } catch (error) {
    console.error('Price drop detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect price drop' },
      { status: 500 }
    );
  }
}
