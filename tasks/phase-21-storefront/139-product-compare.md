# Task 139 — Product compare

- [ ] Implemented

## Goal

Let customers compare up to 4 products side by side, using their specifications.

## Prerequisites

- None

## Locked rules

- Selection stored client-side (slugs only); data fetched server-side
- Spec rows built from product specification JSON keys

## In scope

- Compare toggle on product cards/detail
- `/compare` page with a responsive spec table
- Clear empty state

## Out of scope

- Saving comparisons to the account

## Files likely touched

- components/product/
- app/(store)/compare/page.tsx

## Acceptance and validation

- Comparing two motors shows RPM/voltage side by side; works on mobile
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
