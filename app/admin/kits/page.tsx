import { AdminKitsShell } from "@/components/admin/admin-kits-shell";
import { listAdminKits } from "@/lib/admin";

export default function AdminKitsPage() {
  return <AdminKitsShell kits={listAdminKits()} />;
}
