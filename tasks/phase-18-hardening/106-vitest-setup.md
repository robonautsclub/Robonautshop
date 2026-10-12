# Task 106 — Test runner (Vitest) and first pricing tests

- [x] Implemented

## Goal

There are no automated tests. Add Vitest and cover the pure pricing functions first (AGENTS.md §41).

## Prerequisites

- None

## Locked rules

- Use pnpm (`pnpm add -D vitest`)
- No meaningless tests just to increase the count
- Tests must not need D1 or network

## In scope

- Add Vitest as a dev dependency, plus a minimal `vitest.config.ts` with the `@/` alias
- `"test": "vitest run"` script in package.json
- Tests for `lib/cart/calculations.ts` (`calculateCartSubtotal`, `calculateCartItemCount`, `mergeCartLines`)
- Tests for `lib/builder/pricing.ts` (`calculateBuildTotal`, `getAvailableLines`, `getUnavailableLines`)
- Add `pnpm test` to the README dev commands

## Out of scope

- Database or inventory tests (task 107)
- E2E or browser tests

## Files likely touched

- package.json, pnpm-lock.yaml
- vitest.config.ts
- lib/cart/calculations.test.ts
- lib/builder/pricing.test.ts
- README.md

## Acceptance and validation

- `pnpm test` runs and passes
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
