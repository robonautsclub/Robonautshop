// Makes Cloudflare Workers runtime types (D1Database, R2Bucket, Fetcher, ...)
// available globally without touching tsconfig's `types` array (which would
// otherwise stop auto-including @types/node, @types/react, etc.).
/// <reference types="@cloudflare/workers-types" />

// `CloudflareEnv` is declared (and left open for merging) by
// @opennextjs/cloudflare. `wrangler types` would normally extend it with the
// bindings from wrangler.jsonc, but that output is generated/gitignored (see
// README "Cloudflare deployment"), so typecheck doesn't depend on a codegen
// step having been run first. This merge is the checked-in source of truth
// instead — keep it in sync with wrangler.jsonc's `d1_databases`/`r2_buckets`.
declare global {
  interface CloudflareEnv {
    DB: D1Database;
    PRODUCT_IMAGES: R2Bucket;
  }
}

export {};
