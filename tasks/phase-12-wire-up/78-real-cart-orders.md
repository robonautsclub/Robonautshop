# Task 78 — Server cart and order creation

- [ ] Implemented

## Goal

Move cart authority server-side for signed-in customers and create real orders
with separate **order status** and **payment status** fields. Orders require an
authenticated customer; prices and stock must be read server-side.

## Prerequisites

- Task 78b (checkout login + cart merge) complete
- Catalog readable from D1 (tasks 75–76) strongly preferred before treating
  orders as production-ready

## Locked rules

- No guest orders
- Cart merge from 78b remains the path from guest browsing → logged-in checkout
- Never trust client-provided prices, discounts, or stock
- Order status and payment status are separate fields (see AGENTS.md)

## In scope

- This task only
- Server-owned cart for the signed-in user (persist lines against `userId`)
- Create order from server cart / validated line items
- Separate order status vs payment status
- Reuse the cart merge helper from 78b; one authoritative pricing/totals path
- Keep components small; business logic out of giant UI files

## Out of scope

- Payment provider capture (bKash, Nagad, SSLCOMMERZ, etc.)
- Admin order management beyond what already exists as UI shells
- Admin route protection (79a)
- Email notifications

## Steps

1. Inspect cart calculations, checkout shells, and database readiness for orders.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Signed-in customers can create a real order server-side
- Guests still cannot place orders
- Order status and payment status are stored separately
- Lint and typecheck pass
- The report lists completed work, files changed, and next task **79a**
