# Task 125 — Admin robot projects create and edit

- [ ] Implemented

## Goal

Robot project dialogs are preview-only. Save projects and their components to D1.

## Prerequisites

- Task 124 (reuse the BOM editor pattern)

## Locked rules

- Components reference real products
- Skill level uses the existing enum
- ADMIN-only, Zod validated

## In scope

- Create, edit, archive project
- Save project components

## Out of scope

- Rich content editor for build steps

## Files likely touched

- components/admin/admin-projects-shell.tsx
- lib/admin/catalog.ts

## Acceptance and validation

- New project appears on `/projects` and in the Robot Builder
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
