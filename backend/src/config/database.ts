import mongoose from 'mongoose';
import pino from 'pino';

const logger = pino();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Add TLS options for production
    if (process.env.NODE_ENV === 'production') {
      options.tls = true;
      options.tlsAllowInvalidCertificates = false;
    }

    await mongoose.connect(mongoUri, options);
    logger.info('MongoDB connection established');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connectDB;
