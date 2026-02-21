import mongoose from 'mongoose';

interface IAffiliateClick {
  productId: string;
  platform: string;
  title: string;
  price: number;
  affiliateLink: string;
  timestamp: Date;
  userIP: string;
  converted: boolean;
  conversionDate?: Date;
  revenue?: number;
}

const AffiliateClickSchema = new mongoose.Schema<IAffiliateClick>({
  productId: { type: String, required: true, index: true },
  platform: { type: String, required: true, index: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  affiliateLink: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  userIP: { type: String, required: true },
  converted: { type: Boolean, default: false },
  conversionDate: Date,
  revenue: Number,
});

// Create indexes for efficient querying
AffiliateClickSchema.index({ platform: 1, timestamp: -1 });
AffiliateClickSchema.index({ productId: 1 });

export default mongoose.models.AffiliateClick ||
  mongoose.model<IAffiliateClick>('AffiliateClick', AffiliateClickSchema);
