# Smart Compare - Full Project Setup Guide

Complete guide to set up and run the entire Smart Compare affiliate platform.

## Project Structure

```
smart-compare/
├── backend/          # Node.js/Express server
├── frontend/         # Next.js React app
├── .env.example     # Example environment variables
└── README.md
```

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** ([Local](https://www.mongodb.com/try/download/community) or [Atlas Cloud](https://www.mongodb.com/cloud/atlas))
- **Redis** ([Download](https://redis.io/download) or use [Docker](https://hub.docker.com/_/redis))
- **Git** for version control

## Quick Start (Development)

### Step 1: Clone and Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

cd ..
```

### Step 2: Setup Environment Files

**Backend `.env.local`:**
```bash
cp backend/.env.example backend/.env.local
```

Edit `backend/.env.local`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-compare
JWT_SECRET=dev-secret-key-change-in-production
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
AFFILIATE_COMMISSION_PERCENT=5
AMAZON_AFFILIATE_TAG=smartcompare-20
FLIPKART_AFFILIATE_TAG=smartcompare
```

**Frontend `.env.local`:**
```bash
# Create frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AMAZON_AFFILIATE_TAG=smartcompare-20
```

### Step 3: Start Services

**Terminal 1 - MongoDB** (if running locally):
```bash
mongod
```

**Terminal 2 - Redis** (if running locally):
```bash
redis-server
```

**Terminal 3 - Backend**:
```bash
cd backend
npm run dev
```

Backend will be available at: `http://localhost:5000`

**Terminal 4 - Frontend**:
```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## Default User Flow

1. **Sign Up:** Visit http://localhost:3000/auth/signup
2. **Create Account:** Enter name, email, password
3. **Get Affiliate ID:** Automatically generated upon signup
4. **Access Dashboard:** http://localhost:3000/revenue-dashboard
5. **Start Earning:** Generate affiliate links and earn commissions on sales

## Features Overview

### Frontend Features

- ✅ Product search and comparison across platforms
- ✅ Price history charts
- ✅ Product watchlist with alerts
- ✅ Affiliate revenue dashboard
- ✅ Trending deals section
- ✅ Responsive mobile UI

### Backend Features

- ✅ User authentication (signup/login)
- ✅ Affiliate link generation & tracking
- ✅ Price monitoring & alerts
- ✅ Commission calculations
- ✅ Scheduled tasks (cron jobs)
- ✅ REST API with security

## API Quick Reference

### Authentication
```bash
# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

### Generate Affiliate Link
```bash
curl -X POST http://localhost:5000/api/affiliate/generate-link \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId":"B07XYZ123",
    "platform":"amazon",
    "productUrl":"https://amazon.in/...",
    "sourceUrl":"https://smartcompare.com"
  }'
```

### Get Stats
```bash
curl -X GET http://localhost:5000/api/affiliate/stats \
  -H "Authorization: Bearer <token>"
```

## Database

### MongoDB Collections

- **users** - User accounts and profiles
- **affiliateclicks** - Click tracking and conversions
- **products** - Product catalog
- **pricehistories** - Historical price data
- **watchlists** - User watchlist items

### Reset Database (Development)

```bash
# Connect to MongoDB
mongo

# In mongo shell
show databases
use smart-compare
db.dropDatabase()
```

## Debugging

### Backend Logs

Set `LOG_LEVEL` in `.env.local`:
```env
LOG_LEVEL=debug  # (info, debug, warn, error)
```

### Frontend Debugging

Use browser DevTools (F12):
- **Network tab** - Check API calls
- **Console** - Check for errors
- **Storage** - Check localStorage for token

### MongoDB Query

```bash
mongo
use smart-compare
db.users.find()
db.affiliateclicks.find()
```

## Common Issues & Solutions

### "Cannot connect to MongoDB"
```bash
# Check MongoDB is running
# Windows: mongod should be running
# macOS: brew services list
# Linux: sudo systemctl status mongod
```

### "Port 5000/3000 already in use"
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or change port in .env.local
PORT=5001
```

### "Redis connection failed"
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

### "JWT token invalid"
```bash
# Token might be expired
# Login again to get new token
# Token expires in 7 days by default
```

## Production Deployment

See individual README files:
- [Backend Deployment](./backend/README.md)
- [Frontend Deployment](./frontend/README.md)

### Key Steps

1. **Backend:**
   - Build: `npm run build`
   - Deploy to Railway, Heroku, or similar
   - Set environment variables on platform
   - Use MongoDB Atlas (not localhost)
   - Enable HTTPS

2. **Frontend:**
   - Build: `npm run build`
   - Deploy to Vercel, Netlify, or similar
   - Update API URL to production backend
   - Enable HTTPS

## Testing

### Manual Testing

Use Postman or Insomnia:
1. Create account via `/auth/signup`
2. Copy the returned JWT token
3. Use token in `Authorization: Bearer <token>` header
4. Test other endpoints

### Load Testing

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:5000/health
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request
```

## Support & Resources

- **MongoDB Docs:** https://docs.mongodb.com
- **Express Guide:** https://expressjs.com
- **Next.js Docs:** https://nextjs.org/docs
- **JWT Info:** https://jwt.io

## Troubleshooting Checklist

- [ ] Node.js installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] MongoDB running
- [ ] Redis running
- [ ] Environment files created
- [ ] Ports 3000 and 5000 available
- [ ] Correct URLs in browser

## Next Steps

1. ✅ Set up and run both servers
2. 📱 Create test account and explore
3. 🔗 Test affiliate link generation
4. 💰 Check revenue dashboard
5. 📊 Monitor price tracking
6. 🚀 Deploy to production

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Maintainer:** Smart Compare Team
