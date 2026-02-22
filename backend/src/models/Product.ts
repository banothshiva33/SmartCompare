import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  asin: string;
  title: string;
  description?: string;
  category: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  platforms: Array<{
    platform: string;
    url: string;
    currentPrice: number;
    originalPrice?: number;
    discount?: number;
    inStock: boolean;
    lastUpdated: Date;
  }>;
  priceHistory: mongoose.Types.ObjectId[];
  lastPriceDrop?: {
    amount: number;
    previousPrice: number;
    date: Date;
  };
  trending: boolean;
  trendingScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    asin: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    platforms: [
      {
        platform: {
          type: String,
          enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'other'],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        currentPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        originalPrice: Number,
        discount: Number,
        inStock: {
          type: Boolean,
          default: true,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    priceHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PriceHistory',
      },
    ],
    lastPriceDrop: {
      amount: Number,
      previousPrice: Number,
      date: Date,
    },
    trending: {
      type: Boolean,
      default: false,
      index: true,
    },
    trendingScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ title: 'text', description: 'text', category: 'text' });
productSchema.index({ category: 1, updatedAt: -1 });
productSchema.index({ 'platforms.platform': 1 });

export default mongoose.model<IProduct>('Product', productSchema);
