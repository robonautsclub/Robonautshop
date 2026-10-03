# Dashboard design — Admin redesign

Redesign `/admin` into a professional e-commerce admin dashboard.

## Constraints

- Keep **shadcn/ui** + **Lucide**
- Match the **public store width system** via `PageContainer`
  (`px-8 sm:px-12 lg:px-20 xl:px-28`) — do **not** keep the current admin
  `max-w-7xl` + tighter padding unless a later decision explicitly replaces it
- Prefer **UI shells** over mock/static data until backend phases — no fake
  payment success; inventory booking rules may be demonstrated with local UI
  state only
- Reuse existing admin data helpers in `lib/admin`
- Keep components small and reusable; do not duplicate code
- One task at a time; check boxes only when that task is done
- **No admin logout button** (see task 14)

## Why

Current admin uses `max-w-7xl` and smaller padding, so it feels narrower than the
storefront. Align layout width with the public site, then upgrade to a denser
professional ops dashboard (commerce-console density, still Robonautshop-branded).

## Design intent

- **Before:** admin `max-w-7xl` + `px-4/6/8`
- **After:** same edge padding as storefront `PageContainer`
- **Look:** professional commerce admin, light mode, shadcn + Lucide
- **Modals:** Add / Edit open in popups, not long inline forms
- **Lists:** paginated (20 / 30 / 50 per page)
- **Users:** SUPER_ADMIN · ADMIN · STORE_MANAGER (shopkeeper) · SHOPPER
- **Stock:** available = stock − booked; cancel releases booked units
- **Kits:** Products first, then Kits search/attach those products into the BOM
  (never create parts inside the kit editor); buy kit → cart gets those
  components (not new SKUs)
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
- [ ] 11 [Create / Edit dialogs (shared modal)](11-create-edit-dialogs.md)
- [ ] 12 [Create / Edit dialogs for all admin entities](12-dialogs-all-entities.md)
- [ ] 13 [Admin table pagination + page size](13-table-pagination.md)
- [ ] 14 [Admin chrome: no logout button](14-no-admin-logout.md)
- [ ] 15 [Users tab + role matrix (UI shell)](15-users-roles-shell.md)
- [ ] 16 [Inventory booking UI (stock vs booked vs available)](16-inventory-booking-ui.md)
- [ ] 17 [Cancelled order releases booked stock (UI shell)](17-cancel-releases-stock.md)
- [ ] 18 [Admin kit BOM: pick components from stock](18-admin-kit-bom-from-stock.md)
- [ ] 19 [Custom kit quantities (storefront / builder shell)](19-custom-kit-quantities.md)
- [ ] 20 [Buying a kit expands cart from stock components](20-kit-cart-expands-components.md)
