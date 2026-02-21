import { Suspense } from 'react';
import ProductDetail from '@/components/ProductDetail';
import SearchResults from '@/components/SearchResults';

interface ProductPageProps {
  params: {
    asin: string;
  };
  searchParams: {
    results?: string;
  };
}

export default function ProductPage({ params, searchParams }: ProductPageProps) {
  const { asin } = params;
  
  // Get search results from query params (passed from search results page)
  let searchResults = [];
  try {
    if (searchParams.results) {
      searchResults = JSON.parse(decodeURIComponent(searchParams.results));
    }
  } catch (error) {
    console.error('Error parsing search results:', error);
  }

  // If no results in query params, show a message
  if (!searchResults || searchResults.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please search for a product first
          </p>
          <a
            href="/"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
          >
            Back to Search
          </a>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
      <ProductDetail productId={asin} searchResults={searchResults} />
    </Suspense>
  );
}
