# Task 123 — Admin product image upload to R2

- [ ] Implemented

## Goal

Let admins upload, reorder and remove product images stored in R2, with metadata in `product_images`.

## Prerequisites

- Tasks 64 (R2), 70 (product images schema), 119

## Locked rules

- Validate file type by content (magic bytes), size and extension; do not trust filename or MIME
- Generate secure random object keys
- Store only metadata/keys in D1, never file data
- ADMIN-only upload endpoint

## In scope

- Upload endpoint (images only, size limit e.g. 5 MB)
- Image manager in the product dialog: upload, alt text, reorder, remove
- Delete the R2 object when an image is removed

## Out of scope

- Image resizing pipeline
- Bulk upload

## Files likely touched

- lib/api/ or app/api/ (upload route)
- lib/db/schema/product-images.ts
- components/admin/ (image manager)

## Acceptance and validation

- Uploaded image shows on the product page
- A renamed `.exe` as `.png` is rejected
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
