# Task 07 — Placeholder pages

- [x] Implemented

## Goal

Add empty public routes so navigation does not 404.

## Routes

- `/` — `app/(store)/page.tsx`
- `/products`
- `/categories`
- `/kits`
- `/projects`
- `/cart`
- `/account`

## In scope

- Each page exports metadata and shows a heading plus one sentence that the section is not available yet
- A small shared placeholder component is fine if it avoids copy-paste
- Home can say the storefront is being set up. It must not list fake products

## Out of scope

- Product cards, prices, stock, ratings, add to cart, search, filters, or images of products
- Auth forms, checkout, admin, or database calls

## Steps

1. Inspect existing pages so you do not duplicate routes.
2. Run `pnpm lint` and `pnpm typecheck`.
3. Stop. Do not start task 08 beyond what this task requires. Task 08 owns the README.

## Done when

- All seven routes render
- No fake catalog or working cart
- Lint and typecheck pass
