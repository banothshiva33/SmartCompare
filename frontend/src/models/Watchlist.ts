import mongoose from 'mongoose';

const WatchlistSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    productId: { type: String, required: true }, // ASIN / SKU
    title: String,
    image: String,
    currentPrice: Number,
    targetPrice: Number, // alert when price <= this
    platform: String,
    url: String,
  },
  { timestamps: true }
);

export default mongoose.models.Watchlist ||
  mongoose.model('Watchlist', WatchlistSchema);