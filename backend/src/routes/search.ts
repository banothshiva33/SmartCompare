import { Router, Request, Response } from 'express';
import Joi from 'joi';
import Product from '../models/Product';
import pino from 'pino';

const router = Router();
const logger = pino();

// Search products
router.get('/products', async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      query: Joi.string().max(200).optional(),
      category: Joi.string().optional(),
      page: Joi.number().min(1).default(1),
      pageSize: Joi.number().min(1).max(100).default(20),
      minPrice: Joi.number().min(0).optional(),
      maxPrice: Joi.number().min(0).optional(),
      platform: Joi.string().valid('amazon', 'flipkart', 'myntra', 'ajio', 'other').optional(),
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { query, category, page, pageSize, minPrice, maxPrice, platform } = value;
    const skip = (page - 1) * pageSize;

    let dbQuery: any = {};

    // Text search
    if (query) {
      dbQuery.$text = { $search: query };
    }

    // Category filter
    if (category) {
      dbQuery.category = new RegExp(category, 'i');
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      dbQuery['platforms.currentPrice'] = {};
      if (minPrice !== undefined) {
        dbQuery['platforms.currentPrice'].$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        dbQuery['platforms.currentPrice'].$lte = maxPrice;
      }
    }

    // Platform filter
    if (platform) {
      dbQuery['platforms.platform'] = platform;
    }

    const [products, total] = await Promise.all([
      Product.find(dbQuery).skip(skip).limit(pageSize).lean(),
      Product.countDocuments(dbQuery),
    ]);

    res.json({
      products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get product by ID
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('priceHistory');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error: any) {
    logger.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get trending products
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

    const trendingProducts = await Product.find({ trending: true })
      .sort({ trendingScore: -1 })
      .limit(limit)
      .lean();

    res.json({
      trendingProducts,
    });
  } catch (error: any) {
    logger.error('Get trending error:', error);
    res.status(500).json({ error: 'Failed to fetch trending products' });
  }
});

export default router;
