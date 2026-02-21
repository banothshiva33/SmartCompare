import { Product } from '@/types/product';

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <img
        src={product.image}
        alt={product.title}
        className="h-40 w-full object-contain mb-3"
      />

      <h3 className="font-semibold text-sm mb-1 line-clamp-2">
        {product.title}
      </h3>

      <p className="text-lg font-bold">{product.displayPrice}</p>

      <p className="text-sm text-gray-600">
        ⭐ {product.rating} ({product.reviewCount} reviews)
      </p>

      <button className="mt-3 w-full bg-black text-white py-2 rounded-lg">
        View Deal
      </button>
    </div>
  );
}
