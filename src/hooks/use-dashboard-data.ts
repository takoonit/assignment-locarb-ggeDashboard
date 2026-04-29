"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAvailableMapYears,
  fetchAvailableSectorYears,
  fetchCountries,
  fetchMap,
  fetchSector,
  fetchTrend,
} from "@/lib/api-client";
import type { Gas } from "@/lib/dashboard-types";

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
  });
}

export function useTrendData(country: string, gas: Gas) {
  return useQuery({
    queryKey: ["emissions", "trend", country, gas],
    queryFn: () => fetchTrend({ country, gas }),
    enabled: Boolean(country),
  });
}

// `ready` prevents firing before available-sector-years resolves for the new country,
// which would cause a wasted request with the previous country's effective year.
export function useSectorData(country: string, year: number, ready = true) {
  return useQuery({
    queryKey: ["emissions", "sector", country, year],
    queryFn: () => fetchSector({ country, year }),
    enabled: Boolean(country && year) && ready,
  });
}

export function useMapData(year: number, gas: Gas) {
  return useQuery({
    queryKey: ["emissions", "map", year, gas],
    queryFn: () => fetchMap({ year, gas }),
    enabled: Boolean(year),
  });
}

// Cached forever — seeded year lists don't change at runtime. This also eliminates
// the waterfall where useSectorData would otherwise wait a full round-trip before firing.
export function useAvailableSectorYears(country: string) {
  return useQuery({
    queryKey: ["emissions", "available-sector-years", country],
    queryFn: () => fetchAvailableSectorYears(country),
    enabled: Boolean(country),
    staleTime: Infinity,
  });
}

// Cached forever — global map years are static after seeding.
export function useAvailableMapYears() {
  return useQuery({
    queryKey: ["emissions", "available-map-years"],
    queryFn: fetchAvailableMapYears,
    staleTime: Infinity,
  });
}
