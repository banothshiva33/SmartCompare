import mongoose, { Schema, Document } from 'mongoose';

export interface IWatchlist extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  platform: string;
  targetPrice?: number;
  currentPrice: number;
  notifyOnDrop: boolean;
  alertsSent: number;
  lastAlertDate?: Date;
  addedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'other'],
      required: true,
    },
    targetPrice: {
      type: Number,
      min: 0,
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    notifyOnDrop: {
      type: Boolean,
      default: true,
    },
    alertsSent: {
      type: Number,
      default: 0,
    },
    lastAlertDate: Date,
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index per user per product per platform
watchlistSchema.index({ userId: 1, productId: 1, platform: 1 }, { unique: true });

// Index for finding products that need price drop alerts
watchlistSchema.index({ notifyOnDrop: 1, targetPrice: 1 });

export default mongoose.model<IWatchlist>('Watchlist', watchlistSchema);
