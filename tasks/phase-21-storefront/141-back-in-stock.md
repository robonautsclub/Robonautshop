# Task 141 — Back-in-stock notifications

- [ ] Implemented

## Goal

Customers can ask to be emailed when an out-of-stock product or variant is available again.

## Prerequisites

- Tasks 91, 122

## Locked rules

- One subscription per email per variant
- Send once, then mark sent
- Rate limit sign-ups

## In scope

- "Notify me" button when out of stock
- Subscriptions table + migration
- Send emails when stock goes from 0 to available (stock adjustment path)

## Out of scope

- Price-drop alerts
- SMS

## Files likely touched

- components/product/product-purchase-panel.tsx
- lib/inventory/
- lib/email/

## Acceptance and validation

- Restocking a variant emails subscribers once
- Add Vitest tests for the business rule; `pnpm test` passes
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
