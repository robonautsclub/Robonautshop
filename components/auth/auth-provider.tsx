"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { authClient } from "@/lib/auth/client";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  /** CUSTOMER | ADMIN — see lib/db/schema/users.ts. Authorization must still be checked server-side. */
  role: "CUSTOMER" | "ADMIN";
};

export type SignInResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  /** False until the first session check (local or server) has resolved. */
  hydrated: boolean;
  user: SessionUser | null;
  isSignedIn: boolean;
  signIn: (input: { email: string; password: string }) => Promise<SignInResult>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();

  const signIn = useCallback(
    async (input: { email: string; password: string }): Promise<SignInResult> => {
      const { error } = await authClient.signIn.email({
        email: input.email,
        password: input.password,
      });

      if (error) {
        return {
          ok: false,
          error: error.message ?? "Could not sign in with that email and password.",
        };
      }

      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(() => {
    void authClient.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = data?.user ?? null;
    // The generic authClient isn't typed against our server's additional
    // `role` field (see lib/auth/server.ts), but the API always returns it.
    const role = (user as { role?: "CUSTOMER" | "ADMIN" } | null)?.role ?? "CUSTOMER";

    return {
      hydrated: !isPending,
      user: user
        ? { id: user.id, name: user.name, email: user.email, image: user.image ?? null, role }
        : null,
      isSignedIn: Boolean(user),
      signIn,
      signOut,
    };
  }, [data, isPending, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
