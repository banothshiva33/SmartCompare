/**
 * Input Validation & Sanitization Module
 * Prevents XSS, NoSQL Injection, and other input-based attacks
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Email validation with proper regex pattern
 * Prevents injection and validates format
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid email format',
    };
  }

  if (trimmed.length > 254) {
    return {
      isValid: false,
      error: 'Email too long',
    };
  }

  return {
    isValid: true,
    sanitized: trimmed.toLowerCase(),
  };
}

/**
 * Search query validation
 * Prevents NoSQL injection and empty/oversized inputs
 */
export function validateSearchQuery(query: string): ValidationResult {
  const trimmed = query.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Search query cannot be empty',
    };
  }

  if (trimmed.length > 200) {
    return {
      isValid: false,
      error: 'Search query too long (max 200 characters)',
    };
  }

  // Remove potentially dangerous characters while preserving search intent
  const sanitized = trimmed
    .replace(/[<>[\]{}]/g, '') // Remove brackets and braces
    .replace(/\$\s*where/gi, '') // Remove NoSQL injection patterns
    .replace(/\$\s*regex/gi, '')
    .replace(/\$\s*ne/gi, '')
    .replace(/\$\s*gt/gi, '')
    .replace(/\$\s*lt/gi, '')
    .substring(0, 200);

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Product ID (ASIN) validation
 * Prevents injection through product identifiers
 */
export function validateProductId(productId: string): ValidationResult {
  const trimmed = productId.trim();

  // ASINs are alphanumeric, typically 10 characters
  if (!/^[a-zA-Z0-9]{1,20}$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid product ID format',
    };
  }

  return {
    isValid: true,
    sanitized: trimmed,
  };
}

/**
 * Price validation
 * Ensures numeric format and reasonable bounds
 */
export function validatePrice(price: any): ValidationResult {
  const num = Number(price);

  if (isNaN(num)) {
    return {
      isValid: false,
      error: 'Price must be a number',
    };
  }

  if (num < 0) {
    return {
      isValid: false,
      error: 'Price cannot be negative',
    };
  }

  if (num > 10000000) {
    // 10 million INR max
    return {
      isValid: false,
      error: 'Price exceeds maximum limit',
    };
  }

  return {
    isValid: true,
    sanitized: num.toString(),
  };
}

/**
 * File upload validation
 * Prevents malicious file uploads
 */
export function validateImageFile(file: File): ValidationResult {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, WebP, and GIF images are allowed',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File is empty',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_SIZE / 1024 / 1024}MB limit`,
    };
  }

  return {
    isValid: true,
    sanitized: file.name,
  };
}

/**
 * Sanitize HTML content to prevent XSS
 * Safe for display without dangerouslySetInnerHTML
 */
export function sanitizeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Platform validation
 * Ensures only known platforms are used
 */
export function validatePlatform(platform: string): ValidationResult {
  const ALLOWED_PLATFORMS = ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Other'];
  const trimmed = platform.trim();

  if (!ALLOWED_PLATFORMS.includes(trimmed)) {
    return {
      isValid: false,
      error: `Invalid platform. Allowed: ${ALLOWED_PLATFORMS.join(', ')}`,
    };
  }

  return {
    isValid: true,
    sanitized: trimmed,
  };
}

/**
 * Object key validation for request bodies
 * Prevents prototype pollution attacks
 */
export function validateObjectKeys(
  obj: Record<string, any>,
  allowedKeys: string[]
): ValidationResult {
  const keys = Object.keys(obj);

  const Invalid = keys.find((key) => !allowedKeys.includes(key));

  if (Invalid) {
    return {
      isValid: false,
      error: `Invalid field: ${Invalid}`,
    };
  }

  // Check for prototype pollution attempts
  if (keys.some((key) => ['__proto__', 'constructor', 'prototype'].includes(key))) {
    return {
      isValid: false,
      error: 'Invalid request structure',
    };
  }

  return {
    isValid: true,
  };
}
