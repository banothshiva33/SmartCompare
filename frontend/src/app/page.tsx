import Navbar from '@/components/NavbarNew';
import SearchBarNew from '@/components/SearchBarNew';
import Categories from '@/components/Categories';
import SearchResults from '@/components/SearchResults';
import TrendingDeals from '@/components/TrendingDeals';

export default function Home() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-12 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <main className="px-4 max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Smart Price Comparison
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Compare prices across 100+ retailers and save more on every purchase
            </p>
          </div>

          <SearchBarNew />
        </main>
      </div>

      <main className="px-4 max-w-6xl mx-auto py-12">
        {/* Categories Section */}
        <Categories />

        {/* Trending Deals Section */}
        <section className="mt-16 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Trending Deals Today</h2>
          <TrendingDeals />
        </section>

        {/* Search Results */}
        <SearchResults />
      </main>
    </>
  );
}