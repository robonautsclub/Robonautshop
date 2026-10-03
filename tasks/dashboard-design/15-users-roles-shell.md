# Task 15 — Users tab + role matrix (UI shell)

- [ ] Implemented

## Goal

Add an admin **Users** section that lists users with roles for the future
permission system.

## Roles

| Role | Intent |
| --- | --- |
| `SUPER_ADMIN` | Full access to everything |
| `ADMIN` | Broad store/admin access (not necessarily every super-admin setting) |
| `STORE_MANAGER` | Shopkeeper / order taker — fulfill and manage orders day-to-day |
| `SHOPPER` | Customer account (storefront buyer; limited or no admin powers) |

Show a clear **role matrix** (who can do what) as static UI copy or a simple
table — permissions are **not** enforced yet (real ADMIN auth is later).

## In scope

- This task only
- Nav item: Users under an appropriate group (e.g. Customers or Overview)
- `/admin/users` list shell with mock users + role badges
- Optional non-persistent Add/Edit user dialog (reuse task 11 dialog if present)
- Document role meanings in the page description or a small matrix panel
- Lucide icons; shadcn patterns

## Out of scope

- Any later task in this folder
- Real auth, role guards, or database users
- Enforcing permissions on other admin routes

## Steps

1. Inspect the current project and this task's dependencies.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/dashboard-design/README.md`
   and `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- `/admin/users` exists with mock roles including the four roles above
- Role intent is visible in the UI
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task
