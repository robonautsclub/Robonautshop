"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  readSessionUser,
  signInOrCreateAccount,
  signOutLocal,
  type SignInResult,
} from "@/lib/auth/mock-auth-storage";
import {
  emailToDisplayName,
  type MockSessionUser,
} from "@/lib/auth/mock-auth-types";

type AuthContextValue = {
  hydrated: boolean;
  user: MockSessionUser | null;
  isSignedIn: boolean;
  signIn: (input: {
    email: string;
    password: string;
    name?: string;
  }) => SignInResult;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockSessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setUser(readSessionUser());
      setHydrated(true);
    });
  }, []);

  const signIn = useCallback(
    (input: { email: string; password: string; name?: string }) => {
      const result = signInOrCreateAccount({
        email: input.email,
        password: input.password,
        name: input.name ?? emailToDisplayName(input.email),
      });

      if (result.ok) {
        setUser(result.user);
      }

      return result;
    },
    [],
  );

  const signOut = useCallback(() => {
    signOutLocal();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      hydrated,
      user,
      isSignedIn: Boolean(user),
      signIn,
      signOut,
    }),
    [hydrated, user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
