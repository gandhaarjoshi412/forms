// ---------------------------------------------------------------------------
// In-memory rate limiter — sliding window per IP
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Config
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 5;       // max 5 submissions per window per IP
const CLEANUP_INTERVAL = 5 * 60 * 1000; // cleanup stale entries every 5 min

// Periodically purge expired entries to prevent memory leak
if (typeof globalThis !== "undefined") {
  const g = globalThis as unknown as { _rateLimitCleanup?: NodeJS.Timeout };
  if (!g._rateLimitCleanup) {
    g._rateLimitCleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store.entries()) {
        entry.timestamps = entry.timestamps.filter(
          (t) => now - t < WINDOW_MS
        );
        if (entry.timestamps.length === 0) {
          store.delete(key);
        }
      }
    }, CLEANUP_INTERVAL);
  }
}

/**
 * Check if a request from the given IP is within rate limits.
 * Returns `{ allowed: true }` or `{ allowed: false, retryAfterMs }`.
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterMs?: number;
} {
  const now = Date.now();
  const entry = store.get(ip) ?? { timestamps: [] };

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = WINDOW_MS - (now - oldest);
    return { allowed: false, retryAfterMs };
  }

  // Record this request
  entry.timestamps.push(now);
  store.set(ip, entry);

  return { allowed: true };
}
