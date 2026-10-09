# Task 133 — Account deletion request

- [ ] Implemented

## Goal

Let customers delete their account while keeping order records required for the business.

## Prerequisites

- Task 129

## Locked rules

- Require re-authentication or password confirmation
- Orders are kept but personal data is anonymized; document exactly what is kept
- Block deletion while an order is in progress

## In scope

- Delete account section on `/account`
- Server action that anonymizes the user, deletes addresses, wishlist and cart, and signs out

## Out of scope

- Full data export (can be a later task)

## Files likely touched

- lib/account/
- components/account/

## Acceptance and validation

- After deletion the user cannot log in and their orders show anonymized data in admin
- Add Vitest tests for the business rule; `pnpm test` passes
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
