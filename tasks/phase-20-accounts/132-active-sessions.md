# Task 132 — Active sessions list and revoke

- [ ] Implemented

## Goal

Show customers where they are signed in and let them sign out other sessions.

## Prerequisites

- Task 77c

## Locked rules

- Use Better Auth session APIs; no custom session table

## In scope

- Sessions list (device/browser, last active) on `/account`
- Revoke one / revoke all others

## Out of scope

- Login history for admins (task 147)

## Files likely touched

- components/account/
- lib/account/

## Acceptance and validation

- Revoking a session signs that device out
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
