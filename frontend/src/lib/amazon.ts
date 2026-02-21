import axios from 'axios';

export async function searchAmazon(keyword: string) {
  // Amazon endpoint
  const endpoint = 'https://webservices.amazon.in/paapi5/searchitems';

  // 🔐 TEMP headers (real signing will replace this later)
  const headers = {
    'Content-Type': 'application/json',
  };

  // Request payload
  const payload = {
    Keywords: keyword,
    SearchIndex: 'All',
    ItemCount: 5,
    PartnerTag: process.env.AMAZON_PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.in',
  };

  try {
    // ❗ This will fail until Amazon API is active
    const response = await axios.post(endpoint, payload, { headers });
    return response.data?.SearchResult?.Items || [];
  } catch (err) {
    console.warn('Amazon API not active yet, using mock data');

    // ✅ MOCK DATA (SAFE FALLBACK)
    return [
      {
        ASIN: 'MOCK123',
        ItemInfo: {
          Title: { DisplayValue: `${keyword} (Mock Result)` },
        },
        Images: {
          Primary: {
            Large: { URL: 'https://via.placeholder.com/300' },
          },
        },
        Offers: {
          Listings: [
            {
              Price: {
                Amount: 19999,
                Currency: 'INR',
                DisplayAmount: '₹19,999',
              },
            },
          ],
        },
        CustomerReviews: {
          StarRating: 4.3,
          Count: 1245,
        },
      },
    ];
  }
}
