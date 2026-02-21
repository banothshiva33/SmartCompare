"use client";

import { useState, useEffect } from "react";

export default function Navbar() {
  const [dark, setDark] = useState(false);

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
  }, []);

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

        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          SmartCompare
        </h1>

        <button
          onClick={() => setDark(!dark)}
          className="text-xl hover:scale-110 transition"
        >
          {dark ? "☀️" : "🌙"}
        </button>

      </div>
    </nav>
  );
}