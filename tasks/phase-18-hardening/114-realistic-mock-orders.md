# Task 114 — Realistic mock admin orders

- [x] Implemented

## Goal

Keep `lib/admin/mock-orders.ts` as mock data, but make it believable and consistent with the catalog.

## Prerequisites

- None

## Locked rules

- Still clearly labelled as development fixture data (AGENTS.md §49)
- Payment method is bKash only
- No real people's personal data

## In scope

- Line items use real product names and prices from the mock catalog (`lib/catalog/mock-data.ts`). No made-up products
- `lineTotal`, `subtotal` and `total` add up. Delivery charge follows the store's shipping rule
- Realistic BD cities and areas (Dhaka, Chattogram, Sylhet, Rajshahi, Khulna and others), dates spread over recent weeks
- Sensible status pairs (e.g. SHIPPED with PAID, FAILED payment with CANCELLED)
- Around 25–40 orders so pagination and filters work

## Out of scope

- Replacing mocks with D1 queries

## Files likely touched

- lib/admin/mock-orders.ts

## Acceptance and validation

- All totals add up (a quick check or test)
- Admin orders list and detail render correctly
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
