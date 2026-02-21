'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';

export default function WatchlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [alertPrice, setAlertPrice] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail') || 'guest@example.com';
    setEmail(storedEmail);

    fetchWatchlist(storedEmail);
  }, []);

  const fetchWatchlist = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/watchlist?email=${userEmail}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, productId }),
      });

      if (response.ok) {
        setItems(items.filter((item) => item.productId !== productId));
      }
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  const handleSetAlert = async () => {
    if (!alertPrice || !selectedItem) return;

    try {
      const response = await fetch('/api/watchlist/alert', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          productId: selectedItem.productId,
          targetPrice: parseFloat(alertPrice),
        }),
      });

      if (response.ok) {
        // Update the item in state
        setItems(
          items.map((item) =>
            item.productId === selectedItem.productId
              ? { ...item, targetPrice: parseFloat(alertPrice) }
              : item
          )
        );
        setShowAlertModal(false);
        setAlertPrice('');
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Failed to set alert:', error);
    }
  };

  const openAlertModal = (item: any) => {
    setSelectedItem(item);
    setAlertPrice(item.targetPrice?.toString() || '');
    setShowAlertModal(true);
  };

  return (
    <>
      <Navbar />
      <div className="pt-24" />

      <main className="px-4 max-w-6xl mx-auto min-h-screen pb-12">
        <h1 className="text-3xl font-bold mb-4">📌 My Watchlist</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading watchlist...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Your watchlist is empty. Start adding products to track their prices!
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-8">
              You're tracking {items.length} product{items.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item._id} className="space-y-2">
                  <ProductCard
                    product={{
                      ASIN: item.productId,
                      title: item.title,
                      image: item.image,
                      price: item.currentPrice || 0,
                      displayPrice: item.displayPrice || '₹0',
                      rating: 0,
                      reviewCount: 0,
                      platform: item.platform || 'Amazon',
                      url: item.url,
                    } as Product}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => openAlertModal(item)}
                      className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition text-sm font-medium"
                    >
                      {item.targetPrice ? `Alert: ₹${item.targetPrice}` : '💰 Set Price Alert'}
                    </button>

                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Alert Modal */}
      {showAlertModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">💰 Set Price Alert</h3>
              <button
                onClick={() => setShowAlertModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedItem.title}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Alert me when price drops to:
              </label>
              <input
                type="number"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder="Enter price"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-2">
                Current price: ₹{selectedItem.currentPrice?.toLocaleString() || 'N/A'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAlertModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSetAlert}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
              >
                Set Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
