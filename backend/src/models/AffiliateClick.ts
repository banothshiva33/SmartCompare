import mongoose, { Schema, Document } from 'mongoose';

export interface IAffiliateClick extends Document {
  userId: mongoose.Types.ObjectId;
  affiliateId: string;
  productId: string;
  platform: string;
  sourceUrl: string;
  redirectUrl: string;
  userAgent?: string;
  ipAddress?: string;
  referer?: string;
  device?: string;
  browser?: string;
  country?: string;
  purchased: boolean;
  purchaseAmount?: number;
  commission?: number;
  clickedAt: Date;
  purchasedAt?: Date;
  expiresAt: Date; // Click expires after 30 days if not purchased
}

const affiliateClickSchema = new Schema<IAffiliateClick>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    affiliateId: {
      type: String,
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'other'],
      required: true,
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    redirectUrl: {
      type: String,
      required: true,
    },
    userAgent: String,
    ipAddress: String,
    referer: String,
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
    },
    browser: String,
    country: String,
    purchased: {
      type: Boolean,
      default: false,
    },
    purchaseAmount: {
      type: Number,
      default: null,
    },
    commission: {
      type: Number,
      default: null,
    },
    clickedAt: {
      type: Date,
      default: Date.now,
    },
    purchasedAt: Date,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for analytics
affiliateClickSchema.index({ affiliateId: 1, platform: 1, clickedAt: -1 });
affiliateClickSchema.index({ userId: 1, purchased: 1 });
affiliateClickSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.model<IAffiliateClick>('AffiliateClick', affiliateClickSchema);
