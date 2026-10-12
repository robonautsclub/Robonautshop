# Task 148 — Admin two-factor authentication

- [ ] Implemented

## Goal

Require TOTP two-factor auth for admin and staff accounts.

## Prerequisites

- Task 79b

## Locked rules

- Use the Better Auth two-factor plugin
- Backup codes shown once
- Customers unaffected

## In scope

- Enrollment page for admins
- 2FA step on `/login`
- Enforce for admin routes

## Out of scope

- SMS OTP

## Files likely touched

- lib/auth/server.ts
- app/login/
- app/admin/

## Acceptance and validation

- Admin without 2FA is sent to enroll; login asks for a code
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
