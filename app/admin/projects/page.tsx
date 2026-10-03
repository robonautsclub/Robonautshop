import { AdminProjectsShell } from "@/components/admin/admin-projects-shell";
import { listAdminProjects } from "@/lib/admin";

export default function AdminProjectsPage() {
  return <AdminProjectsShell projects={listAdminProjects()} />;
}
