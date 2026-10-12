# Task 144 — Review moderation and verified purchase

- [ ] Implemented

## Goal

Reviews publish immediately. Add moderation and a verified-purchase badge.

## Prerequisites

- Task 85

## Locked rules

- Status field (PENDING, APPROVED, HIDDEN) with a migration
- Verified purchase computed from delivered orders server-side
- Only approved reviews count toward ratings

## In scope

- Admin reviews list with approve/hide
- Verified badge on reviews

## Out of scope

- Review photos

## Files likely touched

- lib/db/schema/product-reviews.ts
- migrations/
- lib/reviews/
- app/admin/

## Acceptance and validation

- A hidden review disappears from the product page and the rating
- Add Vitest tests for the business rule; `pnpm test` passes
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
