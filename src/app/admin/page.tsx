import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { AdminPageClient } from "@/components/admin/admin-page-client";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  listAdminAnnualEmissionsPaged,
  listAdminCountriesPaged,
  listAdminSectorSharesPaged,
} from "@/lib/services/emissions";

const PAGE_SIZE = 20;
const allowedTabs = ["countries", "emissions", "sectorShares"] as const;

type AdminTab = (typeof allowedTabs)[number];
type SearchParams = Record<string, string | string[] | undefined>;

type AdminPageProps = {
  searchParams?: Promise<SearchParams>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveTab(searchParams: SearchParams): AdminTab {
  const tab = firstParam(searchParams.tab);
  return allowedTabs.includes(tab as AdminTab) ? (tab as AdminTab) : "countries";
}

function resolvePage(searchParams: SearchParams) {
  const parsed = parseInt(firstParam(searchParams.page) ?? "1", 10);
  return isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

function adminQueryKey(tab: AdminTab, page: number) {
  return ["admin", tab, page] as const;
}

async function listInitialAdminRows(tab: AdminTab, page: number) {
  const query = { page, pageSize: PAGE_SIZE };

  if (tab === "countries") {
    return listAdminCountriesPaged(query);
  }
  if (tab === "emissions") {
    return listAdminAnnualEmissionsPaged(query);
  }
  return listAdminSectorSharesPaged(query);
}

export default async function AdminPage({ searchParams }: AdminPageProps = {}) {
  await requireAdmin();

  const resolvedSearchParams = (await searchParams) ?? {};
  const tab = resolveTab(resolvedSearchParams);
  const page = resolvePage(resolvedSearchParams);
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: adminQueryKey(tab, page),
    queryFn: () => listInitialAdminRows(tab, page),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminPageClient />
    </HydrationBoundary>
  );
}
