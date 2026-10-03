# Task 17 — Cancelled order releases booked stock (UI shell)

- [ ] Implemented

## Goal

When an order is **cancelled**, booked units return to sellable availability.

Example: stock 20, booked 3 → available 17. Cancel the order that booked 3 →
booked 0, available 20 again (in the mock/UI shell).

## In scope

- This task only
- Orders list/detail: allow setting status to **CANCELLED** in a demo-only
  control (dialog or select) that updates **local UI state** for booked stock
  display
- Show a clear message: “Demo only — cancelled order releases booked units back
  to available”
- Tie into the booking model from task 16 (reuse helpers; do not duplicate
  formulas)
- Keep order status and payment status separate

## Out of scope

- Any later task in this folder
- Real inventory mutations / D1 transactions
- Partial line cancellations (whole-order cancel is enough for this shell)
- Refunds / payment provider logic

## Steps

1. Inspect the current project and this task's dependencies.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/dashboard-design/README.md`
   and `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Cancelling a demo order visibly releases booked quantity in the UI model
- Operators can understand stock returned on cancel
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task
