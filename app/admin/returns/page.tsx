import { AdminReturnsShell } from "@/components/admin/admin-returns-shell";
import { getRequestDb } from "@/lib/db/request";
import { listReturnRequestsForAdmin } from "@/lib/returns/queries";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  const db = await getRequestDb();
  return <AdminReturnsShell requests={await listReturnRequestsForAdmin(db)} />;
}
