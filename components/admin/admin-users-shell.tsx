"use client";

import { useState } from "react";

import { AdminDeleteTrigger } from "@/components/admin/admin-confirm-delete-dialog";
import {
  AdminField,
  AdminFormDialog,
  fieldClassName,
} from "@/components/admin/admin-form-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminPagination,
  useAdminPagination,
} from "@/components/admin/admin-pagination";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTableToolbarSearch,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import {
  ADMIN_ROLE_MATRIX,
  type AdminUser,
  type AdminUserRole,
} from "@/lib/admin";

function roleTone(role: AdminUserRole) {
  if (role === "SUPER_ADMIN") return "danger" as const;
  if (role === "ADMIN") return "warning" as const;
  if (role === "STORE_MANAGER") return "success" as const;
  return "neutral" as const;
}

export function AdminUsersShell({
  users: initialUsers,
}: {
  users: AdminUser[];
}) {
  const [rows, setRows] = useState(initialUsers);
  const [showCreate, setShowCreate] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const pagination = useAdminPagination(rows, 20);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description={`${rows.length} users · Delete always asks for confirmation.`}
        actions={
          <Button type="button" size="sm" onClick={() => setShowCreate(true)}>
            Invite user
          </Button>
        }
        toolbar={
          <>
            <AdminTableToolbarSearch placeholder="Search users" />
            <p className="text-xs text-muted-foreground">
              Manage staff accounts and roles.
            </p>
          </>
        }
      />

      <section className="rounded-xl border bg-muted/20 p-4">
        <h2 className="text-sm font-semibold tracking-tight">Role matrix</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {ADMIN_ROLE_MATRIX.map((entry) => (
            <li key={entry.role} className="rounded-lg border bg-background p-3">
              <AdminStatusBadge tone={roleTone(entry.role)}>
                {entry.label}
              </AdminStatusBadge>
              <p className="mt-2 text-sm text-muted-foreground">
                {entry.access}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Name</AdminTh>
          <AdminTh>Email</AdminTh>
          <AdminTh>Role</AdminTh>
          <AdminTh>Status</AdminTh>
          <AdminTh>Joined</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody>
          {pagination.pageItems.map((user) => (
            <tr key={user.id} className="hover:bg-muted/30">
              <AdminTd>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.id}</p>
                </div>
              </AdminTd>
              <AdminTd className="break-all">{user.email}</AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={roleTone(user.role)}>
                  {user.role}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge
                  tone={user.status === "ACTIVE" ? "success" : "neutral"}
                >
                  {user.status}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd>
                {new Date(user.createdAt).toLocaleDateString()}
              </AdminTd>
              <AdminTd className="text-right">
                <AdminDeleteTrigger
                  itemLabel={`the user “${user.name}”`}
                  title="Delete user?"
                  description={`Are you sure you want to delete “${user.name}”? This removes it from the list.`}
                  buttonLabel="Delete"
                  buttonVariant="destructive"
                  onConfirm={() => {
                    setRows((current) =>
                      current.filter((row) => row.id !== user.id),
                    );
                    setStatus(
                      `“${user.name}” was removed.`,
                    );
                  }}
                />
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      <AdminPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}

      <AdminFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Invite user"
        noun="user"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField id="admin-user-name" label="Name">
            <input
              id="admin-user-name"
              name="name"
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-user-email" label="Email">
            <input
              id="admin-user-email"
              name="email"
              type="email"
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-user-role" label="Role">
            <select
              id="admin-user-role"
              name="role"
              defaultValue="STORE_MANAGER"
              className={fieldClassName()}
            >
              {ADMIN_ROLE_MATRIX.map((entry) => (
                <option key={entry.role} value={entry.role}>
                  {entry.label}
                </option>
              ))}
            </select>
          </AdminField>
        </div>
      </AdminFormDialog>
    </div>
  );
}
