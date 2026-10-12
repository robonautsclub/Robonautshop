# Task 117 — Realistic mock tutorials, guides, docs and code examples

- [x] Implemented

## Goal

Make `lib/content/mock-data.ts` read like real robotics content that matches the catalog.

## Prerequisites

- None

## Locked rules

- Still mock content (no D1 or CMS yet)
- Only reference products and projects that exist in the catalog

## In scope

- Tutorials and guides for the catalog's real projects (e.g. line follower, obstacle avoider), with real component lists
- Code examples that are valid Arduino or ESP32 sketches
- Datasheet entries with plausible specs for catalog parts
- Working links to the related product and project slugs

## Out of scope

- Moving content to D1
- An admin content editor

## Files likely touched

- lib/content/mock-data.ts

## Acceptance and validation

- Every product or project slug referenced in the content resolves
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
