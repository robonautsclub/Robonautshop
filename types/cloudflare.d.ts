// Makes Cloudflare Workers runtime types (D1Database, R2Bucket, Fetcher, ...)
// available globally without touching tsconfig's `types` array (which would
// otherwise stop auto-including @types/node, @types/react, etc.).
/// <reference types="@cloudflare/workers-types" />
