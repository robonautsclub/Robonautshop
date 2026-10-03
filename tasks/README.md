# Robonautshop — Task Prompts

Small, independent prompts for building the robotics parts store. Give an agent **one file at a time**. Do not start the next task until the current one is done and you ask for it.

Checked items are implemented. Unchecked items are not.

**Store name:** Robonautshop

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

- [ ] 33 [Robot Builder entry](phase-06-robot-builder/33-builder-entry.md)
- [ ] 34 [Skill level selection](phase-06-robot-builder/34-skill-level.md)
- [ ] 35 [Builder component requirements](phase-06-robot-builder/35-builder-components.md)
- [ ] 36 [Builder price calculation](phase-06-robot-builder/36-builder-price.md)
- [ ] 37 [Builder stock validation UI](phase-06-robot-builder/37-builder-stock.md)
- [ ] 38 [Add complete kit](phase-06-robot-builder/38-complete-kit.md)
- [ ] 39 [Customize kit UI](phase-06-robot-builder/39-customize-kit.md)

## Phase 7 — Auth UI shells

UI only. Do not fake successful signup/login unless real auth is already wired.

- [ ] 40 [Registration UI shell](phase-07-auth-shells/40-registration-ui.md)
- [ ] 41 [Login UI shell](phase-07-auth-shells/41-login-ui.md)
- [ ] 42 [Account page shell](phase-07-auth-shells/42-account-shell.md)
- [ ] 43 [Addresses UI shell](phase-07-auth-shells/43-addresses-ui.md)
- [ ] 44 [Auth nav states](phase-07-auth-shells/44-auth-nav-states.md)

## Phase 8 — Checkout UI shells

No real payments or order persistence.

- [ ] 45 [Checkout page shell](phase-08-checkout-shells/45-checkout-shell.md)
- [ ] 46 [Checkout address UI](phase-08-checkout-shells/46-checkout-address-ui.md)
- [ ] 47 [Shipping estimate UI](phase-08-checkout-shells/47-shipping-estimate-ui.md)
- [ ] 48 [Payment method UI](phase-08-checkout-shells/48-payment-method-ui.md)
- [ ] 49 [Order confirmation shell](phase-08-checkout-shells/49-order-confirmation-shell.md)

## Phase 9 — Admin UI shells

UI shells over mock/static data. Real ADMIN auth comes in Phase 12.

- [ ] 50 [Admin layout and dashboard shell](phase-09-admin-shells/50-admin-layout.md)
- [ ] 51 [Admin products shell](phase-09-admin-shells/51-admin-products-shell.md)
- [ ] 52 [Admin categories shell](phase-09-admin-shells/52-admin-categories-shell.md)
- [ ] 53 [Admin inventory shell](phase-09-admin-shells/53-admin-inventory-shell.md)
- [ ] 54 [Admin orders shell](phase-09-admin-shells/54-admin-orders-shell.md)
- [ ] 55 [Admin customers shell](phase-09-admin-shells/55-admin-customers-shell.md)
- [ ] 56 [Admin kits shell](phase-09-admin-shells/56-admin-kits-shell.md)
- [ ] 57 [Admin robot projects shell](phase-09-admin-shells/57-admin-projects-shell.md)

---

# Deferred — backend and beyond

Do not start these until Phases 2–9 are done (unless you explicitly change strategy).

## Phase 10 — Cloudflare backend

- [ ] 58 [Configure Cloudflare](phase-10-backend-cloudflare/58-configure-cloudflare.md)
- [ ] 59 [Configure Workers](phase-10-backend-cloudflare/59-configure-workers.md)
- [ ] 60 [Configure D1](phase-10-backend-cloudflare/60-configure-d1.md)
- [ ] 61 [Configure Drizzle](phase-10-backend-cloudflare/61-configure-drizzle.md)
- [ ] 62 [Create first migration](phase-10-backend-cloudflare/62-create-first-migration.md)
- [ ] 63 [Test database connection](phase-10-backend-cloudflare/63-test-database-connection.md)
- [ ] 64 [Configure R2](phase-10-backend-cloudflare/64-configure-r2.md)

## Phase 11 — Database schema

- [ ] 65 [Users schema](phase-11-database/65-users.md)
- [ ] 66 [Categories schema](phase-11-database/66-categories.md)
- [ ] 67 [Products schema](phase-11-database/67-products.md)
- [ ] 68 [Product variants schema](phase-11-database/68-product-variants.md)
- [ ] 69 [Inventory schema](phase-11-database/69-inventory.md)
- [ ] 70 [Product images schema](phase-11-database/70-product-images.md)
- [ ] 71 [Robot projects schema](phase-11-database/71-robot-projects.md)
- [ ] 72 [Project components schema](phase-11-database/72-project-components.md)
- [ ] 73 [Kits schema](phase-11-database/73-kits.md)
- [ ] 74 [Kit components schema](phase-11-database/74-kit-components.md)

## Phase 12 — Wire UI to backend

- [ ] 75 [Replace mock catalog with D1](phase-12-wire-up/75-replace-mock-catalog.md)
- [ ] 76 [Seed database from faker catalog](phase-12-wire-up/76-seed-from-faker.md)
- [ ] 77 [Wire real authentication](phase-12-wire-up/77-real-auth.md)
- [ ] 78 [Server cart and order creation](phase-12-wire-up/78-real-cart-orders.md)
- [ ] 79 [Admin route protection](phase-12-wire-up/79-admin-protection.md)

## Phase 13 — Content

- [ ] 80 [Tutorials](phase-13-content/80-tutorials.md)
- [ ] 81 [Robot guides](phase-13-content/81-robot-guides.md)
- [ ] 82 [Documentation](phase-13-content/82-documentation.md)
- [ ] 83 [Datasheets](phase-13-content/83-datasheets.md)
- [ ] 84 [Code examples](phase-13-content/84-code-examples.md)

## Phase 14 — Advanced

- [ ] 85 [Reviews](phase-14-advanced/85-reviews.md)
- [ ] 86 [Wishlist](phase-14-advanced/86-wishlist.md)
- [ ] 87 [Coupons](phase-14-advanced/87-coupons.md)
- [ ] 88 [Recommendations](phase-14-advanced/88-recommendations.md)
- [ ] 89 [Advanced search](phase-14-advanced/89-advanced-search.md)
- [ ] 90 [Analytics](phase-14-advanced/90-analytics.md)
- [ ] 91 [Email notifications](phase-14-advanced/91-email-notifications.md)
- [ ] 92 [Abandoned carts](phase-14-advanced/92-abandoned-carts.md)
- [ ] 93 [Inventory alerts](phase-14-advanced/93-inventory-alerts.md)
