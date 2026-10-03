# Task 13 — Admin table pagination + page size

- [ ] Implemented

## Goal

Add bottom pagination for admin list tables so long catalogs are not one endless
page. Support page numbers (1, 2, 3, …) and a **page size** control of
**20 / 30 / 50** rows per page.

## In scope

- This task only
- Shared pagination component (Previous / numbered pages / Next + page-size
  select)
- Apply to Products at minimum; ideally Categories, Inventory, Orders,
  Customers, Kits, Projects
- Client-side paging over current mock/static arrays is fine
- Keep UI compact: short page number list (not a huge control)

## Out of scope

- Any later task in this folder
- Server-side / D1 pagination APIs
- Real search filtering (unless already present as UI-only)

## Steps

1. Inspect the current project and this task's dependencies.
2. Implement only this task.
3. Run `pnpm lint` and `pnpm typecheck`.
4. Fix errors.
5. Check this box and the matching box in `tasks/dashboard-design/README.md`
   and `tasks/README.md`.
6. Stop. Do not start the next task.

## Done when

- Tables show page size 20/30/50 and page navigation at the bottom
- Changing page size resets sensibly (e.g. back to page 1)
- Lint and typecheck pass
- The report lists completed work, files changed, and the next suggested task
