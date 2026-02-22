import { Router, Request, Response } from 'express';
import Joi from 'joi';
import Product from '../models/Product';
import Watchlist from '../models/Watchlist';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import pino from 'pino';

const router = Router();
const logger = pino();

// Get personalized recommendations
router.get('/personalized', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Get user's watchlist items to understand preferences
    const watchlist = await Watchlist.find({ userId: req.userId }).populate('productId');

    // Extract categories from watchlist
    const categories = [...new Set(watchlist.map((w: any) => w.productId.category))];

    // Get recommendations based on categories
    let query: any = {};
    if (categories.length > 0) {
      query.category = { $in: categories };
    }

    const recommendations = await Product.find(query).limit(20).lean();

    res.json({
      recommendations,
      basedOn: categories,
    });
  } catch (error: any) {
    logger.error('Get personalized recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get similar products
router.get('/similar/:productId', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.productId).lean();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find similar products in same category
    const similar = await Product.find({
      category: product.category,
      _id: { $ne: req.params.productId },
    })
      .limit(10)
      .lean();

    res.json({
      product,
      similarProducts: similar,
    });
  } catch (error: any) {
    logger.error('Get similar products error:', error);
    res.status(500).json({ error: 'Failed to fetch similar products' });
  }
});

// Get recommendations by category
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      limit: Joi.number().min(1).max(100).default(20),
      sortBy: Joi.string().valid('price', 'rating', 'trending', 'new').default('trending'),
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { limit, sortBy } = value;
    const { category } = req.params;

    let sort: any = {};
    switch (sortBy) {
      case 'price':
        sort['platforms.currentPrice'] = 1;
        break;
      case 'rating':
        sort.rating = -1;
        break;
      case 'trending':
        sort.trendingScore = -1;
        break;
      case 'new':
        sort.createdAt = -1;
        break;
    }

    const recommendations = await Product.find({
      category: new RegExp(category, 'i'),
    })
      .sort(sort)
      .limit(limit)
      .lean();

    res.json({
      category,
      recommendations,
      count: recommendations.length,
    });
  } catch (error: any) {
    logger.error('Get category recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get price drop recommendations (products where price dropped significantly)
router.get('/deals/price-drops', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const minDropPercent = parseFloat(req.query.minDrop as string) || 10; // At least 10% drop

    const recommendations = await Product.find({
      'lastPriceDrop.amount': { $gt: 0 },
    })
      .sort({ 'lastPriceDrop.date': -1 })
      .limit(limit)
      .lean();

    // Filter by minimum drop percentage
    const filtered = recommendations.filter((product) => {
      if (!product.lastPriceDrop) return false;
      const dropPercent =
        (product.lastPriceDrop.amount / product.lastPriceDrop.previousPrice) * 100;
      return dropPercent >= minDropPercent;
    });

    res.json({
      recommendations: filtered,
      count: filtered.length,
      minDropPercent,
    });
  } catch (error: any) {
    logger.error('Get price drops recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;
