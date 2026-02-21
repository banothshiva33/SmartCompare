/**
 * COUPON INTEGRATION
 * Aggregates coupons from multiple sources
 */

interface Coupon {
  code: string;
  discount: number; // percentage
  description: string;
  platform: string;
  expiryDate: string;
  applicable: boolean;
}

export async function findCoupons(
  productTitle: string,
  platform: string
): Promise<Coupon[]> {
  try {
    // In production, integrate with APIs like:
    // - GrabOn (Indian coupon aggregator)
    // - CouponDunia
    // - RetailMeNot API
    // - Platform's own coupon API

    const mockCoupons: Record<string, Coupon[]> = {
      Amazon: [
        {
          code: 'WELCOME10',
          discount: 10,
          description: 'Welcome bonus - 10% off on first purchase',
          platform: 'Amazon',
          expiryDate: '2026-03-31',
          applicable: true,
        },
        {
          code: 'PRIMEDAY',
          discount: 20,
          description: 'Prime Day Special - 20% off on electronics',
          platform: 'Amazon',
          expiryDate: '2026-02-28',
          applicable:
            productTitle.toLowerCase().includes('electron') ||
            productTitle.toLowerCase().includes('phone') ||
            productTitle.toLowerCase().includes('laptop'),
        },
      ],
      Flipkart: [
        {
          code: 'FLIP50',
          discount: 15,
          description: 'Flipkart Special - 15% off on select items',
          platform: 'Flipkart',
          expiryDate: '2026-03-15',
          applicable: true,
        },
        {
          code: 'FASHION22',
          discount: 22,
          description: 'Fashion Week - 22% off on clothing & accessories',
          platform: 'Flipkart',
          expiryDate: '2026-02-28',
          applicable:
            productTitle.toLowerCase().includes('cloth') ||
            productTitle.toLowerCase().includes('dress') ||
            productTitle.toLowerCase().includes('shoe') ||
            productTitle.toLowerCase().includes('accessory'),
        },
      ],
      Myntra: [
        {
          code: 'NEW25',
          discount: 25,
          description: 'New User - 25% off on first order',
          platform: 'Myntra',
          expiryDate: '2026-04-30',
          applicable: true,
        },
        {
          code: 'SUMMER30',
          discount: 30,
          description: 'Summer Sale - Up to 30% off on fashion',
          platform: 'Myntra',
          expiryDate: '2026-03-31',
          applicable: true,
        },
      ],
      Ajio: [
        {
          code: 'FIRST15',
          discount: 15,
          description: 'First Order - 15% off',
          platform: 'Ajio',
          expiryDate: '2026-05-31',
          applicable: true,
        },
      ],
    };

    return mockCoupons[platform] || [];
  } catch (error) {
    console.error('Coupon fetch error:', error);
    return [];
  }
}

export function getApplicableCoupons(coupons: Coupon[]): Coupon[] {
  return coupons
    .filter((c) => c.applicable && new Date(c.expiryDate) > new Date())
    .sort((a, b) => b.discount - a.discount);
}

export function calculateSavingsWithCoupon(
  price: number,
  coupon: Coupon
): number {
  return Math.floor(price * (coupon.discount / 100));
}
