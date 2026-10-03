# Task 11 — Create / Edit dialogs (shared modal)

- [x] Implemented

## Goal

Replace inline create/edit form shells with a **popup dialog** (shadcn Dialog /
Sheet on mobile). Opening **Add** or **Edit** should show a modal window for
editing that record.

## In scope

- This task only
- Shared reusable admin dialog shell (title, description, form slot, Cancel /
  Save demo actions)
- Wire **Products** first: New product + Edit open the modal (not an inline
  panel below the table)
- Keep saves non-persistent (demo message only)
- Lucide + shadcn patterns; keep components small and reusable

## Out of scope

- Any later task in this folder
- Real persistence / API
- Migrating every entity (task 12)
- Pagination (task 13)

## Steps

1. Inspect the current project and this task's dependencies.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/dashboard-design/README.md`
   and `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Product Add/Edit opens in a popup
- Inline product form panel is removed
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task
