import SearchBar from "@/components/SearchBar";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Space below fixed navbar */}
      <div className="pt-24"></div>

      {/* Main Page */}
      <main
        className="
          relative min-h-screen overflow-hidden px-4
          bg-gradient-to-br
          from-pink-50 via-white to-purple-50
          dark:from-gray-900 dark:via-gray-950 dark:to-black
          transition-colors duration-500
        "
      >

        {/* Floating Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-200 dark:bg-purple-900 rounded-full blur-3xl opacity-40"></div>

        <div className="absolute top-40 -right-32 w-96 h-96 bg-purple-200 dark:bg-indigo-900 rounded-full blur-3xl opacity-40"></div>

        {/* Hero */}
        <section className="relative text-center py-24 max-w-3xl mx-auto">

          <h1
            className="
              text-5xl md:text-6xl font-extrabold mb-6
              bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
              bg-clip-text text-transparent
            "
          >
            Compare Prices Instantly
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-lg mb-10 leading-relaxed">
            Search products by name, paste a link, or upload an image —
            we’ll find the best deals across all shopping platforms.
          </p>

          <SearchBar />
        </section>

        {/* Categories */}
        <section className="max-w-6xl mx-auto mt-10 pb-20">

          <h2 className="text-2xl font-semibold mb-10 text-center dark:text-white">
            Explore Popular Categories
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Fashion", icon: "👕", color: "from-pink-400 to-pink-600" },
              { name: "Electronics", icon: "📱", color: "from-blue-400 to-indigo-600" },
              { name: "Home Appliances", icon: "🏠", color: "from-green-400 to-emerald-600" },
              { name: "Home Decor", icon: "🛋️", color: "from-purple-400 to-violet-600" },
            ].map((cat) => (
              <div
                key={cat.name}
                className="
                  group relative p-8 rounded-3xl
                  bg-white/70 dark:bg-gray-900/60
                  backdrop-blur-xl
                  shadow-lg hover:shadow-2xl
                  transition-all duration-300
                  hover:scale-105
                  cursor-pointer text-center
                "
              >
                {/* Icon Bubble */}
                <div
                  className={`
                    mx-auto mb-4 w-16 h-16 flex items-center justify-center
                    rounded-full text-2xl text-white
                    bg-gradient-to-r ${cat.color}
                    shadow-lg group-hover:scale-110 transition
                  `}
                >
                  {cat.icon}
                </div>

                {/* Text */}
                <p className="font-semibold text-gray-700 dark:text-gray-200">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}