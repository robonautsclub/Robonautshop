import {
  MOCK_SESSION_KEY,
  MOCK_USERS_KEY,
  type MockSessionUser,
  type MockUser,
} from "@/lib/auth/mock-auth-types";

function readUsers(): MockUser[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(MOCK_USERS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((user): user is MockUser => {
      if (!user || typeof user !== "object") {
        return false;
      }

      const record = user as Record<string, unknown>;
      return (
        typeof record.id === "string" &&
        typeof record.name === "string" &&
        typeof record.email === "string" &&
        typeof record.password === "string"
      );
    });
  } catch {
    return [];
  }
}

function writeUsers(users: MockUser[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export function readSessionUser(): MockSessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(MOCK_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as MockSessionUser;
    if (
      !parsed ||
      typeof parsed.id !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeSessionUser(user: MockSessionUser | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(MOCK_SESSION_KEY);
    return;
  }

  window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
}

export type SignInResult =
  | { ok: true; user: MockSessionUser; created: boolean }
  | { ok: false; error: string };

/**
 * Local demo auth (no backend):
 * - New email → create account and sign in
 * - Existing email + correct password → sign in
 * - Existing email + wrong password → remain signed out
 */
export function signInOrCreateAccount(input: {
  email: string;
  password: string;
  name?: string;
}): SignInResult {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const users = readUsers();
  const existing = users.find((user) => user.email.toLowerCase() === email);

  if (!existing) {
    const created: MockUser = {
      id: crypto.randomUUID(),
      name: input.name?.trim() || email.split("@")[0] || "Customer",
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    writeUsers([...users, created]);
    const sessionUser = {
      id: created.id,
      name: created.name,
      email: created.email,
    };
    writeSessionUser(sessionUser);
    return { ok: true, user: sessionUser, created: true };
  }

  if (existing.password !== password) {
    return {
      ok: false,
      error: "Incorrect password for this account. You are not signed in.",
    };
  }

  const sessionUser = {
    id: existing.id,
    name: existing.name,
    email: existing.email,
  };
  writeSessionUser(sessionUser);
  return { ok: true, user: sessionUser, created: false };
}

export function signOutLocal(): void {
  writeSessionUser(null);
}
