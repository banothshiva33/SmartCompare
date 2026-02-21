import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Watchlist from '@/models/Watchlist';
import PriceHistory from '@/models/PriceHistory';
import { sendTargetPriceAlertEmail, sendWatchlistNotificationEmail } from '@/lib/email';

// This endpoint should be called periodically by a cron job service
// Example: EasyCron, Upstash, or similar services
export async function POST(req: Request) {
  try {
    // Verify the cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    console.log('🔄 Starting price alert cron job...');

    // Get all watchlist items
    const watchlistItems = await Watchlist.find({});

    let alertsSent = 0;
    let errors = 0;

    // Check each watchlist item
    for (const item of watchlistItems) {
      try {
        // Get the latest prices
        const latestPrice = await PriceHistory.findOne({
          productId: item.productId,
        }).sort({ createdAt: -1 });

        if (!latestPrice) {
          console.log(`⏭️ No price history for ${item.productId}`);
          continue;
        }

        // Check if product price hit target price
        if (item.targetPrice > 0 && latestPrice.price <= item.targetPrice) {
          console.log(
            `📧 Sending target price alert for ${item.productId} to ${item.email}`
          );

          await sendTargetPriceAlertEmail(
            item.email,
            item.title,
            latestPrice.price,
            item.targetPrice,
            item.url
          );

          alertsSent++;

          // Update the item to mark alert as sent (optional: add sentAlertAt field)
          await Watchlist.updateOne(
            { _id: item._id },
            { lastAlertSentAt: new Date() }
          );
        }

        // Check for significant price drops
        const previousPrice = await PriceHistory.findOne({
          productId: item.productId,
          createdAt: { $lt: latestPrice.createdAt },
        }).sort({ createdAt: -1 });

        if (previousPrice) {
          const priceDrop = previousPrice.price - latestPrice.price;
          const dropPercentage = (priceDrop / previousPrice.price) * 100;

          // Alert if price dropped more than 5%
          if (dropPercentage > 5) {
            console.log(
              `📧 Sending price drop notification for ${item.productId} to ${item.email}`
            );

            await sendWatchlistNotificationEmail(
              item.email,
              item.title,
              latestPrice.price,
              previousPrice.price,
              item.url
            );

            alertsSent++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing ${item.productId}:`, error);
        errors++;
      }
    }

    console.log(
      `✅ Cron job completed. Sent ${alertsSent} alerts, ${errors} errors.`
    );

    return NextResponse.json({
      success: true,
      message: 'Price alerts check completed',
      alertsSent,
      errors,
      watchlistItemsChecked: watchlistItems.length,
    });
  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
