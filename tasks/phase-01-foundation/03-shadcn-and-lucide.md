# Task 03 — shadcn/ui and Lucide

## Goal

Configure shadcn/ui and Lucide so later UI can reuse them.

## In scope

- `pnpm dlx shadcn@latest init` for the existing Next.js app
- Add only `button`, `sheet`, and `separator`
- Ensure `lucide-react` is installed
- Keep generated `components/ui/` and `lib/utils.ts`

## Out of scope

- Navbar, footer, pages, or extra shadcn components
- Custom theme beyond the CLI defaults
- Replacing Tailwind or the App Router

## Steps

1. Inspect `components.json`, `package.json`, and `app/globals.css` if they exist.
2. Initialize shadcn only if it is not already configured.
3. Add `button`, `sheet`, and `separator`. Do not add a component dump.
4. Run `pnpm lint` and `pnpm typecheck`.
5. Stop. Do not start task 04.

## Done when

- shadcn is configured
- The three components and Lucide are available
- Lint and typecheck pass
