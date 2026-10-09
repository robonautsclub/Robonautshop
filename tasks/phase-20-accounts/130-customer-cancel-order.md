# Task 130 — Customer cancels an order before it ships

- [ ] Implemented

## Goal

Customers can cancel their own order while it is not yet packed or shipped.

## Prerequisites

- Tasks 105, 109

## Locked rules

- Only the order owner can cancel, checked server-side
- Only allowed in early statuses (e.g. PENDING, PAYMENT_PENDING, PAID before PACKED)
- Reuse the existing cancel + stock release logic; do not duplicate it
- A paid bKash order is marked for a manual refund; no automatic gateway refund

## In scope

- Cancel button with a confirm dialog on `/account/orders/[id]`
- Server action reusing `lib/orders` cancel logic
- Cancellation email (reuse `lib/email`)

## Out of scope

- Payments other than bKash, and courier/delivery integrations (out of scope for now)
- Automatic refunds

## Files likely touched

- app/(store)/account/orders/[id]/page.tsx
- lib/orders/
- lib/admin/order-actions.ts

## Acceptance and validation

- Cancelling releases reserved stock
- A shipped order cannot be cancelled
- Add Vitest tests for the business rule; `pnpm test` passes
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
