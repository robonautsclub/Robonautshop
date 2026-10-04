# Task 77c — Replace mock auth with real sessions

- [x] Implemented

## Goal

Replace browser-local mock auth (`AuthProvider` + mock storage) with real
Better Auth sessions so the storefront reflects signed-in / signed-out state
from the server.

## Prerequisites

- Tasks 77a and 77b complete (77b may be env-incomplete locally, but client
  session APIs must use Better Auth)

## In scope

- This task only
- Point the client auth layer at Better Auth (`authClient` session helpers)
- Sign-out clears the real session
- Remove or stop using mock session storage for production paths
- Keep components small and reusable; do not duplicate session logic
- Update any “demo auth is local to this browser” copy that is no longer true
  for wired flows

## Out of scope

- Redesigning login pages / splitting admin vs customer UI (77d)
- Protecting `/account`, `/checkout`, or `/admin`
- Cart merge
- Fake successful login without a real session

## Steps

1. Inspect `components/auth/auth-provider.tsx`, `lib/auth/mock-auth-*`, and
   Better Auth client modules.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Navbar / account chrome uses real session state
- Mock localStorage auth is no longer the source of truth
- Lint and typecheck pass
- The report lists completed work, files changed, and next task **77d**
