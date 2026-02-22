import cron from 'node-cron';
import pino from 'pino';
import Watchlist from '../models/Watchlist';
import AffiliateClick from '../models/AffiliateClick';
import User from '../models/User';
import Product from '../models/Product';

const logger = pino();

/**
 * Daily price drop alerts
 * Checks watchlist items and sends alerts if prices drop below target
 */
export const schedulePriceAlerts = () => {
  // Run every day at 8 AM
  cron.schedule('0 8 * * *', async () => {
    logger.info('Running scheduled price alert task');

    try {
      const watchlistItems = await Watchlist.find({ notifyOnDrop: true }).populate(
        'productId'
      );

      for (const item of watchlistItems) {
        const product = item.productId as any;
        const platformData = product.platforms.find((p: any) => p.platform === item.platform);

        if (!platformData) continue;

        const currentPrice = platformData.currentPrice;
        const targetPrice = item.targetPrice || product.platforms[0].currentPrice * 0.9; // 10% drop if no target

        if (currentPrice <= targetPrice) {
          // Price dropped below target - would send email notification here
          logger.info({
            event: 'price_drop_detected',
            productId: item.productId,
            currentPrice,
            targetPrice,
            platform: item.platform,
          });

          item.alertsSent = (item.alertsSent || 0) + 1;
          item.lastAlertDate = new Date();
          await item.save();
        }
      }

      logger.info(`Price alert check completed for ${watchlistItems.length} items`);
    } catch (error) {
      logger.error('Price alert task failed:', error);
    }
  });
};

/**
 * Weekly trending deals update
 * Analyzes click patterns and purchase conversions to identify trending products
 */
export const scheduleTrendingUpdates = () => {
  // Run every Monday at 2 AM
  cron.schedule('0 2 * * 1', async () => {
    logger.info('Running scheduled trending deals update');

    try {
      // Last 7 days data analysis
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentClicks = await AffiliateClick.aggregate([
        {
          $match: {
            clickedAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: '$productId',
            clickCount: { $sum: 1 },
            purchaseCount: {
              $sum: { $cond: ['$purchased', 1, 0] },
            },
            totalCommission: {
              $sum: '$commission',
            },
          },
        },
        {
          $addFields: {
            conversionRate: {
              $divide: ['$purchaseCount', '$clickCount'],
            },
            trendingScore: {
              $add: [
                { $multiply: ['$clickCount', 0.3] },
                { $multiply: [{ $multiply: ['$conversionRate', 100] }, 0.5] },
                { $multiply: ['$totalCommission', 0.001] },
              ],
            },
          },
        },
        {
          $sort: { trendingScore: -1 },
        },
        {
          $limit: 50,
        },
      ]);

      // Update products as trending
      for (const item of recentClicks) {
        await Product.findByIdAndUpdate(item._id, {
          trending: true,
          trendingScore: item.trendingScore,
        });
      }

      logger.info(`Trending update completed: ${recentClicks.length} products marked as trending`);
    } catch (error) {
      logger.error('Trending update task failed:', error);
    }
  });
};

/**
 * Monthly commission calculations
 * Calculates and records monthly commission for each affiliate
 */
export const scheduleMonthlyCommissions = () => {
  // Run on the 1st of each month at 12 AM
  cron.schedule('0 0 1 * *', async () => {
    logger.info('Running monthly commission calculation');

    try {
      const users = await User.find();

      for (const user of users) {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const monthStart = new Date(lastMonth);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(lastMonth);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthlyPurchases = await AffiliateClick.find({
          affiliateId: user.affiliateId,
          purchased: true,
          purchasedAt: {
            $gte: monthStart,
            $lte: monthEnd,
          },
        });

        const totalCommission = monthlyPurchases.reduce(
          (sum, click) => sum + (click.commission || 0),
          0
        );

        // Would record this in a separate Collection like "MonthlyEarnings"
        logger.info({
          event: 'monthly_commission_calculated',
          affiliateId: user.affiliateId,
          month: lastMonth.toISOString().slice(0, 7),
          totalCommission,
          purchaseCount: monthlyPurchases.length,
        });
      }

      logger.info('Monthly commission calculation completed');
    } catch (error) {
      logger.error('Monthly commission task failed:', error);
    }
  });
};

/**
 * Cleanup expired affiliate clicks
 * Removes click records older than 30 days without purchases
 */
export const scheduleCleanupExpiredClicks = () => {
  // Run daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    logger.info('Running cleanup for expired affiliate clicks');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await AffiliateClick.deleteMany({
        purchased: false,
        clickedAt: { $lt: thirtyDaysAgo },
      });

      logger.info(`Deleted ${result.deletedCount} expired click records`);
    } catch (error) {
      logger.error('Cleanup task failed:', error);
    }
  });
};

/**
 * Initialize all scheduled jobs
 */
export const initializeScheduledJobs = () => {
  logger.info('Initializing scheduled jobs');

  schedulePriceAlerts();
  scheduleTrendingUpdates();
  scheduleMonthlyCommissions();
  scheduleCleanupExpiredClicks();

  logger.info('All scheduled jobs initialized');
};
