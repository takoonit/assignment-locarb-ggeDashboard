import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const serviceMock = vi.hoisted(() => ({
  listCountries: vi.fn(),
  getEmissionsTrend: vi.fn(),
  getEmissionsMap: vi.fn(),
  getSectorBreakdown: vi.fn(),
  getFilteredEmission: vi.fn(),
}));

vi.mock("@/lib/services/emissions", () => serviceMock);
vi.mock("@/lib/require-admin", () => ({ requireAdmin: vi.fn().mockResolvedValue(null) }));

const request = (path: string) => new NextRequest(`http://localhost${path}`);

describe("B5 read API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns countries in the shared success envelope", async () => {
    serviceMock.listCountries.mockResolvedValueOnce([
      { code: "THA", name: "Thailand", isRegion: false },
    ]);

    const { GET } = await import("../countries/route");
    const response = await GET(request("/api/countries"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [{ code: "THA", name: "Thailand", isRegion: false }],
    });
    expect(serviceMock.listCountries).toHaveBeenCalledWith({
      includeRegions: false,
    });
  });

  it("rejects invalid countries params with INVALID_PARAMS", async () => {
    const { GET } = await import("../countries/route");
    const response = await GET(request("/api/countries?includeRegions=yes"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "INVALID_PARAMS" },
    });
  });

  it("parses trend params and returns a success envelope", async () => {
    serviceMock.getEmissionsTrend.mockResolvedValueOnce({
      country: { code: "THA", name: "Thailand" },
      gas: "CO2",
      unit: "kt_co2e",
      points: [{ year: 2000, value: null }],
    });

    const { GET } = await import("./trend/route");
    const response = await GET(
      request("/api/emissions/trend?country=THA&gas=CO2&fromYear=2000&toYear=2000"),
    );

    expect(response.status).toBe(200);
    expect(serviceMock.getEmissionsTrend).toHaveBeenCalledWith({
      country: "THA",
      gas: "CO2",
      fromYear: 2000,
      toYear: 2000,
    });
  });

  it("rejects invalid trend year ranges with INVALID_PARAMS", async () => {
    const { GET } = await import("./trend/route");
    const response = await GET(
      request("/api/emissions/trend?country=THA&fromYear=2021&toYear=2020"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "INVALID_PARAMS" },
    });
  });

  it("parses map, sector, and filter route params", async () => {
    serviceMock.getEmissionsMap.mockResolvedValueOnce({
      year: 2020,
      gas: "TOTAL",
      unit: "kt_co2e",
      countries: [],
    });
    serviceMock.getSectorBreakdown.mockResolvedValueOnce({
      country: { code: "THA", name: "Thailand" },
      year: 2020,
      unit: "percent",
      sectors: {
        transport: null,
        manufacturing: null,
        electricity: null,
        buildings: null,
        other: null,
      },
    });
    serviceMock.getFilteredEmission.mockResolvedValueOnce({
      country: { code: "THA", name: "Thailand" },
      year: 2020,
      gas: "CO2",
      unit: "kt_co2e",
      value: null,
    });

    const mapRoute = await import("./map/route");
    const sectorRoute = await import("./sector/route");
    const filterRoute = await import("./filter/route");

    expect(
      await mapRoute.GET(
        request("/api/emissions/map?year=2020&gas=TOTAL&includeRegions=true"),
      ),
    ).toMatchObject({ status: 200 });
    expect(
      await sectorRoute.GET(
        request("/api/emissions/sector?country=THA&year=2020"),
      ),
    ).toMatchObject({ status: 200 });
    expect(
      await filterRoute.GET(
        request("/api/emissions/filter?country=THA&gas=CO2&year=2020"),
      ),
    ).toMatchObject({ status: 200 });

    expect(serviceMock.getEmissionsMap).toHaveBeenCalledWith({
      year: 2020,
      gas: "TOTAL",
      includeRegions: true,
    });
    expect(serviceMock.getSectorBreakdown).toHaveBeenCalledWith({
      country: "THA",
      year: 2020,
    });
    expect(serviceMock.getFilteredEmission).toHaveBeenCalledWith({
      country: "THA",
      gas: "CO2",
      year: 2020,
    });
  });
});
