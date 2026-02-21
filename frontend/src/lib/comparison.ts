import { Product } from '@/types/product';

export interface ComparisonMetrics {
  cheapestASIN: string;
  mostExpensiveASIN: string;
  bestRatedASIN: string;
  mostReviewsASIN: string;
  averagePrice: number;
}

export function analyzeProducts(products: Product[]): ComparisonMetrics {
  if (!products.length) {
    return {
      cheapestASIN: '',
      mostExpensiveASIN: '',
      bestRatedASIN: '',
      mostReviewsASIN: '',
      averagePrice: 0,
    };
  }

  const cheapest = products.reduce((prev, curr) =>
    prev.price < curr.price ? prev : curr
  );

  const mostExpensive = products.reduce((prev, curr) =>
    prev.price > curr.price ? prev : curr
  );

  const bestRated = products.reduce((prev, curr) =>
    prev.rating > curr.rating ? prev : curr
  );

  const mostReviews = products.reduce((prev, curr) =>
    prev.reviewCount > curr.reviewCount ? prev : curr
  );

  const averagePrice =
    products.reduce((sum, p) => sum + p.price, 0) / products.length;

  return {
    cheapestASIN: cheapest.ASIN,
    mostExpensiveASIN: mostExpensive.ASIN,
    bestRatedASIN: bestRated.ASIN,
    mostReviewsASIN: mostReviews.ASIN,
    averagePrice,
  };
}

export function getProductBadges(
  product: Product,
  metrics: ComparisonMetrics
): string[] {
  const badges: string[] = [];

  if (product.ASIN === metrics.cheapestASIN) {
    badges.push('💰 Cheapest');
  }

  if (product.ASIN === metrics.bestRatedASIN) {
    badges.push('⭐ Best Rated');
  }

  if (product.ASIN === metrics.mostReviewsASIN) {
    badges.push('👥 Most Reviewed');
  }

  const savingsPercent = (
    ((metrics.averagePrice - product.price) / metrics.averagePrice) *
    100
  ).toFixed(0);
  if (parseInt(savingsPercent) > 10) {
    badges.push(`✅ Save ${savingsPercent}%`);
  }

  return badges;
}
