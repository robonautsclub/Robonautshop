# Task 112 — Product and Breadcrumb structured data

- [x] Implemented

## Goal

Add JSON-LD structured data so search engines can show price, stock and breadcrumbs (AGENTS.md §22).

## Prerequisites

- Task 111

## Locked rules

- Values come from the database (price in BDT, real availability). Never invent ratings
- Escape JSON safely when inlining it (no XSS through product text)

## In scope

- Small `JsonLd` server component
- Product schema on product detail: name, sku, image, description, offers (price, `priceCurrency: BDT`, availability)
- BreadcrumbList on product, kit and project detail pages

## Out of scope

- Review or aggregateRating markup

## Files likely touched

- components/shared/json-ld.tsx (new)
- lib/seo/structured-data.ts (new)
- app/(store)/products/[slug]/page.tsx and kits/projects detail pages

## Acceptance and validation

- Google Rich Results test (or manual check of the page source) shows valid Product and BreadcrumbList
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` passes

Stop after this task and report. Do not start the next one.
