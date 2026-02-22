import emailjs from '@emailjs/browser';

// ========== Security: Initialize EmailJS on client side ==========
// EmailJS public key is OK to be public (it's designed for client-side usage)
// However, the service ID and template ID should be validated on backend
// Real implementation would call a backend endpoint that validates the request

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
  console.error('❌ EmailJS configuration missing. Check your .env.local file.');
}

/**
 * Send price alert email
 * ⚠️ SECURITY NOTE: In production, this should be called from a backend API
 * to prevent email injection and ensure proper validation/rate limiting
 */
export function sendPriceAlertEmail(
  email: string,
  productName: string,
  oldPrice: number,
  newPrice: number
) {
  // ========== Security: Validate inputs before sending ==========
  if (!isValidEmail(email)) {
    return Promise.reject(new Error('Invalid email format'));
  }

  if (!isValidPrice(oldPrice) || !isValidPrice(newPrice)) {
    return Promise.reject(new Error('Invalid price values'));
  }

  if (!isValidProductName(productName)) {
    return Promise.reject(new Error('Invalid product name'));
  }

  return emailjs.send(
    SERVICE_ID!,
    TEMPLATE_ID!,
    {
      to_email: email,
      product_name: productName,
      old_price: oldPrice.toFixed(2),
      new_price: newPrice.toFixed(2),
      // Add timestamp to prevent replay attacks
      timestamp: new Date().toISOString(),
    },
    PUBLIC_KEY!
  );
}

/**
 * Send target price alert email
 * ⚠️ SECURITY NOTE: This should also be called from backend in production
 */
export async function sendTargetPriceAlertEmail(
  email: string,
  productTitle: string,
  currentPrice: number,
  targetPrice: number,
  productUrl: string
) {
  try {
    // ========== Security: Validate all inputs ==========
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!isValidProductName(productTitle)) {
      throw new Error('Invalid product title');
    }

    if (!isValidPrice(currentPrice) || !isValidPrice(targetPrice)) {
      throw new Error('Invalid price values');
    }

    if (!isValidUrl(productUrl)) {
      throw new Error('Invalid product URL');
    }

    if (currentPrice < 0 || targetPrice < 0) {
      throw new Error('Prices cannot be negative');
    }

    const response = await emailjs.send(
      SERVICE_ID!,
      'template_target_alert',
      {
        to_email: email,
        product_name: productTitle,
        current_price: currentPrice.toFixed(2),
        target_price: targetPrice.toFixed(2),
        savings: Math.max(0, currentPrice - targetPrice).toFixed(2),
        product_url: productUrl,
        // Add timestamp to prevent replay attacks
        timestamp: new Date().toISOString(),
      },
      PUBLIC_KEY!
    );

    console.log('✅ Target price alert email sent:', response.status);
    return { success: true, status: response.status };
  } catch (error) {
    const err = error as Error;
    console.error('❌ Email send error:', err.message);
    return { success: false, error: err.message };
  }
}

// ========== Validation Helpers ==========

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length < 254;
}

/**
 * Validate product name
 */
function isValidProductName(name: string): boolean {
  return typeof name === 'string' && name.length > 0 && name.length < 500;
}

/**
 * Validate price format
 */
function isValidPrice(price: any): boolean {
  const num = Number(price);
  return !isNaN(num) && isFinite(num) && num >= 0 && num < 10000000;
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function sendWatchlistNotificationEmail(
  email: string,
  productTitle: string,
  newPrice: number,
  previousPrice: number,
  productUrl: string
) {
  try {
    const priceDrop = previousPrice - newPrice;
    const dropPercentage = ((priceDrop / previousPrice) * 100).toFixed(1);

    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      'template_price_drop', // Custom template for price drops
      {
        to_email: email,
        product_name: productTitle,
        new_price: newPrice,
        previous_price: previousPrice,
        savings: priceDrop,
        drop_percentage: dropPercentage,
        product_url: productUrl,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    console.log('✅ Price drop notification email sent:', response.status);
    return { success: true, status: response.status };
  } catch (error) {
    console.error('❌ Notification email error:', error);
    return { success: false, error: (error as Error).message };
  }
}
