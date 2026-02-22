# Smart Compare - Backend Server

A Node.js/Express backend for the Smart Compare affiliate price comparison platform.

## Features

- ✅ **User Authentication** - JWT-based authentication system
- ✅ **Affiliate Tracking** - Track affiliate clicks and commissions
- ✅ **Price Monitoring** - Monitor prices across platforms
- ✅ **Watchlist Management** - Users can create product watchlists with alerts
- ✅ **Revenue Dashboard** - Real-time commission and earnings tracking
- ✅  **Scheduled Jobs** - Automated price alerts, trending updates, commission calculations
- ✅ **Security** - Helmet, rate limiting, input validation
- ✅ **API Documentation** - All endpoints documented below

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (for caching)
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-compare
JWT_SECRET=your-super-secret-key
REDIS_URL=redis://localhost:6379
```

### 3. Start MongoDB and Redis

```bash
# MongoDB (if local)
mongod

# Redis (if local)
redis-server
```

### 4. Run Backend

**Development (with auto-reload):**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

```
POST   /api/auth/signup           - Create new user account
POST   /api/auth/login            - Login with email/password
GET    /api/auth/me               - Get current user profile
PUT    /api/auth/profile          - Update user profile
```

### Affiliate System

```
POST   /api/affiliate/generate-link   - Generate affiliate link
POST   /api/affiliate/track-click     - Track affiliate click
POST   /api/affiliate/mark-purchase   - Record purchase
GET    /api/affiliate/stats           - Get affiliate statistics
```

### Search & Products

```
GET    /api/search/products       - Search products
GET    /api/search/products/:id   - Get product details
GET    /api/search/trending       - Get trending products
```

### Watchlist

```
POST   /api/watchlist             - Add to watchlist
GET    /api/watchlist             - Get user's watchlist
DELETE /api/watchlist/:id         - Remove from watchlist
PATCH  /api/watchlist/:id         - Update watchlist entry
```

### Price History

```
GET    /api/price-history/product/:id  - Get price history
GET    /api/price-history/drops/recent - Get recent price drops
POST   /api/price-history/record       - Record price update (internal)
```

### Recommendations

```
GET    /api/recommendations/personalized   - Get recommendations
GET    /api/recommendations/similar/:id    - Get similar products
GET    /api/recommendations/category/:cat  - Get category recommendations
GET    /api/recommendations/deals/price-drops - Get price drop deals
```

### Deals

```
GET    /api/deals/trending         - Get trending deals
GET    /api/deals/flash            - Get flash sales
GET    /api/deals/category/:cat    - Get category deals
GET    /api/deals/best-price       - Get best priced products
POST   /api/deals/update-trending  - Update trending (internal)
```

### Dashboard

```
GET    /api/dashboard/revenue     - Get revenue dashboard
GET    /api/dashboard/watchlist-analytics - Get watchlist stats
GET    /api/dashboard/overview    - Get dashboard overview
```

## Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <token>
```

## Database Models

### User

```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  phone?: string
  affiliateId: string (unique)
  commissionRate: number
  bankAccount?: {
    accountName: string
    accountNumber: string
    ifscCode: string
  }
}
```

### AffiliateClick

```typescript
{
  userId: ObjectId
  affiliateId: string
  productId: string
  platform: 'amazon' | 'flipkart' | 'myntra' | 'ajio' | 'other'
  sourceUrl: string
  redirectUrl: string
  purchased: boolean
  purchaseAmount?: number
  commission?: number
  clickedAt: Date
  purchasedAt?: Date
}
```

### Product

```typescript
{
  asin: string
  title: string
  category: string
  platforms: [{
    platform: string
    url: string
    currentPrice: number
    originalPrice?: number
    discount?: number
    inStock: boolean
  }]
  rating?: number
  trending: boolean
  lastPriceDrop?: {
    amount: number
    previousPrice: number
    date: Date
  }
}
```

## Scheduled Jobs

- **8 AM Daily** - Price drop alerts for watchlist items
- **2 AM Mondays** - Trending deals update based on conversion rates
- **12 AM 1st of Month** - Monthly commission calculations
- **3 AM Daily** - Cleanup expired affiliate clicks (30+ days)

## Error Handling

All errors return appropriate HTTP status codes:

- 400 - Bad Request (validation error)
- 401 - Unauthorized (missing/invalid token)
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found
- 409 - Conflict (duplicate entry)
- 500 - Internal Server Error

## Security Features

- ✅ Helmet - Sets security HTTP headers
- ✅ Rate Limiting - 100 requests per 15 minutes per IP
- ✅ JWT Validation - Token-based authentication
- ✅ Password Hashing - bcryptjs with 10 salt rounds
- ✅ Input Validation - All inputs validated with Joi
- ✅ CORS - Configured for frontend domain
- ✅ TLS in Production - Secure MongoDB connections

## Environment Variables

See `.env.example` for all available variables.

Key ones:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `REDIS_URL` - Redis connection string
- `AFFILIATE_COMMISSION_PERCENT` - Default commission rate
- `AMAZON_AFFILIATE_TAG` - Amazon affiliate tag
- `FLIPKART_AFFILIATE_TAG` - Flipkart affiliate tag

## Development Tips

- Use `npm run watch` to watch TypeScript files and auto-compile
- Use Postman/Insomnia to test API endpoints
- Check `logs/` directory for application logs
- Set `LOG_LEVEL=debug` in `.env.local` for verbose logging

## Deployment

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["npm", "start"]
```

Build and run:

```bash
npm run build
docker build -t smart-compare-backend .
docker run -p 5000:5000 --env-file .env.local smart-compare-backend
```

### Platform

Deploy to Heroku, Railway, Render, or any Node.js hosting.

Environment variables must be set in the hosting platform's config.

## Support & Maintenance

- Monitor error logs regularly
- Set up database backups
- Rotate JWT secrets periodically
- Update dependencies regularly: `npm audit fix`

---

**Version:** 1.0.0  
**Last Updated:** February 2026
