import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Watchlist from '@/models/Watchlist';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { email, productId, targetPrice } = body;

    if (!email || !productId) {
      return NextResponse.json(
        { error: 'email and productId are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const updated = await Watchlist.findOneAndUpdate(
      { email, productId },
      { targetPrice: targetPrice || 0 },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Watchlist item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Alert price updated',
      item: updated,
    });
  } catch (error) {
    console.error('Update alert error:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
