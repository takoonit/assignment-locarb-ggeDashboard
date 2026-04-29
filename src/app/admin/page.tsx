import { AdminPageClient } from "@/components/admin/admin-page-client";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  listAdminAnnualEmissions,
  listAdminCountries,
  listAdminSectorShares,
} from "@/lib/services/emissions";

export default async function AdminPage() {
  await requireAdmin();

  const [countries, emissions, sectorShares] = await Promise.all([
    listAdminCountries(),
    listAdminAnnualEmissions(),
    listAdminSectorShares(),
  ]);

  return (
    <AdminPageClient
      countries={countries}
      emissions={emissions}
      sectorShares={sectorShares}
    />
  );
}
