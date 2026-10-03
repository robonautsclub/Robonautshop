export type MockUser = {
  id: string;
  name: string;
  email: string;
  /** Demo-only local password. Not for production. */
  password: string;
  createdAt: string;
};

export type MockSessionUser = {
  id: string;
  name: string;
  email: string;
};

export const MOCK_USERS_KEY = "robonautshop.mock-users.v1";
export const MOCK_SESSION_KEY = "robonautshop.mock-session.v1";

export function emailToDisplayName(email: string): string {
  const local = email.split("@")[0] ?? "Customer";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim() || "Customer";
}
