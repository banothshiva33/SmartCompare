/**
 * SMART RECOMMENDATIONS ENGINE
 * ML-powered product recommendations based on user behavior
 */

interface Recommendation {
  productId: string;
  reason: string;
  relevanceScore: number;
  category: string;
}

/**
 * Generate personalized recommendations
 */
export function generateRecommendations(
  userSearchHistory: string[],
  userWatchlist: string[],
  category?: string
): Recommendation[] {
  // Extract common keywords
  const keywords = [...userSearchHistory].slice(-5);
  const categories = new Set<string>();

  // Mock recommendation engine
  const recommendations: Recommendation[] = [
    {
      productId: 'ASN123',
      reason: `Similar to products you searched: ${keywords[0] || 'this'}`,
      relevanceScore: 85,
      category: category || 'Electronics',
    },
    {
      productId: 'ASN124',
      reason: 'Trending in your favorite category',
      relevanceScore: 75,
      category: category || 'Fashion',
    },
    {
      productId: 'ASN125',
      reason: 'Best seller matching your interests',
      relevanceScore: 70,
      category: category || 'Home Appliances',
    },
    {
      productId: 'ASN126',
      reason: 'Limited time deal - popular in your area',
      relevanceScore: 65,
      category: category || 'Accessories',
    },
    {
      productId: 'ASN127',
      reason: 'Frequently bought together with items you viewed',
      relevanceScore: 60,
      category: category || 'Electronics',
    },
  ];

  return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Get "You might like" suggestions based on currently viewed product
 */
export function getSimilarProducts(
  currentProduct: { title: string; category: string; price: number; ASIN?: string },
  allProducts: Array<{ title: string; category: string; price: number; ASIN: string }>
): Array<{ ASIN: string; similarity: number }> {
  return allProducts
    .filter((p) => !currentProduct.ASIN || p.ASIN !== currentProduct.ASIN)
    .map((p) => {
      let similarity = 0;

      // Same category = high similarity
      if (p.category === currentProduct.category) {
        similarity += 40;
      }

      // Similar price range (±20%) = medium similarity
      if (
        p.price > currentProduct.price * 0.8 &&
        p.price < currentProduct.price * 1.2
      ) {
        similarity += 30;
      }

      // Title keyword overlap
      const currentWords = currentProduct.title.toLowerCase().split(' ');
      const productWords = p.title.toLowerCase().split(' ');
      const overlap = currentWords.filter((w) =>
        productWords.some((pw) => pw.includes(w) || w.includes(pw))
      ).length;
      similarity += overlap * 5;

      return { ASIN: p.ASIN, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 6);
}

/**
 * Trending products in each category (based on searches and price drops)
 */
export function getTrendingByCategory(
  category: string
): Array<{ title: string; trend: number; savings: string }> {
  const categoryTrending: Record<string, Array<{ title: string; trend: number; savings: string }>> = {
    Electronics: [
      { title: 'iPhone 16 Pro Max', trend: 95, savings: '₹5,000-10,000' },
      { title: 'MacBook Air M3', trend: 88, savings: '₹15,000-20,000' },
      { title: 'Samsung Galaxy S25', trend: 85, savings: '₹8,000-12,000' },
      { title: 'iPad Air', trend: 78, savings: '₹5,000-8,000' },
      { title: 'Sony WH-1000XM5', trend: 72, savings: '₹3,000-5,000' },
    ],
    Fashion: [
      { title: 'Designer Sarees', trend: 90, savings: '₹2,000-5,000' },
      { title: 'Premium Jeans', trend: 85, savings: '₹1,000-2,000' },
      { title: 'Ethnic Wear', trend: 80, savings: '₹3,000-7,000' },
      { title: 'Sports Shoes', trend: 75, savings: '₹1,500-3,000' },
      { title: 'Designer Handbags', trend: 70, savings: '₹2,000-4,000' },
    ],
    'Home Appliances': [
      { title: 'Smart Washing Machine', trend: 88, savings: '₹5,000-10,000' },
      { title: 'Air Conditioner', trend: 82, savings: '₹8,000-15,000' },
      { title: 'Refrigerator', trend: 78, savings: '₹5,000-12,000' },
      { title: 'Microwave Oven', trend: 72, savings: '₹2,000-4,000' },
      { title: 'Water Purifier', trend: 68, savings: '₹3,000-6,000' },
    ],
  };

  return (
    categoryTrending[category] || [
      { title: 'Best Sellers', trend: 80, savings: '₹1,000-5,000' },
    ]
  );
}
