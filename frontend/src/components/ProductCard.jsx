"use client";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 hover:shadow-xl transition">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-48 object-contain mb-3"
      />

      <h3 className="font-semibold text-sm mb-2">
        {product.title}
      </h3>

      <p className="text-yellow-500 text-sm mb-1">
        ⭐ {product.rating}
      </p>

      <p className="text-green-600 font-bold">
        {product.displayPrice}
      </p>
    </div>
  );
}