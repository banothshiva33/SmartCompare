/**
 * CASHBACK & PAYMENT INTEGRATION
 * Detects available cashback offers from payment methods
 */

interface CashbackOffer {
  provider: string; // e.g., "PhonePe", "Google Pay", "Credit Card",
  cashbackPercent: number;
  maxCashback: number;
  minPurchase: number;
  description: string;
  valid: boolean;
  expiryDate: string;
}

/**
 * Find available cashback offers based on purchase amount and category
 */
export function findCashbackOffers(
  amount: number,
  category: string,
  platform: string
): CashbackOffer[] {
  const offers: CashbackOffer[] = [
    {
      provider: 'PhonePe',
      cashbackPercent: 10,
      maxCashback: 500,
      minPurchase: 100,
      description: 'UPI Cashback - 10% on UPI payments',
      valid: true,
      expiryDate: '2026-03-31',
    },
    {
      provider: 'Google Pay',
      cashbackPercent: 5,
      maxCashback: 300,
      minPurchase: 50,
      description: 'Everyday Cashback - 5% on all purchases',
      valid: true,
      expiryDate: '2026-02-28',
    },
    {
      provider: 'HDFC Credit Card',
      cashbackPercent: 5,
      maxCashback: 1000,
      minPurchase: 2000,
      description: 'Credit Card Cashback - 5% on online purchases',
      valid: true,
      expiryDate: '2026-04-30',
    },
    {
      provider: 'ICICI Credit Card',
      cashbackPercent: 3,
      maxCashback: 500,
      minPurchase: 1000,
      description: 'Credit Card Cashback - 3% on all transactions',
      valid: true,
      expiryDate: '2026-03-31',
    },
  ];

  // Category-specific offers (Fashion cashback higher during sales)
  if (category.toLowerCase().includes('fashion')) {
    offers.push({
      provider: 'Myntra SuperMoney',
      cashbackPercent: 15,
      maxCashback: 5000,
      minPurchase: 1000,
      description: 'Fashion Cashback - 15% on fashion items with SuperMoney',
      valid: true,
      expiryDate: '2026-02-28',
    });
  }

  // Electronics offers
  if (category.toLowerCase().includes('electron')) {
    offers.push({
      provider: 'Amazon Cashback',
      cashbackPercent: 8,
      maxCashback: 2000,
      minPurchase: 500,
      description: 'Electronics Cashback - 8% on selected electronics',
      valid: true,
      expiryDate: '2026-03-31',
    });
  }

  return offers.filter((o) => o.minPurchase <= amount);
}

/**
 * Calculate total savings including all offers
 */
export function calculateTotalSavings(
  price: number,
  discountPercent: number,
  couponAmount: number,
  maxCashback: number
): { discountAmount: number; cashback: number; total: number } {
  const discountAmount = Math.floor(price * (discountPercent / 100));
  return {
    discountAmount,
    cashback: maxCashback,
    total: discountAmount + maxCashback,
  };
}

/**
 * Get recommended payment method for maximum savings
 */
export function getOptimalPaymentMethod(
  amount: number,
  category: string
): { method: string; cashback: number; description: string } {
  const offers = findCashbackOffers(amount, category, '');
  const best = offers.reduce((prev, current) =>
    current.maxCashback > prev.maxCashback ? current : prev
  );

  return {
    method: best.provider,
    cashback: Math.min(best.maxCashback, Math.floor(amount * (best.cashbackPercent / 100))),
    description: best.description,
  };
}
