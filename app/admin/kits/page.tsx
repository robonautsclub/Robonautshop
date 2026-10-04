import { AdminKitsShell } from "@/components/admin/admin-kits-shell";
import { listAdminKits, listAdminProductOptions } from "@/lib/admin";
import { getKitComponentsForKits } from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";

export default async function AdminKitsPage() {
  const db = await getRequestDb();
  const kits = await listAdminKits(db);
  const [productOptions, kitComponents] = await Promise.all([
    listAdminProductOptions(db),
    getKitComponentsForKits(db, kits.map((kit) => kit.id)),
  ]);

  return (
    <AdminKitsShell
      kits={kits}
      kitComponents={kitComponents}
      productOptions={productOptions}
    />
  );
}
