# Task 18 — Admin kit BOM: pick components from stock

- [x] Implemented

## Goal

When creating or editing a kit in admin (e.g. Line Follower Robot), the operator
**does not invent new products inside the kit editor**. Every kit line must be an
existing catalog product.

## Required workflow

```text
1. Need wheels for Line Follower?
   → If wheels are not in Products yet, go to Products and Add the product first
     (with image, price, stock, etc.).

2. Open Kits → create/edit Line Follower kit
   → Search products (by name/SKU)
   → Add the product into the kit BOM box
   → Set quantity (e.g. Wheels × 2)

3. Kit lines always reference Products.
   → Images, names, SKUs come from that product record.
```

**Hard rule:** The kit editor must only **search and attach** existing products.
There is no “create new component” or “add wheels as free text” inside Kits.
If search finds nothing, show an empty state that points the operator to
**Products → New product** first, then come back and search again.

Example BOM after products exist:

```text
Line Follower Kit
├── Wheels × 2          ← product previously added under Products
├── N20 Motors × 2      ← product from catalog
├── Jumper wires × 40   ← product from catalog
├── Arduino Nano × 1
└── …
```

Changing quantity (e.g. 2 wheels → 4 wheels) only changes the kit component
link quantity — it does not create a new SKU.

## In scope

- This task only
- Admin Kits create/edit UI (prefer dialog from tasks 11–12 if present):
  - Product search over mock catalog
  - Add selected product to BOM with quantity
  - Remove line / change quantity
- Empty search state: “No product found. Add it under Products first.”
  with a link to `/admin/products`
- Show selected lines with product name, image thumb (if available), SKU,
  available stock hint, quantity stepper
- Persist selection in **local UI / demo state only** for this shell (or display
  against existing `getKitComponents` mock data) — no D1 writes
- Reuse catalog helpers; do not duplicate product data

## Out of scope

- Any later task in this folder
- Creating products from inside the kit editor
- Real kit_component DB writes
- Storefront cart expansion (task 20)
- Customizable customer quantities (task 19)

## Steps

1. Inspect the current project and this task's dependencies
   (`KitComponent`, `getKitComponents`, admin kits shell, admin products).
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/dashboard-design/README.md`
   and `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Kit BOM only attaches products that already exist in Products
- Search + add from stock works; missing items direct the user to Products first
- No “create new component product” path inside Kits
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task
