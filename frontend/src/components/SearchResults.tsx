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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [total, setTotal] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchType, setSearchType] = useState<'text'|'image'>('text');

  const metrics = useMemo(
    () => analyzeProducts(products),
    [products]
  );

  useEffect(() => {
    const handler = (e: any) => {
      const { products, query, page: p = 1, pageSize: ps = 24, total: t = null, searchType: st = 'text' } = e.detail;
      setProducts(products || []);
      setQuery(query || '');
      setPage(p);
      setPageSize(ps);
      setTotal(typeof t === 'number' ? t : (products ? products.length : 0));
      setSearchType(st);
      setHasSearched(true);
    };

    window.addEventListener('search-results', handler);
    return () => window.removeEventListener('search-results', handler);
  }, []);

  const loadMore = async () => {
    if (loadingMore) return;
    if (total !== null && products.length >= total) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      if (searchType === 'image') {
        // image searches can't be paged from client (binary) — skip
        return;
      }

      const formData = new FormData();
      formData.append('query', query);
      formData.append('searchType', 'text');
      formData.append('page', String(next));
      formData.append('pageSize', String(pageSize));

      // dedupe in-flight requests
      const key = `search:query=${query}:page=${next}:size=${pageSize}`;
      const res = await import('@/lib/dedupe').then(({ withInFlight }) =>
        withInFlight(key, () => fetch('/api/search', { method: 'POST', body: formData }))
      );
      if (!res.ok) throw new Error('Failed to load more');
      const data = await res.json();
      const items: Product[] = data.products || [];
      setProducts((prev) => {
        const newProducts = [...prev, ...items];
        setTotal(typeof data.total === 'number' ? data.total : newProducts.length);
        return newProducts;
      });
      setPage(next);
    } catch (err) {
      console.error('Load more search error', err);
    } finally {
      setLoadingMore(false);
    }
  };

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

      {/* Load More Button */}
      {products.length > 0 && total !== null && products.length < total && (
        <div className="flex justify-center py-8 border-t border-gray-200 dark:border-gray-700 mt-12">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            aria-disabled={loadingMore}
            aria-busy={loadingMore}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              loadingMore
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {loadingMore ? 'Loading more products…' : 'Load More Products'}
          </button>
        </div>
      )}
    </div>
  );
}
