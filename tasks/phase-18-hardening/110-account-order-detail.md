# Task 110 — Customer order detail page `/account/orders/[id]`

- [x] Implemented

## Goal

AGENTS.md §21 expects `/account/orders/[id]`. Only the list exists. Add a detail page.

## Prerequisites

- Task 102

## Locked rules

- Server Component by default
- Only the owner can see the order. Others get `notFound()`, not 403, so order IDs aren't revealed

## In scope

- `app/(store)/account/orders/[id]/page.tsx` using `getMyOrderAction`
- Show items, totals, discount, shipping address, order status and payment status
- Reuse the existing bKash repay button for FAILED or CANCELLED payments
- Link each row on `/account/orders` to its detail page
- Loading state

## Out of scope

- Invoice download for customers
- Tracking numbers

## Files likely touched

- app/(store)/account/orders/[id]/page.tsx
- components/account/*

## Acceptance and validation

- The owner sees the full order. Another user gets the not-found page
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
