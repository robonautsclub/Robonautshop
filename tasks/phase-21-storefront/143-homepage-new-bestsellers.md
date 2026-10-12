# Task 143 — Homepage: new arrivals and bestsellers

- [ ] Implemented

## Goal

Add "New arrivals" and "Bestsellers" sections to the homepage.

## Prerequisites

- Task 15

## Locked rules

- Bestsellers calculated from real order items, not hard-coded
- New arrivals use `createdAt`
- Build on the current uncommitted `components/home/` work; reuse `ProductCard`/`ProductGrid`
- Empty states when there is no data

## In scope

- Two query functions in `lib/catalog`
- Two homepage sections

## Out of scope

- Personalized recommendations
- Flash sales

## Files likely touched

- app/(store)/page.tsx
- components/home/
- lib/catalog/queries.ts

## Acceptance and validation

- Sections render with data and show empty states without it
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
