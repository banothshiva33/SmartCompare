// Simple in-flight request deduplication helper
const inFlight = new Map<string, Promise<any>>();

export function withInFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (inFlight.has(key)) {
    return inFlight.get(key) as Promise<T>;
  }

  const p = (async () => {
    try {
      return await fn();
    } finally {
      // ensure removal so subsequent calls can re-run
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, p as Promise<any>);
  return p;
}

export function clearInFlight(key?: string) {
  if (key) inFlight.delete(key);
  else inFlight.clear();
}

export default withInFlight;
