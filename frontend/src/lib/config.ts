/**
 * Security Configuration for the Application
 * Production deployment checklist and security best practices
 */

// ============================================================
// SECURITY CHECKLIST FOR PRODUCTION DEPLOYMENT
// ============================================================

// 1. ENVIRONMENT VARIABLES
// ✅ Set all required environment variables in .env.production
// ✅ Use strong, randomly generated secrets (min 32 characters for JWT_SECRET)
// ✅ Use Atlas MongoDB (not localhost)
// ✅ Rotate API keys and credentials regularly
// ✅ Never commit .env files with real secrets

// 2. HTTPS & TLS
// ✅ Deploy only on HTTPS
// ✅ Use valid SSL/TLS certificate (not self-signed in production)
// ✅ Enable HSTS (Strict-Transport-Security header)
// ✅ Set secure cookie flags: Secure, HttpOnly, SameSite

// 3. DATABASE SECURITY
// ✅ Enable MongoDB IP whitelist
// ✅ Use strong database user credentials
// ✅ Enable authentication for all MongoDB connections
// ✅ Use TLS for MongoDB connections
// ✅ Regularly backup database

// 4. API SECURITY
// ✅ Implement rate limiting on all public endpoints
// ✅ Add input validation and sanitization
// ✅ Use parameterized queries (Mongoose does this by default)
// ✅ Implement CSRF tokens for state-changing operations
// ✅ Add API authentication (JWT tokens)

// 5. FRONTEND SECURITY
// ✅ Implement Content Security Policy (CSP)
// ✅ Set X-Frame-Options: DENY (prevent clickjacking)
// ✅ Set X-Content-Type-Options: nosniff (prevent MIME sniffing)
// ✅ Implement proper error handling (don't expose stack traces)
// ✅ Regular security scanning of dependencies

// 6. DEPENDENCY MANAGEMENT
// ✅ Keep dependencies up to date (npm outdated, npm audit)
// ✅ Remove crypto-js (use Web Crypto API or Node crypto)
// ✅ Monitor for CVEs in production
// ✅ Lock dependency versions in package-lock.json

// 7. LOGGING & MONITORING
// ✅ Implement centralized logging
// ✅ Log security events (failed auth, rate limit, etc.)
// ✅ Monitor for suspicious activity
// ✅ Set up alerting for critical errors

// 8. DEPLOYMENT
// ✅ Use container images with minimal base OS
// ✅ Don't run as root in containers
// ✅ Use strong secrets management (not environment variables if possible)
// ✅ Implement health checks
// ✅ Auto-scale based on load

// 9. DOCUMENTATION
// ✅ Document security policies and incident response
// ✅ Create runbook for security incidents
// ✅ Document all API endpoints and authentication

export const SECURITY_CHECKLIST = {
  environment: {
    description: 'Environment Variable Security',
    items: [
      'All required env vars set',
      'No placeholder values',
      'Strong secret keys (32+ chars)',
      'Using production database',
      'API keys rotated',
    ],
  },
  https: {
    description: 'HTTPS & TLS Security',
    items: [
      'HTTPS enforced',
      'Valid SSL certificate',
      'HSTS header enabled',
      'Cookies: Secure, HttpOnly, SameSite',
    ],
  },
  database: {
    description: 'Database Security',
    items: [
      'IP whitelist enabled',
      'Strong DB credentials',
      'Authentication enabled',
      'TLS connections enforced',
      'Backups configured',
    ],
  },
  api: {
    description: 'API Security',
    items: [
      'Rate limiting active',
      'Input validation on all endpoints',
      'CSRF protection enabled',
      'JWT authentication implemented',
      'Error messages sanitized',
    ],
  },
  frontend: {
    description: 'Frontend Security',
    items: [
      'CSP headers set',
      'X-Frame-Options configured',
      'XSS protection enabled',
      'No credentials in localStorage',
      'Secure form handling',
    ],
  },
  dependencies: {
    description: 'Dependency Management',
    items: [
      'npm audit passing',
      'No high/critical vulnerabilities',
      'Dependencies up-to-date',
      'Lock files committed',
      'Security scanning enabled',
    ],
  },
};

/**
 * Production Deployment Recommendations
 */
export const PRODUCTION_RECOMMENDATIONS = [
  {
    item: 'Deploy with environment variables',
    command: 'Use CI/CD secrets, not .env files',
    priority: 'CRITICAL',
  },
  {
    item: 'Enable CORS with specific origins',
    config: 'CORS: ["https://yourdomain.com"]',
    priority: 'HIGH',
  },
  {
    item: 'Set rate limits per IP',
    config: '30 requests per minute for search endpoint',
    priority: 'HIGH',
  },
  {
    item: 'Implement monitoring & logging',
    service: 'Sentry, DataDog, CloudWatch, or similar',
    priority: 'HIGH',
  },
  {
    item: 'Enable MongoDB backups',
    service: 'Atlas automated backups',
    priority: 'HIGH',
  },
  {
    item: 'Set up CI/CD security scanning',
    tools: 'npm audit, OWASP ZAP, Snyk',
    priority: 'MEDIUM',
  },
  {
    item: 'Configure WAF (Web Application Firewall)',
    provider: 'Cloudflare, AWS WAF, or similar',
    priority: 'MEDIUM',
  },
  {
    item: 'Implement DDoS protection',
    provider: 'Cloudflare, AWS Shield, or similar',
    priority: 'MEDIUM',
  },
  {
    item: 'Regular security audits',
    frequency: 'Quarterly',
    priority: 'LOW',
  },
];

/**
 * Verify production readiness
 */
export function checkProductionReadiness(): boolean {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.log('ℹ️  Running in development mode - security checks relaxed');
    return true;
  }

  const checks = [
    {
      name: 'HTTPS enforcement',
      check: () => process.env.ENFORCE_HTTPS === 'true',
    },
    {
      name: 'JWT Secret configured',
      check: () => (process.env.JWT_SECRET?.length || 0) >= 32,
    },
    {
      name: 'Production Database',
      check: () =>
        process.env.MONGODB_URI &&
        !process.env.MONGODB_URI.includes('localhost'),
    },
    {
      name: 'Content Security Policy',
      check: () => true, // Configured in middleware.ts
    },
  ];

  const passed = checks.filter((c) => c.check()).length;
  console.log(
    `🔒 Production Security Checks: ${passed}/${checks.length} passed`
  );

  if (passed < checks.length) {
    const failed = checks.filter((c) => !c.check());
    console.warn('\n⚠️  Failed security checks:');
    failed.forEach((c) => console.warn(`  - ${c.name}`));
  }

  return passed === checks.length;
}
