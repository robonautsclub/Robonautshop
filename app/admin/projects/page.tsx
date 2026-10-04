import { AdminProjectsShell } from "@/components/admin/admin-projects-shell";
import { listAdminProductOptions, listAdminProjects } from "@/lib/admin";
import { getProjectComponentsForProjects } from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";

export default async function AdminProjectsPage() {
  const db = await getRequestDb();
  const projects = await listAdminProjects(db);
  const [productOptions, projectComponents] = await Promise.all([
    listAdminProductOptions(db),
    getProjectComponentsForProjects(db, projects.map((project) => project.id)),
  ]);

  return (
    <AdminProjectsShell
      projects={projects}
      projectComponents={projectComponents}
      productOptions={productOptions}
    />
  );
}
