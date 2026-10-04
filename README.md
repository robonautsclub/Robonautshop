# Robonautshop

Robotics parts, kits, and project guides for builders in Bangladesh. The catalog, cart, accounts, and checkout are not built yet.

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

Copy `.env.example` to `.env.local` when a later task needs secrets. Do not commit `.env.local`.

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

### Database (D1 + Drizzle)

- Schema: `lib/db/schema.ts`. No domain tables yet — those are added one at a time in `tasks/phase-11-database`.
- Client: `createDb(d1)` in `lib/db/index.ts`, called with `env.DB` inside a request.

```bash
pnpm db:generate         # diff lib/db/schema.ts and write a new SQL file into migrations/
pnpm db:migrate:local    # apply pending migrations to the local D1 database
pnpm db:migrate:remote   # apply pending migrations to the real, deployed D1 database
```

`migrations/` (including `migrations/meta/`) is committed — it's Drizzle's and Wrangler's shared source of truth for schema history, never hand-edited.

### Object storage (R2)

The `PRODUCT_IMAGES` R2 bucket (`robonautshop-product-images`) is bound for future product images. No upload code exists yet — product image metadata/upload flow is a later task (see AGENTS.md "Product images").

### API

`lib/api/app.ts` is a small [Hono](https://hono.dev) app mounted at `/api` via `app/api/[[...route]]/route.ts`, running in the same Worker as the rest of the app. `GET /api/health` and `GET /api/health/db` exist today as infrastructure smoke checks; business routes (products, categories, ...) are added per-resource in later tasks.

Later work is split into small prompts in [`tasks/README.md`](tasks/README.md).
