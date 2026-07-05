/**
 * A tiny in-memory, per-key sliding-window rate limiter.
 *
 * Fits this app: a single long-running server (Replit), no extra dependency.
 * If the app is ever scaled to multiple instances, swap this for a shared store
 * (e.g. Upstash/Redis) — the call sites stay the same.
 */

const globalForRateLimit = globalThis as unknown as {
  __rateLimitBuckets?: Map<string, number[]>;
};

// Persist across dev hot-reloads so the window isn't reset on every edit.
const buckets =
  globalForRateLimit.__rateLimitBuckets ??
  (globalForRateLimit.__rateLimitBuckets = new Map<string, number[]>());

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the caller may retry (0 when allowed). */
  retryAfterSec: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfterSec = Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup so idle keys don't accumulate forever.
  if (buckets.size > 10_000) {
    for (const [k, ts] of buckets) {
      if (ts.every((t) => t <= cutoff)) buckets.delete(k);
    }
  }

  return { ok: true, retryAfterSec: 0 };
}

/** Best-effort client IP from proxy headers, falling back to a shared bucket. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
