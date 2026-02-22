"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/NavbarNew';
import SearchBarNew from '@/components/SearchBarNew';
import LeftFilters from '@/components/LeftFilters';
import ProductCardNew from '@/components/ProductCardNew';
import { Product } from '@/types/product';
import { ArrowUp } from 'lucide-react';

function BrowseContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('price-low');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = searchQuery || 'popular products deals';
        const res = await fetch(`/api/search/products?query=${encodeURIComponent(query)}`);
        
        if (res.ok) {
          const data = await res.json();
          const items = data.products || data.results || [];
          setProducts(items);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchProducts();
    }
  }, [searchQuery]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Price filter
    result = result.filter(
      (p) => p.price >= minPrice && p.price <= maxPrice
    );

    // Rating filter
    if (minRating > 0) {
      result = result.filter((p) => (p.rating || 0) >= minRating);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'discount':
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, minPrice, maxPrice, minRating, sortBy]);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Navbar />
      <div className="pt-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="px-4 max-w-6xl mx-auto py-8">
          <SearchBarNew />
        </div>
      </div>

      <div className="px-4 max-w-6xl mx-auto py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Products'}
          </h1>
          <p className="text-gray-600">
            Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <LeftFilters
            minPrice={minPrice}
            maxPrice={maxPrice}
            minRating={minRating}
            onPriceChange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            onRatingChange={setMinRating}
          />

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <p className="text-gray-600 font-medium">
                Showing {filteredProducts.length} products
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="discount">Discount</option>
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 rounded-lg h-72 animate-pulse"
                  ></div>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {!loading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCardNew key={product.ASIN} product={product} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-40"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
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

