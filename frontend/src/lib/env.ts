/**
 * Environment Variable Validation Module
 * Validates that all required environment variables are set correctly
 * and warns about security misconfigurations
 */

export interface EnvironmentConfig {
  // Database
  mongodbUri: string;

  // Email Service
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;

  // Amazon Associates
  amazonPartnerTag: string;
  amazonAccessKey: string;
  amazonSecretKey: string;
  amazonRegion: string;

  // Security
  jwtSecret: string;
  encryptionKey: string;

  // Feature Flags
  affiliateEnabled: boolean;
  priceAlertsEnabled: boolean;

  // Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Validate and load environment configuration
 * Throws if critical environment variables are missing
 */
export function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ========== CRITICAL: Database Configuration ==========
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    errors.push('❌ CRITICAL: MONGODB_URI is not set');
  } else if (mongodbUri.includes('placeholder') || mongodbUri.includes('username')) {
    errors.push('❌ CRITICAL: MONGODB_URI contains placeholder values');
  }

  // ========== WARNING: Backend-Only Secrets ==========
  const amazonAccessKey = process.env.AMAZON_ACCESS_KEY;
  const amazonSecretKey = process.env.AMAZON_SECRET_KEY;

  if (!amazonAccessKey || amazonAccessKey.includes('placeholder')) {
    warnings.push('⚠️ WARNING: AMAZON_ACCESS_KEY not properly configured');
  }
  if (!amazonSecretKey || amazonSecretKey.includes('placeholder')) {
    warnings.push('⚠️ WARNING: AMAZON_SECRET_KEY not properly configured');
  }

  // ========== Security: Check for Exposed Frontend Secrets ==========
  // NEXT_PUBLIC_ variables are exposed to the client - this is expected for EmailJS
  // but we should warn about rotation
  const emailjsPublicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  if (!emailjsPublicKey) {
    warnings.push('⚠️ WARNING: NEXT_PUBLIC_EMAILJS_PUBLIC_KEY not set');
  } else if (emailjsPublicKey === 'AjfpeqOT9qHaiiSNm') {
    warnings.push(
      '⚠️ SECURITY: Using demo EmailJS key. Rotate this key in production!'
    );
  }

  // ========== Security: JWT Secret (Backend Only) ==========
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    warnings.push('⚠️ WARNING: JWT_SECRET not set or too short (minimum 32 characters)');
  }

  // ========== Security: Encryption Key (Backend Only) ==========
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey || encryptionKey.length < 32) {
    warnings.push('⚠️ WARNING: ENCRYPTION_KEY not set or too short (minimum 32 characters)');
  }

  // ========== INSECURE: Check for Common Development mistakes ==========
  if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
    warnings.push('⚠️ WARNING: NEXT_PUBLIC_BACKEND_URL not configured');
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  if (isProduction) {
    // ========== Production-Specific Checks ==========
    if (!process.env.JWT_SECRET) {
      errors.push('❌ CRITICAL: JWT_SECRET must be set in production');
    }

    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost')) {
      errors.push('❌ CRITICAL: Must use Atlas MongoDB (not localhost) in production');
    }

    // Check for HTTPS enforcement
    if (process.env.ENFORCE_HTTPS !== 'true') {
      warnings.push('⚠️ WARNING: ENFORCE_HTTPS not set to true for production');
    }
  }

  // Print warnings
  if (warnings.length > 0) {
    console.log('\n⚠️  SECURITY WARNINGS:\n');
    warnings.forEach((w) => console.log(w));
    console.log('');
  }

  // Throw on critical errors
  if (errors.length > 0) {
    console.error('\n🔴 CRITICAL CONFIGURATION ERRORS:\n');
    errors.forEach((e) => console.error(e));
    console.error('\nFix these errors before starting the application.\n');
    throw new Error('Environment validation failed');
  }

  return {
    mongodbUri: mongodbUri!,
    emailjsServiceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
    emailjsTemplateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
    emailjsPublicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
    amazonPartnerTag: process.env.AMAZON_PARTNER_TAG || '',
    amazonAccessKey: process.env.AMAZON_ACCESS_KEY || '',
    amazonSecretKey: process.env.AMAZON_SECRET_KEY || '',
    amazonRegion: process.env.AMAZON_REGION || 'IN',
    jwtSecret: process.env.JWT_SECRET || '',
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    affiliateEnabled: process.env.NEXT_PUBLIC_AFFILIATE_ENABLED !== 'false',
    priceAlertsEnabled: process.env.NEXT_PUBLIC_PRICE_ALERTS_ENABLED !== 'false',
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: isProduction,
  };
}

/**
 * Get safe environment config for client-side code
 * Only returns NEXT_PUBLIC_ variables
 */
export function getClientEnvironment(): {
  backendUrl: string;
  affiliateEnabled: boolean;
  priceAlertsEnabled: boolean;
} {
  return {
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    affiliateEnabled: process.env.NEXT_PUBLIC_AFFILIATE_ENABLED !== 'false',
    priceAlertsEnabled: process.env.NEXT_PUBLIC_PRICE_ALERTS_ENABLED !== 'false',
  };
}

// Validate on load in development
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  try {
    validateEnvironment();
  } catch (error) {
    // In development, log and continue (to allow for incremental setup)
    if (process.env.NODE_ENV === 'development') {
      console.warn('Development env validation warnings above ☝️');
    } else {
      // In production, this will have already thrown
      throw error;
    }
  }
}
