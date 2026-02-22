type Bucket = { tokens: number; lastRefill: number };

const buckets = new Map<string, Bucket>();

/**
 * Simple token-bucket rate limiter. Uses in-memory buckets by default.
 * If REDIS_URL is configured you should replace with a Redis-based limiter for distributed rate limits.
 */
export function checkRateLimit(key: string, points = 30, duration = 60) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: points, lastRefill: now };

  // refill tokens
  const elapsed = (now - bucket.lastRefill) / 1000;
  const refill = (elapsed / duration) * points;
  bucket.tokens = Math.min(points, bucket.tokens + refill);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    buckets.set(key, bucket);
    return { allowed: true, remaining: Math.floor(bucket.tokens) };
  }

  buckets.set(key, bucket);
  return { allowed: false, remaining: Math.floor(bucket.tokens) };
}

export function resetRateLimit(key?: string) {
  if (key) buckets.delete(key);
  else buckets.clear();
}

export default { checkRateLimit, resetRateLimit };
