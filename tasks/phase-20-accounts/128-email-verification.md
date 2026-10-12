# Task 128 — Email verification

- [ ] Implemented

## Goal

Verify customer email addresses after email/password signup.

## Prerequisites

- Task 127

## Locked rules

- Social logins count as verified
- Decide and document whether unverified users can place orders (default: block checkout with a clear message)

## In scope

- Send verification email on signup
- Verify landing page
- Resend link on the account page (rate limited)

## Out of scope

- Phone verification

## Files likely touched

- lib/auth/server.ts
- components/account/account-page-content.tsx
- app/(store)/checkout/page.tsx

## Acceptance and validation

- New signup gets an email; clicking it marks the user verified
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
