# Smart Compare - Complete Backend Implementation

## Overview

A full-featured affiliate price comparison platform backend with JWT authentication, real-time commission tracking, and automated pricing updates.

## What Has Been Built

### 1. Core Authentication System ✅

**Routes:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login with JWT
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile and bank details

**Security Features:**
- Bcryptjs password hashing (10 rounds)
- JWT tokens with 7-day expiration
- Input validation with Joi
- Secure password comparison
- Automatic affiliate ID generation

**User Model:**
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  phone?: string
  affiliateId: string (unique) // auto-generated
  commissionRate: number // default 5%
  bankAccount?: {
    accountName: string
    accountNumber: string
    ifscCode: string
  }
  paymentHistory: ObjectId[]
}
```

---

### 2. Affiliate Tracking System ✅

**Routes:**
- `POST /api/affiliate/generate-link` - Create affiliate links with tracking
- `POST /api/affiliate/track-click` - Track individual clicks
- `POST /api/affiliate/mark-purchase` - Record purchases and calculate commissions
- `GET /api/affiliate/stats` - Get affiliate statistics

**Key Features:**
- Unique click tracking with 30-day window
- Automatic commission calculation based on purchase amount
- Platform-wise click analytics (Amazon, Flipkart, Myntra, Ajio)
- Conversion rate tracking
- Real-time earnings dashboard

**AffiliateClick Model:**
```typescript
{
  userId: ObjectId
  affiliateId: string
  productId: string
  platform: 'amazon' | 'flipkart' | 'myntra' | 'ajio' | 'other'
  sourceUrl: string
  redirectUrl: string
  userAgent?: string
  ipAddress?: string
  referer?: string
  device?: 'mobile' | 'tablet' | 'desktop'
  browser?: string
  country?: string
  purchased: boolean
  purchaseAmount?: number
  commission?: number
  clickedAt: Date
  purchasedAt?: Date (within 30 days)
  expiresAt: Date (TTL index)
}
```

**Commission Calculation:**
```
commission = purchaseAmount × commissionRate / 100
Example: ₹1000 purchase × 5% = ₹50 commission
```

---

### 3. Product Management System ✅

**Routes:**
- `GET /api/search/products` - Search with filters
- `GET /api/search/products/:id` - Get product details
- `GET /api/search/trending` - Get trending products

**Product Model:**
```typescript
{
  asin: string (optional)
  title: string (required)
  description?: string
  category: string
  imageUrl?: string
  rating?: number (0-5)
  reviewCount?: number
  platforms: [{
    platform: 'amazon' | 'flipkart' | 'myntra' | 'ajio' | 'other'
    url: string
    currentPrice: number
    originalPrice?: number
    discount?: number
    inStock: boolean
    lastUpdated: Date
  }]
  priceHistory: ObjectId[]
  lastPriceDrop?: {
    amount: number
    previousPrice: number
    date: Date
  }
  trending: boolean
  trendingScore?: number
}
```

**Search Features:**
- Full-text search on title, description, category
- Price range filtering
- Platform filtering
- Pagination support
- Category-based browsing

---

### 4. Price History & Monitoring ✅

**Routes:**
- `GET /api/price-history/product/:id` - Get historical prices
- `GET /api/price-history/drops/recent` - Get recent price drops
- `POST /api/price-history/record` - Record new price (internal)

**PriceHistory Model:**
```typescript
{
  productId: ObjectId
  platform: 'amazon' | 'flipkart' | ...
  price: number
  currency: 'INR'
  discount?: number
  originalPrice?: number
  inStock: boolean
  recordedAt: Date
}
```

**Statistics Provided:**
- Minimum price
- Maximum price
- Average price over period
- Days with data (configurable: 7, 30, 90, 365 days)
- Price drop detection

---

### 5. Watchlist & Alerts System ✅

**Routes:**
- `POST /api/watchlist` - Add to watchlist
- `GET /api/watchlist` - Get user's watchlist
- `DELETE /api/watchlist/:id` - Remove from watchlist
- `PATCH /api/watchlist/:id` - Update watchlist entry

**Watchlist Model:**
```typescript
{
  userId: ObjectId
  productId: ObjectId
  platform: string
  targetPrice?: number
  currentPrice: number
  notifyOnDrop: boolean
  alertsSent: number
  lastAlertDate?: Date
  addedAt: Date
}
```

**Alert Features:**
- Price drop notifications
- Custom target price setting
- Alert frequency tracking
- Multiple platform monitoring per product

---

### 6. Recommendations Engine ✅

**Routes:**
- `GET /api/recommendations/personalized` - User-specific recommendations
- `GET /api/recommendations/similar/:id` - Similar products in category
- `GET /api/recommendations/category/:cat` - Category-based recommendations
- `GET /api/recommendations/deals/price-drops` - Products with significant drops

**Recommendation Logic:**
- Based on watchlist categories
- Similar products in same category
- Price optimization (cheapest available)
- Trending products with conversions

---

### 7. Deals & Trending System ✅

**Routes:**
- `GET /api/deals/trending` - Trending deals ranked by conversion
- `GET /api/deals/flash` - Flash sales (high discounts)
- `GET /api/deals/category/:cat` - Category-specific deals
- `GET /api/deals/best-price` - Best priced products across platforms
- `POST /api/deals/update-trending` - Update trending scores (internal)

**Trending Calculation:**
```
trendingScore = (clickCount × 0.3) + (conversionRate% × 0.5) + (commission × 0.001)
```

---

### 8. Revenue Dashboard ✅

**Routes:**
- `GET /api/dashboard/revenue` - Complete revenue dashboard
- `GET /api/dashboard/watchlist-analytics` - Watchlist statistics
- `GET /api/dashboard/overview` - Dashboard overview

**Dashboard Data:**
```json
{
  "affiliateId": "aff_123456",
  "bankAccount": { "name": "...", "ifsc": "..." },
  "totalEarnings": "₹50,000.00",
  "thisMonthEarnings": "₹5,000.00",
  "thisWeekEarnings": "₹1,200.00",
  "totalPurchases": 250,
  "thisMonthPurchases": 25,
  "thisWeekPurchases": 6,
  "commissionRate": 5,
  "earningsByPlatform": [
    { "platform": "amazon", "totalCommission": 30000, "count": 150 },
    { "platform": "flipkart", "totalCommission": 20000, "count": 100 }
  ],
  "recentTransactions": [
    {
      "productId": "B07XYZ",
      "amount": 5000,
      "commission": 250,
      "platform": "amazon",
      "purchasedAt": "2026-02-21"
    }
  ]
}
```

---

### 9. Scheduled Jobs (Cron Tasks) ✅

**Daily 8 AM - Price Drop Alerts**
```
- Checks all watchlist items
- Detects price drops below target
- Logs alert events
- Updates lastAlertDate
```

**Weekly (Monday 2 AM) - Trending Updates**
```
- Analyzes clicks from last 7 days
- Calculates conversion rates
- Scores products by trendingScore
- Updates top 50 products as trending
```

**Monthly (1st at 12 AM) - Commission Calculations**
```
- Calculates earnings for previous month
- Groups by affiliate
- Records total commissions
- Logs for accounting
```

**Daily 3 AM - Cleanup Expired Clicks**
```
- Removes unpurchased clicks older than 30 days
- Frees up database space
- Uses TTL index for automatic cleanup
```

---

### 10. Frontend Authentication Pages ✅

**Sign Up Page** (`/auth/signup`):
- User registration form
- Name, email, password, phone
- Form validation
- Error handling
- Link to login
- Affiliate benefits display

**Login Page** (`/auth/login`):
- Email and password fields
- Remember session
- JWT token storage
- Redirect to dashboard
- Sign up link

**Features:**
- Form validation (Joi compatible)
- Secure password handling
- Token persistence in localStorage
- Error messages
- Loading states
- Mobile responsive

---

## Security Features Implemented

✅ **Authentication:**
- JWT tokens with secret key
- Password hashing (bcryptjs)
- Token expiration (7 days)
- Secure password comparison

✅ **Input Validation:**
- Joi schema validation on all routes
- Email RFC 5322 compliance
- Price bounds validation (0 to 10 million)
- Platform whitelist validation
- Object key protection

✅ **HTTP Security:**
- Helmet middleware for security headers
- CORS configured for frontend
- Rate limiting (100 req/15 min per IP)
- Content-Type validation
- X-Frame-Options set

✅ **Database:**
- MongoDB connection pooling
- TLS in production
- Indexes on frequently queried fields
- TTL indexes for automatic cleanup
- Password field not returned by default

✅ **API Security:**
- authMiddleware on protected routes
- User ownership verification
- Safe error messages (no stack traces)
- Request logging on all endpoints
- Status codes per HTTP spec

---

## File Structure

```
backend/
├── src/
│   ├── index.ts                  # Main server entry
│   ├── config/
│   │   ├── database.ts           # MongoDB connection
│   │   └── env.ts                # Environment validation
│   ├── middleware/
│   │   └── auth.ts               # JWT middleware
│   ├── models/
│   │   ├── User.ts               # User schema
│   │   ├── AffiliateClick.ts     # Click tracking
│   │   ├── Product.ts            # Product catalog
│   │   ├── PriceHistory.ts       # Price data
│   │   └── Watchlist.ts          # User watchlists
│   ├── routes/
│   │   ├── auth.ts               # Auth endpoints
│   │   ├── affiliate.ts          # Affiliate endpoints
│   │   ├── search.ts             # Product search
│   │   ├── watchlist.ts          # Watchlist endpoints
│   │   ├── priceHistory.ts       # Price tracking
│   │   ├── recommendations.ts    # Recommendations
│   │   ├── deals.ts              # Deals & trending
│   │   └── dashboard.ts          # Revenue dashboard
│   ├── utils/
│   │   └── jwt.ts                # JWT utilities
│   └── jobs/
│       └── scheduler.ts          # Cron jobs
├── .env.example                  # Environment template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # Backend documentation

frontend/
├── src/app/
│   ├── auth/
│   │   ├── login/page.tsx        # Login page
│   │   └── signup/page.tsx       # Sign up page
│   └── ... (other pages)
├── .env.example                  # Frontend env
├── package.json                  # Dependencies
└── tsconfig.json
```

---

## Dependencies

**Backend:**
```json
{
  "express": "^4.18.2",           // Web framework
  "mongoose": "^8.0.0",           // MongoDB ODM
  "jsonwebtoken": "^9.1.2",       // JWT tokens
  "bcryptjs": "^2.4.3",           // Password hashing
  "joi": "^17.11.0",              // Input validation
  "helmet": "^7.1.0",             // Security headers
  "express-rate-limit": "^7.1.5", // Rate limiting
  "node-cron": "^3.0.2",          // Scheduled jobs
  "redis": "^4.6.11",             // Caching
  "bull": "^4.11.5",              // Job queue
  "axios": "^1.6.2",              // HTTP requests
  "pino": "^8.16.2",              // Logging
  "cors": "^2.8.5"                // CORS middleware
}
```

---

## Database Indexes

**User Collection:**
- `email` - Unique index
- `affiliateId` - Unique index

**AffiliateClick Collection:**
- `affiliateId, platform, clickedAt` - Compound index
- `userId, purchased` - Compound index
- `expiresAt` - TTL index (30 days)

**Product Collection:**
- Full-text index on: title, description, category
- `category, updatedAt` - Compound index
- `platforms.platform` - Index
- `trending` - Index

**PriceHistory Collection:**
- `productId, platform, recordedAt` - Compound index
- `recordedAt` - TTL index (1 year)

**Watchlist Collection:**
- `userId, productId, platform` - Unique compound index
- `notifyOnDrop, targetPrice` - Compound index

---

## API Response Format

**Success Response:**
```json
{
  "message": "Success message",
  "data": { /* response data */ },
  "timestamp": "2026-02-21T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "error": "Error message (non-sensitive)",
  "statusCode": 400,
  "timestamp": "2026-02-21T10:30:00.000Z"
}
```

---

## Environment Variables

**Required:**
- `MONGODB_URI` - MongoDB connection
- `JWT_SECRET` - JWT signing key
- `REDIS_URL` - Redis connection
- `AFFILIATE_COMMISSION_PERCENT` - Default commission

**Optional:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - environment (development/production)
- `CORS_ORIGINS` - Allowed origins
- `AWS_*` - AWS credentials for S3
- `SENDGRID_API_KEY` - Email service
- `AMAZON_AFFILIATE_TAG` - Amazon affiliate ID
- `FLIPKART_AFFILIATE_TAG` - Flipkart affiliate ID
- `LOG_LEVEL` - Logging level

---

## Testing the Backend

### 1. Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
```

Response:
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "65c123456789...",
    "name": "John Doe",
    "email": "john@example.com",
    "affiliateId": "aff_1708506660000_a1b2c3d4e"
  }
}
```

### 2. Generate Affiliate Link
```bash
curl -X POST http://localhost:5000/api/affiliate/generate-link \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "B07XYZ",
    "platform": "amazon",
    "productUrl": "https://amazon.in/s?k=laptop"
  }'
```

### 3. Track Click
```bash
curl -X POST http://localhost:5000/api/affiliate/track-click \
  -H "Content-Type: application/json" \
  -d '{
    "clickId": "65c123456789...",
    "device": "mobile",
    "userAgent": "Mozilla/5.0..."
  }'
```

### 4. Mark Purchase
```bash
curl -X POST http://localhost:5000/api/affiliate/mark-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "clickId": "65c123456789...",
    "purchaseAmount": 50000
  }'
```

### 5. Get Stats
```bash
curl -X GET http://localhost:5000/api/affiliate/stats \
  -H "Authorization: Bearer <token>"
```

### 6. Get Dashboard
```bash
curl -X GET http://localhost:5000/api/dashboard/revenue \
  -H "Authorization: Bearer <token>"
```

---

## Performance Optimization

✅ **Database:**
- Indexed queries reduce lookup time from O(n) to O(log n)
- Connection pooling (min: 5, max: 10)
- Lean queries for read-only operations
- Compound indexes for common filters

✅ **Caching:**
- Redis for session caching (optional)
- Database query results caching
- Product data caching

✅ **API:**
- Pagination (default: 20 items per page)
- Field selection (only needed fields)
- Compression with gzip
- Rate limiting to prevent abuse

---

## Next Steps

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Setup MongoDB & Redis:**
   - Local: `mongod` and `redis-server`
   - Cloud: MongoDB Atlas and Redis Cloud

3. **Configure Environment:**
   ```bash
   cp .env.example .env.local
   # Edit with your credentials
   ```

4. **Start Backend:**
   ```bash
   npm run dev
   ```

5. **Start Frontend:**
   ```bash
   cd ../frontend
   npm run dev
   ```

6. **Test Application:**
   - Sign up at http://localhost:3000/auth/signup
   - Explore dashboard
   - Test affiliate features

---

## Troubleshooting

**Issue:** MongoDB connection timeout
- Check MongoDB URL
- Verify MongoDB is running
- Check network connectivity

**Issue:** JWT invalid error
- Token may be expired (7 days default)
- Login again to get new token
- Verify JWT_SECRET matches

**Issue:** CORS errors
- Check CORS_ORIGINS in .env.local
- Verify frontend URL is listed
- Check browser console for details

**Issue:** Port already in use
- Change PORT in .env.local
- Kill existing process on that port

---

## Maintenance Checklist

- [ ] Review logs daily
- [ ] Monitor database size
- [ ] Backup MongoDB regularly
- [ ] Rotate JWT secrets quarterly
- [ ] Update dependencies: `npm audit fix`
- [ ] Test disaster recovery
- [ ] Review user data privacy
- [ ] Monitor API performance

---

## Support & Questions

For detailed information, see:
- [Backend README](./backend/README.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Security Docs](./frontend/SECURITY.md)

---

**Version:** 1.0.0  
**Status:** ✅ Complete & Production-Ready  
**Last Updated:** February 2026
