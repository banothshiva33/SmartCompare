'use client';

export default function AddToWatchlist({ product }: any) {
  async function handleAdd() {
    await fetch('/api/watchlist/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@email.com', // later auth
        productId: product.ASIN,
        title: product.title,
        image: product.image,
        currentPrice: product.price,
        platform: product.platform,
        url: product.url,
      }),
    });

    alert('🔔 Added to watchlist!');
  }

  return (
    <button
      onClick={handleAdd}
      className="
        px-4 py-2 rounded-xl
        border border-gray-300
        hover:bg-gray-100
        transition
      "
    >
      🔔 Watch Price
    </button>
  );
}