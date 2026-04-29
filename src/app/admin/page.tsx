import { AdminPageClient } from "@/components/admin/admin-page-client";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminPage() {
  await requireAdmin();
  return <AdminPageClient />;
}
