# Robonautshop

Robotics parts, kits, and project guides for builders in Bangladesh. Catalog, cart, auth, checkout, and orders are wired to a real Cloudflare D1 database. **bKash Checkout (URL)** is integrated for online payment; Nagad and other providers are not yet. The admin dashboard is still UI shells over real catalog data (see "Admin" below).

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
pnpm lint
pnpm typecheck
```

Copy `.env.example` to `.env` and fill in `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` before running auth-dependent features locally. For bKash Checkout, also set the `BKASH_CHECKOUT_URL_*` variables. For transactional email (welcome + order confirmation), set `RESEND_API_KEY` to your real Resend API key (replace any `re_xxxxxxxxx` placeholder) and optionally `RESEND_FROM_EMAIL`. Do not commit `.env` or `.env.local`.

## Cloudflare deployment

The app deploys to Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). Local `pnpm dev` is unaffected — it still runs the plain Next.js dev server.

```bash
pnpm cf:build     # build the Next.js app and bundle it for Workers (.open-next/)
pnpm cf:preview   # build, then run the Worker locally with Wrangler
pnpm cf:deploy    # build, then deploy to Cloudflare
pnpm cf:typegen   # regenerate cloudflare-env.d.ts from wrangler.jsonc + bound env vars
```

Config lives in `wrangler.jsonc` (Worker name, compatibility date/flags, static assets, D1/R2 bindings) and `open-next.config.ts` (OpenNext build options). Secrets for the deployed Worker are set with `wrangler secret put <NAME>`, never committed.

Local `next dev` also gets local versions of these bindings (D1, R2, ...), via `initOpenNextCloudflareForDev()` in `next.config.ts` — no extra setup needed.

Every storefront and admin page reads from D1 at request time, so these routes render dynamically (`export const dynamic = "force-dynamic"` on the `(store)` and `admin` layouts) rather than being statically prerendered at build time — D1 bindings aren't available during `next build`.

### Database (D1 + Drizzle)

- Schema: `lib/db/schema/` — one file per table (`users`, `categories`, `products`, `product-variants`, `inventory`, `product-images`, `robot-projects`, `project-components`, `kits`, `kit-components`, `cart-items`, `orders`, `order-items`, `user_addresses`, `bkash_tokens`, `bkash_pending_payments`, plus the infra-only `health`), re-exported from `index.ts`. The catalog tables mirror the frontend types in `lib/catalog/types.ts`.
- Client: `createDb(d1)` in `lib/db/index.ts`; `getRequestDb()` in `lib/db/request.ts` is the one place server code (Server Components, Server Actions) gets a request-bound instance.
- `lib/catalog/queries.ts` is the one D1-backed catalog read layer — storefront pages and the admin dashboard both go through it (`lib/admin/catalog.ts` wraps it for admin-only views that include DRAFT/ARCHIVED rows).

```bash
pnpm db:generate         # diff lib/db/schema/ and write a new SQL file into migrations/
pnpm db:migrate:local    # apply pending migrations to the local D1 database
pnpm db:migrate:remote   # apply pending migrations to the real, deployed D1 database
pnpm db:seed:local       # regenerate + apply the Faker catalog as dev seed data (local D1)
pnpm db:seed:remote      # same, against the deployed D1 — development data only
```

`migrations/` (including `migrations/meta/`) is committed — it's Drizzle's and Wrangler's shared source of truth for schema history, never hand-edited. `.seed/` (generated SQL) is gitignored and regenerated on demand.

### Auth (Better Auth + D1)

- `lib/auth/server.ts`: `getAuth()` builds a Better Auth instance per request (it needs the request-bound D1 client), backed by the `users`/`sessions`/`accounts`/`verifications` tables via `@better-auth/drizzle-adapter`. Email/password is always on; Google/Microsoft are registered only when their client id/secret env vars are set.
- `lib/auth/client.ts` / `components/auth/auth-provider.tsx`: the browser-side session (`useAuth()`), backed by real Better Auth sessions — no mock localStorage auth remains.
- **Two separate login pages**: `/login` is admin-only (email/password, no OAuth); `/user/login` is for customers (email/password + Google + Microsoft). The storefront "Sign in" link always points at `/user/login`.
- `lib/auth/session.ts`: `getServerSession()` (any valid session) and `requireAdminSession()` (session + `role === "ADMIN"`, else redirects to `/login` or 403s via `app/forbidden.tsx`) — the one place route guards live. Used by the `/account`, `/checkout`, and `/admin` layouts.
- `pnpm admin:bootstrap` (`scripts/bootstrap-admin.ts`) creates or promotes an `ADMIN` user locally from `ADMIN_BOOTSTRAP_EMAIL`/`ADMIN_BOOTSTRAP_PASSWORD` env vars — see the script's header comment for the documented remote-database procedure (sign up normally in production, then promote with a `wrangler d1 execute --remote` SQL update).

### Cart and orders

- Guests: cart lines live in `localStorage` only (`lib/cart/`).
- Signed-in customers: the cart is server-owned, persisted in D1 against the user's id (`lib/server-cart/`), loaded/saved through Server Actions (`lib/server-cart/actions.ts`).
- On customer sign-in, any guest cart lines are merged into the server cart (same quantities-sum rule either way — `mergeCartLines()` in `lib/cart/calculations.ts`); admin sessions never get a cart of their own.
- Placing an order (`placeOrderAction`) re-reads the server cart and re-validates every line's price and stock straight from D1 — nothing from the client is trusted for money or availability. Orders (`orders` + `order_items`) have separate `status` and `paymentStatus` columns. Shipping addresses used at checkout are upserted into `user_addresses`; `/account/orders` lists the customer's real orders.
- **bKash Checkout (URL)** (`lib/payments/bkash/`): when the customer chooses bKash, the server validates the cart and calls Create Payment (`mode: "0011"`). Checkout details are staged in `bkash_pending_payments` until the callback. Success runs Execute Payment and writes a `PAID` order. Failure/cancel persists an unpaid order (`paymentStatus` `FAILED` / `CANCELLED`) so the customer can **Pay again with bKash** from `/account/orders` (prices/stock re-validated server-side).
- COD and Nagad still create orders immediately without a live payment redirect (Nagad remains a placeholder). Order confirmation email (and welcome email on signup) send via Resend when `RESEND_API_KEY` is set (`lib/email/`).

### Object storage (R2)

The `PRODUCT_IMAGES` R2 bucket (`robonautshop-product-images`) is bound for future product images. No upload code exists yet — product image metadata/upload flow is a later task (see AGENTS.md "Product images").

### API

`lib/api/app.ts` is a small [Hono](https://hono.dev) app mounted at `/api` via `app/api/[[...route]]/route.ts`, running in the same Worker as the rest of the app. `GET /api/health` and `GET /api/health/db` exist today as infrastructure smoke checks; business routes (products, categories, ...) are added per-resource in later tasks.

Later work is split into small prompts in [`tasks/README.md`](tasks/README.md).
