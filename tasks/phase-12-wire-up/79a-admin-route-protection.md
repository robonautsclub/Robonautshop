# Task 79a — Admin route protection (`/admin`)

- [ ] Implemented

## Goal

Enforce `ADMIN` role server-side on `/admin` and admin APIs. Only credential
(email/password) admin sessions may access the dashboard. Frontend hiding is
not enough.

## Prerequisites

- Tasks 77a–77d complete (`/login` is the admin login page)

## Locked rules

- Admin login page: **`/login`** (email/password only)
- Customer login page: **`/user/login`** (do not send admins’ storefront traffic
  there for admin access)
- Unauthenticated visit to `/admin` → redirect to `/login?callbackUrl=/admin`
- Signed-in `CUSTOMER` → forbidden (reuse existing 403 page)
- **Admins cannot use Google or Microsoft** to access `/admin`
  - Prefer: only sessions established via email/password credential login may
    pass the admin gate
  - Social-only accounts must never become admin through OAuth alone
- Authorization always server-side

## In scope

- This task only
- Protect `app/admin` layout (and any admin API routes/actions that mutate data)
- Shared helper for “require admin” (reuse; do not copy checks into every page)
- Clear separation from customer `/user/login` redirects

## Out of scope

- First admin user bootstrap (79b)
- Building new admin features
- Customer account protection (already 78a)
- Payments

## Steps

1. Inspect `app/admin/layout.tsx`, auth session helpers, and forbidden/unauthorized pages.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- `/admin` is inaccessible without an ADMIN credential session
- Customers and signed-out users are blocked appropriately
- Google/Microsoft sessions cannot access `/admin`
- Lint and typecheck pass
- The report lists completed work, files changed, and next task **79b**
