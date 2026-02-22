'use client';

interface Props {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

export default function CategoryTabs({ categories, selected, onSelect }: Props) {
  return (
    <div className="mb-6">
      <div className="overflow-x-auto no-scrollbar py-1">
        <div className="flex gap-3 items-center px-1">
          <button
            onClick={() => onSelect('All')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium shadow-sm ${selected === 'All' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-800'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onSelect(c)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium shadow-sm ${selected === c ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-800'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
