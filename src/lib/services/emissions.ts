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
