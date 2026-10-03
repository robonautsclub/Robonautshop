# Task 28 — Cart state and page

- [ ] Implemented

## Goal

Add client cart state (React context or equivalent) and a real `/cart` page that lists line items. Prices and product names must be resolved from the mock catalog by product/variant id — never trust free-typed client prices as source of truth.

## In scope

- This task only
- Reuse existing types, mock data helpers, and UI components
- Keep components small and reusable; do not duplicate code
- Cart empty state
- Navbar cart affordance can show count if easy; polish later OK

## Out of scope

- Any later task in the sequence
- Cloudflare Workers, D1, Drizzle, R2, or real APIs
- Real payments, real order persistence, or production secrets
- Hard-coded API keys or credentials

## Steps

1. Inspect the current project and this task's dependencies.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- The goal above is true in the running app
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task
