# Task 100 — Sitemap and robots

- [ ] Implemented

## Goal

Generate `/sitemap.xml` via `app/sitemap.ts` from static public routes plus published mock catalog slugs, and add `app/robots.ts` so crawlers may index the storefront while `/admin` stays disallowed.

## In scope

- This task only
- `app/sitemap.ts` returning a Next.js `MetadataRoute.Sitemap`
- Include static public routes at minimum: `/`, `/products`, `/categories`, `/kits`, `/projects`, `/builder` (and other public indexable routes that already exist)
- Include published product, category, kit, and project detail URLs using existing catalog helpers from `@/lib/catalog` (or `queries`) — do not import faker or raw mock arrays in the page file
- Use absolute URLs with a sensible site origin (env such as `NEXT_PUBLIC_SITE_URL` or equivalent already in `.env.example`; add placeholder if missing — never hard-code secrets)
- `app/robots.ts`: allow public storefront; disallow `/admin` (and `/api` if appropriate); point `sitemap` to the absolute sitemap URL
- Keep admin non-indexable consistent with existing admin layout metadata

## Out of scope

- Open Graph images, structured data, or per-page metadata overhauls
- D1 / real catalog queries (mock helpers are correct until Phase 12)
- Indexing account, cart, checkout, or login as marketing pages (omit private/utility routes)
- Changing product page `generateMetadata` behavior beyond what sitemap needs
- Cloudflare Workers deployment of sitemap

## Steps

1. Inspect `@/lib/catalog` queries, public routes under `app/(store)`, admin `robots` metadata, and `.env.example`.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- `/sitemap.xml` lists static public routes and published catalog detail URLs
- `/robots.txt` allows the storefront, disallows `/admin`, and references the sitemap
- Lint and typecheck pass
- The report lists completed work, files changed, and notes that Phase 15 App Router UX tasks are complete
