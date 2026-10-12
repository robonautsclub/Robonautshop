# Task 137 — Recently viewed products

- [ ] Implemented

## Goal

Show the customer's recently viewed products on product pages and the homepage.

## Prerequisites

- None

## Locked rules

- Store only slugs in localStorage, wrapped in try/catch
- Fetch current product data from the server; never trust stored prices
- Small client island only

## In scope

- Track views on product detail
- "Recently viewed" row reusing `ProductCard`

## Out of scope

- Server-side history for logged-in users

## Files likely touched

- components/product/
- app/(store)/products/[slug]/page.tsx

## Acceptance and validation

- Viewing three products shows them in the row, newest first
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
