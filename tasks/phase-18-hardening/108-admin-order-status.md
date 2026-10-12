# Task 108 — Admin order status updates (real D1 orders)

- [x] Implemented

## Goal

Nothing can move an order through fulfilment. Add a server action so an admin can update the order status of a real D1 order.

## Prerequisites

- Task 79a (admin route protection)

## Locked rules

- Admin role is checked server-side in the action, not only in the UI
- Validate input with Zod
- Only change `status`. `paymentStatus` stays separate and is never set from this action
- Allowed moves: PAID/PENDING → PROCESSING → PACKED → SHIPPED → DELIVERED, and → CANCELLED before SHIPPED

## In scope

- `updateOrderStatusAction(orderId, nextStatus)` in `lib/admin/` with a single transition table
- Status select on the admin order detail page for real orders (`app/admin/orders/[id]/page.tsx`)
- Update `updatedAt`
- Mock orders stay read-only

## Out of scope

- Stock changes (task 109)
- Refunds and status emails

## Files likely touched

- lib/admin/order-actions.ts (new)
- components/admin/admin-order-detail-shell.tsx
- app/admin/orders/[id]/page.tsx

## Acceptance and validation

- Admin can move a real order forward. Invalid moves are rejected with a clear message
- A non-admin calling the action is rejected
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes
- `pnpm test` passes (once task 106 exists)

Stop after this task and report. Do not start the next one.
