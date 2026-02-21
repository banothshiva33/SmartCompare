import { Product } from '@/types/product';

/**
 * BuyHatke-style recommendation:
 * Best value = (rating × trust) ÷ price
 */
export function recommendProduct(products: Product[]) {
  if (!products.length) return null;

  let bestProduct = products[0];
  let bestScore = 0;

  for (const product of products) {
    const priceScore = 1 / product.price; // cheaper = higher score
    const ratingScore = product.rating / 5; // normalize (0–1)
    const trustScore = Math.log10(product.reviewCount + 1); // review trust

    const score =
      priceScore * 0.5 +
      ratingScore * 0.3 +
      trustScore * 0.2;

    if (score > bestScore) {
      bestScore = score;
      bestProduct = product;
    }
  }

  return bestProduct;
}