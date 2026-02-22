import pino from 'pino';

const logger = pino();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  REDIS_URL: string;
  CORS_ORIGINS: string;
  AFFILIATE_COMMISSION_PERCENT: number;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  SENDGRID_API_KEY: string;
  AMAZON_AFFILIATE_TAG: string;
  FLIPKART_AFFILIATE_TAG: string;
}

export const validateEnv = (): EnvConfig => {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'REDIS_URL',
    'AFFILIATE_COMMISSION_PERCENT',
  ];

  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    logger.warn(`Missing environment variables: ${missing.join(', ')}`);
  }

  const config: EnvConfig = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-compare',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5000',
    AFFILIATE_COMMISSION_PERCENT: parseFloat(process.env.AFFILIATE_COMMISSION_PERCENT || '5'),
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
    AMAZON_AFFILIATE_TAG: process.env.AMAZON_AFFILIATE_TAG || 'smartcompare-20',
    FLIPKART_AFFILIATE_TAG: process.env.FLIPKART_AFFILIATE_TAG || 'smartcompare',
  };

  // Production validations
  if (process.env.NODE_ENV === 'production') {
    if (config.JWT_SECRET === 'your-secret-key-change-in-production') {
      throw new Error('JWT_SECRET must be changed from default in production');
    }
    if (!config.SENDGRID_API_KEY) {
      logger.warn('SENDGRID_API_KEY not set - email features will be limited');
    }
  }

  return config;
};

export const getEnvConfig = (): EnvConfig => validateEnv();
