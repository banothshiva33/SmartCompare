'use client';
import { useEffect, useState } from 'react';
import { Search, Upload, X, Link2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';

export default function SearchBarNew() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState<'text' | 'image' | 'link'>('text');
  const [results, setResults] = useState<Product[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setImage(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result.startsWith('data:image/')) {
        setImagePreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    setError('');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let searchQuery = '';

      if (searchMode === 'text') {
        if (!query.trim()) {
          setError('Please enter a search query');
          setLoading(false);
          return;
        }
        searchQuery = query;
      } else if (searchMode === 'link') {
        if (!productUrl.trim()) {
          setError('Please enter a product URL');
          setLoading(false);
          return;
        }
        // Extract product name/keywords from URL
        try {
          const url = new URL(productUrl);
          const pathname = url.pathname;
          // Extract keywords from popular e-commerce sites
          if (pathname.includes('amazon')) {
            searchQuery = pathname.split('/').pop() || 'product';
          } else if (pathname.includes('flipkart')) {
            const parts = pathname.split('%2F');
            searchQuery = parts[parts.length - 1] || 'product';
          } else {
            searchQuery = pathname.split('/').filter(p => p).pop() || 'product';
          }
        } catch {
          setError('Please enter a valid URL');
          setLoading(false);
          return;
        }
      } else if (searchMode === 'image') {
        if (!image) {
          setError('Please upload an image');
          setLoading(false);
          return;
        }
        // For image search, we'll use a placeholder
        searchQuery = 'similar product';
      }

      // Perform search
      const res = await fetch(`/api/search/products?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        const products = data.products || data.results || [];
        setResults(products);
        router.push(`/browse?search=${encodeURIComponent(searchQuery)}`);
      } else {
        setError('Search failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during search');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Search Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { mode: 'text', label: '🔍 Text Search', icon: Search },
          { mode: 'link', label: '🔗 URL Search', icon: Link2 },
          { mode: 'image', label: '🖼️ Image Search', icon: Upload },
        ].map((tab) => (
          <button
            key={tab.mode}
            onClick={() => {
              setSearchMode(tab.mode as 'text' | 'image' | 'link');
              setError('');
              setImage(null);
              setImagePreview('');
            }}
            className={`px-4 py-2 rounded-md font-semibold transition flex items-center gap-2 text-sm ${
              searchMode === tab.mode
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Text Search */}
        {searchMode === 'text' && (
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products... e.g., iPhone 15, Laptop, shoes"
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-xl transition"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Link Search */}
        {searchMode === 'link' && (
          <div className="relative">
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="Paste product URL... e.g., https://amazon.com/dp/B08EXAMPLE"
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-xl transition"
            >
              <Link2 className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Image Search */}
        {searchMode === 'image' && (
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-gray-300">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                <Upload className="w-12 h-12 mx-auto text-blue-400 mb-2" />
                <p className="text-gray-700 font-semibold">Click to upload an image</p>
                <p className="text-sm text-gray-500">or drag and drop</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
            <button
              type="submit"
              disabled={!image || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 rounded-2xl transition flex items-center justify-center gap-2"
            >
              <Search className="w-6 h-6" />
              {loading ? 'Searching...' : 'Search by Image'}
            </button>
          </div>
        )}
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          Searching...
        </div>
      )}
    </div>
  );
}
