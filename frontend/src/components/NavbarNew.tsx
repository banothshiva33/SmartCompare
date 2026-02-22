"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Zap, Menu, X } from "lucide-react";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load cart and watchlist counts
  useEffect(() => {
    setMounted(true);
    const updateCounts = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      setCartCount(cart.length);
      setWatchlistCount(watchlist.length);
    };

    updateCounts();
    window.addEventListener("storage", updateCounts);
    return () => window.removeEventListener("storage", updateCounts);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-lg group-hover:scale-110 transition transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none">
                SmartCompare
              </span>
              <span className="text-xs text-gray-600">Compare & Save</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/deals"
              className="text-gray-700 hover:text-blue-600 font-medium transition relative group"
            >
              🔥 Hot Deals
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              href="/browse"
              className="text-gray-700 hover:text-blue-600 font-medium transition relative group"
            >
              🔍 Browse
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              href="/watchlist"
              className="text-gray-700 hover:text-blue-600 font-medium transition relative group"
            >
              ❤️ Watchlist
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Watchlist */}
            <Link
              href="/watchlist"
              className="relative p-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition hidden sm:block"
            >
              <Heart className="w-6 h-6" />
              {watchlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {watchlistCount}
                </span>
              )}
            </Link>

            {/* Sign In Button */}
            <Link
              href="/auth/login"
              className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition shadow-md text-sm"
            >
              Sign In
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            <Link
              href="/deals"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition"
            >
              🔥 Hot Deals
            </Link>
            <Link
              href="/browse"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition"
            >
              🔍 Browse
            </Link>
            <Link
              href="/watchlist"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition"
            >
              ❤️ Watchlist
            </Link>
            <Link
              href="/auth/login"
              className="block w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold transition text-center"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
