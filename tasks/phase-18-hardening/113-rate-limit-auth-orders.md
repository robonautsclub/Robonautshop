# Task 113 — Rate limit login, register, orders, reviews and coupons

- [x] Implemented

## Goal

Rate limiting only covers the contact form. Apply the existing limiter to other abuse-prone actions.

## Prerequisites

- None

## Locked rules

- Reuse `checkRateLimit` in `lib/rate-limit/memory.ts`. No new dependency
- Document in the code that it is in-memory per Worker isolate, so it's best-effort only
- Return a friendly "Too many attempts, try again shortly" message

## In scope

- Key by user ID when signed in, otherwise by IP (`cf-connecting-ip`)
- Customer and admin sign-in and register (check what Better Auth already rate-limits first, and don't double up)
- `placeOrderAction`, review submit and coupon check actions

## Out of scope

- A durable (D1, KV or Durable Object) limiter
- Turnstile or CAPTCHA

## Files likely touched

- lib/rate-limit/memory.ts
- lib/server-cart/actions.ts
- lib/reviews/actions.ts
- lib/coupons/actions.ts
- lib/auth/server.ts

## Acceptance and validation

- Repeated rapid calls are rejected after the limit, then allowed again after the window
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
