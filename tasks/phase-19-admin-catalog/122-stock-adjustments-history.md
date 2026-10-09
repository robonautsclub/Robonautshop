# Task 122 — Stock adjustments with reasons and movement history

- [x] Implemented

## Goal

Admins need to correct stock (received, damaged, recount) with a recorded reason, and see the history.

## Prerequisites

- Task 104 (atomic stock reservation)

## Locked rules

- Every stock change writes a movement row (who, when, delta, reason)
- Adjustments run server-side in one transaction/batch with the inventory update
- Stock can never go below reserved quantity
- Track the schema change with a Drizzle migration

## In scope

- `stock_movements` table + migration
- Adjust stock dialog in admin inventory (reason select + note)
- Movement history list per SKU
- Record the automatic ship deduction as a movement too (reservations and their release never change stock quantity, so they are not stock movements)

## Out of scope

- Purchase orders, suppliers, warehouses
- Stock valuation

## Files likely touched

- lib/db/schema/ (new stock-movements.ts)
- migrations/
- lib/inventory/
- components/admin/admin-inventory-shell.tsx

## Acceptance and validation

- Adjusting stock updates available quantity and adds a history row
- An adjustment that would go below reserved is refused
- Add Vitest tests for the business rule; `pnpm test` passes
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
