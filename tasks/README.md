# Robonautsshop — Task Prompts

Small, independent prompts for building the robotics parts store. Give an agent **one file at a time**. Do not start the next task until the current one is done and you ask for it.

Checked items are implemented. Unchecked items are not.

**Store name:** Robonautsshop

## Current strategy

**Frontend first.** Build the full browse UX (storefront, kits, projects, Robot Builder, cart) against a **Faker.js mock catalog**, then auth/checkout/admin **UI shells**. Cloudflare, D1, Drizzle, real auth, and real orders come **after** the UI is solid.

Mock/faker data here is explicit development fixture data so the UI can be built and reviewed. It is not production catalog data.

## Rules for every task

1. Inspect the existing project first.
2. Do not rewrite working architecture.
3. Implement only that task.
4. Use TypeScript. Keep components reusable. Do not duplicate code. Avoid extra dependencies unless the task requires them (e.g. `@faker-js/faker` in task 12).
5. Never hard-code secrets. Use environment variables.
6. Never create fake functionality that looks like it works (especially payments, auth success, and order persistence during shell phases).
7. Run `pnpm lint` and `pnpm typecheck` when the project exists. Use pnpm for installs.
8. Fix errors before finishing.
9. When the task is actually done, check its box here and in the task file. Do not check work that was not implemented.
10. Stop and report. Do not continue to the next task.

## Phase 1 — Foundation

- [x] 01 [Scaffold Next.js](phase-01-foundation/01-scaffold-nextjs.md)
- [x] 02 [Environment and gitignore](phase-01-foundation/02-env-and-gitignore.md)
- [x] 03 [shadcn/ui and Lucide](phase-01-foundation/03-shadcn-and-lucide.md)
- [x] 04 [Root layout](phase-01-foundation/04-root-layout.md)
- [x] 05 [Navbar](phase-01-foundation/05-navbar.md)
- [x] 06 [Footer](phase-01-foundation/06-footer.md)
- [x] 07 [Placeholder pages](phase-01-foundation/07-placeholder-pages.md)
- [x] 08 [Verify, lint, and README](phase-01-foundation/08-verify-lint-and-readme.md)

## Phase 2 — Mock data (Faker.js)

- [x] 11 [Domain types](phase-02-mock-data/11-domain-types.md)
- [x] 12 [Faker.js mock catalog](phase-02-mock-data/12-faker-mock-catalog.md)
- [x] 13 [Mock data access layer](phase-02-mock-data/13-mock-data-access.md)

## Phase 3 — Storefront

- [x] 14 [Product UI components](phase-03-storefront/14-product-ui-components.md)
- [x] 15 [Homepage](phase-03-storefront/15-homepage.md)
- [x] 16 [Product listing](phase-03-storefront/16-product-listing.md)
- [x] 17 [Category pages](phase-03-storefront/17-category-pages.md)
- [x] 18 [Product detail](phase-03-storefront/18-product-detail.md)
- [x] 19 [Search](phase-03-storefront/19-search.md)
- [x] 20 [Filters](phase-03-storefront/20-filters.md)
- [x] 21 [Sorting](phase-03-storefront/21-sorting.md)
- [x] 22 [Related products](phase-03-storefront/22-related-products.md)

## Phase 4 — Kits and projects

- [x] 23 [Kits listing](phase-04-kits-projects/23-kits-listing.md)
- [x] 24 [Kit detail](phase-04-kits-projects/24-kit-detail.md)
- [x] 25 [Projects listing](phase-04-kits-projects/25-projects-listing.md)
- [x] 26 [Project detail](phase-04-kits-projects/26-project-detail.md)
- [x] 27 [Project components UI](phase-04-kits-projects/27-project-components-ui.md)

## Phase 5 — Cart (client + mock catalog)

- [x] 28 [Cart state and page](phase-05-cart/28-cart-state.md)
- [x] 29 [Add and remove products](phase-05-cart/29-add-remove-products.md)
- [x] 30 [Quantity controls](phase-05-cart/30-quantity.md)
- [x] 31 [Cart calculations](phase-05-cart/31-cart-calculations.md)
- [x] 32 [Persistent cart](phase-05-cart/32-persistent-cart.md)

## Phase 6 — Robot Builder UI

- [x] 33 [Robot Builder entry](phase-06-robot-builder/33-builder-entry.md)
- [x] 34 [Skill level selection](phase-06-robot-builder/34-skill-level.md)
- [x] 35 [Builder component requirements](phase-06-robot-builder/35-builder-components.md)
- [x] 36 [Builder price calculation](phase-06-robot-builder/36-builder-price.md)
- [x] 37 [Builder stock validation UI](phase-06-robot-builder/37-builder-stock.md)
- [x] 38 [Add complete kit](phase-06-robot-builder/38-complete-kit.md)
- [x] 39 [Customize kit UI](phase-06-robot-builder/39-customize-kit.md)

## Phase 7 — Auth UI shells

UI only. Do not fake successful signup/login unless real auth is already wired.

- [x] 40 [Registration UI shell](phase-07-auth-shells/40-registration-ui.md)
- [x] 41 [Login UI shell](phase-07-auth-shells/41-login-ui.md)
- [x] 42 [Account page shell](phase-07-auth-shells/42-account-shell.md)
- [x] 43 [Addresses UI shell](phase-07-auth-shells/43-addresses-ui.md)
- [x] 44 [Auth nav states](phase-07-auth-shells/44-auth-nav-states.md)

## Phase 8 — Checkout UI shells

No real payments or order persistence.

- [x] 45 [Checkout page shell](phase-08-checkout-shells/45-checkout-shell.md)
- [x] 46 [Checkout address UI](phase-08-checkout-shells/46-checkout-address-ui.md)
- [x] 47 [Shipping estimate UI](phase-08-checkout-shells/47-shipping-estimate-ui.md)
- [x] 48 [Payment method UI](phase-08-checkout-shells/48-payment-method-ui.md)
- [x] 49 [Order confirmation shell](phase-08-checkout-shells/49-order-confirmation-shell.md)

## Phase 9 — Admin UI shells

UI shells over mock/static data. Real ADMIN auth comes in Phase 12.

- [x] 50 [Admin layout and dashboard shell](phase-09-admin-shells/50-admin-layout.md)
- [x] 51 [Admin products shell](phase-09-admin-shells/51-admin-products-shell.md)
- [x] 52 [Admin categories shell](phase-09-admin-shells/52-admin-categories-shell.md)
- [x] 53 [Admin inventory shell](phase-09-admin-shells/53-admin-inventory-shell.md)
- [x] 54 [Admin orders shell](phase-09-admin-shells/54-admin-orders-shell.md)
- [x] 55 [Admin customers shell](phase-09-admin-shells/55-admin-customers-shell.md)
- [x] 56 [Admin kits shell](phase-09-admin-shells/56-admin-kits-shell.md)
- [x] 57 [Admin robot projects shell](phase-09-admin-shells/57-admin-projects-shell.md)

## Dashboard design — Admin redesign

Professional e-commerce admin layout. Same width as the public store (`PageContainer`). Keep shadcn/ui + Lucide. UI shell only.

- [x] 01 [Shared dashboard shell + public width](dashboard-design/01-dashboard-shell-width.md)
- [x] 02 [Sidebar navigation redesign](dashboard-design/02-sidebar-nav.md)
- [x] 03 [Top bar / header redesign](dashboard-design/03-topbar.md)
- [x] 04 [Dashboard home metrics layout](dashboard-design/04-dashboard-home.md)
- [x] 05 [Shared table + page header patterns](dashboard-design/05-table-page-patterns.md)
- [x] 06 [Catalog pages restyle](dashboard-design/06-catalog-pages.md)
- [x] 07 [Orders + customers restyle](dashboard-design/07-orders-customers.md)
- [x] 08 [Kits + projects restyle](dashboard-design/08-kits-projects.md)
- [x] 09 [Responsive / mobile dashboard polish](dashboard-design/09-responsive-polish.md)
- [x] 10 [Lint, typecheck, visual QA](dashboard-design/10-verify.md)
- [x] 11 [Create / Edit dialogs (shared modal)](dashboard-design/11-create-edit-dialogs.md)
- [x] 12 [Create / Edit dialogs for all admin entities](dashboard-design/12-dialogs-all-entities.md)
- [x] 13 [Admin table pagination + page size](dashboard-design/13-table-pagination.md)
- [x] 14 [Admin chrome: no logout button](dashboard-design/14-no-admin-logout.md)
- [x] 15 [Users tab + role matrix (UI shell)](dashboard-design/15-users-roles-shell.md)
- [x] 16 [Inventory booking UI](dashboard-design/16-inventory-booking-ui.md)
- [x] 17 [Cancelled order releases booked stock](dashboard-design/17-cancel-releases-stock.md)
- [x] 18 [Admin kit BOM from stock](dashboard-design/18-admin-kit-bom-from-stock.md)
- [x] 19 [Custom kit quantities](dashboard-design/19-custom-kit-quantities.md)
- [x] 20 [Kit cart expands to stock components](dashboard-design/20-kit-cart-expands-components.md)

See also [dashboard-design/README.md](dashboard-design/README.md).

---

# Deferred — backend and beyond

Do not start these until Phases 2–9 are done (unless you explicitly change strategy).

## Phase 10 — Cloudflare backend

- [x] 58 [Configure Cloudflare](phase-10-backend-cloudflare/58-configure-cloudflare.md)
- [x] 59 [Configure Workers](phase-10-backend-cloudflare/59-configure-workers.md)
- [x] 60 [Configure D1](phase-10-backend-cloudflare/60-configure-d1.md)
- [x] 61 [Configure Drizzle](phase-10-backend-cloudflare/61-configure-drizzle.md)
- [x] 62 [Create first migration](phase-10-backend-cloudflare/62-create-first-migration.md)
- [x] 63 [Test database connection](phase-10-backend-cloudflare/63-test-database-connection.md)
- [x] 64 [Configure R2](phase-10-backend-cloudflare/64-configure-r2.md)

## Phase 11 — Database schema

- [x] 65 [Users schema](phase-11-database/65-users.md)
- [x] 66 [Categories schema](phase-11-database/66-categories.md)
- [x] 67 [Products schema](phase-11-database/67-products.md)
- [x] 68 [Product variants schema](phase-11-database/68-product-variants.md)
- [x] 69 [Inventory schema](phase-11-database/69-inventory.md)
- [x] 70 [Product images schema](phase-11-database/70-product-images.md)
- [x] 71 [Robot projects schema](phase-11-database/71-robot-projects.md)
- [x] 72 [Project components schema](phase-11-database/72-project-components.md)
- [x] 73 [Kits schema](phase-11-database/73-kits.md)
- [x] 74 [Kit components schema](phase-11-database/74-kit-components.md)

## Phase 12 — Wire UI to backend

Catalog first, then auth/access, then real orders.

**Auth product rules (locked):**

- Guests may use the cart; **no guest checkout**
- On customer login, guest cart **merges** into that user’s cart
- Customer login: `/user/login` — email/password + Google + Microsoft
- Admin login: `/login` — **email/password only** (no Google/Microsoft)
- Protect `/account`, `/checkout` (place order), and `/admin` server-side

- [x] 75 [Replace mock catalog with D1](phase-12-wire-up/75-replace-mock-catalog.md)
- [x] 76 [Seed database from faker catalog](phase-12-wire-up/76-seed-from-faker.md)
- [x] 77a [Better Auth server + D1](phase-12-wire-up/77a-better-auth-server.md)
- [x] 77b [Customer Google + Microsoft OAuth](phase-12-wire-up/77b-customer-social-oauth.md)
- [x] 77c [Replace mock auth with real sessions](phase-12-wire-up/77c-replace-mock-auth.md)
- [x] 77d [Split login UIs (admin `/login`, customer `/user/login`)](phase-12-wire-up/77d-split-login-uis.md)
- [x] 78a [Protect `/account` routes](phase-12-wire-up/78a-protect-account-routes.md)
- [x] 78b [Checkout login + guest cart merge](phase-12-wire-up/78b-checkout-login-cart-merge.md)
- [x] 78 [Server cart and order creation](phase-12-wire-up/78-real-cart-orders.md)
- [x] 79a [Admin route protection](phase-12-wire-up/79a-admin-route-protection.md)
- [x] 79b [Admin bootstrap (email/password only)](phase-12-wire-up/79b-admin-bootstrap.md)

Superseded stubs (do not implement): [77](phase-12-wire-up/77-real-auth.md), [79](phase-12-wire-up/79-admin-protection.md).

## Phase 13 — Content

- [x] 80 [Tutorials](phase-13-content/80-tutorials.md)
- [x] 81 [Robot guides](phase-13-content/81-robot-guides.md)
- [x] 82 [Documentation](phase-13-content/82-documentation.md)
- [x] 83 [Datasheets](phase-13-content/83-datasheets.md)
- [x] 84 [Code examples](phase-13-content/84-code-examples.md)

## Phase 14 — Advanced

- [x] 85 [Reviews](phase-14-advanced/85-reviews.md)
- [x] 86 [Wishlist](phase-14-advanced/86-wishlist.md)
- [x] 87 [Coupons](phase-14-advanced/87-coupons.md)
- [x] 88 [Recommendations](phase-14-advanced/88-recommendations.md)
- [x] 89 [Advanced search](phase-14-advanced/89-advanced-search.md)
- [x] 90 [Analytics](phase-14-advanced/90-analytics.md)
- [x] 91 [Email notifications](phase-14-advanced/91-email-notifications.md)
- [x] 92 [Abandoned carts](phase-14-advanced/92-abandoned-carts.md)
- [x] 93 [Inventory alerts](phase-14-advanced/93-inventory-alerts.md)

## Phase 15 — App Router UX & SEO

Next.js special files for loading, errors, auth status pages, and sitemap. UI shells only until Phase 12 wires real auth.

- [x] 94 [Custom not-found page](phase-15-app-router-ux/94-not-found.md)
- [x] 95 [Segment error pages](phase-15-app-router-ux/95-error.md)
- [x] 96 [Root global-error page](phase-15-app-router-ux/96-global-error.md)
- [x] 97 [Route loading UI](phase-15-app-router-ux/97-loading.md)
- [x] 98 [Forbidden (403) page](phase-15-app-router-ux/98-forbidden.md)
- [x] 99 [Unauthorized (401) page](phase-15-app-router-ux/99-unauthorized.md)
- [x] 100 [Sitemap and robots](phase-15-app-router-ux/100-sitemap.md)

## Phase 16 — Payments

- [x] 101 [bKash Checkout URL](phase-16-payments/101-bkash-checkout-url.md)

## Phase 17 — Customer account & post-purchase

- [x] 102 [Orders, addresses, bKash repay & emails](phase-17-customer-account/102-orders-addresses-repay-emails.md)

## Phase 18 — Hardening & realistic mocks

Payments: bKash only. No courier integrations for now. Admin and content mock data stay, but become realistic.

- [x] 103 [Scope: bKash only, couriers deferred](phase-18-hardening/103-scope-bkash-only.md)
- [x] 104 [Atomic stock reservation (prevent overselling)](phase-18-hardening/104-atomic-stock-reservation.md)
- [x] 105 [Release reserved stock on failed or cancelled payment](phase-18-hardening/105-release-reservation.md)
- [x] 106 [Test runner (Vitest) and first pricing tests](phase-18-hardening/106-vitest-setup.md)
- [x] 107 [Tests for coupons and stock reservation](phase-18-hardening/107-tests-coupons-inventory.md)
- [x] 108 [Admin order status updates (real D1 orders)](phase-18-hardening/108-admin-order-status.md)
- [x] 109 [Turn reserved stock into a stock decrease on ship; release on cancel](phase-18-hardening/109-deduct-stock-on-ship.md)
- [x] 110 [Customer order detail page `/account/orders/[id]`](phase-18-hardening/110-account-order-detail.md)
- [x] 111 [Open Graph and canonical URLs](phase-18-hardening/111-seo-og-canonical.md)
- [x] 112 [Product and Breadcrumb structured data](phase-18-hardening/112-seo-json-ld.md)
- [x] 113 [Rate limit login, register, orders, reviews and coupons](phase-18-hardening/113-rate-limit-auth-orders.md)
- [x] 114 [Realistic mock admin orders](phase-18-hardening/114-realistic-mock-orders.md)
- [x] 115 [Realistic mock customers and users](phase-18-hardening/115-realistic-mock-customers-users.md)
- [x] 116 [Finances calculated from the mock orders](phase-18-hardening/116-realistic-mock-finances.md)
- [x] 117 [Realistic mock tutorials, guides, docs and code examples](phase-18-hardening/117-realistic-mock-content.md)
- [x] 118 [Honest message for mock-backed admin saves](phase-18-hardening/118-honest-admin-save-message.md)

## Phase 19 — Admin catalog (real D1 writes)

Replace preview-only admin dialogs with real, ADMIN-guarded saves.

- [ ] 119 [Admin product create and edit (real D1 writes)](phase-19-admin-catalog/119-admin-product-crud.md)
- [ ] 120 [Product status: draft, published, archived](phase-19-admin-catalog/120-product-status-archive.md)
- [ ] 121 [Admin category create, edit and delete](phase-19-admin-catalog/121-admin-category-crud.md)
- [ ] 122 [Stock adjustments with reasons and movement history](phase-19-admin-catalog/122-stock-adjustments-history.md)
- [ ] 123 [Admin product image upload to R2](phase-19-admin-catalog/123-admin-image-upload-r2.md)
- [ ] 124 [Admin kits create and edit](phase-19-admin-catalog/124-admin-kit-crud.md)
- [ ] 125 [Admin robot projects create and edit](phase-19-admin-catalog/125-admin-project-crud.md)
- [ ] 126 [Admin orders search and filter](phase-19-admin-catalog/126-admin-orders-search-filter.md)

## Phase 20 — Accounts & auth

Account recovery and self-service. bKash stays the only payment method.

- [ ] 127 [Forgot and reset password](phase-20-accounts/127-forgot-reset-password.md)
- [ ] 128 [Email verification](phase-20-accounts/128-email-verification.md)
- [ ] 129 [Customer profile edit](phase-20-accounts/129-profile-edit.md)
- [ ] 130 [Customer cancels an order before it ships](phase-20-accounts/130-customer-cancel-order.md)
- [ ] 131 [Customer invoice download](phase-20-accounts/131-customer-invoice-download.md)
- [ ] 132 [Active sessions list and revoke](phase-20-accounts/132-active-sessions.md)
- [ ] 133 [Account deletion request](phase-20-accounts/133-account-deletion.md)

## Phase 21 — Storefront gaps

Browse, discovery and trust pages.

- [ ] 134 [Product listing pagination](phase-21-storefront/134-product-pagination.md)
- [ ] 135 [Brand filter](phase-21-storefront/135-brand-filter.md)
- [ ] 136 [Search autocomplete](phase-21-storefront/136-search-autocomplete.md)
- [ ] 137 [Recently viewed products](phase-21-storefront/137-recently-viewed.md)
- [ ] 138 [Subcategories](phase-21-storefront/138-subcategories.md)
- [ ] 139 [Product compare](phase-21-storefront/139-product-compare.md)
- [ ] 140 [Product questions and answers](phase-21-storefront/140-product-qa.md)
- [ ] 141 [Back-in-stock notifications](phase-21-storefront/141-back-in-stock.md)
- [ ] 142 [Policy, About and FAQ pages](phase-21-storefront/142-policy-pages.md)
- [ ] 143 [Homepage: new arrivals and bestsellers](phase-21-storefront/143-homepage-new-bestsellers.md)

## Phase 22 — Trust, staff & ops

Moderation, returns, staff permissions, audit and exports.

- [ ] 144 [Review moderation and verified purchase](phase-22-ops/144-review-moderation.md)
- [ ] 145 [Return and warranty requests](phase-22-ops/145-return-warranty-requests.md)
- [ ] 146 [Staff roles and permissions](phase-22-ops/146-staff-roles.md)
- [ ] 147 [Admin audit log](phase-22-ops/147-admin-audit-log.md)
- [ ] 148 [Admin two-factor authentication](phase-22-ops/148-admin-2fa.md)
- [ ] 149 [CSV export for orders, products and inventory](phase-22-ops/149-csv-export.md)
- [ ] 150 [Server error logging](phase-22-ops/150-error-logging.md)

## Out of scope for now

Not turned into tasks. Ask before planning these.

- **Payments:** Nagad, Rocket, cards, Cash on Delivery, bank transfer, gateway refunds, payment reconciliation, failed-payment retry
- **Delivery:** courier integrations (Pathao, Steadfast, RedX), zone/weight rates, tracking numbers, shipping labels, store pickup, split shipments
- **Later platform features:** AI assistants, multi-vendor marketplace, POS, multi-warehouse, loyalty/referrals, gift cards, subscriptions, page builder, SMS/WhatsApp marketing
