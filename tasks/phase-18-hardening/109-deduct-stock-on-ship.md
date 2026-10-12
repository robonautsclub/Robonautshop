# Task 109 — Turn reserved stock into a stock decrease on ship; release on cancel

- [x] Implemented

## Goal

Reserved stock is never consumed. When an order ships, reduce `stockQuantity` and `reservedQuantity` together. When an admin cancels, release the reservation.

## Prerequisites

- Tasks 105 and 108

## Locked rules

- Runs server-side inside the status update
- Must not run twice for the same order

## In scope

- On → SHIPPED: decrement both `stockQuantity` and `reservedQuantity` by the line quantities
- On → CANCELLED (before ship): call `releaseStockForOrderLines`
- Reuse the helpers in `lib/inventory/queries.ts`

## Out of scope

- Restocking returned or refunded items

## Files likely touched

- lib/inventory/queries.ts
- lib/admin/order-actions.ts

## Acceptance and validation

- Shipping an order lowers stock and reserved stock by the right amounts
- Cancelling releases the reservation
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes
- `pnpm test` passes (once task 106 exists)

Stop after this task and report. Do not start the next one.
