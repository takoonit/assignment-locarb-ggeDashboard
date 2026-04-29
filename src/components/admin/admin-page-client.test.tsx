import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { AdminPageClient } from "./admin-page-client";

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

function renderAdmin(fetchMock = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
  vi.stubGlobal("fetch", fetchMock);

  const view = render(
    <QueryClientProvider client={queryClient}>
      <AdminPageClient
        countries={countries}
        emissions={emissions}
        sectorShares={sectorShares}
      />
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
  it("renders three CRUD tabs and displays null values as no data without hiding zero", () => {
    renderAdmin();

    expect(screen.getByRole("tab", { name: /countries/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /annual emissions/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /sector shares/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /annual emissions/i }));
    expect(screen.getAllByText("No data").length).toBeGreaterThan(0);
    expect(screen.getByText("0")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /sector shares/i }));
    expect(screen.getAllByText("No data").length).toBeGreaterThan(0);
    expect(screen.getByText("0")).toBeInTheDocument();
  }, 10_000);

  it("creates countries through the existing write API and invalidates dashboard queries", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        data: { id: "country-3", code: "JPN", name: "Japan", isRegion: false },
      }),
    );
    const { invalidateQueries } = renderAdmin(fetchMock);

    fireEvent.click(screen.getByRole("button", { name: /create country/i }));
    fireEvent.change(screen.getByLabelText(/^code$/i), { target: { value: "JPN" } });
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: "Japan" } });
    await submitDialog(/create$/i);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/countries",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ code: "JPN", name: "Japan", isRegion: false }),
      }),
    );
    expect(await screen.findByText("Japan")).toBeInTheDocument();
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["countries"] });
  });

  it("edits annual emissions while preserving empty numeric inputs as null and zero as zero", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        data: { ...emissions[0], total: null, co2: 0 },
      }),
    );
    renderAdmin(fetchMock);

    fireEvent.click(screen.getByRole("tab", { name: /annual emissions/i }));
    const row = screen.getByRole("row", { name: /THA 2020/i });
    fireEvent.click(within(row).getByRole("button", { name: /edit annual emission/i }));
    fireEvent.change(screen.getByLabelText(/^total$/i), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/^co2$/i), { target: { value: "0" } });
    await submitDialog(/save$/i);

    expect(fetchMock).toHaveBeenCalledWith(
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

  it("creates sector shares and shows shared API error codes when mutations fail", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ error: { code: "CONFLICT", details: {} } }, { status: 409 }),
    );
    renderAdmin(fetchMock);

    fireEvent.click(screen.getByRole("tab", { name: /sector shares/i }));
    fireEvent.click(screen.getByRole("button", { name: /create sector share/i }));
    fireEvent.change(screen.getByLabelText(/^country code$/i), { target: { value: "THA" } });
    fireEvent.change(screen.getByLabelText(/^year$/i), { target: { value: "2020" } });
    fireEvent.click(screen.getByRole("button", { name: /create$/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sector-shares",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          countryCode: "THA",
          year: 2020,
          transport: null,
          manufacturing: null,
          electricity: null,
          buildings: null,
          other: null,
        }),
      }),
    );
    expect(await screen.findByText(/CONFLICT/i)).toBeInTheDocument();
  });

  it("requires confirmation before deleting a country", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ data: { deleted: true, id: "country-1" } }),
    );
    renderAdmin(fetchMock);

    const row = screen.getByRole("row", { name: /THA Thailand/i });
    fireEvent.click(within(row).getByRole("button", { name: /delete country/i }));

    expect(screen.getByRole("dialog", { name: /delete country/i })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/countries/country-1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
    expect(screen.queryByText("Thailand")).not.toBeInTheDocument();
  });
});
