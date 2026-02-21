'use client';
import { useEffect, useState } from 'react';
import { Search, Upload, X } from 'lucide-react';
import { Product } from '@/types/product';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');

  // Listen for category clicks
  useEffect(() => {
    const handler = (e: any) => {
      setQuery(e.detail);
      setSearchMode('text');
      setImage(null);
      setImagePreview('');
    };
    window.addEventListener('category-search', handler);
    return () => window.removeEventListener('category-search', handler);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setSearchMode('image');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    setSearchMode('text');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (searchMode === 'text' && !query.trim()) {
      setError('Please enter a search query');
      return;
    }

    if (searchMode === 'image' && !image) {
      setError('Please upload an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      if (searchMode === 'text') {
        formData.append('query', query);
        formData.append('searchType', 'text');
      } else {
        formData.append('image', image!);
        formData.append('searchType', 'image');
      }

      const response = await fetch('/api/search', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();

      if (data.success && data.products) {
        // Emit search results as a custom event
        window.dispatchEvent(
          new CustomEvent('search-results', {
            detail: {
              products: data.products,
              query: data.query || 'Image Search Results',
              platforms: data.platforms,
            },
          })
        );
      } else {
        setError('No results found');
      }
    } catch (err) {
      setError((err as Error).message || 'Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full space-y-4">
      {/* Mode Tabs */}
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={() => {
            setSearchMode('text');
            setImage(null);
            setImagePreview('');
          }}
          className={`px-6 py-2 rounded-xl font-semibold transition ${
            searchMode === 'text'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          🔍 Text Search
        </button>
        <button
          type="button"
          onClick={() => setSearchMode('image')}
          className={`px-6 py-2 rounded-xl font-semibold transition ${
            searchMode === 'image'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          📸 Image Search
        </button>
      </div>

      {/* Text Search Mode */}
      {searchMode === 'text' && (
        <div className="flex gap-2 items-center">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError('');
            }}
            placeholder="Search iPhone, laptop, headphones..."
            className="flex-1 border border-gray-300 dark:border-gray-700 p-4 rounded-xl text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition"
          >
            <Search size={20} />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      )}

      {/* Image Search Mode */}
      {searchMode === 'image' && (
        <div className="space-y-4">
          {!imagePreview ? (
            <label className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} className="text-blue-600" />
                <p className="font-semibold text-gray-900 dark:text-white">
                  Click to upload image
                </p>
                <p className="text-xs text-gray-500">
                  Take a photo or upload an image of the product
                </p>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded-xl max-h-48 max-w-full"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  <X size={16} />
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                <Search size={20} />
                {loading ? 'Analyzing Image...' : 'Search by Image'}
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </form>
  );
}

// Hidden input component
function Input({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}