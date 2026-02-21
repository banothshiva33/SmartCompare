"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import { normalizeAmazonItem } from "@/lib/normalize";
import { recommendProduct } from "@/lib/recommendation";
import { Product } from "@/types/product";
import "./SearchBar.css";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= SEARCH ================= */

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);

    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    const normalized = data.items.map(normalizeAmazonItem);

    setProducts(normalized);
    setLoading(false);
  }

  const recommended = recommendProduct(products);

  /* ================= IMAGE UPLOAD ================= */

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Selected Image:", file);

    // Future → send to image search backend
  }

  /* ================= UI ================= */

  return (
    <>
      {/* ===== SEARCH BAR ===== */}
      <div className="w-full max-w-3xl mx-auto mt-12 px-4">

        <div
          className="
            search-container
            relative flex items-center gap-3
            bg-white/80 backdrop-blur-lg
            border border-gray-200
            shadow-lg rounded-full
            px-4 py-2
            transition-all duration-300
            hover:shadow-2xl
          "
        >

          {/* ===== REAL INPUT ===== */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product, paste link, or upload image…"
            className="
              flex-1
              bg-transparent
              px-4 py-3
              outline-none
              text-transparent
              caret-pink-500
              text-lg
              relative z-10
            "
          />

          {/* ===== VISUAL LETTER LAYER ===== */}
          <div
            className="
              absolute left-4 right-32
              flex items-center
              pointer-events-none
              text-gray-700 text-lg
            "
          >

            {query.length === 0 && (
              <span className="text-gray-400">
                Search product, paste link, or upload image…
              </span>
            )}

            {query.split("").map((char, i) => (
              <span key={i} className="pop-letter">
                {char}
              </span>
            ))}

            <span className="fake-cursor"></span>

          </div>

          {/* ===== IMAGE UPLOAD ===== */}
          <input
            type="file"
            accept="image/*"
            id="imageUpload"
            className="hidden"
            onChange={handleImageUpload}
          />

          <label
            htmlFor="imageUpload"
            className="
              cursor-pointer
              px-4 py-2 rounded-full
              bg-gradient-to-r from-blue-500 to-indigo-500
              text-white shadow-md
              hover:scale-110 active:scale-95
              transition
            "
          >
            📷
          </label>

          {/* ===== SEARCH BUTTON ===== */}
          <button
            onClick={handleSearch}
            className="
              px-7 py-3 rounded-full
              font-semibold text-white
              bg-gradient-to-r from-pink-500 to-purple-500
              shadow-md
              transition-all duration-300
              hover:scale-110 active:scale-95
            "
          >
            {loading ? "..." : "Search"}
          </button>

        </div>
      </div>

      {/* ===== RECOMMENDATION ===== */}
      {recommended && (
        <div className="max-w-6xl mx-auto mt-12 px-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow">

            <h2 className="text-xl font-bold text-green-700 mb-3">
              🏆 Best Value Recommendation
            </h2>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <p className="font-semibold text-lg">
                  {recommended.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  ⭐ {recommended.rating} Rating
                </p>
              </div>

              <div className="text-lg font-bold text-green-700">
                {recommended.displayPrice}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===== RESULTS ===== */}
      <div className="max-w-6xl mx-auto mt-14 px-4">

        {loading && (
          <div className="text-center text-gray-500">
            Loading products...
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.ASIN} product={p} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && query && (
          <div className="text-center text-gray-500 mt-6">
            No products found.
          </div>
        )}

      </div>
    </>
  );
}