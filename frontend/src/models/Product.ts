import mongoose from 'mongoose';

interface IProduct {
  ASIN: string;
  title: string;
  image: string;
  price: number;
  displayPrice: string;
  rating: number;
  reviewCount: number;
  discount?: number;
  platform: 'Amazon' | 'Flipkart' | 'Myntra' | 'Ajio' | 'Other';
  url: string;
  affiliateLink?: string;
  category?: string;
  originalPrice?: number;
  savings?: number;
  savingsPercent?: number;
  cashback?: number;
  couponCode?: string;
  couponDiscount?: number;
  trending?: boolean;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  priceHistory?: Array<{ date: string; price: number }>;
  lowestPrice?: number;
  highestPrice?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
}

const ProductSchema = new mongoose.Schema<IProduct>({
  ASIN: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  displayPrice: { type: String, required: true },
  rating: { type: Number, required: true },
  reviewCount: { type: Number, required: true },
  discount: Number,
  platform: { type: String, enum: ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Other'], index: true },
  url: { type: String, required: true },
  affiliateLink: String,
  category: { type: String, index: true },
  originalPrice: Number,
  savings: Number,
  savingsPercent: Number,
  cashback: Number,
  couponCode: String,
  couponDiscount: Number,
  trending: { type: Boolean, default: false },
  stockStatus: { type: String, enum: ['In Stock', 'Low Stock', 'Out of Stock'] },
  priceHistory: [
    {
      date: String,
      price: Number,
    },
  ],
  lowestPrice: Number,
  highestPrice: Number,
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
},
{ timestamps: true });

// Create indexes
ProductSchema.index({ platform: 1, savingsPercent: -1 });
ProductSchema.index({ category: 1, trending: -1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema);
