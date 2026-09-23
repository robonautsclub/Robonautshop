# Task 04 — Root layout

- [x] Implemented

## Goal

Set the Robonautshop document shell and a store layout that can hold the navbar and footer.

## In scope

- `app/layout.tsx`: html, body, font, and global metadata for Robonautshop
- Move the home page into `app/(store)/page.tsx` if it currently lives at `app/page.tsx`
- `app/(store)/layout.tsx` with a `main` region. Leave clear slots for navbar and footer; do not build them yet if they do not exist
- Metadata title and description suitable for a robotics parts store in Bangladesh

## Out of scope

- Navbar and footer implementation (tasks 05 and 06)
- Placeholder route pages (task 07)
- Fake products, auth, or data fetching

## Steps

1. Inspect the current `app/` tree and existing layout components.
2. Reuse existing fonts and global CSS. Do not restyle the whole app.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Stop. Do not start task 05.

## Done when

- The store route group exists
- The document title is Robonautshop
- Lint and typecheck pass
