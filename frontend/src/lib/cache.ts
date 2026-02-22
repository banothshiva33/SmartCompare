// Lightweight server-side cache with TTL. Uses in-memory Map and is safe
// for single-instance deployments. If REDIS_URL is present you can swap
// this for a Redis-backed cache.

type CacheEntry = { val: any; exp: number };

const store = new Map<string, CacheEntry>();

let redisClient: any = null;
let redisInitializing = false;

async function initRedis() {
  if (redisClient) return redisClient;
  if (redisInitializing) return null;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    redisInitializing = true;
    const { createClient } = await import('redis');
    const client = createClient({ url });
    client.on && client.on('error', () => {});
    await client.connect();
    redisClient = client;
    return redisClient;
  } catch (e) {
    // Redis not available; fall back to in-memory store
    redisClient = null;
    return null;
  } finally {
    redisInitializing = false;
  }
}

export async function getCache(key: string) {
  const rc = await initRedis();
  if (rc) {
    try {
      const v = await rc.get(key);
      if (!v) return null;
      return JSON.parse(v);
    } catch (e) {
      return null;
    }
  }

  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.exp) {
    store.delete(key);
    return null;
  }
  return e.val;
}

export async function setCache(key: string, value: any, ttlSeconds = 60) {
  const rc = await initRedis();
  if (rc) {
    try {
      await rc.set(key, JSON.stringify(value), { EX: Math.max(1, ttlSeconds) });
      return;
    } catch (e) {
      // fall through to memory
    }
  }

  const exp = Date.now() + Math.max(1, ttlSeconds) * 1000;
  store.set(key, { val: value, exp });
}

export async function withCache<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const cached = await getCache(key);
  if (cached !== null) return cached as T;
  const res = await fn();
  try {
    await setCache(key, res, ttlSeconds);
  } catch (e) {
    // ignore cache set errors
  }
  return res;
}

export async function clearCache(key?: string) {
  const rc = await initRedis();
  if (rc) {
    try {
      if (key) await rc.del(key);
      else await rc.flushDb();
      return;
    } catch (e) {
      // fall back
    }
  }

  if (key) store.delete(key);
  else store.clear();
}

export default { getCache, setCache, withCache, clearCache };
