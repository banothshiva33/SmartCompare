import nodemailer from 'nodemailer';

export async function sendPriceAlert(
  email: string,
  title: string,
  oldPrice: number,
  newPrice: number,
  url: string
) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ALERT_EMAIL,
      pass: process.env.ALERT_EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: 'Smart Compare 🔔',
    to: email,
    subject: 'Price Drop Alert!',
    html: `
      <h2>Good news! 🎉</h2>
      <p><b>${title}</b></p>
      <p>Price dropped from <b>₹${oldPrice}</b> to <b>₹${newPrice}</b></p>
      <a href="${url}">View Deal</a>
    `,
  });
}