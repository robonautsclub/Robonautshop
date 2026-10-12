import { requirePermission } from "@/lib/auth/session";
import { AdminReviewsShell } from "@/components/admin/admin-reviews-shell";
import { getRequestDb } from "@/lib/db/request";
import { listReviewsForAdmin } from "@/lib/reviews/queries";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requirePermission("reviews.moderate");
  const db = await getRequestDb();
  return <AdminReviewsShell reviews={await listReviewsForAdmin(db)} />;
}
