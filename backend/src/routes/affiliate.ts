import { Router, Request, Response } from 'express';
import Joi from 'joi';
import AffiliateClick from '../models/AffiliateClick';
import Product from '../models/Product';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getEnvConfig } from '../config/env';
import pino from 'pino';

const router = Router();
const logger = pino();

// Generate affiliate link
router.post('/generate-link', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const schema = Joi.object({
      productId: Joi.string().required(),
      platform: Joi.string().valid('amazon', 'flipkart', 'myntra', 'ajio', 'other').required(),
      productUrl: Joi.string().uri().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const envConfig = getEnvConfig();
    const { productId, platform, productUrl } = value;

    let affiliateLink = productUrl;

    // Add affiliate parameters based on platform
    if (platform === 'amazon') {
      const separator = productUrl.includes('?') ? '&' : '?';
      affiliateLink = `${productUrl}${separator}tag=${envConfig.AMAZON_AFFILIATE_TAG}`;
    } else if (platform === 'flipkart') {
      const separator = productUrl.includes('?') ? '&' : '?';
      affiliateLink = `${productUrl}${separator}affid=${envConfig.FLIPKART_AFFILIATE_TAG}`;
    }

    // Create affiliate click record
    const clickRecord = new AffiliateClick({
      userId: req.userId,
      affiliateId: user.affiliateId,
      productId,
      platform,
      sourceUrl: req.body.sourceUrl || 'unknown',
      redirectUrl: affiliateLink,
    });

    await clickRecord.save();

    res.json({
      affiliateLink,
      clickId: clickRecord._id,
      platform,
      productId,
    });
  } catch (error: any) {
    logger.error('Generate affiliate link error:', error);
    res.status(500).json({ error: 'Failed to generate affiliate link' });
  }
});

// Track affiliate click
router.post('/track-click', async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      clickId: Joi.string().required(),
      userAgent: Joi.string().optional(),
      ipAddress: Joi.string().ip().optional(),
      device: Joi.string().valid('mobile', 'tablet', 'desktop').optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { clickId, userAgent, ipAddress, device } = value;

    const click = await AffiliateClick.findByIdAndUpdate(
      clickId,
      {
        userAgent,
        ipAddress: ipAddress || req.ip,
        device,
      },
      { new: true }
    );

    if (!click) {
      return res.status(404).json({ error: 'Click record not found' });
    }

    res.json({
      message: 'Click tracked successfully',
      redirectUrl: click.redirectUrl,
    });
  } catch (error: any) {
    logger.error('Track click error:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// Mark purchase
router.post('/mark-purchase', async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      clickId: Joi.string().required(),
      purchaseAmount: Joi.number().positive().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { clickId, purchaseAmount } = value;

    const click = await AffiliateClick.findById(clickId);
    if (!click) {
      return res.status(404).json({ error: 'Click record not found' });
    }

    // Check if click is still valid (within 30 days)
    const clickDate = new Date(click.clickedAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (clickDate < thirtyDaysAgo) {
      return res.status(400).json({ error: 'Click has expired. Commission window has passed.' });
    }

    const user = await User.findById(click.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const commission = (purchaseAmount * user.commissionRate) / 100;

    const updatedClick = await AffiliateClick.findByIdAndUpdate(
      clickId,
      {
        purchased: true,
        purchaseAmount,
        commission,
        purchasedAt: new Date(),
      },
      { new: true }
    );

    // Update user's earnings (could be a separate model)
    logger.info({
      event: 'purchase_recorded',
      userId: click.userId,
      affiliateId: click.affiliateId,
      purchaseAmount,
      commission,
    });

    res.json({
      message: 'Purchase recorded successfully',
      clickId,
      purchaseAmount,
      commission,
      commissionRate: user.commissionRate,
    });
  } catch (error: any) {
    logger.error('Mark purchase error:', error);
    res.status(500).json({ error: 'Failed to record purchase' });
  }
});

// Get affiliate stats
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Total clicks
    const totalClicks = await AffiliateClick.countDocuments({
      affiliateId: user.affiliateId,
    });

    // Successful purchases
    const successfulPurchases = await AffiliateClick.find({
      affiliateId: user.affiliateId,
      purchased: true,
    });

    const totalRevenue = successfulPurchases.reduce((sum, click) => sum + (click.commission || 0), 0);

    // Clicks by platform
    const clicksByPlatform = await AffiliateClick.aggregate([
      { $match: { affiliateId: user.affiliateId } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
    ]);

    // Conversion rate
    const conversionRate =
      totalClicks > 0 ? ((successfulPurchases.length / totalClicks) * 100).toFixed(2) : '0.00';

    // This month's earnings
    const monthStart = new Date();
    monthStart.setDate(1);
    const thisMonthEarnings = successfulPurchases
      .filter((click) => new Date(click.purchasedAt!) >= monthStart)
      .reduce((sum, click) => sum + (click.commission || 0), 0);

    res.json({
      affiliateId: user.affiliateId,
      totalClicks,
      successfulPurchases: successfulPurchases.length,
      conversionRate: `${conversionRate}%`,
      totalRevenue: totalRevenue.toFixed(2),
      thisMonthEarnings: thisMonthEarnings.toFixed(2),
      clicksByPlatform,
      commissionRate: user.commissionRate,
    });
  } catch (error: any) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
