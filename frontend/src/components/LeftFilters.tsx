'use client';

import { useState } from 'react';
import { Slider } from 'lucide-react';

interface Props {
  minPrice: number;
  maxPrice: number;
  minRating: number;
  onPriceChange: (min: number, max: number) => void;
  onRatingChange: (rating: number) => void;
}

export default function LeftFilters({
  minPrice,
  maxPrice,
  minRating,
  onPriceChange,
  onRatingChange,
}: Props) {
  const [tempMinPrice, setTempMinPrice] = useState(minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice);
  const [tempMinRating, setTempMinRating] = useState(minRating);

  const handlePriceApply = () => {
    onPriceChange(tempMinPrice, tempMaxPrice);
  };

  const handleRatingApply = () => {
    onRatingChange(tempMinRating);
  };

  const handleClear = () => {
    setTempMinPrice(0);
    setTempMaxPrice(100000);
    setTempMinRating(0);
    onPriceChange(0, 100000);
    onRatingChange(0);
  };

  return (
    <aside className="w-full lg:w-72 p-6 bg-white rounded-2xl shadow-md sticky top-24 h-fit space-y-6">
      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-4">Filters</h3>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Price Range (₹)
        </label>
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Min"
              value={tempMinPrice}
              onChange={(e) => setTempMinPrice(Number(e.target.value) || 0)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={tempMaxPrice}
              onChange={(e) => setTempMaxPrice(Number(e.target.value) || 100000)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <input
            type="range"
            min="0"
            max="100000"
            step="1000"
            value={tempMinPrice}
            onChange={(e) => setTempMinPrice(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <button
            onClick={handlePriceApply}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition text-sm"
          >
            Apply Price
          </button>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Minimum Rating
        </label>
        <select
          value={tempMinRating}
          onChange={(e) => setTempMinRating(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value={0}>Any Rating</option>
          <option value={2}>2.0★ and up</option>
          <option value={3}>3.0★ and up</option>
          <option value={4}>4.0★ and up</option>
          <option value={4.5}>4.5★ and up</option>
        </select>
        <button
          onClick={handleRatingApply}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition text-sm"
        >
          Apply Rating
        </button>
      </div>

      {/* Clear All */}
      <button
        onClick={handleClear}
        className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-2 rounded-lg font-semibold transition text-sm"
      >
        Clear All Filters
      </button>
    </aside>
  );
}
