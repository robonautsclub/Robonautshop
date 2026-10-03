import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AuthProvider } from "@/components/auth/auth-provider";

export const metadata: Metadata = {
  title: "Admin",
  description: "Robonautshop admin UI shell.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AuthProvider>
  );
}
