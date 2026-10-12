# Task 127 — Forgot and reset password

- [ ] Implemented

## Goal

Customers cannot recover a lost password. Add a reset flow using Better Auth and the existing email sender.

## Prerequisites

- Tasks 77a, 91

## Locked rules

- Do not reveal whether an email is registered
- Reset tokens expire and are single-use (Better Auth)
- Rate limit the request endpoint (reuse `lib/rate-limit`)

## In scope

- `/user/forgot-password` and `/user/reset-password` pages
- Wire `sendResetPassword` in `lib/auth/server.ts` to `lib/email`
- "Forgot password?" link on the customer login form

## Out of scope

- Admin password reset UI (admins use the bootstrap flow)
- Phone OTP

## Files likely touched

- lib/auth/server.ts
- lib/email/
- components/auth/
- app/(store)/user/

## Acceptance and validation

- Reset email arrives and the new password works
- Unknown email shows the same success message
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
