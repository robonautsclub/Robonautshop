import { sentinelClient } from "@better-auth/infra/client";
import { twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * The one authoritative Better Auth client. Uses the `better-auth/react`
 * entry point (not the plain `better-auth/client`) so it also exposes the
 * `useSession()` hook used by AuthProvider — see
 * components/auth/auth-provider.tsx.
 */
export const authClient = createAuthClient({
  plugins: [sentinelClient(), twoFactorClient()],
});
