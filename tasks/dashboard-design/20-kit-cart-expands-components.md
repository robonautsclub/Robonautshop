# Task 20 — Buying a kit expands cart from stock components

- [ ] Implemented

## Goal

When someone adds a kit to the cart, the cart must contain the **kit’s stock
component products** (with quantities), not a mysterious standalone “fake”
product that is unrelated to inventory.

Rules:

1. Kit SKUs are bundles of existing products.
2. Add-to-cart for a kit expands into component cart lines (product + qty),
   derived from the kit BOM (and any custom quantities from task 19).
3. Images, names, and unit prices in the cart come from those stock products.
4. Booking / available-stock checks (when present) apply **per component**.
5. Do **not** invent new catalog products at add-to-cart time.

Optional UX (document choice in the report):

- Show a parent “Kit: Line Follower” summary with expandable child lines, **or**
- Flatten to component lines only with a note “From kit: …”

Either way, inventory math must be component-based.

## In scope

- This task only
- Cart service / add-kit path uses `getKitRequirementLines` (or equivalent)
  against mock catalog
- Cart page shows expanded components clearly
- Demo-only if persistence is still localStorage
- Reuse cart helpers; one authoritative expand function (no duplicated expand
  logic in five places)

## Out of scope

- Any later task in this folder
- Real D1 order creation
- Admin BOM editor (task 18) except consuming its data shape if already present

## Steps

1. Inspect cart store, kit detail CTAs, and requirement-line helpers.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/dashboard-design/README.md`
   and `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Adding a kit puts stock component products into the cart with correct qtys
- No new products are created for kit components at purchase time
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task
