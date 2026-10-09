# Task 115 — Realistic mock customers and users

- [x] Implemented

## Goal

Make `lib/admin/mock-customers.ts` and `lib/admin/mock-users.ts` believable and consistent with the mock orders.

## Prerequisites

- Task 114

## Locked rules

- Still clearly labelled as mock data
- Use `example.com` emails and non-real phone numbers in BD format

## In scope

- Bangladeshi names, `01XXXXXXXXX` phone format, BD cities
- Customer order count and total spent are calculated from the task 114 orders, not hard-coded
- Users have consistent roles (ADMIN, CUSTOMER and future roles from the role matrix)

## Out of scope

- Real customer data or D1 changes

## Files likely touched

- lib/admin/mock-customers.ts
- lib/admin/mock-users.ts

## Acceptance and validation

- Customer stats match the orders
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
