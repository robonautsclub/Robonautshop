# Task 120 — Product status: draft, published, archived

- [x] Implemented

## Goal

Let admins change product status and archive products instead of hard deleting them, so old orders keep their references.

## Prerequisites

- Task 119

## Locked rules

- Do not hard delete products that appear in orders
- Storefront and sitemap only show published products
- Status change is ADMIN-only, server-side

## In scope

- Status select in the product dialog
- Archive action in the products table (with the existing confirm dialog)
- Status filter on the admin products list
- Check storefront queries exclude draft/archived

## Out of scope

- Scheduled publishing
- Revision history

## Files likely touched

- lib/db/schema/products.ts (only if a migration is needed)
- lib/catalog/queries.ts
- components/admin/admin-products-shell.tsx
- components/admin/admin-confirm-delete-dialog.tsx

## Acceptance and validation

- Archived product disappears from `/products`, search and sitemap
- Archived product still shows in existing order details
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
