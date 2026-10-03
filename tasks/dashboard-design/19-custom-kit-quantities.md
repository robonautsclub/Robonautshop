# Task 19 — Custom kit quantities (storefront / builder shell)

- [ ] Implemented

## Goal

Support a **custom kit / custom order** feel for robot builds (e.g. line
follower): the customer (or builder) can adjust quantities for required part
types such as jumpers, motors, and wheels — but every line still maps to a
**real stock product that already exists in Products**, not a free-text part.

If a needed part is missing from the catalog, it must be added under **Admin →
Products** first (see task 18 workflow). This customize UI only changes
quantities on products already linked in the kit BOM.

## In scope

- This task only
- UI shell on kit detail and/or Robot Builder customize flow:
  - Show kit BOM lines from stock products
  - Allow quantity adjustments within sensible bounds (min from kit recipe,
    optional max from available stock)
- Display running total from product prices × quantities
- Availability uses **available** stock (stock − booked) when booking UI exists
- Keep components reusable; reuse requirement-line helpers where possible

## Out of scope

- Any later task in this folder
- Creating new products from the customize UI
- Real checkout reservation against D1
- Admin BOM editor (task 18)

## Steps

1. Inspect kit detail, builder customize, and cart add flows.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/dashboard-design/README.md`
   and `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- User can adjust jumper/motor/wheel (etc.) quantities for a kit/build against
  stock products
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task
