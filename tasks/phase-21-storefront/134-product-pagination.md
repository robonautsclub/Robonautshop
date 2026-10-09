# Task 134 — Product listing pagination

- [ ] Implemented

## Goal

`/products` and category pages load every product. Add server-side pagination.

## Prerequisites

- Tasks 16, 20, 21

## Locked rules

- Use LIMIT/OFFSET (or cursor) in the D1 query
- Page number lives in the URL and works with search, filters and sort
- Canonical URL handles `?page=`

## In scope

- Pagination in `lib/catalog/queries.ts`
- Reusable pagination component (reuse admin pagination styles if suitable)
- Total count for "Showing X–Y of Z"

## Out of scope

- Infinite scroll

## Files likely touched

- lib/catalog/queries.ts
- app/(store)/products/page.tsx
- app/(store)/categories/[slug]/page.tsx

## Acceptance and validation

- Page 2 shows the next products; filters keep working
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
