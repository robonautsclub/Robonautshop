# Task 11 — Domain types

- [ ] Implemented

## Goal

Add shared TypeScript types for the storefront catalog: Category, Product, ProductVariant, ProductImage, InventorySummary, Kit, KitComponent, RobotProject, ProjectComponent. Types must match the future database shape so mock data can later be replaced by D1 without rewriting UI.

## In scope

- This task only
- Reuse existing types, mock data helpers, and UI components
- Keep components small and reusable; do not duplicate code
- Put types under something like `lib/catalog/types.ts` (or equivalent)
- Use strict TypeScript; avoid `any`
- Include slug-friendly string fields and BDT-friendly price fields (integer minor units or number — pick one and document it)

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

- No UI and no faker yet
- Do not invent a second parallel type system later for the database
