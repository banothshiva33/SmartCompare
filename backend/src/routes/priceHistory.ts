import { Router, Request, Response } from 'express';
import Joi from 'joi';
import PriceHistory from '../models/PriceHistory';
import Product from '../models/Product';
import pino from 'pino';

const router = Router();
const logger = pino();

// Get price history for a product
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      platform: Joi.string().valid('amazon', 'flipkart', 'myntra', 'ajio', 'other').optional(),
      days: Joi.number().min(1).max(365).default(30),
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { platform, days } = value;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    let query: any = {
      productId: req.params.productId,
      recordedAt: { $gte: fromDate },
    };

    if (platform) {
      query.platform = platform;
    }

    const priceHistory = await PriceHistory.find(query).sort({ recordedAt: -1 }).lean();

    if (priceHistory.length === 0) {
      return res.status(404).json({ error: 'No price history found' });
    }

    // Calculate statistics
    const prices = priceHistory.map((h) => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    res.json({
      productId: req.params.productId,
      platform: platform || 'all',
      days,
      priceHistory,
      statistics: {
        minPrice: minPrice.toFixed(2),
        maxPrice: maxPrice.toFixed(2),
        averagePrice: avgPrice.toFixed(2),
        currentPrice: prices[0],
      },
    });
  } catch (error: any) {
    logger.error('Get price history error:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// Get price drop alerts - products with significant price drops
router.get('/drops/recent', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const productsWithDrops = await Product.find({
      'lastPriceDrop.amount': { $gt: 0 },
    })
      .sort({ 'lastPriceDrop.date': -1 })
      .limit(limit)
      .lean();

    res.json({
      productsWithDrops,
      count: productsWithDrops.length,
    });
  } catch (error: any) {
    logger.error('Get price drops error:', error);
    res.status(500).json({ error: 'Failed to fetch price drops' });
  }
});

// Record price update (internal use - called from scraper/scheduler)
router.post('/record', async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      productId: Joi.string().required(),
      platform: Joi.string().valid('amazon', 'flipkart', 'myntra', 'ajio', 'other').required(),
      price: Joi.number().positive().required(),
      discount: Joi.number().min(0).max(100).optional(),
      originalPrice: Joi.number().positive().optional(),
      inStock: Joi.boolean().default(true),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { productId, platform, price, discount, originalPrice, inStock } = value;

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Record price history
    const priceRecord = new PriceHistory({
      productId,
      platform,
      price,
      discount,
      originalPrice,
      inStock,
    });

    await priceRecord.save();

    // Update product's platform price
    const platformIndex = product.platforms.findIndex((p) => p.platform === platform);
    if (platformIndex >= 0) {
      const oldPrice = product.platforms[platformIndex].currentPrice;

      product.platforms[platformIndex] = {
        platform,
        url: product.platforms[platformIndex].url,
        currentPrice: price,
        originalPrice,
        discount,
        inStock,
        lastUpdated: new Date(),
      };

      // Track price drop
      if (oldPrice > price) {
        product.lastPriceDrop = {
          amount: oldPrice - price,
          previousPrice: oldPrice,
          date: new Date(),
        };
      }
    }

    await product.save();

    res.json({
      message: 'Price recorded successfully',
      priceRecord,
    });
  } catch (error: any) {
    logger.error('Record price error:', error);
    res.status(500).json({ error: 'Failed to record price' });
  }
});

export default router;
