import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import Categories from '@/components/Categories';
import SearchResults from '@/components/SearchResults';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="pt-24" />

      <main className="px-4 max-w-6xl mx-auto">
        <SearchBar />
        <Categories />
        <SearchResults />
      </main>
    </>
  );
}