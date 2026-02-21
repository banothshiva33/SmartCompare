'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, TrendingUp, Tag, Zap, DollarSign, AlertCircle } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';

interface ProductDetailProps {
  productId: string;
  searchResults: Product[];
}

export default function ProductDetail({ productId, searchResults }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Find the selected product from search results
    const found = searchResults.find((p) => p.ASIN === productId);
    if (found) {
      setProduct(found);
      setSelectedPlatform(found);

      // Get related products (same category)
      const related = searchResults
        .filter((p) => p.category === found.category && p.ASIN !== productId)
        .slice(0, 4);
      setRelatedProducts(related);

      // Check if in watchlist
      const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
      setIsInWatchlist(watchlist.includes(productId));
    }
    setLoading(false);
  }, [productId, searchResults]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product && selectedPlatform) {
      addItem({
        ASIN: product.ASIN,
        title: product.title,
        price: selectedPlatform.price,
        platform: selectedPlatform.platform,
        image: product.image,
        quantity: 1,
      });
      // Show success message (you could use a toast here)
      alert('Product added to cart!');
    }
  };

  const handleWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    if (isInWatchlist) {
      localStorage.setItem(
        'watchlist',
        JSON.stringify(watchlist.filter((id: string) => id !== product.ASIN))
      );
    } else {
      watchlist.push(product.ASIN);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }
    setIsInWatchlist(!isInWatchlist);
  };

  const handleBuyNow = async () => {
    // Track affiliate click
    try {
      await fetch('/api/track/affiliate-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedPlatform?.ASIN,
          platform: selectedPlatform?.platform,
          title: selectedPlatform?.title,
          price: selectedPlatform?.price,
          affiliateLink: selectedPlatform?.affiliateLink || selectedPlatform?.url,
        }),
      });
    } catch (error) {
      console.error('Click tracking failed:', error);
    }

    // Redirect to affiliate link
    window.open(selectedPlatform?.affiliateLink || selectedPlatform?.url, '_blank');
  };

  // Get all platform variants
  const allVariants = searchResults.filter(
    (p) => p.title.toLowerCase() === product.title.toLowerCase()
  );
  const cheapest = allVariants.reduce((prev, current) =>
    current.price < prev.price ? current : prev
  );
  const bestRated = allVariants.reduce((prev, current) =>
    current.rating > prev.rating ? current : prev
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Product Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-2">
            {product.title}
          </h1>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium">
              {product.category}
            </span>
            <span className="text-yellow-500 font-semibold">⭐ {product.rating.toString().includes('.') ? product.rating : product.rating.toFixed(1)}</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              {product.reviewCount.toLocaleString()} reviews
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left: Product Image & Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 sticky top-24">
              <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-4">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleWatchlist}
                  className={`w-full py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                    isInWatchlist
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <Heart size={20} fill={isInWatchlist ? 'currentColor' : 'none'} />
                  {isInWatchlist ? 'Saved' : 'Save for Later'}
                </button>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                {product.discount && (
                  <div className="flex items-center gap-2 text-red-600">
                    <Tag size={16} />
                    <span className="font-semibold">{product.discount}% OFF</span>
                  </div>
                )}
                {product.stockStatus && (
                  <div className="flex items-center gap-2 text-sm">
                    <Zap size={16} className={product.stockStatus === 'In Stock' ? 'text-green-600' : 'text-orange-600'} />
                    <span>{product.stockStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Price Comparison Table */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign size={24} />
                Price Comparison
              </h2>

              {/* Best Deals Badges */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-xs text-green-700 dark:text-green-400 font-semibold">CHEAPEST</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-300">
                    ₹{cheapest.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">{cheapest.platform}</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">BEST RATED</p>
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
                    ⭐ {typeof bestRated.rating === 'number' ? bestRated.rating.toFixed(1) : parseFloat(bestRated.rating as any).toFixed(1)}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">{bestRated.platform}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                  <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold">YOU SAVE</p>
                  <p className="text-lg font-bold text-purple-800 dark:text-purple-300">
                    ₹{(cheapest.price - product.price).toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">vs current price</p>
                </div>
              </div>

              {/* Platform Comparison */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-bold text-gray-900 dark:text-white">Platform</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-900 dark:text-white">Price</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-900 dark:text-white">Rating</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-900 dark:text-white">Delivery</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-900 dark:text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allVariants.map((variant, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                          variant.price === cheapest.price
                            ? 'bg-green-50 dark:bg-green-900/10'
                            : ''
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {variant.platform}
                            </span>
                            {variant.price === cheapest.price && (
                              <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                Best Price
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₹{variant.price.toLocaleString()}
                          </p>
                          {variant.discount && (
                            <p className="text-sm text-red-600 font-semibold">
                              Discount: {variant.discount}%
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {typeof variant.rating === 'number' ? variant.rating.toFixed(1) : parseFloat(variant.rating as any).toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {variant.reviewCount.toLocaleString()} reviews
                          </p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            2-3 days
                          </p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedPlatform(variant);
                              handleBuyNow();
                            }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition text-sm"
                          >
                            Buy
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Info Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Free Delivery</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">On orders above ₹499</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Easy Returns</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">7 days return policy</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Authentic</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">100% original products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Related Products
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedProducts.map((p) => (
                    <div
                      key={p.ASIN}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded">
                          <Image
                            src={p.image}
                            alt={p.title}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm">
                            {p.title}
                          </p>
                          <p className="text-green-600 font-bold mt-1">
                            ₹{p.price.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500 text-sm">⭐</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {typeof p.rating === 'number' ? p.rating.toFixed(1) : parseFloat(p.rating as any).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
