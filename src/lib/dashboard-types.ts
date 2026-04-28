export const GAS_OPTIONS = [
  { value: "TOTAL", label: "Total" },
  { value: "CO2", label: "CO2" },
  { value: "CH4", label: "CH4" },
  { value: "N2O", label: "N2O" },
  { value: "HFC", label: "HFC" },
  { value: "PFC", label: "PFC" },
  { value: "SF6", label: "SF6" },
] as const;

export type Gas = (typeof GAS_OPTIONS)[number]["value"];

export type CountryOption = {
  code: string;
  name: string;
  isRegion: boolean;
};

export type TrendPoint = {
  year: number;
  value: number | null;
};

export type TrendData = {
  country: { code: string; name: string };
  gas: Gas;
  unit: "kt_co2e";
  points: TrendPoint[];
};

export const SECTOR_KEYS = [
  "transport",
  "manufacturing",
  "electricity",
  "buildings",
  "other",
] as const;

export type SectorKey = (typeof SECTOR_KEYS)[number];

export const SECTOR_LABELS: Record<SectorKey, string> = {
  transport: "Transport",
  manufacturing: "Manufacturing",
  electricity: "Electricity",
  buildings: "Buildings",
  other: "Other",
};

export type SectorData = {
  country: { code: string; name: string };
  year: number;
  unit: "percent";
  sectors: Record<SectorKey, number | null>;
};

export type MapCountry = {
  countryCode: string;
  countryName: string;
  value: number | null;
};

export type MapData = {
  year: number;
  gas: Gas;
  unit: "kt_co2e";
  countries: MapCountry[];
};

export function isGas(value: string | null): value is Gas {
  return GAS_OPTIONS.some((gas) => gas.value === value);
}

export function gasLabel(gas: Gas) {
  if (gas === "TOTAL") return "Total GHG";
  return gas;
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "No data";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export function formatCompact(value: number | null | undefined) {
  if (value === null || value === undefined) return "No data";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}
