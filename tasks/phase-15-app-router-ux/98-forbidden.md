# Task 98 — Forbidden (403) page

- [x] Implemented

## Goal

Add `app/forbidden.tsx` so Next.js `forbidden()` (when wired later) shows a branded 403 page. This task is a UI shell only — do not fake authorization or block admin routes yet.

## In scope

- This task only
- `app/forbidden.tsx` matching the shared status-page pattern from task 94
- Clear copy: access denied / you do not have permission
- Helpful CTAs (e.g. Home, Account, or Login as appropriate)
- Accessible markup and mobile-friendly layout
- Brief code comment or task note that calling `forbidden()` belongs to real auth / admin protection (Phase 12), not this task

## Out of scope

- Calling `forbidden()` from middleware, layouts, or pages
- Real ADMIN role checks or route protection
- `unauthorized.tsx` (task 99)
- Changing Better Auth configuration
- Cloudflare, D1, or backend work

## Steps

1. Inspect task 94 status-page UI and existing login/account routes.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- `app/forbidden.tsx` exists and matches the branded status-page pattern
- No fake auth enforcement was added
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task (99)
