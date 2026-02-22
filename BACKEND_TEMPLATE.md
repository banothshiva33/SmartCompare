# Backend Implementation Template

⚠️ **This is a blueprint for implementing the backend server**

The frontend currently handles all operations. For production, implement a backend API server to:
1. Handle all database operations
2. Secure all API keys
3. Implement authentication
4. Add rate limiting

---

## Recommended Backend Structure

```
backend/
├── src/
│   ├── index.ts              # Main application entry
│   ├── config/
│   │   ├── database.ts       # MongoDB connection
│   │   ├── redis.ts          # Redis for rate limiting
│   │   └── env.ts            # Environment validation
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   ├── rateLimiter.ts    # Rate limiting
│   │   ├── errorHandler.ts   # Error handling
│   │   └── security.ts       # Security headers
│   ├── routes/
│   │   ├── auth.ts           # Authentication endpoints
│   │   ├── search.ts         # Search products
│   │   ├── watchlist.ts      # Watchlist management
│   │   └── products.ts       # Product information
│   ├── services/
│   │   ├── amazon.ts         # Amazon API integration
│   │   ├── email.ts          # Email service
│   │   └── cache.ts          # Caching logic
│   └── models/
│       ├── user.ts           # User model
│       ├── product.ts        # Product model
│       └── watchlist.ts      # Watchlist model
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Example Backend Implementation

```typescript
// backend/src/index.ts

import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment
config();

const app = express();
const PORT = process.env.PORT || 3001;

// ========== Security Middleware ==========

// 1. Helmet - Security headers
app.use(helmet());

// 2. Body parser with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb' }));

// 3. Cookie parser
app.use(cookieParser());

// 4. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// 5. CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000', // Development
    process.env.FRONTEND_URL, // Production
  ];

  if (allowedOrigins.includes(req.origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', req.origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ========== Routes ==========

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/search', require('./routes/search'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/products', require('./routes/products'));

// ========== Error Handling ==========

interface AppError extends Error {
  status?: number;
}

app.use(
  (
    err: AppError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err.message);

    const status = err.status || 500;
    const message =
      status === 500
        ? 'Internal server error'
        : err.message;

    res.status(status).json({
      error: message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
      }),
    });
  }
);

// ========== Start Server ==========

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
```

---

## Key Implementation Areas

### 1. Authentication Endpoints

```typescript
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/logout
// POST /api/auth/refresh
// GET /api/auth/profile
```

### 2. Search Endpoints (Secure)

```typescript
// POST /api/search
// - Move search logic from frontend to backend
// - Keep secrets on backend (API keys)
// - Validate input
// - Implement caching
```

### 3. Database Models

```typescript
// User Model
interface User {
  _id: ObjectId;
  email: string;
  passwordHash: string; // bcrypt/argon2
  createdAt: Date;
  updatedAt: Date;
}

// Watchlist Model
interface WatchlistItem {
  _id: ObjectId;
  userId: ObjectId;
  productId: string;
  title: string;
  platform: string;
  price: number;
  targetPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Environment Variables (Backend)

```env
# Backend Configuration
PORT=3001
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://...

# Redis (for rate limiting, caching, sessions)
REDIS_URL=redis://...

# Authentication
JWT_SECRET=your_very_long_secret_key_min_32_chars
JWT_EXPIRY=24h

# Amazon Associates (SECRETS - never exposed to frontend!)
AMAZON_PARTNER_TAG=...
AMAZON_ACCESS_KEY=...
AMAZON_SECRET_KEY=...

# CORS
FRONTEND_URL=https://smartcompare.com
ALLOW_ORIGINS=https://smartcompare.com,https://www.smartcompare.com

# Email (if using backend-based email)
EMAILJS_SERVICE_ID=...
EMAILJS_TEMPLATE_ID=...
EMAILJS_PUBLIC_KEY=...
```

---

## Deployment Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS Only
       ▼
┌──────────────────┐
│  Nginx/Reverse   │
│    Proxy         │
└──────┬───────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
   ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐
   │Backend│     │Backend│     │Backend│     │Backend│
   │Server1│     │Server2│     │Server3│     │Server4│
   └───┬──┘      └───┬──┘      └───┬──┘      └───┬──┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
   ┌────────────┐ ┌─────────┐ ┌──────────┐
   │  MongoDB   │ │  Redis  │ │  Email   │
   │   Atlas    │ │  Cache  │ │ Service  │
   └────────────┘ └─────────┘ └──────────┘
```

---

## Next Steps

1. **Create backend project structure**
2. **Implement authentication system**
3. **Move all API routes to backend**
4. **Implement Redis-based rate limiting**
5. **Set up database models**
6. **Deploy backend to production**
7. **Update frontend to call backend APIs**

---

## Security Checklist for Backend

- [ ] All secrets in environment variables
- [ ] Helmet security headers enabled
- [ ] Rate limiting on all endpoints
- [ ] Input validation using Joi/Zod
- [ ] CORS configured with specific origins
- [ ] Authentication middleware on protected routes
- [ ] Secure password hashing (bcrypt/argon2)
- [ ] JWT token validation
- [ ] Error messages don't leak internals
- [ ] Logging for security events
- [ ] HTTPS enforced
- [ ] Dependency security checked (npm audit)

