# Task 124 — Admin kits create and edit

- [ ] Implemented

## Goal

Kit dialogs are preview-only. Save kits and their components to D1, reusing the existing BOM editor.

## Prerequisites

- Tasks 18 (kit BOM from stock), 119

## Locked rules

- Kit components must reference real products/variants
- ADMIN-only, Zod validated
- Kit price is set by admin but component availability is still checked server-side

## In scope

- Create, edit, archive kit
- Save BOM rows from `components/admin/admin-bom-editor.tsx`

## Out of scope

- Kit discounts beyond the kit price

## Files likely touched

- components/admin/admin-kits-shell.tsx
- components/admin/admin-bom-editor.tsx
- lib/admin/catalog.ts

## Acceptance and validation

- A new kit appears on `/kits` with its components
- Kit with a missing product is refused
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
