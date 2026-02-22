"use client";

import Image from 'next/image';
import { Product } from '@/types/product';
import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  platform: string;
  products: Product[];
  viewMode?: 'grid' | 'list';
  pageSize?: number;
  onRequestMore?: () => Promise<void>;
}

export default function PlatformGrid({ platform, products, viewMode = 'grid', pageSize = 12, onRequestMore }: Props) {
  if (!products || products.length === 0) return null;

  const categories = Array.from(new Set(products.map((p) => p.category || 'Other')));
  const hero = products.reduce((prev, cur) => (cur.price < prev.price ? cur : prev), products[0]);

  const [visibleCount, setVisibleCount] = useState(Math.min(pageSize, products.length));
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const [supportsIO, setSupportsIO] = useState(typeof IntersectionObserver !== 'undefined');
  const [manualLoadActive, setManualLoadActive] = useState(false);

  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setManualLoadActive(true);
    setTimeout(() => {
      setVisibleCount((v) => Math.min(products.length, v + pageSize));
      loadingRef.current = false;
      setManualLoadActive(false);
    }, 300); // small delay for UX
  }, [pageSize, products.length]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    if (!loaderRef.current) return;
    const el = loaderRef.current;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          // If we still have local items to show, increase visible count
          if (visibleCount < products.length) {
            loadMore();
            return;
          }

          // If there's an external fetch handler, request more items from server
          if (onRequestMore) {
            try {
              await onRequestMore();
            } catch (e) {
              // ignore errors here; loader will show end state
            }
          }
        }
      });
    }, { rootMargin: '400px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [visibleCount, products.length, loadMore]);

  useEffect(() => {
    // detect support for IntersectionObserver and set fallback flag
    setSupportsIO(typeof IntersectionObserver !== 'undefined');
  }, []);

  useEffect(() => {
    // reset when product list changes
    setVisibleCount(Math.min(pageSize, products.length));
  }, [products, pageSize]);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{platform} Picks</h2>
        <div className="text-sm text-gray-500">{products.length} items • {categories.slice(0,3).join(', ')}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-4 shadow-md">
          <div className="relative w-full h-56 bg-white dark:bg-gray-900 rounded overflow-hidden mb-3">
            <Image src={hero.image} alt={hero.title} fill className="object-contain p-4" />
          </div>
          <h3 className="font-semibold line-clamp-2 text-gray-900 dark:text-white">{hero.title}</h3>
          <p className="text-2xl font-extrabold text-green-600 mt-2">₹{hero.price.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{hero.discount ? `${hero.discount}% off` : 'Top pick'}</p>
          <div className="mt-3">
            <button className="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold">Buy Now</button>
          </div>
        </div>

        <div className="lg:col-span-3">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.slice(0, visibleCount).map((p, idx) => (
                <article
                  key={`${platform}-${p.ASIN}`}
                  className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm hover:shadow-lg transition relative group"
                  style={{ animation: `fadeInUp 420ms ease ${(idx % pageSize) * 60}ms both` }}
                >
                  <div className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">{p.discount ? `${p.discount}% OFF` : 'Deal'}</div>
                  <div className="flex flex-col h-full">
                    <div className="relative w-full h-44 bg-gray-100 dark:bg-gray-800 rounded mb-3 overflow-hidden">
                      <Image src={p.image} alt={p.title} fill className="object-contain p-3" />
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-white">{p.title}</h4>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-green-600">₹{p.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{p.reviewCount.toLocaleString()} reviews</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <button className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-semibold">View</button>
                        <button className="mt-2 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-md text-sm">Save</button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
              {products.slice(0, visibleCount).map((p, idx) => (
                  <div
                    key={`${platform}-${p.ASIN}`}
                    className="py-4 flex gap-4 items-center"
                    style={{ animation: `fadeInUp 380ms ease ${(idx % pageSize) * 40}ms both` }}
                  >
                  <div className="relative w-28 h-28 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                    <Image src={p.image} alt={p.title} fill className="object-contain p-2" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm line-clamp-2">{p.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{p.category || 'Other'} • {p.platform}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">₹{p.price.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">{p.reviewCount.toLocaleString()} reviews</div>
                    <div className="mt-2">
                      <button className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-semibold">Buy</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col items-center gap-2">
            {!supportsIO && visibleCount < products.length && (
              <button
                onClick={loadMore}
                disabled={manualLoadActive}
                aria-disabled={manualLoadActive}
                aria-busy={manualLoadActive}
                className={`px-4 py-2 rounded-md font-semibold ${manualLoadActive ? 'bg-gray-400 text-white' : 'bg-indigo-600 text-white'}`}
              >
                {manualLoadActive ? 'Loading…' : 'Load more'}
              </button>
            )}

            <div ref={loaderRef} className="h-8 flex items-center justify-center" aria-live="polite">
              {visibleCount < products.length ? (
                <div className="text-sm text-gray-500">{supportsIO ? 'Loading more...' : ''}</div>
              ) : (
                <div className="text-sm text-gray-400">End of results</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
