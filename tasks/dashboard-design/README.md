# Dashboard design — Admin redesign

Redesign `/admin` into a professional e-commerce admin dashboard.

## Constraints

- Keep **shadcn/ui** + **Lucide**
- Match the **public store width system** via `PageContainer`
  (`px-8 sm:px-12 lg:px-20 xl:px-28`) — do **not** keep the current admin
  `max-w-7xl` + tighter padding unless a later decision explicitly replaces it
- UI shell only — no real ADMIN auth, no DB writes
- Reuse existing admin data helpers in `lib/admin`
- Keep components small and reusable; do not duplicate code
- One task at a time; check boxes only when that task is done

## Why

Current admin uses `max-w-7xl` and smaller padding, so it feels narrower than the
storefront. Align layout width with the public site, then upgrade to a denser
professional ops dashboard (commerce-console density, still Robonautshop-branded).

## Design intent

- **Before:** admin `max-w-7xl` + `px-4/6/8`
- **After:** same edge padding as storefront `PageContainer`
- **Look:** professional commerce admin, light mode, shadcn + Lucide
- **Not:** restyling the public storefront in this folder

## Tasks

- [x] 01 [Shared dashboard shell + public width](01-dashboard-shell-width.md)
- [x] 02 [Sidebar navigation redesign](02-sidebar-nav.md)
- [x] 03 [Top bar / header redesign](03-topbar.md)
- [x] 04 [Dashboard home metrics layout](04-dashboard-home.md)
- [x] 05 [Shared table + page header patterns](05-table-page-patterns.md)
- [x] 06 [Catalog pages restyle (products, categories, inventory)](06-catalog-pages.md)
- [x] 07 [Orders + customers restyle](07-orders-customers.md)
- [x] 08 [Kits + projects restyle](08-kits-projects.md)
- [x] 09 [Responsive / mobile dashboard polish](09-responsive-polish.md)
- [x] 10 [Lint, typecheck, visual QA](10-verify.md)
