import { Product } from '@/types/product';

export function recommendProduct(products: Product[]) {
  if (!products.length) return null;

  return products
    .map((p) => ({
      ...p,
      score:
        p.rating * 0.5 +
        Math.log10(p.reviewCount + 1) * 1.5 -
        p.price * 0.00001,
    }))
    .sort((a, b) => b.score - a.score)[0];
}
