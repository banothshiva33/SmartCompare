'use client';

import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap, Home, Couch } from 'lucide-react';

const categories = [
  {
    name: 'Electronics',
    icon: Zap,
    color: 'from-blue-400 to-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    query: 'electronics gadgets phones laptops',
  },
  {
    name: 'Fashion',
    icon: ShoppingBag,
    color: 'from-pink-400 to-pink-600',
    textColor: 'text-pink-600',
    bgColor: 'bg-pink-50',
    query: 'clothes fashion apparel shoes',
  },
  {
    name: 'Home & Decor',
    icon: Couch,
    color: 'from-amber-400 to-amber-600',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    query: 'home decor furniture bedding',
  },
  {
    name: 'Home Appliances',
    icon: Home,
    color: 'from-green-400 to-green-600',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    query: 'appliances kitchen refrigerator washing machine',
  },
];

export default function Categories() {
  const router = useRouter();

  const handleCategoryClick = (query: string) => {
    router.push(`/browse?search=${encodeURIComponent(query)}`);
  };

  return (
    <section className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Browse Categories</h2>
        <p className="text-gray-600 text-lg">Explore our curated collections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.query)}
              className={`group relative overflow-hidden rounded-2xl p-8 ${cat.bgColor} hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-gray-200`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`mb-4 p-3 rounded-full ${cat.bgColor} group-hover:bg-white transition`}>
                  <Icon className={`w-8 h-8 ${cat.textColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700">
                  {cat.name}
                </h3>
                <span className="text-sm text-gray-500 mt-2 group-hover:text-gray-700">
                  Explore →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}