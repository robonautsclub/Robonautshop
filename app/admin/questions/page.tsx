import { requirePermission } from "@/lib/auth/session";
import { AdminQuestionsShell } from "@/components/admin/admin-questions-shell";
import { getRequestDb } from "@/lib/db/request";
import { listQuestionsForAdmin } from "@/lib/questions/queries";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  await requirePermission("questions.answer");
  const db = await getRequestDb();
  return <AdminQuestionsShell questions={await listQuestionsForAdmin(db)} />;
}
