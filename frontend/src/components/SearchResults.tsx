'use client';

import { useEffect, useState, useMemo } from 'react';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import ComparisonTable from './ComparisonTable';
import { analyzeProducts, ComparisonMetrics } from '@/lib/comparison';

export default function SearchResults() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const metrics = useMemo(
    () => analyzeProducts(products),
    [products]
  );

  useEffect(() => {
    const handler = (e: any) => {
      const { products, query } = e.detail;
      setProducts(products);
      setQuery(query);
      setHasSearched(true);
    };

    window.addEventListener('search-results', handler);
    return () => window.removeEventListener('search-results', handler);
  }, []);

  if (!hasSearched) {
    return null;
  }

  if (products.length === 0) {
    return (
      <div className="mt-12 text-center py-12">
        <p className="text-gray-600 text-lg">
          No products found for "{query}". Try another search!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* Results Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results for "{query}"
        </h2>
        <p className="text-gray-600">
          Found {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {products.map((product, index) => (
          <ProductCard
            key={`${product.platform}-${product.ASIN}-${index}`}
            product={product}
            metrics={metrics}
            allProducts={products}
          />
        ))}
      </div>

      {/* Comparison Table */}
      {products.length > 1 && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Comparison
          </h3>
          <ComparisonTable products={products} metrics={metrics} />
        </div>
      )}
    </div>
  );
}
