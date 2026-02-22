import mongoose from 'mongoose';

// ⚠️ SECURITY: This connection should ONLY be called from API routes on the server
// Never expose MongoDB operations to client-side code
// Use API endpoints as middleware for all database access

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('🔴 CRITICAL: MONGODB_URI environment variable is not set. Add it to .env.local');
}

// Connection options with security best practices
const mongooseOptions = {
  // These options help prevent connection pool exhaustion
  maxPoolSize: 10,
  minPoolSize: 2,
  // Timeout settings
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  // Security: force TLS for production
  ...(process.env.NODE_ENV === 'production' && {
    tls: true,
  }),
};

/**
 * Connect to MongoDB with error handling
 * Should only be called from server-side code (API routes, middleware)
 */
export async function connectDB() {
  // Check if already connected
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const connection = await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ MongoDB connected successfully');
    return connection;
  } catch (error) {
    const err = error as Error;
    console.error('🔴 MongoDB connection failed:', err.message);
    // In production, implement proper error reporting
    // Do NOT expose connection details to client
    throw new Error('Database connection failed');
  }
}

/**
 * Gracefully disconnect from MongoDB
 * Call on server shutdown
 */
export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    const err = error as Error;
    console.error('Error disconnecting from MongoDB:', err.message);
  }
}
