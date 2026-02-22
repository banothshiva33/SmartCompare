'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, ArrowUpRight, Heart } from 'lucide-react';
import { Product } from '@/types/product';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCardNew({ product }: ProductCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAffiliateClick = async () => {
    try {
      await fetch('/api/track/affiliate-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asin: product.ASIN,
          platform: product.platform,
          url: product.affiliateLink || product.url,
        }),
      });
    } catch (err) {
      console.error('Tracking error:', err);
    }
  };

  const handleWatchlistClick = async () => {
    setIsLoading(true);
    try {
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
      }
    } catch (error) {
      console.error('Watchlist error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const discount = product.discount || 0;
  const rating = product.rating || 0;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-64 overflow-hidden">
        <Image
          src={product.image || 'https://via.placeholder.com/300?text=Product'}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          priority={false}
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-md">
            -{discount}%
          </div>
        )}

        {/* Platform Badge */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {product.platform || 'Shop'}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWatchlistClick}
          disabled={isLoading}
          className="absolute bottom-3 right-3 bg-white hover:bg-red-50 p-2.5 rounded-full shadow-md transition transform hover:scale-110 disabled:opacity-50"
        >
          <Heart
            className={`w-5 h-5 transition ${
              isInWatchlist
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400 hover:text-red-500'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col h-full">
        {/* Title */}
        <h3 className="font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition min-h-14">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {rating > 0 ? (
              <>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-semibold text-gray-700">
                  {rating.toFixed(1)}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">No ratings</span>
            )}
          </div>
          {product.reviewCount && product.reviewCount > 0 && (
            <span className="text-xs text-gray-500">
              ({product.reviewCount.toLocaleString()} reviews)
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ₹{product.price?.toLocaleString('en-IN') || 'N/A'}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-auto space-y-2">
          <Link
            href={`/product/${product.ASIN}?results=${encodeURIComponent(
              JSON.stringify([product])
            )}`}
            className="w-full block text-center bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold transition"
          >
            View Details
          </Link>

          <a
            href={product.affiliateLink || product.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAffiliateClick}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy Now
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
