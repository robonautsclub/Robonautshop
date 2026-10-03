# Task 96 — Root global-error page

- [x] Implemented

## Goal

Add `app/global-error.tsx` to handle failures at the root layout level. Because it replaces the root layout when active, it must render its own `<html>` and `<body>` and still feel like Robonautshop.

## In scope

- This task only
- `app/global-error.tsx` as a client component with `error` and `reset`
- Must include `<html lang="en">` and `<body>` (Next.js requirement for global-error)
- Minimal branded recovery UI: clear title, safe message, “Try again” calling `reset`
- Apply existing global styles if practical (e.g. import `./globals.css`) so fonts/colors are not completely unstyled
- Do not leak secrets or raw stack traces to the user

## Out of scope

- Segment `error.tsx` changes (task 95)
- Loading, not-found, forbidden, unauthorized, sitemap
- Error monitoring / Sentry / analytics
- Cloudflare or backend work

## Steps

1. Inspect `app/layout.tsx`, `app/globals.css`, and task 95 error patterns.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- `app/global-error.tsx` exists with its own html/body and a working `reset` control
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task (97)
