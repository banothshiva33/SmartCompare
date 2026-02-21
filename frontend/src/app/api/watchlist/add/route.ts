import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Watchlist from '@/models/Watchlist';

export async function POST(req: Request) {
  const data = await req.json();
  await connectDB();

  await Watchlist.create(data);

  return NextResponse.json({ success: true });
}
