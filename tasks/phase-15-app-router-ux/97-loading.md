# Task 97 — Route loading UI

- [x] Implemented

## Goal

Add App Router `loading.tsx` for the storefront and admin segments so navigations show an accessible placeholder instead of a blank wait. Keep visuals light and consistent with existing chrome — no new animation libraries.

## In scope

- This task only
- `app/(store)/loading.tsx`
- `app/admin/loading.tsx`
- Skeleton or simple placeholder layout that fits inside the existing store/admin layouts
- Accessible loading indication (e.g. `aria-busy`, visually hidden “Loading…” text, or equivalent)
- Reuse Tailwind / existing UI primitives; extract a tiny shared skeleton helper only if both files would otherwise duplicate the same markup
- Mobile-friendly spacing

## Out of scope

- Per-page `loading.tsx` for every nested route (segment-level store + admin is enough)
- Replacing inline “Loading…” strings inside client cart/checkout components
- Adding skeleton libraries or framer-motion
- Error / not-found / auth status pages
- Cloudflare or backend work

## Steps

1. Inspect `(store)` and admin layouts and any existing loading copy in cart/checkout.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Store and admin each have a `loading.tsx` that renders a sensible placeholder
- No new dependencies added for animation
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task (98)
