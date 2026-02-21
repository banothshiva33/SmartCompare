'use client';

import Image from 'next/image';
import { ExternalLink, Heart, Info } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { ComparisonMetrics, getProductBadges } from '@/lib/comparison';

interface Props {
  product: Product;
  metrics?: ComparisonMetrics;
  allProducts?: Product[];
}

export default function ProductCard({ product, metrics, allProducts = [] }: Props) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const badges = metrics ? getProductBadges(product, metrics) : [];

  const handleViewDeal = async () => {
    // Track affiliate click
    try {
      await fetch('/api/track/affiliate-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.ASIN,
          platform: product.platform,
          title: product.title,
          price: product.price,
          affiliateLink: product.affiliateLink || product.url,
        }),
      });
    } catch (error) {
      console.error('Click tracking failed:', error);
    }

    // Redirect to affiliate link
    window.open(product.affiliateLink || product.url, '_blank');
  };

  const handleViewDetails = () => {
    // Navigate to product detail page with search results
    const resultsParam = encodeURIComponent(JSON.stringify(allProducts));
    router.push(`/product/${product.ASIN}?results=${resultsParam}`);
  };

  const handleWatchlistClick = async () => {
    setIsLoading(true);

    try {
      // For now, use a placeholder email - in real app, get from auth
      const email = localStorage.getItem('userEmail') || 'guest@example.com';

      const response = await fetch('/api/watchlist', {
        method: isInWatchlist ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          productId: product.ASIN,
          title: product.title,
          image: product.image,
          platform: product.platform,
          url: product.url,
        }),
      });

      if (response.ok) {
        setIsInWatchlist(!isInWatchlist);
      } else {
        const data = await response.json();
        // If error is "already in watchlist", treat as success
        if (data.error === 'Product already in watchlist') {
          setIsInWatchlist(true);
        }
      }
    } catch (error) {
      console.error('Watchlist action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="
        group relative flex flex-col
        bg-white dark:bg-gray-900
        rounded-2xl border border-gray-200 dark:border-gray-800
        shadow-sm hover:shadow-xl
        transition-all duration-300
      "
    >
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-50 dark:bg-gray-800 rounded-t-2xl overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-contain p-4 group-hover:scale-105 transition"
        />
        {/* Platform Badge */}
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-md">
          {product.platform}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
          {product.title}
        </h3>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {badges.map((badge) => (
              <span
                key={badge}
                className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded-full font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>⭐ {typeof product.rating === 'number' ? product.rating.toFixed(1) : parseFloat(product.rating as any).toFixed(1)}</span>
          <span>•</span>
          <span>{product.reviewCount.toLocaleString()} reviews</span>
        </div>

        {/* Price */}
        <div className="mt-1">
          <p className="text-lg font-bold text-green-600">
            {product.displayPrice}
          </p>
          {product.discount && (
            <p className="text-xs text-red-500">
              🔻 {product.discount}% lower than average
            </p>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-3">
          <button
            onClick={handleViewDetails}
            className="
              w-full inline-flex items-center justify-center gap-2
              px-4 py-2 rounded-xl
              text-sm font-semibold text-white
              bg-gradient-to-r from-blue-500 to-blue-600
              hover:opacity-90 transition
            "
            title="View price comparison and details"
          >
            <Info size={14} /> View Details
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewDeal}
              className="
                flex-1 inline-flex items-center justify-center gap-2
                px-4 py-2 rounded-xl
                text-sm font-semibold text-white
                bg-gradient-to-r from-indigo-500 to-purple-600
                hover:opacity-90 transition
              "
              title="View this deal and help us earn a commission"
            >
              Buy Now <ExternalLink size={14} />
            </button>

            <button
              onClick={handleWatchlistClick}
              disabled={isLoading}
              className={`
                p-2 rounded-xl transition
                ${isInWatchlist
                  ? 'bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700'
                  : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
                disabled:opacity-50
              `}
              title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Heart
                size={18}
                className={isInWatchlist ? 'fill-red-600 text-red-600' : ''}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}