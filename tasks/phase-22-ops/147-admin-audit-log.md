# Task 147 — Admin audit log

- [ ] Implemented

## Goal

Record sensitive admin actions (order status, stock, products, roles, coupons).

## Prerequisites

- Task 146

## Locked rules

- Append-only table; no edit/delete UI
- Never log secrets or passwords

## In scope

- `audit_logs` table + migration
- Helper used by admin actions
- Admin page listing recent entries with filters

## Out of scope

- External SIEM

## Files likely touched

- lib/db/schema/
- migrations/
- lib/admin/
- app/admin/

## Acceptance and validation

- Changing an order status creates an entry with actor and before/after
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
