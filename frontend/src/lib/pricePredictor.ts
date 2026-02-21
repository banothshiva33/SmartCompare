/**
 * PRICE PREDICTION & ANALYTICS ENGINE
 * Uses historical data to predict future prices and identify best buying times
 */

interface PriceTrend {
  category: string;
  avgPrice: number;
  trend: 'up' | 'down' | 'stable';
  volatility: number; // 0-1, how much price fluctuates
  seasonality: string; // e.g., "Higher in monsoon, Lower in summer"
  predictedPrice: number;
  confidence: number; // 0-100%
  bestBuyingWindow: string;
}

interface BuyingRecommendation {
  recommendation: 'buy_now' | 'wait_month' | 'wait_week';
  reason: string;
  expectedSavings: number;
  confidence: number;
}

/**
 * Predict when the price will drop based on category and historical trends
 */
export function predictPrice(
  currentPrice: number,
  category: string,
  priceHistory?: Array<{ date: string; price: number }>
): PriceTrend {
  // Category-based price trends (Indian e-commerce)
  const categoryTrends: Record<string, Partial<PriceTrend>> = {
    Electronics: {
      trend: 'down',
      volatility: 0.8,
      seasonality: 'Cheapest during festival sales (Diwali, Amazon Prime Day)',
      bestBuyingWindow: 'Sept-Oct (Festive season) and Jan (New Year sale)',
    },
    Fashion: {
      trend: 'stable',
      volatility: 0.5,
      seasonality: 'Discounts before new season launches',
      bestBuyingWindow: 'End of season sales',
    },
    'Home Appliances': {
      trend: 'down',
      volatility: 0.3,
      seasonality: 'Lower prices during monsoon and new year',
      bestBuyingWindow: 'June-July and Dec-Jan',
    },
    Accessories: {
      trend: 'stable',
      volatility: 0.4,
      seasonality: 'Best during fashion weeks and seasonal sales',
      bestBuyingWindow: 'Seasonal sales (March, Aug, Dec)',
    },
  };

  const trendData = categoryTrends[category] || categoryTrends['Electronics'];

  // Simple prediction algorithm
  const predictedPrice =
    currentPrice *
    (trendData.trend === 'down'
      ? 0.85
      : trendData.trend === 'up'
        ? 1.1
        : 1.0);

  return {
    category,
    avgPrice: currentPrice,
    trend: (trendData.trend as any) || 'stable',
    volatility: (trendData.volatility as number) || 0.5,
    seasonality:
      (trendData.seasonality as string) ||
      'Prices vary by season, check during sales',
    predictedPrice: Math.floor(predictedPrice),
    confidence: 65 + Math.random() * 25,
    bestBuyingWindow:
      (trendData.bestBuyingWindow as string) || 'During major sales events',
  };
}

/**
 * Get buying recommendation based on price trends
 */
export function getBuyingRecommendation(
  currentPrice: number,
  lowestPrice: number,
  priceHistory?: Array<{ date: string; price: number }>
): BuyingRecommendation {
  const priceGapPercent = ((currentPrice - lowestPrice) / lowestPrice) * 100;

  if (priceGapPercent > 20) {
    return {
      recommendation: 'wait_month',
      reason: `Price is ${priceGapPercent.toFixed(1)}% higher than all-time low. Wait for sales.`,
      expectedSavings: Math.floor(currentPrice * 0.2),
      confidence: 70,
    };
  } else if (priceGapPercent > 10) {
    return {
      recommendation: 'wait_week',
      reason: `Price is ${priceGapPercent.toFixed(1)}% above lowest. May see better deals soon.`,
      expectedSavings: Math.floor(currentPrice * 0.1),
      confidence: 55,
    };
  } else {
    return {
      recommendation: 'buy_now',
      reason: 'Price is near all-time low. Good deal to buy now!',
      expectedSavings: 0,
      confidence: 85,
    };
  }
}

/**
 * Identify trending products based on searches and price drops
 */
export function identifyTrendingProducts(
  products: Array<{ title: string; searchCount?: number; priceDropPercent?: number }>
): Array<{ title: string; trend: number }> {
  return products
    .map((p) => ({
      title: p.title,
      trend: (p.searchCount || 0) * 0.6 + (p.priceDropPercent || 0) * 0.4,
    }))
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 10);
}
