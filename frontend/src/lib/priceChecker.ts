import Watchlist from '@/models/Watchlist';
import { searchAmazon } from './amazon';

export async function checkPrices() {
  const items = await Watchlist.find();

  for (const item of items) {
    const results = await searchAmazon(item.title);
    const newPrice =
      results?.[0]?.Offers?.Listings?.[0]?.Price?.Amount;

    if (newPrice && newPrice < item.lastCheckedPrice) {
      console.log(`PRICE DROP for ${item.title}`);
      // email trigger here
    }

    item.lastCheckedPrice = newPrice || item.lastCheckedPrice;
    await item.save();
  }
}
