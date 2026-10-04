import { getCloudflareContext } from "@opennextjs/cloudflare";

import { app } from "@/lib/api/app";

// Mounts the Hono app (lib/api/app.ts) as the Workers API entry point.
// Next.js resolves more specific routes (e.g. app/api/auth/[...all]) before
// falling back to this optional catch-all, so existing routes are unaffected.
async function handle(request: Request) {
  const { env, ctx } = await getCloudflareContext({ async: true });
  return app.fetch(request, env, ctx);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
