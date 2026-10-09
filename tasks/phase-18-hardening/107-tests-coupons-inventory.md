# Task 107 — Tests for coupons and stock reservation

- [x] Implemented

## Goal

Cover the riskiest business rules: coupon discount calculation, and reserving and releasing stock.

## Prerequisites

- Tasks 104, 105 and 106

## Locked rules

- Test real logic, not mocks of the logic under test
- If D1 is needed, use an in-memory SQLite-compatible setup or extract pure functions. Document the choice

## In scope

- Coupon rules from `lib/coupons/` (min order, expiry, percent and fixed discount, cap at subtotal)
- Reservation succeeds when stock is free, fails when it isn't, and rolls back partial reservations
- Release never takes `reservedQuantity` below 0

## Out of scope

- Refactoring coupon or inventory code beyond what testing needs

## Files likely touched

- lib/coupons/*.test.ts
- lib/inventory/*.test.ts

## Acceptance and validation

- New tests pass and fail when the rule is broken
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes
- `pnpm test` passes (once task 106 exists)

Stop after this task and report. Do not start the next one.
