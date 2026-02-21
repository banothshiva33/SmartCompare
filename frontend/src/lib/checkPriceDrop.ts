import Watchlist from '@/models/Watchlist';
import { sendPriceAlert } from './sendAlert';

export async function checkPriceDrops(fetchLatestPrice: Function) {
  const items = await Watchlist.find();

  for (const item of items) {
    const latestPrice = await fetchLatestPrice(item.productId);

    if (latestPrice < item.currentPrice) {
      await sendPriceAlert(
        item.email,
        item.title,
        item.currentPrice,
        latestPrice,
        item.url
      );

      item.currentPrice = latestPrice;
      await item.save();
    }
  }
}