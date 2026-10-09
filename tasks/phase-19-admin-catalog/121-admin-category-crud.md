# Task 121 — Admin category create, edit and delete

- [x] Implemented

## Goal

Category dialogs are preview-only. Save them to D1.

## Prerequisites

- Task 79a

## Locked rules

- ADMIN-only, server-side Zod validation
- Unique slug
- Block delete when products still use the category; show why

## In scope

- Create, edit, delete actions
- Wire `components/admin/admin-categories-shell.tsx` dialogs

## Out of scope

- Subcategories (task 138)

## Files likely touched

- components/admin/admin-categories-shell.tsx
- lib/admin/catalog.ts

## Acceptance and validation

- New category appears on `/categories`
- Deleting a category in use is refused with a clear message
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
