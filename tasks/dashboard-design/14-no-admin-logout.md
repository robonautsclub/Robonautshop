# Task 14 — Admin chrome: no logout button

- [ ] Implemented

## Goal

Admin dashboard must **not** show a logout / Sign out button.

Product owner request: do not expose an admin logout control in the admin
chrome. Session clearing (when real auth exists) will be handled outside this
UI pattern or in a later auth phase — this task only enforces **no logout
button** in `/admin`.

## In scope

- This task only
- Audit admin top bar, mobile nav, and any admin account menus
- Remove or avoid adding Logout / Sign out in admin
- Optional: tiny helper text that this is a UI shell (already have shell notes)
- Do not add fake logout that pretends to end a real ADMIN session

## Out of scope

- Any later task in this folder
- Real ADMIN authentication / Better Auth wiring
- Storefront login/logout behavior (unless it incorrectly appears inside admin)

## Steps

1. Inspect the current project and this task's dependencies.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/dashboard-design/README.md`
   and `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- No logout button is visible anywhere under `/admin`
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task
