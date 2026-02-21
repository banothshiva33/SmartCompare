import SearchBar from '@/components/SearchBar';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 px-4">
      
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold mb-4">
          Compare Prices. Save Money. Shop Smart.
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Search products by name, link, or image and compare prices across top shopping platforms.
        </p>

        <SearchBar />
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto mt-20">
        <h2 className="text-2xl font-semibold mb-6">Popular Categories</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-xl shadow text-center">👕 Fashion</div>
          <div className="p-6 bg-white rounded-xl shadow text-center">📱 Electronics</div>
          <div className="p-6 bg-white rounded-xl shadow text-center">🏠 Home Appliances</div>
          <div className="p-6 bg-white rounded-xl shadow text-center">🛋️ Home Decor</div>
        </div>
      </section>

    </main>
  );
}
