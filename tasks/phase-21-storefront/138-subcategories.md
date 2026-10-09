# Task 138 — Subcategories

- [ ] Implemented

## Goal

Categories are flat. Add one level of subcategories (e.g. Sensors → IR Sensors).

## Prerequisites

- Task 121

## Locked rules

- `parentId` nullable FK on categories with a migration
- One nesting level only
- Parent category page includes subcategory products

## In scope

- Migration
- Category pages show subcategory links
- Admin category dialog gets a parent select
- Breadcrumbs include the parent

## Out of scope

- Mega menu

## Files likely touched

- lib/db/schema/categories.ts
- migrations/
- lib/catalog/queries.ts
- components/admin/admin-categories-shell.tsx

## Acceptance and validation

- Sensors page lists IR Sensors subcategory and its products
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
