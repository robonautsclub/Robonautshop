import { AdminUsersShell } from "@/components/admin/admin-users-shell";
import { listBackOfficeUsers } from "@/lib/admin/user-roles";
import { requirePermission } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await requirePermission("users.manage");
  const db = await getRequestDb();
  return <AdminUsersShell users={await listBackOfficeUsers(db)} currentUserId={session.user.id} />;
}
