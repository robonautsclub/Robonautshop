# Task 142 — Policy, About and FAQ pages

- [ ] Implemented

## Goal

Add store trust pages: privacy policy, terms, returns and warranty, shipping (flat charge), About and FAQ.

## Prerequisites

- None

## Locked rules

- No invented legal claims — use clearly marked placeholder text the owner must review
- Shipping page describes the current flat charge only; no couriers
- Text kept out of business logic for future Bangla support

## In scope

- Static pages with metadata
- Footer links
- Add to sitemap

## Out of scope

- CMS for editing these pages

## Files likely touched

- app/(store)/
- components/layout/footer.tsx
- app/sitemap.ts

## Acceptance and validation

- All pages reachable from the footer and listed in the sitemap
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
