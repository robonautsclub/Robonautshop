# Task 79b — Admin bootstrap (email/password only)

- [ ] Implemented

## Goal

Provide a safe way to create the first (or subsequent) `ADMIN` user with
**email and password only**, and polish admin login redirect/logout so staff
can manage inventory without using customer social login.

## Prerequisites

- Task 79a complete

## Locked rules

- Admin authentication: email/password only — **no Google / Microsoft**
- Admin login URL: `/login`
- Never commit real admin passwords or secrets
- Bootstrap via env-driven script, one-time CLI, or documented D1/admin procedure
  — not a public “register as admin” page

## In scope

- This task only
- Script or documented command to create/promote an ADMIN with email/password
  (e.g. read `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` from env at
  run time — placeholders in `.env.example` only)
- After credential login at `/login`, redirect ADMIN to `/admin` when appropriate
- Restore a real admin sign-out control if missing (session must clear)
- Short staff-facing copy on `/login` if helpful (“Admin sign-in — email and
  password only”)

## Out of scope

- Public self-serve admin registration
- OAuth for admins
- New inventory features
- Customer social login changes

## Steps

1. Inspect admin login page, users schema `role`, and deploy/env docs.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- A documented/scripted path exists to create an ADMIN with email/password
- Admins can sign in at `/login`, reach `/admin`, and sign out
- No admin OAuth path was added
- Lint and typecheck pass
- The report lists completed work, files changed, and notes Phase 12 auth
  sequence complete (or next deferred task such as Phase 13)
