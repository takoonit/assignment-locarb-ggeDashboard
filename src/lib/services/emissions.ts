import { prisma } from "@/lib/prisma";
import { GasSchema } from "../api-schemas";

export async function getCountries(includeRegions: boolean = false) {
  return prisma.country.findMany({
    where: includeRegions ? {} : { isRegion: false },
    select: {
      code: true,
      name: true,
      isRegion: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getEmissionsTrend(
  countryCode: string,
  gas: string = "TOTAL",
  fromYear?: number,
  toYear?: number
) {
  const country = await prisma.country.findUnique({
    where: { code: countryCode },
    select: { id: true, code: true, name: true },
  });

  if (!country) return null;

  const gasField = gas.toLowerCase() as keyof typeof prisma.annualEmission;

  const emissions = await prisma.annualEmission.findMany({
    where: {
      countryId: country.id,
      year: {
        gte: fromYear,
        lte: toYear,
      },
    },
    select: {
      year: true,
      [gasField]: true,
    },
    orderBy: { year: "asc" },
  });

  // Map to the shape expected by the API
  const points = emissions.map((e) => ({
    year: e.year,
    value: e[gasField as keyof typeof e] as number | null,
  }));

  return {
    country: {
      code: country.code,
      name: country.name,
    },
    gas,
    unit: "kt_co2e",
    points,
  };
}

export async function getEmissionsMap(year: number, gas: string = "TOTAL", includeRegions: boolean = false) {
  const gasField = gas.toLowerCase() as keyof typeof prisma.annualEmission;

  const countries = await prisma.country.findMany({
    where: includeRegions ? {} : { isRegion: false },
    select: {
      code: true,
      name: true,
      annualEmissions: {
        where: { year },
        select: {
          [gasField]: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const formattedCountries = countries.map((c) => ({
    countryCode: c.code,
    countryName: c.name,
    value: c.annualEmissions[0]?.[gasField as keyof (typeof c.annualEmissions)[0]] as number | null ?? null,
  }));

  return {
    year,
    gas,
    unit: "kt_co2e",
    countries: formattedCountries,
  };
}

export async function getEmissionsSector(countryCode: string, year: number) {
  const country = await prisma.country.findUnique({
    where: { code: countryCode },
    select: { id: true, code: true, name: true },
  });

  if (!country) return null;

  const sectorData = await prisma.sectorShare.findUnique({
    where: {
      countryId_year: {
        countryId: country.id,
        year,
      },
    },
  });

  const sectors = {
    transport: sectorData?.transport ?? null,
    manufacturing: sectorData?.manufacturing ?? null,
    electricity: sectorData?.electricity ?? null,
    buildings: sectorData?.buildings ?? null,
    other: sectorData?.other ?? null,
  };

  return {
    country: {
      code: country.code,
      name: country.name,
    },
    year,
    unit: "percent",
    sectors,
  };
}

export async function getEmissionsFilter(countryCode: string, gas: string, year: number) {
  const country = await prisma.country.findUnique({
    where: { code: countryCode },
    select: { id: true, code: true, name: true },
  });

  if (!country) return null;

  const gasField = gas.toLowerCase() as keyof typeof prisma.annualEmission;

  const emission = await prisma.annualEmission.findUnique({
    where: {
      countryId_year: {
        countryId: country.id,
        year,
      },
    },
    select: {
      [gasField]: true,
    },
  });

  return {
    country: {
      code: country.code,
      name: country.name,
    },
    year,
    gas,
    unit: "kt_co2e",
    value: emission?.[gasField as keyof typeof emission] as number | null ?? null,
  };
}

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

function mapWriteError(
  error: unknown,
  {
    conflictMessage,
    notFoundMessage,
  }: { conflictMessage: string; notFoundMessage: string },
) {
  if (isPrismaError(error, "P2002")) {
    return new ApiError("CONFLICT", { message: conflictMessage }, 409);
  }

  if (isPrismaError(error, "P2025")) {
    return new ApiError("NOT_FOUND", { message: notFoundMessage }, 404);
  }

  return error;
}

function isPrismaError(error: unknown, code: string): error is PrismaErrorLike {
  return typeof error === "object" && error !== null && "code" in error
    ? (error as PrismaErrorLike).code === code
    : false;
}
