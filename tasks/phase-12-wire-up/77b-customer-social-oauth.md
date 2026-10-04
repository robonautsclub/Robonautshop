# Task 77b — Customer Google + Microsoft OAuth

- [ ] Implemented

## Goal

Enable Google and Microsoft social sign-in for **customers only**, using
Better Auth social providers. Admin accounts must never rely on these
providers.

## Prerequisites

- Task 77a complete

## Locked rules

- Social login is for customers (`CUSTOMER` role)
- Admins authenticate with email/password only (enforced in later tasks;
  do not add OAuth UI or flows for admin in this task)
- New social users default to `role: CUSTOMER`

## In scope

- This task only
- Configure `socialProviders.google` and `socialProviders.microsoft`
- Add to `.env.example` (placeholders only):
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (if not already present)
  - `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`
- Document callback URLs for local/prod:
  - `/api/auth/callback/google`
  - `/api/auth/callback/microsoft`
- Ensure provider wiring does not grant `ADMIN` on first social sign-in

## Out of scope

- Login page UI buttons (77d)
- Replacing mock client session (77c)
- Admin login page
- Route protection

## Steps

1. Inspect Better Auth Google/Microsoft docs and current auth server config.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Google and Microsoft are configured on the auth server for customer use
- `.env.example` lists the required placeholders
- Lint and typecheck pass
- The report lists completed work, files changed, and next task **77c**
