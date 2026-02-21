"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Load saved theme on first render
  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setDark(false);
      document.documentElement.classList.remove("dark");
    }
    setMounted(true);
  }, []);

  // Load cart and watchlist counts
  useEffect(() => {
    if (mounted) {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      setCartCount(cart.length);
      setWatchlistCount(watchlist.length);

      // Listen for storage changes
      const handleStorage = () => {
        const updatedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const updatedWatchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        setCartCount(updatedCart.length);
        setWatchlistCount(updatedWatchlist.length);
      };

      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, [mounted]);

  // Toggle theme
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-b border-white/40 dark:border-gray-800">

      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition">
          SmartCompare
        </Link>

        <div className="flex items-center gap-6">
          {/* Watchlist Link */}
          <Link
            href="/watchlist"
            className="relative text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            title="View Watchlist"
          >
            <Heart size={20} />
            {watchlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {watchlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            href="/cart"
            className="relative text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            title="View Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="text-xl hover:scale-110 transition"
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

      </div>
    </nav>
  );
}