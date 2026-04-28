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

export function useSectorData(country: string, year: number) {
  return useQuery({
    queryKey: ["emissions", "sector", country, year],
    queryFn: () => fetchSector({ country, year }),
    enabled: Boolean(country && year),
  });
}

export function useMapData(year: number, gas: Gas) {
  return useQuery({
    queryKey: ["emissions", "map", year, gas],
    queryFn: () => fetchMap({ year, gas }),
    enabled: Boolean(year),
  });
}

export function useAvailableSectorYears(country: string) {
  return useQuery({
    queryKey: ["emissions", "available-sector-years", country],
    queryFn: () => fetchAvailableSectorYears(country),
    enabled: Boolean(country),
  });
}

export function useAvailableMapYears() {
  return useQuery({
    queryKey: ["emissions", "available-map-years"],
    queryFn: fetchAvailableMapYears,
    staleTime: Infinity,
  });
}
