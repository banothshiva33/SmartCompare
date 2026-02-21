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
