/**
 * Next.js Middleware for Security Headers and Request Validation
 * Runs on every request before it reaches API routes
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Create response with security headers
  const response = NextResponse.next();

  // ========== Security Headers (OWASP Recommendations) ==========

  // Content Security Policy - Prevent XSS, clickjacking, data exfiltration
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net; " + // unsafe-eval for Next.js, can be restricted further
    "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data: cdn.jsdelivr.net; " +
    "connect-src 'self' https: api.emailjs.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );

  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME-type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS Protection in older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Enforce HTTPS in production (requires HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Disable feature policies that aren't needed
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  // ========== Request Validation ==========

  // Rate limit check using custom header (will be enhanced with Redis)
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  response.headers.set('X-Request-ID', `${Date.now()}-${Math.random()}`);

  // Validate sensitive endpoints
  const pathname = request.nextUrl.pathname;

  // Ensure API requests have proper Content-Type
  if (pathname.startsWith('/api/') && request.method !== 'GET') {
    const contentType = request.headers.get('content-type');

    if (!contentType?.includes('application/json') && !contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid Content-Type header' },
        { status: 400, headers: response.headers }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
