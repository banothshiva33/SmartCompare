import { Product } from '@/types/product';

export function getRecommendationReason(product: Product) {
  if (product.rating >= 4.5 && product.price < 20000) {
    return 'Best balance of price and rating';
  }

  if (product.price < 15000) {
    return 'Lowest price available';
  }

  if (product.reviewCount > 5000) {
    return 'Most trusted by users';
  }

  return 'Best overall value';
}