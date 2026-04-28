export type SeedCountry = {
  code: string;
  name: string;
  isRegion: boolean;
};

export type AnnualEmissionSeed = {
  countryCode: string;
  year: number;
  total: number | null;
  co2: number | null;
  ch4: number | null;
  n2o: number | null;
  hfc: number | null;
  pfc: number | null;
  sf6: number | null;
};

export type SectorShareSeed = {
  countryCode: string;
  year: number;
  transport: number | null;
  manufacturing: number | null;
  electricity: number | null;
  buildings: number | null;
  other: number | null;
};

export type SeedTransformResult = {
  countries: SeedCountry[];
  annualEmissionsByCountryYear: Map<string, AnnualEmissionSeed>;
  sectorSharesByCountryYear: Map<string, SectorShareSeed>;
};

type AnnualField = keyof Omit<AnnualEmissionSeed, "countryCode" | "year">;
type SectorField = keyof Omit<SectorShareSeed, "countryCode" | "year">;

const aggregateRegionCodes = new Set([
  "ARB",
  "CEB",
  "CSS",
  "EAP",
  "EAR",
  "EAS",
  "ECA",
  "ECS",
  "EMU",
  "EUU",
  "FCS",
  "HIC",
  "HPC",
  "IBD",
  "IBT",
  "IDA",
  "IDB",
  "IDX",
  "LAC",
  "LCN",
  "LDC",
  "LIC",
  "LMC",
  "LMY",
  "LTE",
  "MEA",
  "MIC",
  "MNA",
  "NAC",
  "OED",
  "OSS",
  "PRE",
  "PSS",
  "PST",
  "SAS",
  "SSA",
  "SSF",
  "SST",
  "TEA",
  "TEC",
  "TLA",
  "TMN",
  "TSA",
  "TSS",
  "UMC",
  "WLD",
]);

const annualSeries = new Map<string, AnnualField>([
  ["total greenhouse gas emissions", "total"],
  ["total greenhouse gas emissions (kt of co2 equivalent)", "total"],
  ["co2 emissions", "co2"],
  ["co2 emissions (kt)", "co2"],
  ["methane emissions", "ch4"],
  ["methane emissions (kt of co2 equivalent)", "ch4"],
  [
    "nitrous oxide emissions (thousand metric tons of co2 equivalent)",
    "n2o",
  ],
  ["nitrous oxide emissions", "n2o"],
  [
    "hfc gas emissions (thousand metric tons of co2 equivalent)",
    "hfc",
  ],
  ["hfc gas emissions", "hfc"],
  [
    "pfc gas emissions (thousand metric tons of co2 equivalent)",
    "pfc",
  ],
  ["pfc gas emissions", "pfc"],
  [
    "sf6 gas emissions (thousand metric tons of co2 equivalent)",
    "sf6",
  ],
  ["sf6 gas emissions", "sf6"],
]);

const sectorSeries = new Map<string, SectorField>([
  [
    "co2 emissions from transport (% of total fuel combustion)",
    "transport",
  ],
  ["co2 emissions from transport", "transport"],
  [
    "co2 emissions from manufacturing industries and construction (% of total fuel combustion)",
    "manufacturing",
  ],
  ["co2 emissions from manufacturing/construction", "manufacturing"],
  [
    "co2 emissions from electricity and heat production, total (% of total fuel combustion)",
    "electricity",
  ],
  ["co2 emissions from electricity/heat", "electricity"],
  [
    "co2 emissions from residential buildings and commercial and public services (% of total fuel combustion)",
    "buildings",
  ],
  ["co2 emissions from buildings", "buildings"],
  [
    "co2 emissions from other sectors, excluding residential buildings and commercial and public services (% of total fuel combustion)",
    "other",
  ],
  ["co2 emissions from other sectors", "other"],
]);

export function transformSeedCsv(csv: string): SeedTransformResult {
  const rows = parseCsv(csv);
  const headerIndex = rows.findIndex((row) => row.includes("Country Code"));

  if (headerIndex === -1) {
    throw new Error("CSV header row with Country Code was not found.");
  }

  const header = rows[headerIndex];
  const column = buildColumnLookup(header);

  const metadataColumns = new Set([
    "Country Name",
    "Country Code",
    "Series Name",
    "Series Code",
  ]);

  const yearColumns = header
    .map((name, index) => ({ index, name, year: parseYearColumn(name) }))
    .filter((entry): entry is { index: number; year: number } => {
      const trimmedName = entry.name.trim();
      if (metadataColumns.has(trimmedName)) {
        return false;
      }

      if (Number.isInteger(entry.year)) {
        return true;
      }

      throw new Error(
        `Offending header name "${entry.name}" could not be parsed as a year.`,
      );
    });

  const countriesByCode = new Map<string, SeedCountry>();
  const annualEmissionsByCountryYear = new Map<string, AnnualEmissionSeed>();
  const sectorSharesByCountryYear = new Map<string, SectorShareSeed>();

  for (const row of rows.slice(headerIndex + 1)) {
    const countryCode = cell(row, column["Country Code"]).toUpperCase();
    const countryName = cell(row, column["Country Name"]);
    const seriesName = normalizeSeriesName(cell(row, column["Series Name"]));

    if (!countryCode || !countryName || !seriesName) {
      continue;
    }

    const annualField = annualSeries.get(seriesName);
    const sectorField = sectorSeries.get(seriesName);

    if (!annualField && !sectorField) {
      continue;
    }

    countriesByCode.set(countryCode, {
      code: countryCode,
      name: countryName,
      isRegion: aggregateRegionCodes.has(countryCode),
    });

    for (const { index, year } of yearColumns) {
      const parsedValue = parseSeedValue(cell(row, index));

      if (annualField) {
        const key = seedKey(countryCode, year);
        const annual = annualEmissionsByCountryYear.get(key) ?? {
          countryCode,
          year,
          total: null,
          co2: null,
          ch4: null,
          n2o: null,
          hfc: null,
          pfc: null,
          sf6: null,
        };

        annual[annualField] = parsedValue;
        annualEmissionsByCountryYear.set(key, annual);
      }

      if (sectorField) {
        const key = seedKey(countryCode, year);
        const sector = sectorSharesByCountryYear.get(key) ?? {
          countryCode,
          year,
          transport: null,
          manufacturing: null,
          electricity: null,
          buildings: null,
          other: null,
        };

        sector[sectorField] = parsedValue;
        sectorSharesByCountryYear.set(key, sector);
      }
    }
  }

  return {
    countries: Array.from(countriesByCode.values()).sort((left, right) =>
      left.code.localeCompare(right.code),
    ),
    annualEmissionsByCountryYear,
    sectorSharesByCountryYear,
  };
}

export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      row.push(field);
      if (row.some((value) => value.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.trim().length > 0)) {
    rows.push(row);
  }

  return rows;
}

function buildColumnLookup(header: string[]) {
  const lookup = Object.fromEntries(
    header.map((name, index) => [name.trim(), index]),
  ) as Record<string, number>;

  const required = ["Country Name", "Country Code", "Series Name"];
  for (const col of required) {
    if (lookup[col] === undefined) {
      throw new Error(
        `Required column "${col}" was not found in the CSV header.`,
      );
    }
  }

  return lookup;
}

function cell(row: string[], index: number | undefined) {
  if (index === undefined) {
    return "";
  }

  return (row[index] ?? "").trim();
}

function normalizeSeriesName(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function parseYearColumn(value: string) {
  const match = value.match(/^(\d{4}) \[YR\d{4}\]$/);
  return match ? Number(match[1]) : Number.NaN;
}

function parseSeedValue(value: string) {
  const normalized = value.trim();

  if (!normalized || normalized === ".." || normalized.toUpperCase() === "NA") {
    return null;
  }

  const parsed = Number(normalized.replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function seedKey(countryCode: string, year: number) {
  return `${countryCode}:${year}`;
}
