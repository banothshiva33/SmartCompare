'use client';

import { useState, useEffect } from 'react';
import { Flame, TrendingUp, Tag } from 'lucide-react';

interface Deal {
  productId: string;
  title: string;
  price: number;
  originalPrice: number;
  savingsPercent: number;
  platform: string;
  image: string;
  rating: number;
  clicks: number;
  category: string;
}

export default function TrendingDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Electronics');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Electronics',
    'Fashion',
    'Home Appliances',
    'Accessories',
    'All',
  ];

  useEffect(() => {
    fetchTrendingDeals();
  }, [selectedCategory]);

  const fetchTrendingDeals = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/deals/trending?category=${selectedCategory}&limit=20`
      );
      const data = await response.json();
      if (data.success) {
        setDeals(data.deals);
      }
    } catch (error) {
      console.error('Failed to fetch trending deals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="text-red-500" size={32} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trending Deals
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Hottest deals across all platforms - Save big today!
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No trending deals at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <div
                key={deal.productId}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition overflow-hidden group"
              >
                {/* Deal Badge */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Flame size={16} />
                    {deal.savingsPercent}% OFF
                  </div>
                  <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-900 px-2 py-1 rounded text-xs font-semibold">
                    {deal.platform}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                    {deal.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <span>⭐ {deal.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({deal.clicks} interested)
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg mb-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Now
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{deal.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Was
                        </p>
                        <p className="text-lg line-through text-gray-500">
                          ₹{Math.ceil(deal.originalPrice).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400 mt-2 flex items-center gap-1">
                      <TrendingUp size={14} />
                      Save ₹{Math.ceil(deal.originalPrice - deal.price).toLocaleString()}
                    </p>
                  </div>

                  {/* CTA */}
                  <a
                    href={`#`}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition text-center"
                  >
                    View Deal
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
