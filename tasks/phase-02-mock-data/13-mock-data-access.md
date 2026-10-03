# Task 13 — Mock data access layer

- [x] Implemented

## Goal

Add a small catalog access API over the mock data (list/get helpers) so pages never import faker or raw arrays directly. Examples: `getCategories`, `getCategoryBySlug`, `getProducts`, `getProductBySlug`, `getKits`, `getKitBySlug`, `getProjects`, `getProjectBySlug`, `searchProducts`, `getRelatedProducts`.

## In scope

- This task only
- Reuse existing types, mock data helpers, and UI components
- Keep components small and reusable; do not duplicate code
- Support basic filters: categorySlug, query, sort, featured
- Return typed results; empty arrays or null when not found
- Document that these helpers will later call a real API/DB

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

## Notes

- No React components in this task
