'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Zap, Heart, Award } from 'lucide-react';

interface RevenueDashboard {
  overview: {
    totalClicks: number;
    todayClicks: number;
    totalRevenue: number;
    priceDropAlertsSent: number;
    watchlistItems: number;
  };
  byPlatform: Array<{
    platform: string;
    clicks: number;
    revenue: number;
    commission: string;
  }>;
  topProducts: Array<{
    productId: string;
    title: string;
    clicks: number;
    revenue: number;
  }>;
  revenueTarget: {
    daily: { target: number; achieved: number; percentage: number };
    monthly: { target: number; achieved: number; percentage: number };
  };
}

export default function RevenueDashboard() {
  const [dashboard, setDashboard] = useState<RevenueDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const email = localStorage.getItem('userEmail') || 'demo@example.com';
      const response = await fetch(
        `/api/dashboard/revenue?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();
      if (data.success) {
        setDashboard(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Revenue Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your earnings from affiliate links and price alerts
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 font-medium">
              Total Revenue
            </h3>
            <DollarSign className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ₹{dashboard.overview.totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-green-600 mt-2">
            From {dashboard.overview.totalClicks} clicks
          </p>
        </div>

        {/* Today's Clicks */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 font-medium">
              Today
            </h3>
            <Zap className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {dashboard.overview.todayClicks}
          </p>
          <p className="text-sm text-blue-600 mt-2">Clicks today</p>
        </div>

        {/* Price Alerts */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 font-medium">
              Price Alerts
            </h3>
            <TrendingUp className="text-orange-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {dashboard.overview.priceDropAlertsSent}
          </p>
          <p className="text-sm text-orange-600 mt-2">Sent to users</p>
        </div>

        {/* Watchlist Items */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 font-medium">
              Watchlist
            </h3>
            <Heart className="text-red-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {dashboard.overview.watchlistItems}
          </p>
          <p className="text-sm text-red-600 mt-2">Items tracked</p>
        </div>

        {/* Avg Revenue per Click */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 font-medium">
              Avg/Click
            </h3>
            <Award className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ₹{(dashboard.overview.totalRevenue / Math.max(dashboard.overview.totalClicks, 1)).toFixed(0)}
          </p>
          <p className="text-sm text-purple-600 mt-2">Revenue per click</p>
        </div>
      </div>

      {/* Revenue Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Target */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Daily Target
          </h3>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                ₹{dashboard.revenueTarget.daily.achieved.toLocaleString()} / ₹
                {dashboard.revenueTarget.daily.target.toLocaleString()}
              </span>
              <span className="font-bold text-indigo-600">
                {dashboard.revenueTarget.daily.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(dashboard.revenueTarget.daily.percentage, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Monthly Target */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Monthly Target
          </h3>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                ₹{dashboard.revenueTarget.monthly.achieved.toLocaleString()} / ₹
                {dashboard.revenueTarget.monthly.target.toLocaleString()}
              </span>
              <span className="font-bold text-indigo-600">
                {dashboard.revenueTarget.monthly.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(dashboard.revenueTarget.monthly.percentage, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Platform */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Revenue by Platform
          </h3>
          <div className="space-y-4">
            {dashboard.byPlatform.map((p) => (
              <div
                key={p.platform}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {p.platform}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {p.clicks} clicks • {p.commission} commission
                  </p>
                </div>
                <p className="text-xl font-bold text-green-600">
                  ₹{p.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Top Performing Products
          </h3>
          <div className="space-y-4">
            {dashboard.topProducts.map((p, idx) => (
              <div
                key={p.productId}
                className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                      #{idx + 1}
                    </span>
                    <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {p.title}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {p.clicks} clicks
                  </p>
                </div>
                <p className="text-lg font-bold text-green-600 whitespace-nowrap ml-2">
                  ₹{p.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-2">
          Boost Your Revenue! 🚀
        </h3>
        <p className="mb-6 opacity-90">
          Get more conversions by sharing deals with your friends and
          followers
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Share Your Referral Link
          </button>
          <button className="border-2 border-white px-6 py-2 rounded-lg font-semibold hover:bg-white/10 transition">
            View Trending Deals
          </button>
        </div>
      </div>
    </div>
  );
}
