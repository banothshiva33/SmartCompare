import mongoose from 'mongoose';

const PriceHistorySchema = new mongoose.Schema(
  {
    productId: { type: String, required: true }, // ASIN
    title: String,
    price: { type: Number, required: true },
    displayPrice: String,
    platform: { type: String, default: 'Amazon' },
    image: String,
    rating: Number,
    reviewCount: Number,
    url: String,
  },
  { timestamps: true }
);

// Compound index for efficient queries
PriceHistorySchema.index({ productId: 1, createdAt: -1 });

export default mongoose.models.PriceHistory ||
  mongoose.model('PriceHistory', PriceHistorySchema);
