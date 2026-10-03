# Task 16 — Inventory booking UI (stock vs booked vs available)

- [x] Implemented

## Goal

Make inventory and order UIs reflect **booking / reservation** rules so stock is
not shown as free when it is already committed to an order.

## Business rules (encode in UI + mock helpers; not real DB yet)

Conceptual fields:

```text
stockQuantity      = physical units on hand
bookedQuantity     = reserved for open orders (not yet fully delivered)
availableQuantity  = stockQuantity - bookedQuantity
```

Rules to surface:

1. When a customer places an order, units become **booked** (reserved) — available
   drops by that quantity. Do **not** treat booked units as sellable.
2. Storefront “in stock / out of stock” should follow **available**, not raw stock.
   Example: stock 20, booked 3 → available 17. Example: stock 3, booked 3 →
   available 0 → next buyer sees out of stock.
3. Dashboard inventory must show **Stock**, **Booked**, and **Available** clearly.
4. **Cash on Delivery / unpaid**: still **book** the units (so others cannot buy
   them), but do not present them as permanently sold inventory until the
   fulfillment policy marks them consumed/delivered. Label them as booked, not
   “gone forever.”
5. While status is in progress / packing / shipped / out for delivery, booked
   units remain reserved (available stays reduced).

This task is a **UI + mock-data shell** that demonstrates the model. Real
reservation logic belongs with later order/inventory backend work.

## In scope

- This task only
- Update admin inventory columns / badges for Booked + Available
- Update mock helpers or fixture display so booked is visible
- Short explanatory note on the inventory page stating the rules above
- Align wording with existing `reservedQuantity` if that field is reused
  (prefer one clear label: Booked)

## Out of scope

- Any later task in this folder
- Real checkout reservation against D1
- Payment provider webhooks
- Cancelled-order restock flow (task 17)

## Steps

1. Inspect the current project and this task's dependencies.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/dashboard-design/README.md`
   and `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Admin inventory clearly shows stock / booked / available
- Rule explanation is visible to operators
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task
