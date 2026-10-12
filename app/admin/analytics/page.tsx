import { requirePermission } from "@/lib/auth/session";
import { AdminAnalyticsContent } from "@/components/admin/admin-analytics-content";
import { getAnalyticsSummary } from "@/lib/analytics/queries";
import { getRequestDb } from "@/lib/db/request";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requirePermission("analytics.view");
  const db = await getRequestDb();
  const summary = await getAnalyticsSummary(db, 30);

  return <AdminAnalyticsContent summary={summary} />;
}
