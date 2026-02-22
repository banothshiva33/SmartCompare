import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';
import connectDB from './config/database';
import { validateEnv } from './config/env';

// Load environment variables
dotenv.config();

// Validate environment
const envConfig = validateEnv();

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: envConfig.CORS_ORIGINS.split(','),
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    timestamp: new Date(),
  });
  next();
});

// Import routes
import authRoutes from './routes/auth';
import affiliateRoutes from './routes/affiliate';
import searchRoutes from './routes/search';
import watchlistRoutes from './routes/watchlist';
import priceHistoryRoutes from './routes/priceHistory';
import recommendationsRoutes from './routes/recommendations';
import dealsRoutes from './routes/deals';
import dashboardRoutes from './routes/dashboard';

// Import scheduled jobs
import { initializeScheduledJobs } from './jobs/scheduler';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/price-history', priceHistoryRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    error: message,
    timestamp: new Date(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Start server
const PORT = envConfig.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Connected to MongoDB');

    // Initialize scheduled jobs
    initializeScheduledJobs();

    app.listen(PORT, () => {
      logger.info(`Smart Compare Backend running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
