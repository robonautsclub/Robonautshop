import { headers } from "next/headers";

import { checkRateLimit } from "@/lib/rate-limit/memory";

export const TOO_MANY_ATTEMPTS = "Too many attempts. Please wait a moment and try again.";

/**
 * Best-effort per-client throttle for Server Actions
 * (tasks/phase-18-hardening/113). Keys by signed-in user when known,
 * otherwise by Cloudflare's client IP header. Uses the in-memory limiter,
 * so it is per Worker isolate only — see lib/rate-limit/memory.ts.
 *
 * Returns a user-safe error message when the caller is over the limit,
 * otherwise null.
 */
export async function limitAction(
  action: string,
  rule: { limit: number; windowMs: number },
  userId?: string | null,
): Promise<string | null> {
  const requestHeaders = await headers();
  const client = userId
    ? `user:${userId}`
    : `ip:${requestHeaders.get("cf-connecting-ip") ?? requestHeaders.get("x-forwarded-for") ?? "unknown"}`;
  const result = checkRateLimit(`${action}:${client}`, rule);
  return result.allowed ? null : TOO_MANY_ATTEMPTS;
}
