import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-utils";

const prismaMock = vi.hoisted(() => ({
  country: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  annualEmission: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  sectorShare: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("emissions read service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists non-region countries by default", async () => {
    prismaMock.country.findMany.mockResolvedValueOnce([
      { code: "THA", name: "Thailand", isRegion: false },
    ]);

    const { listCountries } = await import("./emissions");
    const result = await listCountries({ includeRegions: false });

    expect(prismaMock.country.findMany).toHaveBeenCalledWith({
      where: { isRegion: false },
      orderBy: { name: "asc" },
      select: { code: true, name: true, isRegion: true },
    });
    expect(result).toEqual([
      { code: "THA", name: "Thailand", isRegion: false },
    ]);
  });

  it("fills trend year gaps with null values", async () => {
    prismaMock.country.findUnique.mockResolvedValueOnce({
      id: "country-1",
      code: "THA",
      name: "Thailand",
    });
    prismaMock.annualEmission.findMany.mockResolvedValueOnce([
      { year: 2000, co2: 184200 },
      { year: 2002, co2: null },
    ]);

    const { getEmissionsTrend } = await import("./emissions");
    const result = await getEmissionsTrend({
      country: "THA",
      gas: "CO2",
      fromYear: 2000,
      toYear: 2002,
    });

    expect(result.points).toEqual([
      { year: 2000, value: 184200 },
      { year: 2001, value: null },
      { year: 2002, value: null },
    ]);
  });

  it("returns every requested map country and preserves missing values as null", async () => {
    prismaMock.country.findMany.mockResolvedValueOnce([
      {
        code: "THA",
        name: "Thailand",
        annualEmissions: [{ total: 403000 }],
      },
      {
        code: "JPN",
        name: "Japan",
        annualEmissions: [],
      },
    ]);

    const { getEmissionsMap } = await import("./emissions");
    const result = await getEmissionsMap({
      year: 2020,
      gas: "TOTAL",
      includeRegions: false,
    });

    expect(result.countries).toEqual([
      { countryCode: "THA", countryName: "Thailand", value: 403000 },
      { countryCode: "JPN", countryName: "Japan", value: null },
    ]);
  });

  it("returns an all-null sector breakdown when the country exists without a sector row", async () => {
    prismaMock.country.findUnique.mockResolvedValueOnce({
      id: "country-1",
      code: "THA",
      name: "Thailand",
    });
    prismaMock.sectorShare.findUnique.mockResolvedValueOnce(null);

    const { getSectorBreakdown } = await import("./emissions");
    const result = await getSectorBreakdown({ country: "THA", year: 2020 });

    expect(result.sectors).toEqual({
      transport: null,
      manufacturing: null,
      electricity: null,
      buildings: null,
      other: null,
    });
  });

  it("throws NOT_FOUND when a country lookup misses", async () => {
    prismaMock.country.findUnique.mockResolvedValueOnce(null);

    const { getFilteredEmission } = await import("./emissions");

    await expect(
      getFilteredEmission({ country: "ZZZ", gas: "CO2", year: 2020 }),
    ).rejects.toMatchObject(new ApiError("NOT_FOUND", { country: "ZZZ" }, 404));
  });

  it("creates annual emissions through a country lookup and maps duplicate country-year records to CONFLICT", async () => {
    prismaMock.country.findUnique.mockResolvedValueOnce({
      id: "country-1",
      code: "THA",
      name: "Thailand",
    });
    prismaMock.annualEmission.create.mockRejectedValueOnce({ code: "P2002" });

    const { createAnnualEmission } = await import("./emissions");

    await expect(
      createAnnualEmission({
        countryCode: "THA",
        year: 2020,
        total: 403000,
        co2: null,
        ch4: null,
        n2o: null,
        hfc: null,
        pfc: null,
        sf6: null,
      }),
    ).rejects.toMatchObject(
      new ApiError(
        "CONFLICT",
        { message: "Annual emissions already exist for this country and year." },
        409,
      ),
    );
  });

  it("maps missing write targets to NOT_FOUND", async () => {
    prismaMock.sectorShare.delete.mockRejectedValueOnce({ code: "P2025" });

    const { deleteSectorShare } = await import("./emissions");

    await expect(deleteSectorShare("missing")).rejects.toMatchObject(
      new ApiError("NOT_FOUND", { message: "Sector share record not found." }, 404),
    );
  });
});
