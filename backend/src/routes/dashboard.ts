import { Router, Request, Response } from 'express';
import AffiliateClick from '../models/AffiliateClick';
import User from '../models/User';
import Watchlist from '../models/Watchlist';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import pino from 'pino';

const router = Router();
const logger = pino();

// Get user revenue dashboard
router.get('/revenue', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all purchases through this affiliate
    const purchases = await AffiliateClick.find({
      affiliateId: user.affiliateId,
      purchased: true,
    }).sort({ purchasedAt: -1 });

    // Calculate metrics
    const totalCommissions = purchases.reduce((sum, click) => sum + (click.commission || 0), 0);

    // This month
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStart0 = new Date(monthStart);
    monthStart0.setHours(0, 0, 0, 0);

    const thisMonthPurchases = purchases.filter(
      (p) => new Date(p.purchasedAt!) >= monthStart0
    );
    const thisMonthCommissions = thisMonthPurchases.reduce(
      (sum, click) => sum + (click.commission || 0),
      0
    );

    // This week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStart0 = new Date(weekStart);
    weekStart0.setHours(0, 0, 0, 0);

    const thisWeekPurchases = purchases.filter(
      (p) => new Date(p.purchasedAt!) >= weekStart0
    );
    const thisWeekCommissions = thisWeekPurchases.reduce(
      (sum, click) => sum + (click.commission || 0),
      0
    );

    // Earnings by platform
    const earningsByPlatform = await AffiliateClick.aggregate([
      {
        $match: {
          affiliateId: user.affiliateId,
          purchased: true,
        },
      },
      {
        $group: {
          _id: '$platform',
          totalCommission: { $sum: '$commission' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent transactions
    const recentTransactions = purchases.slice(0, 10).map((p) => ({
      _id: p._id,
      productId: p.productId,
      amount: p.purchaseAmount,
      commission: p.commission,
      platform: p.platform,
      purchasedAt: p.purchasedAt,
    }));

    res.json({
      affiliateId: user.affiliateId,
      bankAccount: user.bankAccount ? { ...user.bankAccount, accountNumber: '****' } : null,
      totalEarnings: totalCommissions.toFixed(2),
      thisMonthEarnings: thisMonthCommissions.toFixed(2),
      thisWeekEarnings: thisWeekCommissions.toFixed(2),
      totalPurchases: purchases.length,
      thisMonthPurchases: thisMonthPurchases.length,
      thisWeekPurchases: thisWeekPurchases.length,
      commissionRate: user.commissionRate,
      earningsByPlatform,
      recentTransactions,
    });
  } catch (error: any) {
    logger.error('Get revenue dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue dashboard' });
  }
});

// Get watchlist analytics
router.get('/watchlist-analytics', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Watchlist count
    const watchlistCount = await Watchlist.countDocuments({ userId: req.userId });

    // Watchlist by platform
    const watchlistByPlatform = await Watchlist.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
    ]);

    // Items with price drops
    const itemsWithDrops = await Watchlist.find({
      userId: req.userId,
    }).populate('productId');

    const droppedItems = itemsWithDrops.filter((item: any) => {
      if (!item.productId.lastPriceDrop) return false;
      if (item.targetPrice) {
        return item.currentPrice <= item.targetPrice;
      }
      return true;
    });

    res.json({
      totalWatchlistItems: watchlistCount,
      watchlistByPlatform,
      itemsWithDrops: droppedItems.length,
      itemsNotification: [],
    });
  } catch (error: any) {
    logger.error('Get watchlist analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist analytics' });
  }
});

// Get overall dashboard (combined view)
router.get('/overview', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Affiliate stats
    const totalClicks = await AffiliateClick.countDocuments({
      affiliateId: user.affiliateId,
    });

    const purchases = await AffiliateClick.find({
      affiliateId: user.affiliateId,
      purchased: true,
    });

    const totalCommissions = purchases.reduce((sum, click) => sum + (click.commission || 0), 0);
    const conversionRate =
      totalClicks > 0 ? ((purchases.length / totalClicks) * 100).toFixed(2) : '0.00';

    // Watchlist stats
    const watchlistCount = await Watchlist.countDocuments({ userId: req.userId });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        affiliateId: user.affiliateId,
      },
      affiliateStats: {
        totalClicks,
        successfulPurchases: purchases.length,
        conversionRate: `${conversionRate}%`,
        totalEarnings: totalCommissions.toFixed(2),
      },
      watchlistStats: {
        totalItems: watchlistCount,
      },
    });
  } catch (error: any) {
    logger.error('Get dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

export default router;
