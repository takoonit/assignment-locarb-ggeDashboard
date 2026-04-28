import type { CountryOption, Gas, MapData, SectorData, TrendData } from "@/lib/dashboard-types";
import { SECTOR_KEYS } from "@/lib/dashboard-types";

type ApiSuccess<T> = { data: T };
type ApiFailure = { error: { code: string; details?: unknown } };

async function apiFetch<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path, window.location.origin);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const response = await fetch(`${url.pathname}${url.search}`);
  const json = (await response.json()) as ApiSuccess<T> | ApiFailure;

  if (!response.ok || "error" in json) {
    const code = "error" in json ? json.error.code : "INTERNAL_ERROR";
    throw new Error(code);
  }

  return json.data;
}

export function fetchCountries() {
  return apiFetch<CountryOption[]>("/api/countries");
}

export function fetchTrend(params: { country: string; gas: Gas }) {
  return apiFetch<TrendData>("/api/emissions/trend", params);
}

export function fetchSector(params: { country: string; year: number }) {
  return apiFetch<SectorData>("/api/emissions/sector", params);
}

export function fetchMap(params: { year: number; gas: Gas }) {
  return apiFetch<MapData>("/api/emissions/map", params);
}

export async function fetchAvailableMapYears() {
  const candidates = [];
  for (let year = 2022; year >= 1990; year -= 1) candidates.push(year);

  const results = await Promise.all(
    candidates.map(async (year) => {
      try {
        const data = await fetchMap({ year, gas: "TOTAL" });
        return data.countries.length > 0 ? year : null;
      } catch {
        return null;
      }
    }),
  );

  return results.filter((year): year is number => year !== null);
}

export async function fetchAvailableSectorYears(country: string) {
  const candidates = [];
  for (let year = 2030; year >= 1990; year -= 1) candidates.push(year);

  const rows = await Promise.all(
    candidates.map(async (year) => {
      try {
        const data = await fetchSector({ country, year });
        const hasData = SECTOR_KEYS.some((key) => data.sectors[key] !== null);
        return hasData ? year : null;
      } catch {
        return null;
      }
    }),
  );

  return rows.filter((year): year is number => year !== null);
}
