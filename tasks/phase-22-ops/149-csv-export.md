# Task 149 — CSV export for orders, products and inventory

- [ ] Implemented

## Goal

Admins export data to CSV for spreadsheets and accounting.

## Prerequisites

- Task 126

## Locked rules

- Permission-checked server route
- Respect current filters
- Escape CSV values (formula injection: prefix `=+-@`)

## In scope

- Export buttons on orders, products and inventory pages
- One shared CSV helper

## Out of scope

- CSV import
- Scheduled reports

## Files likely touched

- lib/admin/ (csv helper)
- app/admin/

## Acceptance and validation

- Exported orders open correctly in Excel
- Add Vitest tests for the business rule; `pnpm test` passes
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
