import type { CountryOption, Gas, MapData, SectorData, TrendData } from "@/lib/dashboard-types";

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

export function fetchAvailableMapYears() {
  return apiFetch<number[]>("/api/emissions/map/years");
}

export function fetchAvailableSectorYears(country: string) {
  return apiFetch<number[]>("/api/emissions/sector/years", { country });
}
