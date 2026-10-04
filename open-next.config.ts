import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Base configuration for deploying this Next.js app to Cloudflare Workers.
// D1, R2, and KV-backed overrides (incremental cache, tag cache, queue) are
// added in later tasks once those bindings exist (see tasks/phase-10-backend-cloudflare).
export default defineCloudflareConfig();
