import { toNextJsHandler } from "better-auth/next-js";

import { getAuth } from "@/lib/auth/server";

// `getAuth()` builds a fresh Better Auth instance per call because it needs
// the request-bound D1 client (see lib/auth/server.ts) — toNextJsHandler
// accepts a plain (request) => Promise<Response> function for exactly this
// case, so every method still resolves the current request's auth instance.
export const { GET, POST, PATCH, PUT, DELETE } = toNextJsHandler(
  async (request: Request) => {
    const auth = await getAuth();
    return auth.handler(request);
  },
);
