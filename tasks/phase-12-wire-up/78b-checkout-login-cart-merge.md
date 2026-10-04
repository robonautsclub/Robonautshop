# Task 78b — Checkout requires login + guest cart merge

- [ ] Implemented

## Goal

Allow guests to add items to the cart, but require customer login before
checkout. When the customer signs in, the guest cart must merge into that
user’s cart so items are not lost or replaced unexpectedly.

## Prerequisites

- Tasks 77a–77d and 78a complete
- Client cart exists (Phase 5); server cart authority may still be incomplete
  until task 78 — implement merge against the current cart ownership model,
  and keep the merge rule reusable for task 78

## Locked rules

- **No guest checkout** — cannot place an order while signed out
- Guests **can** add/update/remove cart lines
- Checkout entry and any place-order API/action require a customer session
- Redirect: `/user/login?callbackUrl=/checkout` (or equivalent)
- After successful **customer** login from that flow, merge guest cart → user cart
- **Admin** login at `/login` must **not** merge the storefront guest cart into
  an admin session

## Merge rules

1. On successful customer sign-in, attach guest cart lines to that user.
2. Same product/variant: **sum quantities** (stock caps can come with real
   inventory later).
3. Clear the guest cart only after a successful merge.
4. Merge must be authoritative on the server (or a trusted server action) —
   do not trust the browser alone for the final cart.
5. After merge, user continues to checkout with the merged lines.

## In scope

- This task only
- Guard `/checkout` (and confirmation/order submit paths that would place an
  order)
- Reject unauthenticated place-order attempts server-side
- Implement guest → user cart merge on customer login
- Reuse one cart merge helper; do not duplicate merge logic in multiple UI files

## Out of scope

- Full server cart schema / paid order pipeline beyond what is needed to enforce
  login + merge (complete in task 78)
- Payment provider integration
- Admin route protection (79a)

## Steps

1. Inspect cart state, checkout pages, and customer login redirect flow.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Signed-out users can use `/cart` but cannot complete checkout / place order
- Login from checkout returns the user with the same (merged) items
- Admin `/login` does not consume the guest storefront cart
- Lint and typecheck pass
- The report lists completed work, files changed, and next task **78**
