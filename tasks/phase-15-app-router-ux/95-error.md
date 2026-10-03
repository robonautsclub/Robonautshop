# Task 95 — Segment error pages

- [ ] Implemented

## Goal

Add App Router segment `error.tsx` boundaries for the storefront and admin so unexpected render errors show a safe recovery UI with a retry action instead of a blank failure.

## In scope

- This task only
- `app/(store)/error.tsx` — client component accepting `error` and `reset`
- `app/admin/error.tsx` — client component accepting `error` and `reset`
- Safe user-facing copy (e.g. “Something went wrong. Please try again.”)
- Visible “Try again” control that calls `reset`
- Optional secondary link back to a sensible home (`/` for store, `/admin` for admin)
- Reuse the shared status-page pattern from task 94 where practical
- Do not expose stack traces, secrets, or raw exception messages to users

## Out of scope

- `global-error.tsx` (task 96)
- Loading UI, not-found, forbidden, unauthorized, sitemap
- Logging infrastructure or error reporting services
- Intentionally throwing errors in production pages to demo the UI
- Cloudflare, D1, auth, or backend work

## Steps

1. Inspect task 94 shared status UI, `(store)` layout, and admin layout.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Store and admin each have a valid client `error.tsx` with `reset`
- Messages are safe for end users
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task (96)
