'use client';

const categories = [
  'Fashion',
  'Electronics',
  'Home Appliances',
  'Home Decor',
];

export default function Categories() {
  return (
    <section className="max-w-6xl mx-auto mt-10 pb-20">
      <h2 className="text-2xl font-semibold mb-10 text-center">
        Explore Popular Categories
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('category-search', { detail: cat })
              );
            }}
            className="p-8 bg-white rounded-3xl shadow-lg hover:scale-105 transition"
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
}