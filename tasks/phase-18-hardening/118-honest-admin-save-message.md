# Task 118 — Honest message for mock-backed admin saves

- [x] Implemented

## Goal

`components/admin/admin-form-dialog.tsx` shows "saved" when no real handler exists, which fakes success (AGENTS.md §49). Make the message honest.

## Prerequisites

- None

## Locked rules

- Don't remove the dialogs
- Dialogs with a real `onSubmit` (coupons and others) keep working unchanged

## In scope

- Fallback message becomes "Preview only — changes are not saved yet." using a neutral (not success) style
- Optionally show a small "Preview" badge on dialogs without a real handler

## Out of scope

- Wiring real CRUD

## Files likely touched

- components/admin/admin-form-dialog.tsx

## Acceptance and validation

- Mock dialogs no longer say "saved". The coupon dialog still saves
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
