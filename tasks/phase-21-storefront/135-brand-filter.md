# Task 135 — Brand filter

- [ ] Implemented

## Goal

Products have a `brand` column but no brand filter.

## Prerequisites

- Task 134

## Locked rules

- Brand list comes from the database, not hard-coded

## In scope

- Brand checkbox filter alongside the existing filters
- Filter applied in the query

## Out of scope

- Brand pages and a brands table

## Files likely touched

- lib/catalog/queries.ts
- components/catalog/

## Acceptance and validation

- Selecting a brand shows only its products
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
