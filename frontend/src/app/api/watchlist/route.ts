import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Watchlist from '@/models/Watchlist';
import { validateEmail, validateProductId, validatePrice, validatePlatform } from '@/lib/validation';

// ========== Security: Input Validation & Sanitization for Watchlist Operations ==========

export async function POST(req: Request) {
  try {
    // ========== Security: Parse and Validate Request Body ==========
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    const { email, productId, title, image, platform, url, targetPrice } = body;

    // ========== Security: Email Validation ==========
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }
    const sanitizedEmail = emailValidation.sanitized!;

    // ========== Security: Product ID Validation ==========
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const productIdValidation = validateProductId(productId);
    if (!productIdValidation.isValid) {
      return NextResponse.json(
        { error: productIdValidation.error },
        { status: 400 }
      );
    }
    const sanitizedProductId = productIdValidation.sanitized!;

    // ========== Security: Platform Validation ==========
    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      );
    }

    const platformValidation = validatePlatform(platform);
    if (!platformValidation.isValid) {
      return NextResponse.json(
        { error: platformValidation.error },
        { status: 400 }
      );
    }

    // ========== Security: Optional Price Validation ==========
    let sanitizedPrice = 0;
    if (targetPrice !== undefined && targetPrice !== null) {
      const priceValidation = validatePrice(targetPrice);
      if (!priceValidation.isValid) {
        return NextResponse.json(
          { error: priceValidation.error },
          { status: 400 }
        );
      }
      sanitizedPrice = Number(priceValidation.sanitized);
    }

    // ========== Security: Text Content Length Limits ==========
    if (title && title.length > 500) {
      return NextResponse.json(
        { error: 'Title is too long (max 500 characters)' },
        { status: 400 }
      );
    }

    await connectDB();

    // ========== Security: Check for Duplicates (Prevents Spam) ==========
    const existing = await Watchlist.findOne({
      email: sanitizedEmail,
      productId: sanitizedProductId,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Product already in watchlist' },
        { status: 409 }
      );
    }

    // ========== Security: Create Watchlist Item with Sanitized Data ==========
    const watchlistItem = await Watchlist.create({
      email: sanitizedEmail,
      productId: sanitizedProductId,
      title: title?.substring(0, 500) || '',
      image: image?.substring(0, 500) || '',
      platform: platformValidation.sanitized,
      url: url?.substring(0, 500) || '',
      targetPrice: sanitizedPrice,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Added to watchlist',
        item: watchlistItem,
      },
      { status: 201 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Watchlist add error:', err.message);
    // ========== Security: Don't expose internal errors ==========
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

    // ========== Security: Email Parameter Validation ==========
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }
    const sanitizedEmail = emailValidation.sanitized!;

    await connectDB();

    // ========== Security: Query with Sanitized Email ==========
    const items = await Watchlist.find({ email: sanitizedEmail })
      .sort({ createdAt: -1 })
      .limit(1000); // Prevent abuse

    return NextResponse.json({
      success: true,
      email: sanitizedEmail,
      items,
      count: items.length,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Watchlist fetch error:', err.message);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // ========== Security: Parse and Validate Request Body ==========
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    const { email, productId } = body;

    // ========== Security: Email Validation ==========
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }
    const sanitizedEmail = emailValidation.sanitized!;

    // ========== Security: Product ID Validation ==========
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const productIdValidation = validateProductId(productId);
    if (!productIdValidation.isValid) {
      return NextResponse.json(
        { error: productIdValidation.error },
        { status: 400 }
      );
    }

    await connectDB();

    // ========== Security: Delete with Sanitized Parameters ==========
    const result = await Watchlist.deleteOne({
      email: sanitizedEmail,
      productId: productIdValidation.sanitized,
    });

    return NextResponse.json({
      success: true,
      message: result.deletedCount > 0 ? 'Removed from watchlist' : 'Item not found',
      deleted: result.deletedCount > 0,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Watchlist delete error:', err.message);
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    );
  }
}
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
