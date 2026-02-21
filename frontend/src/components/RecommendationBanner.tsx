export default function RecommendationBanner({ product, reason }: any) {
  if (!product) return null;

  return (
    <div className="mt-10 p-6 rounded-2xl bg-green-50 border border-green-200">
      <h2 className="text-lg font-bold text-green-700">
        ✅ Our Recommendation
      </h2>
      <p className="mt-1 font-medium">{product.title}</p>
      <p className="text-sm text-gray-600">
        ⭐ {product.rating} • {product.displayPrice}
      </p>
      <p className="mt-2 text-sm text-green-600">
        Why? {reason}
      </p>
    </div>
  );
}