import { AdminKitsShell } from "@/components/admin/admin-kits-shell";
import { listAdminKits, listAdminProductOptions, listAdminProjects } from "@/lib/admin";
import { getKitComponentsForKits } from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";

export default async function AdminKitsPage() {
  const db = await getRequestDb();
  const kits = await listAdminKits(db);
  const [productOptions, kitComponents, projects] = await Promise.all([
    listAdminProductOptions(db),
    getKitComponentsForKits(db, kits.map((kit) => kit.id)),
    listAdminProjects(db),
  ]);

  return (
    <AdminKitsShell
      kits={kits}
      kitComponents={kitComponents}
      productOptions={productOptions}
      projects={projects.map((project) => ({ id: project.id, name: project.name }))}
    />
  );
}
