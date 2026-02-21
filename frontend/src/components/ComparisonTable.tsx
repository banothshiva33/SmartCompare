'use client';

import Image from 'next/image';
import { ExternalLink, Check, X } from 'lucide-react';
import { Product } from '@/types/product';
import { ComparisonMetrics } from '@/lib/comparison';

interface Props {
  products: Product[];
  metrics?: ComparisonMetrics;
}

export default function ComparisonTable({ products, metrics }: Props) {
  if (!products.length) return null;

  const isCheapest = (asin: string) => metrics?.cheapestASIN === asin;
  const isBestRated = (asin: string) => metrics?.bestRatedASIN === asin;
  const isMostReviews = (asin: string) => metrics?.mostReviewsASIN === asin;

  const highlightClass = 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';

  return (
    <div className="overflow-x-auto mt-12">
      <table className="min-w-full border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-900">
          <tr>
            <th className="p-4 text-left text-sm font-semibold">Feature</th>
            {products.map((p) => (
              <th
                key={p.ASIN}
                className="p-4 text-center text-sm font-semibold min-w-[220px]"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-20 h-20">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="line-clamp-2 text-xs">
                    {p.title}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-950">
          {/* Price */}
          <tr className="border-t">
            <td className="p-4 font-medium">Price</td>
            {products.map((p) => (
              <td
                key={p.ASIN}
                className={`p-4 text-center font-bold text-green-600 ${isCheapest(p.ASIN) ? highlightClass : ''}`}
              >
                {p.displayPrice}
                {isCheapest(p.ASIN) && (
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1 font-semibold">
                    💰 Cheapest
                  </div>
                )}
              </td>
            ))}
          </tr>

          {/* Rating */}
          <tr className="border-t bg-gray-50 dark:bg-gray-900/40">
            <td className="p-4 font-medium">Rating</td>
            {products.map((p) => (
              <td
                key={p.ASIN}
                className={`p-4 text-center ${isBestRated(p.ASIN) ? highlightClass : ''}`}
              >
                ⭐ {p.rating.toFixed(1)} <br />
                <span className="text-xs text-gray-500">
                  {p.reviewCount.toLocaleString()} reviews
                </span>
                {isBestRated(p.ASIN) && (
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1 font-semibold">
                    ⭐ Best Rated
                  </div>
                )}
              </td>
            ))}
          </tr>

          {/* Popularity */}
          <tr className="border-t">
            <td className="p-4 font-medium">Popularity</td>
            {products.map((p) => (
              <td
                key={p.ASIN}
                className={`p-4 text-center text-sm ${isMostReviews(p.ASIN) ? highlightClass : ''}`}
              >
                {p.reviewCount.toLocaleString()} reviews
                {isMostReviews(p.ASIN) && (
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1 font-semibold">
                    👥 Most Reviewed
                  </div>
                )}
              </td>
            ))}
          </tr>

          {/* Platform */}
          <tr className="border-t bg-gray-50 dark:bg-gray-900/40">
            <td className="p-4 font-medium">Platform</td>
            {products.map((p) => (
              <td key={p.ASIN} className="p-4 text-center">
                {p.platform}
              </td>
            ))}
          </tr>

          {/* Availability */}
          <tr className="border-t">
            <td className="p-4 font-medium">Status</td>
            {products.map((p) => (
              <td key={p.ASIN} className="p-4 text-center">
                <Check className="mx-auto text-green-500" />
              </td>
            ))}
          </tr>

          {/* Actions */}
          <tr className="border-t bg-gray-50 dark:bg-gray-900/40">
            <td className="p-4 font-medium">Action</td>
            {products.map((p) => (
              <td key={p.ASIN} className="p-4 text-center">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex items-center gap-2
                    px-4 py-2 rounded-xl
                    text-sm font-semibold text-white
                    bg-gradient-to-r from-indigo-500 to-purple-600
                    hover:opacity-90 transition
                  "
                >
                  View Deal <ExternalLink size={14} />
                </a>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}