import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Watchlist from '@/models/Watchlist';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, productId, title, image, platform, url, targetPrice } = body;

    if (!email || !productId) {
      return NextResponse.json(
        { error: 'email and productId are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if already in watchlist
    const existing = await Watchlist.findOne({ email, productId });
    if (existing) {
      return NextResponse.json(
        { error: 'Product already in watchlist' },
        { status: 400 }
      );
    }

    const watchlistItem = await Watchlist.create({
      email,
      productId,
      title,
      image,
      platform,
      url,
      targetPrice: targetPrice || 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Added to watchlist',
      item: watchlistItem,
    });
  } catch (error) {
    console.error('Watchlist add error:', error);
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const items = await Watchlist.find({ email }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      email,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { email, productId } = body;

    if (!email || !productId) {
      return NextResponse.json(
        { error: 'email and productId are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await Watchlist.deleteOne({ email, productId });

    return NextResponse.json({
      success: true,
      message: 'Removed from watchlist',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Watchlist delete error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    );
  }
}
