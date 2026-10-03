import { AdminUsersShell } from "@/components/admin/admin-users-shell";
import { listAdminUsers } from "@/lib/admin";

export default function AdminUsersPage() {
  return <AdminUsersShell users={listAdminUsers()} />;
}
