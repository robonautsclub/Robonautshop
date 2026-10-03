# Task 12 — Faker.js mock catalog

- [ ] Implemented

## Goal

Install `@faker-js/faker` and generate a seeded, deterministic mock catalog (categories, products with variants/images/stock, kits, robot projects with components) suitable for Bangladesh robotics retail demos.

## In scope

- This task only
- Reuse existing types, mock data helpers, and UI components
- Keep components small and reusable; do not duplicate code
- Use a fixed faker seed so reloads stay stable
- Generate realistic robotics names (Arduino, N20, sensors, chassis, etc.) — not generic lorem-only junk
- Export the generated arrays from a clear module such as `lib/catalog/mock-data.ts`

## Out of scope

- Any later task in the sequence
- Cloudflare Workers, D1, Drizzle, R2, or real APIs
- Real payments, real order persistence, or production secrets
- Hard-coded API keys or credentials
- UI pages
- Network fetching

## Steps

1. Inspect the current project and this task's dependencies.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- The goal above is true in the running app
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task

## Notes

- This is explicit development fixture data for frontend work
- Keep generation code separate from UI components
