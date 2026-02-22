import { Router, Request, Response } from 'express';
import Joi from 'joi';
import Watchlist from '../models/Watchlist';
import Product from '../models/Product';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import pino from 'pino';

const router = Router();
const logger = pino();

// Add to watchlist
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const schema = Joi.object({
      productId: Joi.string().required(),
      platform: Joi.string().valid('amazon', 'flipkart', 'myntra', 'ajio', 'other').required(),
      targetPrice: Joi.number().min(0).optional(),
      notifyOnDrop: Joi.boolean().default(true),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { productId, platform, targetPrice, notifyOnDrop } = value;

    // Check if already in watchlist
    const existing = await Watchlist.findOne({
      userId: req.userId,
      productId,
      platform,
    });

    if (existing) {
      return res.status(409).json({ error: 'Product already in watchlist' });
    }

    // Get current product price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const platformData = product.platforms.find((p) => p.platform === platform);
    if (!platformData) {
      return res.status(400).json({ error: 'Product not available on this platform' });
    }

    // Create watchlist entry
    const watchlist = new Watchlist({
      userId: req.userId,
      productId,
      platform,
      currentPrice: platformData.currentPrice,
      targetPrice,
      notifyOnDrop,
    });

    await watchlist.save();

    res.status(201).json({
      message: 'Added to watchlist',
      watchlist,
    });
  } catch (error: any) {
    logger.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Get user's watchlist
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;

    const [watchlist, total] = await Promise.all([
      Watchlist.find({ userId: req.userId })
        .populate('productId')
        .skip(skip)
        .limit(pageSize)
        .sort({ addedAt: -1 }),
      Watchlist.countDocuments({ userId: req.userId }),
    ]);

    res.json({
      watchlist,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    logger.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Remove from watchlist
router.delete('/:watchlistId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const watchlist = await Watchlist.findById(req.params.watchlistId);

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist entry not found' });
    }

    // Verify ownership
    if (watchlist.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Watchlist.findByIdAndDelete(req.params.watchlistId);

    res.json({ message: 'Removed from watchlist' });
  } catch (error: any) {
    logger.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

// Update watchlist entry (target price, notifications, etc.)
router.patch('/:watchlistId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const schema = Joi.object({
      targetPrice: Joi.number().min(0).optional(),
      notifyOnDrop: Joi.boolean().optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const watchlist = await Watchlist.findById(req.params.watchlistId);

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist entry not found' });
    }

    // Verify ownership
    if (watchlist.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await Watchlist.findByIdAndUpdate(req.params.watchlistId, value, {
      new: true,
    });

    res.json({
      message: 'Watchlist updated',
      watchlist: updated,
    });
  } catch (error: any) {
    logger.error('Update watchlist error:', error);
    res.status(500).json({ error: 'Failed to update watchlist' });
  }
});

export default router;
