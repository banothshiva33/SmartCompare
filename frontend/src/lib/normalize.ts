import { Product } from '@/types/product';

export function normalizeAmazonItem(item: any): Product {
  return {
    ASIN: item.ASIN,
    title: item.ItemInfo?.Title?.DisplayValue || 'No title',
    image: item.Images?.Primary?.Large?.URL || '/placeholder.png',
    price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
    displayPrice:
      item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'N/A',
    rating: Number(item.CustomerReviews?.StarRating || 0),
    reviewCount: Number(item.CustomerReviews?.Count || 0),
    platform: 'Amazon',
    url: `https://www.amazon.com/dp/${item.ASIN}`,
  };
}
