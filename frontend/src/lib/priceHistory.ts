import { connectDB } from './db';
import PriceHistory from '@/models/PriceHistory';
import { Product } from '@/types/product';
import { PricePoint } from '@/types/price';

export async function savePriceHistory(product: Product) {
  try {
    await connectDB();

    const priceRecord = await PriceHistory.create({
      productId: product.ASIN,
      title: product.title,
      price: product.price,
      displayPrice: product.displayPrice,
      platform: product.platform,
      image: product.image,
      rating: product.rating,
      reviewCount: product.reviewCount,
      url: product.url,
    });

    console.log('✅ Saved price history for:', product.ASIN);
    return priceRecord;
  } catch (error) {
    console.error('❌ Failed to save price history:', error);
    // Don't throw - let API continue even if DB fails
    return null;
  }
}

export async function getPriceHistory(
  productId: string,
  days: number = 30
): Promise<PricePoint[]> {
  try {
    await connectDB();

    const since = new Date();
    since.setDate(since.getDate() - days);

    const history = await PriceHistory.find({
      productId,
      createdAt: { $gte: since },
    })
      .sort({ createdAt: 1 })
      .lean();

    return history.map((record: any) => ({
      date: new Date(record.createdAt).toISOString().split('T')[0],
      price: record.price,
    }));
  } catch (error) {
    console.error('❌ Failed to fetch price history:', error);
    // Return empty array instead of placeholder
    return [];
  }
}

export async function getPriceDropDetection(productId: string) {
  try {
    await connectDB();

    // Get latest and previous price
    const latest = await PriceHistory.findOne({
      productId,
    }).sort({ createdAt: -1 });

    if (!latest) return null;

    const previous = await PriceHistory.findOne({
      productId,
      createdAt: { $lt: latest.createdAt },
    }).sort({ createdAt: -1 });

    if (!previous) return null;

    const priceDrop = previous.price - latest.price;
    const dropPercentage = (priceDrop / previous.price) * 100;

    return {
      currentPrice: latest.price,
      previousPrice: previous.price,
      priceDrop,
      dropPercentage: Math.round(dropPercentage),
      hasDropped: priceDrop > 0,
    };
  } catch (error) {
    console.error('❌ Failed to detect price drop:', error);
    return null;
  }
}