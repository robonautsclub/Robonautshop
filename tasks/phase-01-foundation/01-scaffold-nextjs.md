# Task 01 — Scaffold Next.js

- [x] Implemented

## Goal

Create the Robonautsshop Next.js application in the current empty folder.

## In scope

- Next.js with the App Router
- TypeScript in strict mode
- Tailwind CSS
- ESLint
- Import alias `@/*`
- App code at the repo root (`app/`, not `src/`)
- pnpm as the package manager
- `git init` if the folder is not already a git repository

## Out of scope

- shadcn/ui, layout, navbar, footer, or pages beyond the scaffold default
- Database, Cloudflare, authentication, payments, admin, or fake products
- Extra dependencies such as Prettier unless the scaffold already includes them

## Steps

1. Inspect the current folder. If a Next.js app already exists, do not recreate it.
2. Scaffold with `create-next-app` using TypeScript, Tailwind, ESLint, App Router, pnpm, and no `src/` directory.
3. Confirm `tsconfig.json` has `"strict": true` and the `@/*` path alias.
4. Initialize git if needed. Do not commit unless asked.
5. Run `pnpm lint`.
6. Stop. Do not start task 02.

## Done when

- `package.json`, `tsconfig.json`, `app/`, Tailwind, and ESLint config exist
- `pnpm lint` passes
- No store features have been added yet
