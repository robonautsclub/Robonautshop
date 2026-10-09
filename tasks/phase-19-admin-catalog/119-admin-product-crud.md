# Task 119 — Admin product create and edit (real D1 writes)

- [x] Implemented

## Goal

Admin product dialogs in `components/admin/admin-products-shell.tsx` are preview-only. Make create and edit save to D1.

## Prerequisites

- Tasks 79a (admin protection), 118

## Locked rules

- ADMIN role checked server-side on every write
- Validate input with Zod on the server
- Price, compareAtPrice and costPrice are integer BDT
- Slug and SKU stay unique; show a clear error on conflict

## In scope

- Server action or API route for create and update
- Shared Zod schema for product input
- Wire the existing dialog `onSubmit`; refresh the list after save
- Edit specifications (JSON) and variants already in the schema

## Out of scope

- Image upload (task 123)
- Archive/delete (task 120)
- Bulk edit and CSV import

## Files likely touched

- components/admin/admin-products-shell.tsx
- lib/admin/catalog.ts
- lib/admin/ (new product actions + schema)

## Acceptance and validation

- Creating a product shows it on `/products` when published
- Editing price updates the storefront
- Non-admin request is rejected server-side
- Add Vitest tests for the business rule; `pnpm test` passes
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
