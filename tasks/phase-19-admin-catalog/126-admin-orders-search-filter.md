# Task 126 — Admin orders search and filter

- [ ] Implemented

## Goal

Admins need to find orders by order ID, customer name, phone or email, and filter by status and date.

## Prerequisites

- Task 108

## Locked rules

- Filtering happens in the database query, not in the browser over all rows
- Order status and payment status stay separate filters
- Filters live in the URL search params

## In scope

- Search box + order status, payment status and date range filters
- Keep existing pagination working with filters

## Out of scope

- Bulk status updates
- Assigning orders to staff

## Files likely touched

- components/admin/admin-orders-shell.tsx
- app/admin/orders/page.tsx
- lib/orders/

## Acceptance and validation

- Searching a phone number finds that customer's orders
- Filters survive a page reload
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
