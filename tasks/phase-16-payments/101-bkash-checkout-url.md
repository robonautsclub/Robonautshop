# Task 101 — bKash Checkout URL

- [x] Implemented

## Goal

Wire real **bKash Checkout (URL)** (`mode: "0011"`) for the existing `BKASH`
payment method: cache the grant token in D1, create payment → redirect to
`bkashURL`, and **only insert an order after Execute Payment succeeds**. Failed
or cancelled payments must not leave PENDING orders in the database.

## Prerequisites

- Phase 12 orders/cart (task 78)
- Env vars set (see `.env.example`):
  - `BKASH_CHECKOUT_URL_BASE`
  - `BKASH_CHECKOUT_URL_APP_KEY`
  - `BKASH_CHECKOUT_URL_APP_SECRET`
  - `BKASH_CHECKOUT_URL_USER_NAME`
  - `BKASH_CHECKOUT_URL_PASSWORD`
  - `NEXT_PUBLIC_SITE_URL` (callback base)

## Locked rules

- Never trust client-provided prices or payment success
- Order status and payment status stay separate columns
- Grant/refresh token lifetime is ~3600s — persist in D1 and reuse until near expiry
- COD unchanged; Nagad / SSLCOMMERZ out of scope

## In scope

- This task only
- `bkash_tokens` table + order `bkashPaymentId` / `bkashTransactionId`
- Token cache helper + create/execute payment client
- Checkout redirect when `BKASH` is selected
- Callback route that executes payment and updates the order

## Out of scope

- Nagad / SSLCOMMERZ
- Refunds / agreement (tokenized checklist) flows
- Admin payment management UI

## Steps

1. Inspect checkout, order creation, and env placeholders.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Selecting bKash at checkout stages checkout details (not an order), redirects
  to bKash, and only inserts a `PAID` order after Execute Payment succeeds
- Cancelled/failed payments leave no order row; the cart stays intact
- Tokens are read from D1 when still valid
- Lint and typecheck pass
