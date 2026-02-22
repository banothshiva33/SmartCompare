/**
 * Security Utilities Module
 * Provides CSRF token generation, secure headers, and general security functions
 */

/**
 * Generate CSRF token for form submissions
 * Should be stored in session and validated on backend
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    globalThis.crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Store CSRF token in session (localStorage for SPA, or cookie for SSR)
 */
export function storeCSRFToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf-token', token);
  }
}

/**
 * Retrieve CSRF token for request
 */
export function getCSRFToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('csrf-token');
  }
  return null;
}

/**
 * Prepare secure fetch headers with CSRF protection
 */
export function getSecureHeaders(additionalHeaders: Record<string, string> = {}) {
  const csrfToken = getCSRFToken();

  return {
    'Content-Type': 'application/json',
    // Only add CSRF header if token exists
    ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
    ...additionalHeaders,
  };
}

/**
 * Log security events for monitoring
 * In production, send to security monitoring service
 */
export function logSecurityEvent(
  eventType: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
): void {
  const event = {
    timestamp: new Date().toISOString(),
    eventType,
    severity,
    details,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Security Event]', event);
  }

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to security monitoring service
    // Example: sendToSecurityMonitoring(event);
  }
}

/**
 * Check if running in secure context (HTTPS or localhost)
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return true;

  return (
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

/**
 * Prevent clickjacking by checking if framed
 */
export function checkIfFramed(): boolean {
  if (typeof window === 'undefined') return false;
  return window.self !== window.top;
}

/**
 * Validate redirect URL to prevent open redirect vulnerabilities
 */
export function isValidRedirectUrl(url: string, allowedHosts: string[] = []): boolean {
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

    // Allow relative URLs
    if (url.startsWith('/')) {
      return true;
    }

    // Check if host is allowed
    if (allowedHosts.includes(parsed.hostname)) {
      return true;
    }

    // Check if same origin
    if (typeof window !== 'undefined') {
      return parsed.origin === window.location.origin;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Rate limit check for client-side operations
 * Use with server-side rate limiting for defense in depth
 */
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxAttempts: number;

  constructor(windowMs: number = 60000, maxAttempts: number = 30) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key?: string): void {
    if (key) {
      this.attempts.delete(key);
    } else {
      this.attempts.clear();
    }
  }
}

/**
 * Secure storage for sensitive data (with encryption warning)
 * DO NOT store passwords or tokens - use HttpOnly cookies instead
 */
export class SecureStorage {
  /**
   * Store data with warning about limitations
   */
  static setSecure(key: string, value: string, expiryMinutes: number = 60): void {
    if (!isSecureContext()) {
      console.warn('⚠️ Not in secure context - data may be vulnerable');
      logSecurityEvent('insecure_storage_attempt', { key }, 'medium');
    }

    const data = {
      value,
      timestamp: Date.now(),
      expiry: Date.now() + expiryMinutes * 60 * 1000,
    };

    sessionStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Retrieve secure data with expiry check
   */
  static getSecure(key: string): string | null {
    const item = sessionStorage.getItem(key);
    if (!item) return null;

    try {
      const data = JSON.parse(item);

      if (data.expiry && Date.now() > data.expiry) {
        sessionStorage.removeItem(key);
        return null;
      }

      return data.value;
    } catch {
      return null;
    }
  }

  /**
   * Remove secure data
   */
  static clearSecure(key: string): void {
    sessionStorage.removeItem(key);
  }
}
