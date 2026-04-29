import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminPageClient } from "./admin-page-client";

let mockSearchParams = new URLSearchParams("tab=countries&page=1");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/admin",
  useSearchParams: () => mockSearchParams,
}));

const countries = [
  { id: "country-1", code: "THA", name: "Thailand", isRegion: false },
  { id: "country-2", code: "WLD", name: "World", isRegion: true },
];

const emissions = [
  {
    id: "emission-1",
    countryCode: "THA",
    year: 2020,
    total: 403000,
    co2: null,
    ch4: 0,
    n2o: null,
    hfc: null,
    pfc: null,
    sf6: null,
  },
];

const sectorShares = [
  {
    id: "sector-1",
    countryCode: "THA",
    year: 2020,
    transport: 25.4,
    manufacturing: null,
    electricity: 0,
    buildings: null,
    other: 3.4,
  },
];

const pagedCountries = { data: countries, total: 2, page: 1, pageSize: 20 };
const pagedEmissions = { data: emissions, total: 1, page: 1, pageSize: 20 };
const pagedSectorShares = { data: sectorShares, total: 1, page: 1, pageSize: 20 };

type FetchLike = (url: string, options?: RequestInit) => Promise<Response>;

function makeListFetch(mutateFetch?: FetchLike) {
  return vi.fn().mockImplementation((url: string, options?: RequestInit) => {
    if (!options || options.method === undefined || options.method === "GET") {
      if (String(url).includes("/api/admin/emissions")) {
        return Promise.resolve(Response.json({ data: pagedEmissions }));
      }
      if (String(url).includes("/api/admin/countries")) {
        return Promise.resolve(Response.json({ data: pagedCountries }));
      }
      if (String(url).includes("/api/admin/sector-shares")) {
        return Promise.resolve(Response.json({ data: pagedSectorShares }));
      }
    }
    return mutateFetch ? mutateFetch(url, options) : Promise.resolve(Response.json({ data: {} }));
  });
}

function renderAdmin(fetchMock = makeListFetch()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
  vi.stubGlobal("fetch", fetchMock);

  const view = render(
    <QueryClientProvider client={queryClient}>
      <AdminPageClient />
    </QueryClientProvider>,
  );

  return { ...view, fetchMock, invalidateQueries };
}

async function submitDialog(name: RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
  await waitFor(() => {
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
}

describe("AdminPageClient", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams("tab=countries&page=1");
  });

  it("renders three CRUD tabs and displays initial countries data", async () => {
    renderAdmin();

    expect(screen.getByRole("tab", { name: /countries/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /annual emissions/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /sector shares/i })).toBeInTheDocument();

    expect(await screen.findByText("Thailand")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
  }, 10_000);

  it("creates countries through the existing write API and invalidates dashboard queries", async () => {
    const mutateFetch: FetchLike = vi.fn().mockResolvedValue(
      Response.json({
        data: { id: "country-3", code: "JPN", name: "Japan", isRegion: false },
      }),
    );
    const fetchMock = makeListFetch(mutateFetch);
    const { invalidateQueries } = renderAdmin(fetchMock);

    await screen.findByText("Thailand");

    fireEvent.click(screen.getByRole("button", { name: /create country/i }));
    fireEvent.change(screen.getByLabelText(/^code$/i), { target: { value: "JPN" } });
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: "Japan" } });
    await submitDialog(/create$/i);

    expect(mutateFetch).toHaveBeenCalledWith(
      "/api/countries",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ code: "JPN", name: "Japan", isRegion: false }),
      }),
    );
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["countries"] });
  });

  it("edits annual emissions while preserving empty numeric inputs as null and zero as zero", async () => {
    mockSearchParams = new URLSearchParams("tab=emissions&page=1");

    const mutateFetch: FetchLike = vi.fn().mockResolvedValue(
      Response.json({
        data: { ...emissions[0], total: null, co2: 0 },
      }),
    );

    const fetchMock = makeListFetch(mutateFetch);
    renderAdmin(fetchMock);

    await screen.findByText("THA");

    const row = screen.getByRole("row", { name: /THA 2020/i });
    fireEvent.click(within(row).getByRole("button", { name: /edit annual emission/i }));
    fireEvent.change(screen.getByLabelText(/^total$/i), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/^co2$/i), { target: { value: "0" } });
    await submitDialog(/save$/i);

    expect(mutateFetch).toHaveBeenCalledWith(
      "/api/emissions/emission-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          year: 2020,
          total: null,
          co2: 0,
          ch4: 0,
          n2o: null,
          hfc: null,
          pfc: null,
          sf6: null,
        }),
      }),
    );
  });

  it("shows shared API error codes when mutations fail", async () => {
    const mutateFetch: FetchLike = vi.fn().mockResolvedValue(
      Response.json({ error: { code: "CONFLICT", details: {} } }, { status: 409 }),
    );
    const fetchMock = makeListFetch(mutateFetch);
    renderAdmin(fetchMock);

    await screen.findByText("Thailand");

    fireEvent.click(screen.getByRole("button", { name: /create country/i }));
    fireEvent.change(screen.getByLabelText(/^code$/i), { target: { value: "THA" } });
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: "Thailand" } });
    fireEvent.click(screen.getByRole("button", { name: /create$/i }));

    expect(await screen.findByText(/CONFLICT/i)).toBeInTheDocument();
  });

  it("requires confirmation before deleting a country", async () => {
    const mutateFetch: FetchLike = vi.fn().mockResolvedValue(
      Response.json({ data: { deleted: true, id: "country-1" } }),
    );
    const fetchMock = makeListFetch(mutateFetch);
    renderAdmin(fetchMock);

    await screen.findByText("Thailand");

    const row = screen.getByRole("row", { name: /THA Thailand/i });
    fireEvent.click(within(row).getByRole("button", { name: /delete country/i }));

    expect(screen.getByRole("dialog", { name: /delete country/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(mutateFetch).toHaveBeenCalledWith(
        "/api/countries/country-1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });
});
