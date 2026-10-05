# Task 102 — Customer orders, addresses, repay & emails

- [x] Implemented

## Goal

Make the customer account useful after checkout: show real order history
(including failed bKash attempts with a **Pay again with bKash** action),
persist delivery addresses to D1 and reuse them at checkout, upsert the
shipping address used on a successful (or failed repayable) order into the
user’s address book, and send transactional emails (welcome on register +
order/invoice confirmation on paid/COD place).

## Prerequisites

- Task 101 (bKash Checkout URL) complete
- Better Auth sessions + customer login
- `RESEND_API_KEY` (or document the chosen mail provider) in `.env.example`

## Locked rules

- Never trust client-provided prices, stock, or payment success
- Order status and payment status stay separate columns
- **Failed / cancelled bKash:** the customer must be able to see the attempt in
  `/account/orders` and repay via bKash. That means a failed attempt is stored
  as an order (or equivalent user-scoped record with line items) with
  `paymentStatus` `FAILED` / `CANCELLED` — **not** as a confirmed paid order.
  Successful bKash still only reaches `paymentStatus: PAID` after Execute
  Payment. Adjust the task-101 “discard pending with no order row” behaviour
  only as needed to support visibility + repay; do not invent fake paid orders.
- COD: order is created as today (`PENDING` / `PENDING`); send confirmation email
- Guests still cannot place orders
- Secrets stay in env vars; never hard-code API keys
- Addresses are server-owned for the signed-in user (D1), not browser-session-only

## In scope

- This task only
- **`/account/orders`** (and order detail if useful): list the signed-in user’s
  orders with items, totals, order status, payment status, payment method
- Wire account home “Orders” card to the real orders page (remove “later phase”)
- Show profile info from the real session (drop “browser session only” copy)
- **Failed bKash + repay:** persist failed/cancelled attempts so they appear
  in order history; “Pay again with bKash” re-runs Create Payment for that
  unpaid order (re-validate prices/stock server-side), redirects to `bkashURL`,
  then Execute → mark `PAID` on success
- **Addresses in D1:** schema + CRUD replacing the session-only `AddressesPanel`
- On order place / successful bKash finalize (and when creating a failed
  repayable order from a shipping snapshot): **upsert** that shipping address
  into the user’s saved addresses (default / most-recent as appropriate)
- Checkout: **“Use previous address”** (or address picker) that fills
  name, phone, lines, city, postal from a saved address
- **Emails** (Resend or existing `RESEND_API_KEY`):
  - Welcome / registration confirmation when a customer signs up
  - Order confirmation + simple invoice summary when an order is placed
    (COD immediately; bKash when payment becomes `PAID`)
- Document any new env vars in `.env.example`

## Out of scope

- Nagad / SSLCOMMERZ
- Admin order management redesign
- Full PDF invoice attachment (HTML/text email body with line items is enough)
- Password-reset email redesign beyond what Better Auth already does
- Multi-currency / international addresses beyond the existing BD fields

## Steps

1. Inspect account shells, checkout, order queries, bKash pending/callback flow,
   and address UI.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Signed-in customers see their real orders (including line items) under
  `/account/orders`
- Failed bKash payments appear and can be repaid with bKash
- Saved addresses persist in D1; checkout can autofill from a previous address
- Placing/finalizing an order updates the user’s saved address from shipping
- Registration and paid/COD order confirmation emails send when the provider
  is configured
- Lint and typecheck pass
