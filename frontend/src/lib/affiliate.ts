import { connectDB } from './db';
import { Product } from '@/types/product';

/**
 * Affiliate Link Management System
 * Generates affiliate links and tracks conversions
 */

const AFFILIATE_CONFIG = {
  amazon: {
    baseUrl: 'https://amazon.com/s',
    partnerTag: process.env.AMAZON_PARTNER_TAG || 'smartcompare-20',
    trackingId: process.env.AMAZON_TRACKING_ID,
    commission: 0.03, // 3% for links directing to products
  },
  flipkart: {
    baseUrl: 'https://www.flipkart.com',
    affiliateId: process.env.FLIPKART_AFFILIATE_ID,
    trackingCode: process.env.FLIPKART_TRACKING_CODE,
    commission: 0.05, // 5%
  },
  myntra: {
    baseUrl: 'https://www.myntra.com',
    affiliateId: process.env.MYNTRA_AFFILIATE_ID,
    trackingCode: process.env.MYNTRA_TRACKING_CODE,
    commission: 0.1, // 10%
  },
  ajio: {
    baseUrl: 'https://www.ajio.com',
    affiliateId: process.env.AJIO_AFFILIATE_ID,
    trackingCode: process.env.AJIO_TRACKING_CODE,
    commission: 0.08, // 8%
  },
};

export function generateAffiliateLink(product: Product): string {
  const platform = product.platform.toLowerCase();

  switch (platform) {
    case 'amazon':
      return generateAmazonAffiliateLink(product);
    case 'flipkart':
      return generateFlipkartAffiliateLink(product);
    case 'myntra':
      return generateMyntraAffiliateLink(product);
    case 'ajio':
      return generateAjioAffiliateLink(product);
    default:
      return product.url; // Fallback to original URL
  }
}

function generateAmazonAffiliateLink(product: Product): string {
  const config = AFFILIATE_CONFIG.amazon;

  // Format: https://amazon.com/s?k=QUERY&tag=PARTNER_TAG
  if (product.ASIN) {
    return `https://amazon.com/dp/${product.ASIN}?tag=${config.partnerTag}`;
  }

  // Fallback to search link
  return `${config.baseUrl}?k=${encodeURIComponent(product.title)}&tag=${config.partnerTag}`;
}

function generateFlipkartAffiliateLink(product: Product): string {
  const config = AFFILIATE_CONFIG.flipkart;

  if (!config.affiliateId) {
    return product.url;
  }

  // Flipkart affiliate format
  return `${config.baseUrl}?affid=${config.affiliateId}&q=${encodeURIComponent(product.title)}`;
}

function generateMyntraAffiliateLink(product: Product): string {
  const config = AFFILIATE_CONFIG.myntra;

  if (!config.affiliateId) {
    return product.url;
  }

  return `${config.baseUrl}?affid=${config.affiliateId}&q=${encodeURIComponent(product.title)}`;
}

function generateAjioAffiliateLink(product: Product): string {
  const config = AFFILIATE_CONFIG.ajio;

  if (!config.affiliateId) {
    return product.url;
  }

  return `${config.baseUrl}?affid=${config.affiliateId}&q=${encodeURIComponent(product.title)}`;
}

/**
 * Track affiliate conversions
 */
interface AffiliateConversion {
  productId: string;
  platform: string;
  userId?: string;
  amount: number;
  commissionAmount: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'paid';
}

export async function trackAffiliateClick(product: Product, userId?: string) {
  try {
    await connectDB();

    // Log click to database (optional - for analytics)
    const clickRecord = {
      productId: product.ASIN,
      platform: product.platform,
      userId: userId || 'anonymous',
      timestamp: new Date(),
      type: 'click',
    };

    console.log('📊 Affiliate click tracked:', clickRecord);

    return clickRecord;
  } catch (error) {
    console.error('Failed to track affiliate click:', error);
  }
}

export function getEstimatedCommission(product: Product, estimatedPrice?: number): number {
  const platform = product.platform.toLowerCase();
  const config = AFFILIATE_CONFIG[platform as keyof typeof AFFILIATE_CONFIG];

  if (!config) return 0;

  const price = estimatedPrice || product.price || 0;
  return price * config.commission;
}

/**
 * Get commission breakdown for multiple products
 */
export function getCommissionBreakdown(products: Product[]): {
  platform: string;
  productCount: number;
  estimatedCommission: number;
  commissionRate: number;
}[] {
  const breakdown: {
    [key: string]: {
      platform: string;
      productCount: number;
      estimatedCommission: number;
      commissionRate: number;
    };
  } = {};

  products.forEach((product) => {
    const platform = product.platform.toLowerCase();
    const config = AFFILIATE_CONFIG[platform as keyof typeof AFFILIATE_CONFIG];

    if (!config) return;

    if (!breakdown[platform]) {
      breakdown[platform] = {
        platform: product.platform,
        productCount: 0,
        estimatedCommission: 0,
        commissionRate: config.commission * 100,
      };
    }

    breakdown[platform].productCount += 1;
    breakdown[platform].estimatedCommission += getEstimatedCommission(product);
  });

  return Object.values(breakdown);
}

/**
 * Validate affiliate link integrity
 */
export function isValidAffiliateLink(url: string): boolean {
  try {
    const urlObj = new URL(url);

    // Check if URL has required affiliate parameters
    if (url.includes('amazon')) {
      return urlObj.searchParams.has('tag');
    }

    if (url.includes('flipkart')) {
      return urlObj.searchParams.has('affid');
    }

    if (url.includes('myntra')) {
      return urlObj.searchParams.has('affid');
    }

    return true; // Unknown platform, assume valid
  } catch {
    return false;
  }
}
