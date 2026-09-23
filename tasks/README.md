# Robonautshop — Task Prompts

Small, independent prompts for building the robotics parts store. Give an agent **one file at a time**. Do not start the next task until the current one is done and you ask for it.

Checked items are implemented. Unchecked items are not.

**Store name:** Robonautshop

## Rules for every task

1. Inspect the existing project first.
2. Do not rewrite working architecture.
3. Implement only that task.
4. Use TypeScript. Keep components reusable. Do not duplicate code. Avoid extra dependencies.
5. Never hard-code secrets. Use environment variables.
6. Never create fake functionality that looks like it works.
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

## Phase 2 — Cloudflare

- [ ] 11 [Configure Cloudflare](phase-02-cloudflare/11-configure-cloudflare.md)
- [ ] 12 [Configure Workers](phase-02-cloudflare/12-configure-workers.md)
- [ ] 13 [Configure D1](phase-02-cloudflare/13-configure-d1.md)
- [ ] 14 [Configure Drizzle](phase-02-cloudflare/14-configure-drizzle.md)
- [ ] 15 [Create first migration](phase-02-cloudflare/15-create-first-migration.md)
- [ ] 16 [Test database connection](phase-02-cloudflare/16-test-database-connection.md)
- [ ] 17 [Configure R2](phase-02-cloudflare/17-configure-r2.md)

## Phase 3 — Database

- [ ] 18 [Users](phase-03-database/18-users.md)
- [ ] 19 [Categories](phase-03-database/19-categories.md)
- [ ] 20 [Products](phase-03-database/20-products.md)
- [ ] 21 [Product variants](phase-03-database/21-product-variants.md)
- [ ] 22 [Inventory](phase-03-database/22-inventory.md)
- [ ] 23 [Product images](phase-03-database/23-product-images.md)
- [ ] 24 [Robot projects](phase-03-database/24-robot-projects.md)
- [ ] 25 [Project components](phase-03-database/25-project-components.md)
- [ ] 26 [Kits](phase-03-database/26-kits.md)
- [ ] 27 [Kit components](phase-03-database/27-kit-components.md)

## Phase 4 — Storefront

- [ ] 28 [Homepage](phase-04-storefront/28-homepage.md)
- [ ] 29 [Product listing](phase-04-storefront/29-product-listing.md)
- [ ] 30 [Category pages](phase-04-storefront/30-category-pages.md)
- [ ] 31 [Product detail](phase-04-storefront/31-product-detail.md)
- [ ] 32 [Search](phase-04-storefront/32-search.md)
- [ ] 33 [Filters](phase-04-storefront/33-filters.md)
- [ ] 34 [Sorting](phase-04-storefront/34-sorting.md)
- [ ] 35 [Related products](phase-04-storefront/35-related-products.md)

## Phase 5 — Cart

- [ ] 36 [Cart](phase-05-cart/36-cart.md)
- [ ] 37 [Add and remove products](phase-05-cart/37-add-remove-products.md)
- [ ] 38 [Quantity](phase-05-cart/38-quantity.md)
- [ ] 39 [Cart calculations](phase-05-cart/39-cart-calculations.md)
- [ ] 40 [Persistent cart](phase-05-cart/40-persistent-cart.md)

## Phase 6 — Authentication

- [ ] 41 [Customer registration](phase-06-authentication/41-customer-registration.md)
- [ ] 42 [Login](phase-06-authentication/42-login.md)
- [ ] 43 [Google login](phase-06-authentication/43-google-login.md)
- [ ] 44 [Account page](phase-06-authentication/44-account-page.md)
- [ ] 45 [Addresses](phase-06-authentication/45-addresses.md)
- [ ] 46 [Authentication protection](phase-06-authentication/46-authentication-protection.md)

## Phase 7 — Checkout

- [ ] 47 [Checkout](phase-07-checkout/47-checkout.md)
- [ ] 48 [Address selection](phase-07-checkout/48-address-selection.md)
- [ ] 49 [Shipping calculation](phase-07-checkout/49-shipping-calculation.md)
- [ ] 50 [Payment abstraction](phase-07-checkout/50-payment-abstraction.md)
- [ ] 51 [Cash on delivery](phase-07-checkout/51-cash-on-delivery.md)
- [ ] 52 [Online payment integration](phase-07-checkout/52-online-payment-integration.md)
- [ ] 53 [Order creation](phase-07-checkout/53-order-creation.md)
- [ ] 54 [Order confirmation](phase-07-checkout/54-order-confirmation.md)

## Phase 8 — Orders

- [ ] 55 [Customer orders](phase-08-orders/55-customer-orders.md)
- [ ] 56 [Order details](phase-08-orders/56-order-details.md)
- [ ] 57 [Order status](phase-08-orders/57-order-status.md)
- [ ] 58 [Admin order management](phase-08-orders/58-admin-order-management.md)
- [ ] 59 [Shipping management](phase-08-orders/59-shipping-management.md)

## Phase 9 — Admin

- [ ] 60 [Admin dashboard](phase-09-admin/60-admin-dashboard.md)
- [ ] 61 [Product management](phase-09-admin/61-product-management.md)
- [ ] 62 [Category management](phase-09-admin/62-category-management.md)
- [ ] 63 [Inventory management](phase-09-admin/63-inventory-management.md)
- [ ] 64 [Order management](phase-09-admin/64-order-management.md)
- [ ] 65 [Customer management](phase-09-admin/65-customer-management.md)
- [ ] 66 [Kit management](phase-09-admin/66-kit-management.md)
- [ ] 67 [Robot project management](phase-09-admin/67-robot-project-management.md)

## Phase 10 — Robot Builder

- [ ] 68 [Project listing](phase-10-robot-builder/68-project-listing.md)
- [ ] 69 [Project detail](phase-10-robot-builder/69-project-detail.md)
- [ ] 70 [Component requirements](phase-10-robot-builder/70-component-requirements.md)
- [ ] 71 [Automatic price calculation](phase-10-robot-builder/71-automatic-price-calculation.md)
- [ ] 72 [Stock validation](phase-10-robot-builder/72-stock-validation.md)
- [ ] 73 [Complete kit](phase-10-robot-builder/73-complete-kit.md)
- [ ] 74 [Customize kit](phase-10-robot-builder/74-customize-kit.md)

## Phase 11 — Content

- [ ] 75 [Tutorials](phase-11-content/75-tutorials.md)
- [ ] 76 [Robot guides](phase-11-content/76-robot-guides.md)
- [ ] 77 [Documentation](phase-11-content/77-documentation.md)
- [ ] 78 [Datasheets](phase-11-content/78-datasheets.md)
- [ ] 79 [Code examples](phase-11-content/79-code-examples.md)

## Phase 12 — Advanced

- [ ] 80 [Reviews](phase-12-advanced/80-reviews.md)
- [ ] 81 [Wishlist](phase-12-advanced/81-wishlist.md)
- [ ] 82 [Coupons](phase-12-advanced/82-coupons.md)
- [ ] 83 [Recommendations](phase-12-advanced/83-recommendations.md)
- [ ] 84 [Advanced search](phase-12-advanced/84-advanced-search.md)
- [ ] 85 [Analytics](phase-12-advanced/85-analytics.md)
- [ ] 86 [Email notifications](phase-12-advanced/86-email-notifications.md)
- [ ] 87 [Abandoned carts](phase-12-advanced/87-abandoned-carts.md)
- [ ] 88 [Inventory alerts](phase-12-advanced/88-inventory-alerts.md)
