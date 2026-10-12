# Task 129 — Customer profile edit

- [ ] Implemented

## Goal

Let customers edit their name and phone number.

## Prerequisites

- Task 78a

## Locked rules

- Users can only edit their own profile, checked server-side
- Validate Bangladesh phone numbers with a reusable validator (reuse the address phone validator if one exists)
- Email change is out of scope

## In scope

- Profile form on `/account`
- Server action with Zod validation

## Out of scope

- Profile photo
- Email change

## Files likely touched

- components/account/account-page-content.tsx
- lib/account/

## Acceptance and validation

- Saved name shows in the navbar and on new orders
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
