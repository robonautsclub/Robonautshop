# Task 99 — Unauthorized (401) page

- [ ] Implemented

## Goal

Add `app/unauthorized.tsx` so Next.js `unauthorized()` (when wired later) shows a branded 401 page with a clear path to sign in. UI shell only — do not fake sessions or gate routes in this task.

## In scope

- This task only
- `app/unauthorized.tsx` matching the shared status-page pattern from task 94
- Clear copy: sign-in required / not authenticated
- Primary CTA to `/login` (and optional secondary to Home)
- Accessible markup and mobile-friendly layout
- Brief note that callers of `unauthorized()` come with real auth wiring (Phase 12)

## Out of scope

- Calling `unauthorized()` from middleware, layouts, or pages
- Real session checks or protected-route redirects
- Changes to registration/login form behavior
- `forbidden.tsx` changes (task 98)
- Cloudflare, D1, or backend work

## Steps

1. Inspect task 94 status-page UI, `/login`, and task 98 for consistency.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- `app/unauthorized.tsx` exists with a clear login path
- No fake auth enforcement was added
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task (100)
