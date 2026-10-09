# Task 145 — Return and warranty requests

- [ ] Implemented

## Goal

Customers request a return or warranty claim for a delivered order item; admins review it.

## Prerequisites

- Task 110

## Locked rules

- Only for delivered orders within a configurable window
- Admin decision recorded with status and note
- Refunds are handled manually outside the app for now

## In scope

- `return_requests` table + migration
- Request form on the order detail page (reason, note)
- Admin list with approve/reject; restock on approval uses stock movements (task 122)

## Out of scope

- Payments other than bKash, and courier/delivery integrations (out of scope for now)
- Automatic refunds
- Return shipping

## Files likely touched

- lib/db/schema/
- migrations/
- app/(store)/account/orders/[id]/
- app/admin/

## Acceptance and validation

- Customer submits a request; admin approves and stock is restored
- Add Vitest tests for the business rule; `pnpm test` passes
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
