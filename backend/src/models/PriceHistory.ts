import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceHistory extends Document {
  productId: mongoose.Types.ObjectId;
  platform: string;
  price: number;
  currency?: string;
  discount?: number;
  originalPrice?: number;
  inStock: boolean;
  recordedAt: Date;
}

const priceHistorySchema = new Schema<IPriceHistory>(
  {
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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    discount: Number,
    originalPrice: Number,
    inStock: {
      type: Boolean,
      default: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for product price tracking over time
priceHistorySchema.index({ productId: 1, platform: 1, recordedAt: -1 });

// TTL index to keep only last 1 year of price history
priceHistorySchema.index({ recordedAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export default mongoose.model<IPriceHistory>('PriceHistory', priceHistorySchema);
