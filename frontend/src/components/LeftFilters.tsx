'use client';

import { useState, useEffect } from 'react';

interface Props {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  onApply: (opts: { minPrice?: number; maxPrice?: number; minRating?: number }) => void;
}

export default function LeftFilters({ categories, selectedCategory, onCategoryChange, onApply }: Props) {
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
  }, [selectedCategory]);

  return (
    <aside className="w-full lg:w-72 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm sticky top-28">
      <h3 className="font-bold mb-3 text-gray-800 dark:text-gray-100">Filters</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Category</label>
        <select value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm">
          <option value="All">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Price Range (₹)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={minPrice as any} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')} className="w-1/2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm" />
          <input type="number" placeholder="Max" value={maxPrice as any} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')} className="w-1/2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Min Rating</label>
        <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm">
          <option value={0}>Any</option>
          <option value={3}>3.0+</option>
          <option value={4}>4.0+</option>
          <option value={4.5}>4.5+</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onApply({ minPrice: minPrice === '' ? undefined : Number(minPrice), maxPrice: maxPrice === '' ? undefined : Number(maxPrice), minRating: minRating || undefined })} className="flex-1 bg-indigo-600 text-white py-2 rounded-md text-sm hover:opacity-95">Apply</button>
        <button onClick={() => { setMinPrice(''); setMaxPrice(''); setMinRating(0); onApply({}); }} className="flex-1 border border-gray-200 dark:border-gray-700 py-2 rounded-md text-sm hover:bg-gray-50">Clear</button>
      </div>
    </aside>
  );
}
