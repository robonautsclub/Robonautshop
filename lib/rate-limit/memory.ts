/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * Caveat specific to this app's deployment (Cloudflare Workers via
 * OpenNext): this Map lives in one Worker isolate, which is not shared
 * across Cloudflare's edge locations and can be recycled at any time — so
 * this only throttles a single sustained client hitting the same isolate,
 * not a real distributed limit. It's a cheap first layer, not the real
 * control. For an actual per-IP limit on Cloudflare, use a Cloudflare
 * Rate Limiting rule (dashboard/WAF) in front of the route, or back this
 * with Workers KV / a Durable Object if you need it enforced in code.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: boolean; remaining: number; resetAt: number };

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}
