# Task 111 — Open Graph and canonical URLs

- [x] Implemented

## Goal

Product, kit, project and category pages set only a title and description. Add Open Graph tags and canonical URLs (AGENTS.md §22).

## Prerequisites

- None

## Locked rules

- Build absolute URLs with `getSiteUrl` (`lib/site-url.ts`)
- No fake images: use the product's real first image if there is one, otherwise the site default

## In scope

- Extend `generateMetadata` in `products/[slug]`, `kits/[slug]`, `projects/[slug]` and `categories/[slug]` with `alternates.canonical` and `openGraph` (title, description, url, images)
- Default Open Graph values in the root layout metadata
- Put the shared builder in one helper, not copied into each page

## Out of scope

- JSON-LD (task 112)

## Files likely touched

- lib/seo/metadata.ts (new)
- app/(store)/*/[slug]/page.tsx
- app/layout.tsx

## Acceptance and validation

- Page source shows `og:*` and `<link rel="canonical">` with absolute URLs
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
