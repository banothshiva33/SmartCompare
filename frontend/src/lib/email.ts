import emailjs from '@emailjs/browser';

export function sendPriceAlertEmail(
  email: string,
  productName: string,
  oldPrice: number,
  newPrice: number
) {
  return emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
    {
      to_email: email,
      product_name: productName,
      old_price: oldPrice,
      new_price: newPrice,
    },
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
  );
}

export async function sendTargetPriceAlertEmail(
  email: string,
  productTitle: string,
  currentPrice: number,
  targetPrice: number,
  productUrl: string
) {
  try {
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      'template_target_alert', // Custom template for target alerts
      {
        to_email: email,
        product_name: productTitle,
        current_price: currentPrice,
        target_price: targetPrice,
        savings: currentPrice - targetPrice,
        product_url: productUrl,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    console.log('✅ Target price alert email sent:', response.status);
    return { success: true, status: response.status };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: (error as Error).message };
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
