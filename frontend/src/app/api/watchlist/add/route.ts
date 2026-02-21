import { NextResponse } from 'next/server';
import Watchlist from '@/models/Watchlist';
import { connectDB } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.json();
  await connectDB();

  const item = await Watchlist.create(body);

  return NextResponse.json({ success: true, item });
}