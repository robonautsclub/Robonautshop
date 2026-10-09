# Task 131 — Customer invoice download

- [ ] Implemented

## Goal

Customers can download an invoice for their own order, reusing the admin invoice generator.

## Prerequisites

- Task 110

## Locked rules

- Owner-only access, checked server-side
- Reuse `lib/invoice`; do not create a second invoice template

## In scope

- Route `/account/orders/[id]/invoice`
- Download link on the order detail page

## Out of scope

- Emailing the invoice

## Files likely touched

- lib/invoice/
- app/(store)/account/orders/[id]/

## Acceptance and validation

- Owner gets the invoice; another user gets 404/403
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
