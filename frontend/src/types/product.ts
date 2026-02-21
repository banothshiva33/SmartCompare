export interface Product {
  ASIN: string;
  title: string;
  image: string;
  price: number;
  displayPrice: string;
  rating: number;
  reviewCount: number;
  discount?: number;
  platform: 'Amazon' | 'Flipkart' | 'Myntra' | 'Ajio' | 'Other';
  url: string;
  affiliateLink?: string; // Affiliate tracking link
  
  // Revenue-generating features
  category?: string; // Product category (Fashion, Electronics, Home, etc.)
  originalPrice?: number; // Original price before discount
  savings?: number; // Amount saved
  savingsPercent?: number; // Savings percentage
  cashback?: number; // Cashback amount available
  couponCode?: string; // Available coupon code
  couponDiscount?: number; // Coupon discount amount
  trending?: boolean; // Is this trending?
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  
  // Price tracking
  priceHistory?: Array<{ date: string; price: number }>;
  lowestPrice?: number; // All-time low price
  highestPrice?: number; // All-time high price
  
  // Engagement metrics
  clicks?: number; // Affiliate link clicks
  conversions?: number; // Purchases through affiliate link
  revenue?: number; // Estimated revenue from this product
}