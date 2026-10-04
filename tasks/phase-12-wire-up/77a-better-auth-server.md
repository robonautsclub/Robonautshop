# Task 77a — Better Auth server + D1 adapter

- [ ] Implemented

## Goal

Complete a single Better Auth server instance backed by Cloudflare D1 via
Drizzle, with email/password enabled and sessions persisted in the existing
auth tables (`users`, `sessions`, `accounts`, `verifications`).

## Prerequisites

- Phase 11 users/auth schema applied (task 65)
- D1 + Drizzle configured (Phase 10)

## Locked product rules (do not contradict later auth tasks)

- Guests may use the cart; they may not place orders
- Customer login and admin login are separate pages (later tasks)
- Admins: email/password only (no Google/Microsoft)
- Customers: email/password + Google + Microsoft (later task)

## In scope

- This task only
- Consolidate auth server config (resolve duplicate `lib/auth.ts` /
  `lib/auth/server.ts` into one authoritative server module)
- Wire `drizzleAdapter` to the existing schema with plural table names
  (`usePlural: true` or explicit `modelName`s — see schema comments in
  `lib/db/schema/users.ts`)
- Enable `emailAndPassword`
- Keep `/api/auth/[...all]` as the Next.js handler
- Document required env vars in `.env.example`:
  `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- Never hard-code secrets

## Out of scope

- Google / Microsoft OAuth (77b)
- Replacing mock `AuthProvider` UI (77c)
- Split login pages (77d)
- Route protection, checkout, cart merge, admin guards
- Real payments

## Steps

1. Inspect existing Better Auth scaffolding and the users schema.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- One server auth instance talks to D1 through Drizzle
- Email/password sign-up/sign-in can succeed against the real tables
  (manual or scripted smoke check is enough)
- Lint and typecheck pass
- The report lists completed work, files changed, and next task **77b**
