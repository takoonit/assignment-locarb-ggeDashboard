import { db } from "@/lib/db";
import { ApiError } from "@/lib/api/error";

type PrismaErrorLike = { code: string };

// ─── Countries ────────────────────────────────────────────────────────────────

export async function listCountries({ includeRegions = false }: { includeRegions?: boolean } = {}) {
  return db.country.findMany({
    where: includeRegions ? {} : { isRegion: false },
    select: { code: true, name: true, isRegion: true },
    orderBy: { name: "asc" },
  });
}

export async function createCountry(body: { code: string; name: string; isRegion?: boolean }) {
  try {
    return await db.country.create({
      data: { code: body.code.toUpperCase(), name: body.name, isRegion: body.isRegion ?? false },
      select: { id: true, code: true, name: true, isRegion: true },
    });
  } catch (error) {
    throw mapWriteError(error, {
      conflictMessage: "Country code already exists.",
      notFoundMessage: "Country does not exist.",
    });
  }
}

export async function updateCountry(id: string, body: { code?: string; name?: string; isRegion?: boolean }) {
  try {
    return await db.country.update({
      where: { id },
      data: {
        ...(body.code !== undefined ? { code: body.code.toUpperCase() } : {}),
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.isRegion !== undefined ? { isRegion: body.isRegion } : {}),
      },
      select: { id: true, code: true, name: true, isRegion: true },
    });
  } catch (error) {
    throw mapWriteError(error, {
      conflictMessage: "Country code already exists.",
      notFoundMessage: "Country does not exist.",
    });
  }
}

export async function deleteCountry(id: string) {
  try {
    await db.country.delete({ where: { id } });
    return { deleted: true as const, id };
  } catch (error) {
    throw mapWriteError(error, {
      conflictMessage: "Country code already exists.",
      notFoundMessage: "Country does not exist.",
    });
  }
}

// ─── Read: Trend ──────────────────────────────────────────────────────────────

export async function getEmissionsTrend({
  country: countryCode,
  gas = "TOTAL",
  fromYear,
  toYear,
}: {
  country: string;
  gas?: string;
  fromYear?: number;
  toYear?: number;
}) {
  const country = await db.country.findUnique({
    where: { code: countryCode },
    select: { id: true, code: true, name: true },
  });

  if (!country) return null;

  const gasField = gas.toLowerCase() as string;

  const emissions = (await db.annualEmission.findMany({
    where: {
      countryId: country.id,
      year: { gte: fromYear, lte: toYear },
    },
    select: { year: true, [gasField]: true },
    orderBy: { year: "asc" },
  })) as unknown as { year: number; [key: string]: number | null }[];

  // Fill gaps in the year range with null
  const emissionByYear = new Map<number, number | null>(
    emissions.map((e) => [e.year, e[gasField] ?? null]),
  );

  const points: { year: number; value: number | null }[] = [];
  if (fromYear !== undefined && toYear !== undefined) {
    for (let y = fromYear; y <= toYear; y++) {
      points.push({ year: y, value: emissionByYear.get(y) ?? null });
    }
  } else {
    emissions.forEach((e) => {
      points.push({ year: e.year, value: e[gasField] ?? null });
    });
  }

  return {
    country: { code: country.code, name: country.name },
    gas,
    unit: "kt_co2e" as const,
    points,
  };
}

// ─── Read: Map ────────────────────────────────────────────────────────────────

export async function getEmissionsMap({
  year,
  gas = "TOTAL",
  includeRegions = false,
}: {
  year: number;
  gas?: string;
  includeRegions?: boolean;
}) {
  const gasField = gas.toLowerCase() as string;

  const countries = (await db.country.findMany({
    where: includeRegions ? {} : { isRegion: false },
    select: {
      code: true,
      name: true,
      annualEmissions: {
        where: { year },
        select: { [gasField]: true },
      },
    },
    orderBy: { name: "asc" },
  })) as { code: string; name: string; annualEmissions: { [key: string]: number | null }[] }[];

  return {
    year,
    gas,
    unit: "kt_co2e" as const,
    countries: countries.map((c) => ({
      countryCode: c.code,
      countryName: c.name,
      value: c.annualEmissions[0]?.[gasField] ?? null,
    })),
  };
}

// ─── Read: Sector ─────────────────────────────────────────────────────────────

export async function getSectorBreakdown({
  country: countryCode,
  year,
}: {
  country: string;
  year: number;
}) {
  const country = await db.country.findUnique({
    where: { code: countryCode },
    select: { id: true, code: true, name: true },
  });

  if (!country) return null;

  const sectorData = await db.sectorShare.findUnique({
    where: { countryId_year: { countryId: country.id, year } },
  });

  return {
    country: { code: country.code, name: country.name },
    year,
    unit: "percent" as const,
    sectors: {
      transport: sectorData?.transport ?? null,
      manufacturing: sectorData?.manufacturing ?? null,
      electricity: sectorData?.electricity ?? null,
      buildings: sectorData?.buildings ?? null,
      other: sectorData?.other ?? null,
    },
  };
}

// ─── Read: Available Years ────────────────────────────────────────────────────

export async function getAvailableMapYears() {
  const rows = await db.annualEmission.findMany({
    where: { total: { not: null } },
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });
  return rows.map((r: { year: number }) => r.year);
}

export async function getAvailableSectorYears(countryCode: string) {
  const country = await db.country.findUnique({
    where: { code: countryCode },
    select: { id: true },
  });
  if (!country) return [];

  const rows = await db.sectorShare.findMany({
    where: {
      countryId: country.id,
      OR: [
        { transport: { not: null } },
        { manufacturing: { not: null } },
        { electricity: { not: null } },
        { buildings: { not: null } },
        { other: { not: null } },
      ],
    },
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });
  return rows.map((r: { year: number }) => r.year);
}

// ─── Read: Filter ─────────────────────────────────────────────────────────────

export async function getFilteredEmission({
  country: countryCode,
  gas,
  year,
}: {
  country: string;
  gas: string;
  year: number;
}) {
  const country = await db.country.findUnique({
    where: { code: countryCode },
    select: { id: true, code: true, name: true },
  });

  if (!country) throw new ApiError("NOT_FOUND", { country: countryCode }, 404);

  const gasField = gas.toLowerCase() as string;

  const emission = (await db.annualEmission.findUnique({
    where: { countryId_year: { countryId: country.id, year } },
    select: { [gasField]: true },
  })) as { [key: string]: number | null } | null;

  return {
    country: { code: country.code, name: country.name },
    year,
    gas,
    unit: "kt_co2e" as const,
    value: emission?.[gasField] ?? null,
  };
}

// ─── Write: Annual Emissions ──────────────────────────────────────────────────

const annualEmissionSelect = {
  id: true,
  year: true,
  total: true,
  co2: true,
  ch4: true,
  n2o: true,
  hfc: true,
  pfc: true,
  sf6: true,
  country: { select: { code: true } },
};

function formatAnnualEmission(row: {
  id: string;
  year: number;
  total: number | null;
  co2: number | null;
  ch4: number | null;
  n2o: number | null;
  hfc: number | null;
  pfc: number | null;
  sf6: number | null;
  country: { code: string };
}) {
  return {
    id: row.id,
    countryCode: row.country.code,
    year: row.year,
    total: row.total,
    co2: row.co2,
    ch4: row.ch4,
    n2o: row.n2o,
    hfc: row.hfc,
    pfc: row.pfc,
    sf6: row.sf6,
  };
}

export async function createAnnualEmission(body: {
  countryCode: string;
  year: number;
  total?: number | null;
  co2?: number | null;
  ch4?: number | null;
  n2o?: number | null;
  hfc?: number | null;
  pfc?: number | null;
  sf6?: number | null;
}) {
  const country = await db.country.findUnique({
    where: { code: body.countryCode },
    select: { id: true },
  });

  if (!country) throw new ApiError("NOT_FOUND", { countryCode: body.countryCode }, 404);

  try {
    const row = await db.annualEmission.create({
      data: {
        countryId: country.id,
        year: body.year,
        total: body.total ?? null,
        co2: body.co2 ?? null,
        ch4: body.ch4 ?? null,
        n2o: body.n2o ?? null,
        hfc: body.hfc ?? null,
        pfc: body.pfc ?? null,
        sf6: body.sf6 ?? null,
      },
      select: annualEmissionSelect,
    });
    return formatAnnualEmission(row);
  } catch (error) {
    throw mapWriteError(error, {
      conflictMessage: "Annual emissions already exist for this country and year.",
      notFoundMessage: "Country code does not exist.",
    });
  }
}

export async function updateAnnualEmission(
  id: string,
  body: {
    year?: number;
    total?: number | null;
    co2?: number | null;
    ch4?: number | null;
    n2o?: number | null;
    hfc?: number | null;
    pfc?: number | null;
    sf6?: number | null;
  },
) {
  try {
    const row = await db.annualEmission.update({
      where: { id },
      data: body,
      select: annualEmissionSelect,
    });
    return formatAnnualEmission(row);
  } catch (error) {
    throw mapWriteError(error, {
      conflictMessage: "Updated year would create a duplicate.",
      notFoundMessage: "Emissions record does not exist.",
    });
  }
}

export async function deleteAnnualEmission(id: string) {
  try {
    await db.annualEmission.delete({ where: { id } });
    return { deleted: true as const, id };
  } catch (error) {
    throw mapWriteError(error, {
      conflictMessage: "Updated year would create a duplicate.",
      notFoundMessage: "Emissions record does not exist.",
    });
  }
}

// ─── Write: Sector Shares ─────────────────────────────────────────────────────

const sectorShareSelect = {
  id: true,
  year: true,
  transport: true,
  manufacturing: true,
  electricity: true,
  buildings: true,
  other: true,
  country: { select: { code: true } },
};

function formatSectorShare(row: {
  id: string;
  year: number;
  transport: number | null;
  manufacturing: number | null;
  electricity: number | null;
  buildings: number | null;
  other: number | null;
  country: { code: string };
}) {
  return {
    id: row.id,
    countryCode: row.country.code,
    year: row.year,
    transport: row.transport,
    manufacturing: row.manufacturing,
    electricity: row.electricity,
    buildings: row.buildings,
    other: row.other,
  };
}

export async function createSectorShare(body: {
  countryCode: string;
  year: number;
  transport?: number | null;
  manufacturing?: number | null;
  electricity?: number | null;
  buildings?: number | null;
  other?: number | null;
}) {
  const country = await db.country.findUnique({
    where: { code: body.countryCode },
    select: { id: true },
  });

  if (!country) throw new ApiError("NOT_FOUND", { countryCode: body.countryCode }, 404);

  try {
    const row = await db.sectorShare.create({
      data: {
        countryId: country.id,
        year: body.year,
        transport: body.transport ?? null,
        manufacturing: body.manufacturing ?? null,
        electricity: body.electricity ?? null,
        buildings: body.buildings ?? null,
        other: body.other ?? null,
      },
      select: sectorShareSelect,
    });
    return formatSectorShare(row);
  } catch (error) {
    throw mapWriteError(error, {
      conflictMessage: "Sector data already exists for this country and year.",
      notFoundMessage: "Country code does not exist.",
    });
  }
}

export async function updateSectorShare(
  id: string,
  body: {
    year?: number;
    transport?: number | null;
    manufacturing?: number | null;
    electricity?: number | null;
    buildings?: number | null;
    other?: number | null;
  },
) {
  try {
    const row = await db.sectorShare.update({
      where: { id },
      data: body,
      select: sectorShareSelect,
    });
    return formatSectorShare(row);
  } catch (error) {
    throw mapWriteError(error, {
      conflictMessage: "Updated record would create a duplicate.",
      notFoundMessage: "Sector share record does not exist.",
    });
  }
}

export async function deleteSectorShare(id: string) {
  try {
    await db.sectorShare.delete({ where: { id } });
    return { deleted: true as const, id };
  } catch (error) {
    throw mapWriteError(error, {
      conflictMessage: "Updated record would create a duplicate.",
      notFoundMessage: "Sector share record not found.",
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapWriteError(
  error: unknown,
  { conflictMessage, notFoundMessage }: { conflictMessage: string; notFoundMessage: string },
): never {
  if (isPrismaError(error, "P2002")) {
    throw new ApiError("CONFLICT", { message: conflictMessage }, 409);
  }
  if (isPrismaError(error, "P2025")) {
    throw new ApiError("NOT_FOUND", { message: notFoundMessage }, 404);
  }
  throw error;
}

function isPrismaError(error: unknown, code: string): error is PrismaErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as PrismaErrorLike).code === code
  );
}
