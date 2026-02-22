import { Router, Request, Response } from 'express';
import Joi from 'joi';
import Product from '../models/Product';
import pino from 'pino';

const router = Router();
const logger = pino();

// Get trending deals
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const trendingDeals = await Product.find({ trending: true })
      .sort({ trendingScore: -1, 'lastPriceDrop.date': -1 })
      .limit(limit)
      .lean();

    res.json({
      trendingDeals,
      count: trendingDeals.length,
    });
  } catch (error: any) {
    logger.error('Get trending deals error:', error);
    res.status(500).json({ error: 'Failed to fetch trending deals' });
  }
});

// Get flash deals (significant discounts)
router.get('/flash', async (req: Request, res: Response) => {
  try {
    const minDiscount = parseInt(req.query.minDiscount as string) || 30; // At least 30% discount
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const flashDeals = await Product.find({
      'platforms.discount': { $gte: minDiscount },
    })
      .limit(limit)
      .lean();

    res.json({
      flashDeals,
      count: flashDeals.length,
      minDiscount,
    });
  } catch (error: any) {
    logger.error('Get flash deals error:', error);
    res.status(500).json({ error: 'Failed to fetch flash deals' });
  }
});

// Get category deals
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      limit: Joi.number().min(1).max(100).default(20),
      minDiscount: Joi.number().min(0).max(100).default(10),
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { limit, minDiscount } = value;
    const { category } = req.params;

    const deals = await Product.find({
      category: new RegExp(category, 'i'),
      'platforms.discount': { $gte: minDiscount },
    })
      .limit(limit)
      .lean();

    res.json({
      category,
      deals,
      count: deals.length,
      minDiscount,
    });
  } catch (error: any) {
    logger.error('Get category deals error:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Get best priced products (cheapest across platforms)
router.get('/best-price', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const category = req.query.category as string;

    let query: any = {};
    if (category) {
      query.category = new RegExp(category, 'i');
    }

    const products = await Product.find(query).limit(limit * 2).lean();

    // Find best price for each product across platforms
    const bestPriced = products
      .map((product) => {
        const bestPlatform = product.platforms.reduce((best, current) =>
          current.currentPrice < best.currentPrice ? current : best
        );
        return {
          ...product,
          bestPrice: bestPlatform.currentPrice,
          bestPlatform: bestPlatform.platform,
        };
      })
      .sort((a, b) => a.bestPrice - b.bestPrice)
      .slice(0, limit);

    res.json({
      bestPriced,
      count: bestPriced.length,
    });
  } catch (error: any) {
    logger.error('Get best price error:', error);
    res.status(500).json({ error: 'Failed to fetch best price products' });
  }
});

// Update trending products (internal endpoint - called by scheduler)
router.post('/update-trending', async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      productIds: Joi.array().items(Joi.string()).required(),
      scores: Joi.array().items(Joi.number()).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { productIds, scores } = value;

    for (let i = 0; i < productIds.length; i++) {
      await Product.findByIdAndUpdate(productIds[i], {
        trending: true,
        trendingScore: scores[i],
      });
    }

    res.json({
      message: 'Trending products updated',
      count: productIds.length,
    });
  } catch (error: any) {
    logger.error('Update trending error:', error);
    res.status(500).json({ error: 'Failed to update trending products' });
  }
});

export default router;
