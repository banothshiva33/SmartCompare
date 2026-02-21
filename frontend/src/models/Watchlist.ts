import mongoose from 'mongoose';

const WatchlistSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    asin: String,
    title: String,
    image: String,
    currentPrice: Number,
    lastCheckedPrice: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Watchlist ||
  mongoose.model('Watchlist', WatchlistSchema);
