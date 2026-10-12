"use client";

import { type FormEvent, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { useAdminSave } from "@/components/admin/use-admin-save";
import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import type { BackOfficeUser } from "@/lib/admin/user-roles";
import { assignUserRoleAction } from "@/lib/admin/user-actions";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/auth/permissions";
import { USER_ROLE_VALUES, type UserRole } from "@/lib/db/schema/shared";

function roleTone(role: UserRole) {
  if (role === "ADMIN") return "danger" as const;
  if (role === "CUSTOMER") return "neutral" as const;
  return "success" as const;
}

type AdminUsersShellProps = {
  users: BackOfficeUser[];
  currentUserId: string;
};

/** Back-office accounts and role assignment, backed by real D1 writes (task 146). */
export function AdminUsersShell({ users, currentUserId }: AdminUsersShellProps) {
  const save = useAdminSave();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("STAFF");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await save.run(
      () => assignUserRoleAction({ email, role }),
      `Set ${email} to ${ROLE_LABELS[role]}.`,
    );
    if (result?.ok) setEmail("");
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description={`${users.length} back-office accounts. Roles are enforced on the server for every admin page and action.`}
      />

      <section className="rounded-xl border bg-muted/20 p-4">
        <h2 className="text-sm font-semibold tracking-tight">Roles</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {USER_ROLE_VALUES.map((entry) => (
            <li key={entry} className="rounded-lg border bg-background p-3">
              <AdminStatusBadge tone={roleTone(entry)}>{ROLE_LABELS[entry]}</AdminStatusBadge>
              <p className="mt-2 text-sm text-muted-foreground">{ROLE_DESCRIPTIONS[entry]}</p>
            </li>
          ))}
        </ul>
      </section>

      <form className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_14rem_auto] sm:items-end" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="assign-email" className="text-xs font-medium">
            Account email
          </label>
          <input
            id="assign-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="person@example.com"
            className={fieldClassName()}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="assign-role" className="text-xs font-medium">
            Role
          </label>
          <select
            id="assign-role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className={fieldClassName()}
          >
            {USER_ROLE_VALUES.map((entry) => (
              <option key={entry} value={entry}>
                {ROLE_LABELS[entry]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={save.pending}>
          {save.pending ? "Saving…" : "Assign role"}
        </Button>
        <p className="text-xs text-muted-foreground sm:col-span-3">
          The person must already have a registered, email-verified account with a password. Choose
          “Customer” to remove back-office access.
        </p>
      </form>

      {save.error ? (
        <p className="text-sm text-destructive" role="alert">
          {save.error}
        </p>
      ) : null}
      {save.status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {save.status}
        </p>
      ) : null}

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Name</AdminTh>
          <AdminTh>Email</AdminTh>
          <AdminTh>Role</AdminTh>
          <AdminTh>Joined</AdminTh>
        </AdminTableHead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/30">
              <AdminTd className="font-medium">
                {user.name}
                {user.id === currentUserId ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">You</span>
                ) : null}
              </AdminTd>
              <AdminTd className="break-all">{user.email}</AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={roleTone(user.role)}>{ROLE_LABELS[user.role]}</AdminStatusBadge>
              </AdminTd>
              <AdminTd>{new Date(user.createdAt).toLocaleDateString()}</AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
