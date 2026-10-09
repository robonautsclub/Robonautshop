# Task 105 — Release reserved stock on failed or cancelled payment

- [x] Implemented

## Goal

Reserved stock is never given back. When a bKash payment ends FAILED or CANCELLED, release its reservation, and reserve again if the customer repays.

## Prerequisites

- Task 104

## Locked rules

- Release must happen server-side only
- Never release twice for the same order (check order state first)
- Order status and payment status stay separate

## In scope

- Add `releaseStockForOrderLines(db, lines)` in `lib/inventory/queries.ts` (decrement `reservedQuantity`, never below 0)
- Call it from `finalizeBkashUnpaidOrder` (`lib/server-cart/order-queries.ts`) when it records FAILED or CANCELLED, if the order had a reservation
- In `repayBkashOrder`, reserve again with the task 104 guard before starting a new bKash payment. Fail cleanly if stock is gone

## Out of scope

- Admin cancel flow (task 109)
- Payment providers other than bKash

## Files likely touched

- lib/inventory/queries.ts
- lib/server-cart/order-queries.ts

## Acceptance and validation

- After a failed bKash payment, available stock returns to its previous value
- Repaying an order reserves again, or fails with an out-of-stock message
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
