import { NextResponse } from 'next/server';
import { isUrl, extractAmazonASIN } from '@/lib/detect';
import { searchAmazon } from '@/lib/amazon';

export async function POST(req: Request) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: 'Empty query' }, { status: 400 });
  }

  // URL search
  if (isUrl(query)) {
    const asin = extractAmazonASIN(query);
    if (!asin) {
      return NextResponse.json({ error: 'Unsupported URL' });
    }
    // For now, treat ASIN as keyword
    const items = await searchAmazon(asin);
    return NextResponse.json({ items });
  }

  // Text search
  const items = await searchAmazon(query);
  return NextResponse.json({ items });
}
