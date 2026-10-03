# Task 01 — Shared dashboard shell + public width

- [ ] Implemented

## Goal

Replace the admin layout width system so `/admin` uses the same horizontal
padding/width language as the public store (`PageContainer`), and establish a
professional dashboard shell structure (sidebar + main).

## In scope

- This task only
- Update `components/admin/admin-layout-shell.tsx` (and related layout pieces)
- Use `PageContainer` (or equivalent shared width tokens) so admin matches store
  edge padding
- Keep the “UI shell only” note visible but less intrusive
- Reuse existing types, mock data helpers, and UI components
- Keep components small and reusable; do not duplicate code

## Out of scope

- Any later task in this folder
- Real ADMIN auth
- Cloudflare Workers, D1, Drizzle, R2, or real APIs
- Redesigning every admin page content yet
- Hard-coded API keys or credentials

## Steps

1. Inspect the current project and this task's dependencies.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/dashboard-design/README.md`
   and `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Admin pages align visually with store left/right spacing
- Shell structure is ready for sidebar + top bar work
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task
