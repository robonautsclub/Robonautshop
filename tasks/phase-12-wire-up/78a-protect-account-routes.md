# Task 78a — Protect customer `/account` routes

- [x] Implemented

## Goal

Require a valid customer session for `/account` and nested account routes.
Unauthenticated users must not see account management UI.

## Prerequisites

- Tasks 77a–77d complete (real sessions + `/user/login`)

## Locked rules

- Guests may browse and use the cart
- Account area requires login via **`/user/login`**
- Frontend hiding alone is not enough — enforce server-side

## In scope

- This task only
- Server-side session check for `/account` and children (e.g. addresses,
  future orders)
- Redirect unauthenticated users to
  `/user/login?callbackUrl=...` (or use the existing unauthorized page pattern
  consistently — pick one approach and reuse it)
- Keep CUSTOMER (and ADMIN if they visit account) able to pass the “signed in”
  check; do not require ADMIN for account routes

## Out of scope

- Checkout / place-order guards (78b)
- Admin `/admin` guards (79a)
- Order history persistence (may still be shell)
- Changing login page designs

## Steps

1. Inspect `app/(store)/account/**` and existing unauthorized/forbidden pages.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Visiting `/account` while signed out redirects or blocks access
- Signed-in users can open account pages
- Lint and typecheck pass
- The report lists completed work, files changed, and next task **78b**
