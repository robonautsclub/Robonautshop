# Task 116 — Finances calculated from the mock orders

- [x] Implemented

## Goal

Make `lib/admin/finances.ts` calculate its figures from the realistic mock orders and catalog cost prices, so the dashboard numbers agree with the orders page.

## Prerequisites

- Task 114

## Locked rules

- One shared calculation. Don't copy totals logic (AGENTS.md §34)
- Keep the "mock / not live accounting" label

## In scope

- Revenue counts only PAID orders. Refunded and cancelled orders are excluded
- ~~Cost of goods sold uses catalog `costPrice`. Gross margin is calculated~~ — dropped: the catalog has no cost price column yet (adding one is a schema change outside this task). Finances show revenue, average order value, refunds, unpaid bKash attempts, and a monthly breakdown instead
- Monthly breakdown matches the order dates

## Out of scope

- Real accounting or D1 finance tables

## Files likely touched

- lib/admin/finances.ts
- components/admin/admin-finances-content.tsx (only if the data shape changes)

## Acceptance and validation

- Finance totals match a manual sum of the mock orders
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
