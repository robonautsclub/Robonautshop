# Task 146 — Staff roles and permissions

- [ ] Implemented

## Goal

Add staff roles beyond ADMIN with server-side permission checks. Today `/admin/users` is a UI shell.

## Prerequisites

- Task 15 (users/role matrix shell), 79a

## Locked rules

- One permission map in code; every admin action checks it server-side
- ADMIN keeps full access
- Hiding UI is not enough

## In scope

- Roles: STAFF, ORDER_MANAGER, INVENTORY_MANAGER, CONTENT_MANAGER
- Migration for the role enum
- Wire the users page to assign roles
- Guard existing admin actions with the permission helper

## Out of scope

- Custom role builder
- Branch permissions

## Files likely touched

- lib/db/schema/users.ts
- migrations/
- lib/auth/
- components/admin/admin-users-shell.tsx

## Acceptance and validation

- An ORDER_MANAGER can update orders but cannot edit products
- Add Vitest tests for the business rule; `pnpm test` passes
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
