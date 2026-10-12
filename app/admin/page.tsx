import Link from "next/link";

import { AdminDashboardContent } from "@/components/admin/admin-dashboard-content";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ADMIN_NAV } from "@/lib/admin";
import { hasPermission } from "@/lib/auth/permissions";
import { requireStaffSession } from "@/lib/auth/session";

export default async function AdminDashboardPage() {
  const session = await requireStaffSession();

  // The full dashboard shows revenue and analytics, so it needs that permission.
  if (hasPermission(session.user.role, "analytics.view")) {
    return <AdminDashboardContent />;
  }

  const sections = ADMIN_NAV.filter(
    (item) => item.permission && hasPermission(session.user.role, item.permission),
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Welcome, ${session.user.name}`}
        description="Here is what your role can manage."
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-xl border px-5 py-4 font-medium hover:border-foreground/20"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
