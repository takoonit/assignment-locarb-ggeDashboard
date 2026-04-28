import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { Pool } from "pg";
import type { AnnualEmissionSeed, SectorShareSeed } from "./seed-transform";
import { transformSeedCsv } from "./seed-transform";

const defaultCsvPath = path.join(process.cwd(), "docs", "data_for_test.csv");

async function main() {
  const csvPath = process.env.SEED_CSV_PATH ?? defaultCsvPath;
  const csv = readFileSync(csvPath, "utf8");
  const seedData = transformSeedCsv(csv);
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to run the seed script.");
  }

  const pool = new Pool({
    connectionString: normalizePgConnectionString(connectionString),
  });

  try {
    await upsertCountries(pool, seedData.countries);

    const countries = await pool.query<{ id: string; code: string }>(
      `SELECT "id", "code" FROM "Country" WHERE "code" = ANY($1)`,
      [seedData.countries.map((country) => country.code)],
    );
    const countryIdsByCode = new Map(
      countries.rows.map((country) => [country.code, country.id]),
    );

    await upsertAnnualEmissions(
      pool,
      Array.from(seedData.annualEmissionsByCountryYear.values()),
      countryIdsByCode,
    );
    await upsertSectorShares(
      pool,
      Array.from(seedData.sectorSharesByCountryYear.values()),
      countryIdsByCode,
    );

    console.log(
      JSON.stringify({
        countries: seedData.countries.length,
        annualEmissions: seedData.annualEmissionsByCountryYear.size,
        sectorShares: seedData.sectorSharesByCountryYear.size,
      }),
    );
  } finally {
    await pool.end();
  }
}

async function upsertCountries(
  pool: Pool,
  countries: Array<{ code: string; name: string; isRegion: boolean }>,
) {
  for (const batch of chunk(countries, 500)) {
    const values = batch.flatMap((country) => [
      randomUUID(),
      country.code,
      country.name,
      country.isRegion,
    ]);
    const placeholders = buildPlaceholders(batch.length, 4);

    await pool.query(
      `
        INSERT INTO "Country" ("id", "code", "name", "isRegion")
        VALUES ${placeholders}
        ON CONFLICT ("code") DO UPDATE SET
          "name" = EXCLUDED."name",
          "isRegion" = EXCLUDED."isRegion"
      `,
      values,
    );
  }
}

async function upsertAnnualEmissions(
  pool: Pool,
  emissions: AnnualEmissionSeed[],
  countryIdsByCode: Map<string, string>,
) {
  const rows = emissions.flatMap((emission) => {
    const countryId = countryIdsByCode.get(emission.countryCode);
    if (!countryId) {
      return [];
    }

    return [
      {
        countryId,
        year: emission.year,
        total: emission.total,
        co2: emission.co2,
        ch4: emission.ch4,
        n2o: emission.n2o,
        hfc: emission.hfc,
        pfc: emission.pfc,
        sf6: emission.sf6,
      },
    ];
  });

  for (const batch of chunk(rows, 500)) {
    const values = batch.flatMap((emission) => [
      randomUUID(),
      emission.countryId,
      emission.year,
      emission.total,
      emission.co2,
      emission.ch4,
      emission.n2o,
      emission.hfc,
      emission.pfc,
      emission.sf6,
    ]);
    const placeholders = buildPlaceholders(batch.length, 10);

    await pool.query(
      `
        INSERT INTO "AnnualEmission"
          ("id", "countryId", "year", "total", "co2", "ch4", "n2o", "hfc", "pfc", "sf6")
        VALUES ${placeholders}
        ON CONFLICT ("countryId", "year") DO UPDATE SET
          "total" = EXCLUDED."total",
          "co2" = EXCLUDED."co2",
          "ch4" = EXCLUDED."ch4",
          "n2o" = EXCLUDED."n2o",
          "hfc" = EXCLUDED."hfc",
          "pfc" = EXCLUDED."pfc",
          "sf6" = EXCLUDED."sf6"
      `,
      values,
    );
  }
}

async function upsertSectorShares(
  pool: Pool,
  sectors: SectorShareSeed[],
  countryIdsByCode: Map<string, string>,
) {
  const rows = sectors.flatMap((sector) => {
    const countryId = countryIdsByCode.get(sector.countryCode);
    if (!countryId) {
      return [];
    }

    return [
      {
        countryId,
        year: sector.year,
        transport: sector.transport,
        manufacturing: sector.manufacturing,
        electricity: sector.electricity,
        buildings: sector.buildings,
        other: sector.other,
      },
    ];
  });

  for (const batch of chunk(rows, 500)) {
    const values = batch.flatMap((sector) => [
      randomUUID(),
      sector.countryId,
      sector.year,
      sector.transport,
      sector.manufacturing,
      sector.electricity,
      sector.buildings,
      sector.other,
    ]);
    const placeholders = buildPlaceholders(batch.length, 8);

    await pool.query(
      `
        INSERT INTO "SectorShare"
          ("id", "countryId", "year", "transport", "manufacturing", "electricity", "buildings", "other")
        VALUES ${placeholders}
        ON CONFLICT ("countryId", "year") DO UPDATE SET
          "transport" = EXCLUDED."transport",
          "manufacturing" = EXCLUDED."manufacturing",
          "electricity" = EXCLUDED."electricity",
          "buildings" = EXCLUDED."buildings",
          "other" = EXCLUDED."other"
      `,
      values,
    );
  }
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function buildPlaceholders(rowCount: number, columnCount: number) {
  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const start = rowIndex * columnCount;
    const columns = Array.from(
      { length: columnCount },
      (_value, columnIndex) => `$${start + columnIndex + 1}`,
    );

    return `(${columns.join(", ")})`;
  }).join(", ");
}

function normalizePgConnectionString(connectionString: string) {
  const url = new URL(connectionString);

  if (
    url.searchParams.get("sslmode") === "require" &&
    !url.searchParams.has("uselibpqcompat")
  ) {
    url.searchParams.set("uselibpqcompat", "true");
  }

  return url.toString();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
