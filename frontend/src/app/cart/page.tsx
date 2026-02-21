'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Start shopping to add items to your cart
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              <ArrowLeft size={20} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const deliveryFee = items.length > 0 ? 50 : 0;
  const subtotal = total;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:gap-3 transition-all mb-4"
          >
            <ArrowLeft size={20} />
            Back to Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.ASIN}
                  className="border-b border-gray-200 dark:border-gray-700 p-6 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Platform: {item.platform}
                    </p>
                    <p className="text-lg font-bold text-green-600 mt-2">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.ASIN, item.quantity - 1)
                      }
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.ASIN, item.quantity + 1)
                      }
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Total & Delete */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeItem(item.ASIN)}
                      className="mt-2 text-red-600 hover:text-red-700 font-semibold text-sm inline-flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">Free</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                    <span className="text-gray-500">Standard Delivery</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                )}
              </div>

              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>

              {/* Checkout Button */}
              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition mb-3">
                Proceed to Checkout
              </button>

              {/* Continue Shopping */}
              <Link
                href="/"
                className="w-full inline-block text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Continue Shopping
              </Link>

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="w-full mt-3 text-red-600 hover:text-red-700 font-semibold text-sm"
              >
                Clear Cart
              </button>

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Free delivery on orders above ₹499
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Easy 7-day returns
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    100% authentic products
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
