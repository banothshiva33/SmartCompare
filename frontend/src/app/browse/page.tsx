"use client";

import { useEffect, useState, useMemo } from 'react';
import AffiliateNotice from '@/components/AffiliateNotice';
import PlatformGrid from '@/components/PlatformGrid';
import CategoryTabs from '@/components/CategoryTabs';
import LeftFilters from '@/components/LeftFilters';
import { Product } from '@/types/product';

export default function BrowsePage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [byPlatform, setByPlatform] = useState<Record<string, Product[]>>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // initial load or when category changes
    setProducts([]);
    setPage(1);
    setTotal(null);
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: '1', pageSize: String(pageSize) });
        if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
        const res = await fetch(`/api/deals/trending?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const items: Product[] = data.deals || [];
          setProducts(items);
          setTotal(typeof data.total === 'number' ? data.total : items.length);
          setPage(1);
        } else {
          console.error('Failed to load trending deals');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCategory]);

  const fetchNextPage = async () => {
    if (loadingMore) return;
    if (total !== null && products.length >= total) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const params = new URLSearchParams({ page: String(next), pageSize: String(pageSize) });
      if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);

      const key = `trending:category=${selectedCategory}:page=${next}:size=${pageSize}:sort=${sortBy}`;
      const res = await import('@/lib/dedupe').then(({ withInFlight }) =>
        withInFlight(key, () => fetch(`/api/deals/trending?${params.toString()}`))
      );
      if (res.ok) {
        const data = await res.json();
        const items: Product[] = data.deals || [];
        setProducts((prev) => {
          const newProducts = [...prev, ...items];
          setTotal(typeof data.total === 'number' ? data.total : newProducts.length);
          return newProducts;
        });
        setPage(next);
      } else {
        console.error('Failed to load more trending deals');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // derive categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category || 'Other'));
    return Array.from(set).slice(0, 12);
  }, [products]);

  // filtered items
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (minRating && (p.rating || 0) < minRating) return false;
      if (minPrice !== undefined && p.price < minPrice) return false;
      if (maxPrice !== undefined && p.price > maxPrice) return false;
      return true;
    });
  }, [products, selectedCategory, minPrice, maxPrice, minRating]);

  useEffect(() => {
    // group by platform
    const groups: Record<string, Product[]> = {};
    filtered.forEach((p) => {
      const key = p.platform || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    setByPlatform(groups);
  }, [filtered]);

  return (
    <main className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <AffiliateNotice />

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-4">Browse Products</h1>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">Showing {filtered.length} items</div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm">
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700'}`}>Grid</button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700'}`}>List</button>
            </div>
          </div>
        </div>

        <CategoryTabs categories={categories} selected={selectedCategory} onSelect={(c) => setSelectedCategory(c)} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <LeftFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={(c) => setSelectedCategory(c)}
              onApply={(opts) => { setMinPrice(opts.minPrice); setMaxPrice(opts.maxPrice); setMinRating(opts.minRating); }}
            />
          </div>

          <div className="lg:col-span-3">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
              </div>
            )}

            {!loading && Object.keys(byPlatform).length === 0 && (
              <p className="text-gray-600">No products found for this selection.</p>
            )}

            {!loading && Object.entries(byPlatform).map(([platform, list]) => (
              <PlatformGrid key={platform} platform={platform} products={list} viewMode={viewMode} onRequestMore={fetchNextPage} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

