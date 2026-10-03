# Task 94 — Custom not-found page

- [ ] Implemented

## Goal

Add a branded root `app/not-found.tsx` so unknown routes and `notFound()` calls (product/kit/project/category slugs) show Robonautshop UI instead of the Next.js default 404.

Extract a small reusable status-page pattern (inspired by `CatalogEmptyState`) so later error / forbidden / unauthorized pages do not duplicate layout markup.

## In scope

- This task only
- `app/not-found.tsx` at the app root
- Shared status-page UI under `components/` (e.g. `components/shared/` or similar) with title, description, and optional primary/secondary actions
- Clear CTAs: Home and Products (or equivalent useful links)
- Accessible headings, links/buttons, and readable mobile layout
- Match existing storefront visual language (Tailwind, existing button variants)
- Reuse `CatalogEmptyState` patterns where they fit; do not invent a second empty-state design system

## Out of scope

- Any later task in this phase (`error`, `global-error`, `loading`, `forbidden`, `unauthorized`, `sitemap`)
- Calling `notFound()` from pages that do not already use it
- Cloudflare, D1, Drizzle, R2, or real APIs
- Auth enforcement or status codes beyond what Next.js provides for `not-found`
- Open Graph / sitemap / robots

## Steps

1. Inspect `CatalogEmptyState`, root/`(store)` layouts, and existing `notFound()` usage on slug pages.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Visiting an unknown path and an unknown product/kit/project/category slug shows the custom 404
- Shared status-page UI exists and is used by `not-found.tsx`
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task (95)
