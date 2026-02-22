'use client';
import { useEffect, useState } from 'react';
import { Search, Upload, X } from 'lucide-react';
import { Product } from '@/types/product';
import { validateImageFile, validateSearchQuery } from '@/lib/validation';
import { logSecurityEvent } from '@/lib/security';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');

  // ========== Security: Validate Search Results from Custom Events ==========
  useEffect(() => {
    const handler = (e: any) => {
      // ========== Security: Validate event detail to prevent XSS ==========
      const detail = e.detail;
      if (typeof detail !== 'string' || detail.length > 200) {
        logSecurityEvent('invalid_event_data', { event: 'category-search' }, 'medium');
        return;
      }

      setQuery(detail);
      setSearchMode('text');
      setImage(null);
      setImagePreview('');
    };

    window.addEventListener('category-search', handler);
    return () => window.removeEventListener('category-search', handler);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ========== Security: Validate image file before processing ==========
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setImage(file);
    setSearchMode('image');
    setError('');

    // Create preview using secure FileReader API
    const reader = new FileReader();
    reader.onloadend = () => {
      // ========== Security: Ensure result is a valid data URL ==========
      const result = reader.result as string;
      if (result.startsWith('data:image/')) {
        setImagePreview(result);
      } else {
        setError('Invalid image preview');
        logSecurityEvent('invalid_image_preview', {}, 'low');
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
      logSecurityEvent('file_read_error', {}, 'low');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    setSearchMode('text');
    setError('');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ========== Security: Validate Search Input ==========
    if (searchMode === 'text') {
      const validation = validateSearchQuery(query);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid search query');
        return;
      }
      if (!validation.sanitized) {
        setError('Search query is empty');
        return;
      }
    }

    if (searchMode === 'image' && !image) {
      setError('Please upload an image');
      return;
    }

    setLoading(true);

    try {
      const PAGE_SIZE = 24;
      const formData = new FormData();

      if (searchMode === 'text') {
        // Use sanitized query from validation
        const validation = validateSearchQuery(query);
        formData.append('query', validation.sanitized || '');
        formData.append('searchType', 'text');
      } else if (searchMode === 'image' && image) {
        formData.append('image', image);
        formData.append('searchType', 'image');
      }

      formData.append('page', '1');
      formData.append('pageSize', String(PAGE_SIZE));

      // ========== Security: Use secure fetch with timeout ==========
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch('/api/search', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      // ========== Security: Validate response structure ==========
      if (!Array.isArray(data.products)) {
        throw new Error('Invalid response format');
      }

      // ========== Security: Dispatch custom event with validated data ==========
      // Event data is not user-controlled, only server response
      window.dispatchEvent(
        new CustomEvent('search-results', {
          detail: {
            products: data.products,
            query: data.query || (searchMode === 'image' ? 'Image Search Results' : query),
            platforms: data.platforms || [],
            page: data.page || 1,
            pageSize: data.pageSize || PAGE_SIZE,
            total: data.total || data.count || data.products.length,
            searchType: searchMode,
          },
        })
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Search failed';
      setError(errorMsg);
      logSecurityEvent('search_error', { error: errorMsg }, 'low');
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
            setError('');
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
            maxLength={200}
            aria-label="Search products"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition"
            aria-label={loading ? 'Searching...' : 'Search'}
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
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageSelect}
                className="hidden"
                aria-label="Upload product image"
              />
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} className="text-blue-600" />
                <p className="font-semibold text-gray-900 dark:text-white">
                  Click to upload image
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
                </p>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative inline-block">
                {/* ========== Security: Use img tag with proper attributes ==========  */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded-xl max-h-48 max-w-full"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                aria-label={loading ? 'Analyzing Image...' : 'Search by Image'}
              >
                <Search size={20} />
                {loading ? 'Analyzing Image...' : 'Search by Image'}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm mt-2" role="alert">
          {error}
        </div>
      )}
    </form>
  );
}

// Hidden input component
function Input({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}