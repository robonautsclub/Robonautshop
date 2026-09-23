# Task 05 — Navbar

## Goal

Add a responsive store navbar.

## In scope

- `components/layout/navbar.tsx`
- Mount it in `app/(store)/layout.tsx`
- Brand text: Robonautshop, linking to `/`
- Links: Products `/products`, Categories `/categories`, Kits `/kits`, Projects `/projects`
- Cart `/cart` and Account `/account` as icon links using Lucide
- Desktop links, and a hamburger plus shadcn Sheet on small screens
- Use the existing `button` component

## Out of scope

- Footer, page content, cart count, search, auth state, or dropdown menus
- Fake badges, prices, or cart items

## Steps

1. Inspect the store layout and shadcn components already installed.
2. Add only the navbar. Routes may 404 until task 07; that is expected.
3. Run `npm run lint` and `npm run typecheck`.
4. Stop. Do not start task 06.

## Done when

- Navbar is visible on store pages
- All links point at the real paths above
- Cart does not show a count
- Lint and typecheck pass
