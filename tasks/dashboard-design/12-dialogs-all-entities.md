# Task 12 — Create / Edit dialogs for all admin entities

- [x] Implemented

## Goal

Use the shared create/edit popup for Categories, Inventory row edits (where
applicable), Kits, Projects, and any other admin Add/Edit flows that still use
inline forms.

## In scope

- This task only
- Migrate remaining Add/Edit shells to the shared dialog from task 11
- Inventory: prefer dialog or compact row editor consistent with the popup
  pattern (document choice in the report)
- Reuse the shared dialog; do not duplicate modal chrome

## Out of scope

- Any later task in this folder
- Real persistence
- Users tab (task 15)
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

- Admin Add/Edit flows use popups consistently
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task
