# Task 104 — Atomic stock reservation (prevent overselling)

- [x] Implemented

## Goal

`reserveStockForOrderLines` in `lib/inventory/queries.ts` increments `reservedQuantity` without checking that enough stock is free, so two concurrent orders can reserve the same units. Make each reservation conditional so it can never oversell.

## Prerequisites

- Task 78 (server cart and order creation)

## Locked rules

- Server is authoritative for stock (AGENTS.md §15, §26)
- Available = stockQuantity - reservedQuantity
- Never trust stock values from the browser

## In scope

- Put the guard in the UPDATE itself (`... WHERE stock_quantity - reserved_quantity >= qty`) and check rows affected
- If any line can't be reserved, undo the lines already reserved in this call, and return a clear, user-safe error ("Some items are no longer in stock")
- Make `placeOrderFromServerCart` (`lib/server-cart/order-queries.ts`) surface that error instead of creating the order
- Keep low-stock alert behaviour unchanged

## Out of scope

- Releasing reservations (task 105)
- Stock decrement on ship (task 109)

## Files likely touched

- lib/inventory/queries.ts
- lib/server-cart/order-queries.ts

## Acceptance and validation

- Placing an order for more than the available quantity fails with a friendly message and no order row
- Normal orders still reserve stock
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
