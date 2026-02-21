'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import { normalizeAmazonItem } from '@/lib/normalize';
import { recommendProduct } from '@/lib/recommendation';
import { Product } from '@/types/product';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setLoading(true);
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    const normalized = data.items.map(normalizeAmazonItem);
    setProducts(normalized);
    setLoading(false);
  }

  const recommended = recommendProduct(products);

  return (
    <>
      {/* Search UI */}
      <div className="w-full max-w-3xl mx-auto mt-10">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border px-4 py-3 rounded-lg"
            placeholder="Search product or paste link"
          />
          <button
            onClick={handleSearch}
            className="bg-black text-white px-6 rounded-lg"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Recommendation */}
      {recommended && (
        <div className="max-w-6xl mx-auto mt-10 p-4 bg-green-50 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">
            ✅ Our Recommendation
          </h2>
          <p className="font-medium">{recommended.title}</p>
          <p>
            ⭐ {recommended.rating} • {recommended.displayPrice}
          </p>
        </div>
      )}

      {/* Results */}
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.ASIN} product={p} />
        ))}
      </div>
    </>
  );
}
