"use client";

import { Box, Stack, Typography } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChartCard, ChartEmpty, ChartError, ChartSkeleton } from "@/components/dashboard/chart-card";
import { CountrySelect, GasControl, YearSelect } from "@/components/dashboard/controls";
import { SectorChart } from "@/components/dashboard/sector-chart";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { WorldMap } from "@/components/dashboard/world-map";
import {
  useAvailableMapYears,
  useAvailableSectorYears,
  useCountries,
  useMapData,
  useSectorData,
  useTrendData,
} from "@/hooks/use-dashboard-data";
import type { CountryOption, Gas } from "@/lib/dashboard-types";
import { gasLabel, isGas } from "@/lib/dashboard-types";
import { cohereTokens } from "@/theme";

const DEFAULT_COUNTRY = "THA";
const DEFAULT_YEAR = 2020;
const DEFAULT_GAS: Gas = "TOTAL";

export function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialCountry = sanitizeCountry(searchParams.get("country"));
  const initialSectorYear = sanitizeYear(searchParams.get("sectorYear") ?? searchParams.get("year"));
  const initialMapYear = sanitizeYear(searchParams.get("mapYear") ?? searchParams.get("year"));
  const initialGas = sanitizeGas(
    searchParams.get("gas") ?? searchParams.get("trendGas") ?? searchParams.get("mapGas"),
  );

  const [country, setCountry] = useState(initialCountry);
  const [sectorYear, setSectorYear] = useState(initialSectorYear);
  const [mapYear, setMapYear] = useState(initialMapYear);
  const [gas, setGas] = useState<Gas>(initialGas);

  const countries = useCountries();
  const countryOptions = countries.data ?? [];
  const selectedCountryName =
    countryOptions.find((item) => item.code === country)?.name ?? country;

  const trend = useTrendData(country, gas);
  const sectorYearOptions = useAvailableSectorYears(country);
  const mapYearOptions = useAvailableMapYears();

  const availableSectorYears = useMemo(
    () => sectorYearOptions.data ?? [],
    [sectorYearOptions.data],
  );
  const availableMapYears = useMemo(
    () => mapYearOptions.data ?? [],
    [mapYearOptions.data],
  );

  // Snap to the closest available year if the selected year has no data for this country.
  const effectiveSectorYear = useMemo(() => {
    if (availableSectorYears.length === 0 || availableSectorYears.includes(sectorYear)) return sectorYear;
    return closestAvailableYear(sectorYear, availableSectorYears);
  }, [availableSectorYears, sectorYear]);

  // Snap to the closest available year if the selected year has no global map data.
  const effectiveMapYear = useMemo(() => {
    if (availableMapYears.length === 0 || availableMapYears.includes(mapYear)) return mapYear;
    return closestAvailableYear(mapYear, availableMapYears);
  }, [availableMapYears, mapYear]);

  const sector = useSectorData(country, effectiveSectorYear);
  const map = useMapData(effectiveMapYear, gas);

  const query = useMemo(
    () => ({ country, sectorYear: effectiveSectorYear, mapYear: effectiveMapYear, gas }),
    [country, effectiveSectorYear, effectiveMapYear, gas],
  );

  const updateQuery = useCallback(
    (next: Partial<typeof query>) => {
      const merged = { ...query, ...next };
      const params = new URLSearchParams();

      if (merged.country !== DEFAULT_COUNTRY) params.set("country", merged.country);
      if (merged.sectorYear !== DEFAULT_YEAR) params.set("sectorYear", String(merged.sectorYear));
      if (merged.mapYear !== DEFAULT_YEAR) params.set("mapYear", String(merged.mapYear));
      if (merged.gas !== DEFAULT_GAS) params.set("gas", merged.gas);

      const href = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(href, { scroll: false });
    },
    [pathname, query, router],
  );

  useEffect(() => {
    if (effectiveSectorYear === sectorYear) return;
    updateQuery({ sectorYear: effectiveSectorYear });
  }, [effectiveSectorYear, updateQuery, sectorYear]);

  useEffect(() => {
    if (effectiveMapYear === mapYear) return;
    updateQuery({ mapYear: effectiveMapYear });
  }, [effectiveMapYear, updateQuery, mapYear]);

  function handleCountry(nextCountry: string) {
    setCountry(nextCountry);
    updateQuery({ country: nextCountry });
  }

  function handleSectorYear(nextYear: number) {
    setSectorYear(nextYear);
    updateQuery({ sectorYear: nextYear });
  }

  function handleMapYear(nextYear: number) {
    setMapYear(nextYear);
    updateQuery({ mapYear: nextYear });
  }

  function handleGas(nextGas: Gas) {
    setGas(nextGas);
    updateQuery({ gas: nextGas });
  }

  return (
    <Box
      sx={{
        bgcolor: cohereTokens.colors.canvas,
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: 1,
          maxWidth: 1600,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: { xs: 3, md: 2.5 },
          width: "100%",
        }}
      >
        <Stack spacing={{ xs: 3, md: 2 }} sx={{ minHeight: 0 }}>
          <DashboardTitle />
          <DashboardControls
            availableSectorYears={availableSectorYears}
            countries={countryOptions}
            country={country}
            effectiveSectorYear={effectiveSectorYear}
            gas={gas}
            onCountryChange={handleCountry}
            onGasChange={handleGas}
            onSectorYearChange={handleSectorYear}
            sectorYearSnapped={effectiveSectorYear !== sectorYear}
          />

          <Box
            sx={{
              alignItems: "stretch",
              display: "grid",
              gap: { xs: 2, md: 2 },
              gridTemplateColumns: {
                xs: "1fr",
                lg: "minmax(0, 1.45fr) minmax(300px, 0.55fr)",
              },
            }}
          >
            <ChartCard
              title="Emissions trend"
              subtitle={`${selectedCountryName} · ${gasLabel(gas)} · Full available range`}
            >
              {renderTrend()}
            </ChartCard>

            <ChartCard
              title="Sector breakdown"
              subtitle={`${selectedCountryName} · ${effectiveSectorYear} · CO2 share of fuel combustion`}
            >
              {renderSector()}
            </ChartCard>

            <Box sx={{ gridColumn: "1 / -1", minHeight: 0 }}>
              <ChartCard
                tall
                title="World emissions map"
                subtitle={`${effectiveMapYear} · ${gasLabel(gas)} emissions`}
                controls={
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={cohereTokens.spacing.md}
                    sx={{ alignItems: { sm: "flex-end" }, flexWrap: "wrap" }}
                  >
                    <YearSelect
                      id="map-year"
                      label="Year"
                      ariaLabel="Map year selection"
                      onChange={handleMapYear}
                      value={effectiveMapYear}
                      years={availableMapYears}
                      snapped={effectiveMapYear !== mapYear}
                    />
                  </Stack>
                }
              >
                {renderMap()}
              </ChartCard>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );

  function renderTrend() {
    if (trend.isLoading || countries.isLoading) return <ChartSkeleton />;
    if (trend.isError) return <ChartError onRetry={() => void trend.refetch()} />;
    if (!trend.data)
      return (
        <ChartEmpty message="Awaiting selection. Choose a country and gas to see historical emission trends since 1990." />
      );
    return <TrendChart data={trend.data} />;
  }

  function renderSector() {
    if (sector.isLoading || countries.isLoading) return <ChartSkeleton />;
    if (sector.isError) return <ChartError onRetry={() => void sector.refetch()} />;
    if (!sector.data)
      return (
        <ChartEmpty message="Sector data unavailable for this view. Try selecting a different reporting year or country." />
      );
    const maxSectorYear =
      availableSectorYears.length > 0 ? Math.max(...availableSectorYears) : undefined;
    return <SectorChart data={sector.data} maxAvailableYear={maxSectorYear} />;
  }

  function renderMap() {
    if (map.isLoading) return <ChartSkeleton />;
    if (map.isError) return <ChartError onRetry={() => void map.refetch()} />;
    if (!map.data)
      return <ChartEmpty message="Global dataset could not be loaded for the selected year." />;
    return <WorldMap data={map.data} onSelectCountry={handleCountry} selectedCountry={country} />;
  }
}

function DashboardTitle() {
  return (
    <Box
      sx={{
        borderBottom: `1px solid ${cohereTokens.colors.hairline}`,
        pb: 1.5,
      }}
    >
      <Typography
        component="h1"
        variant="h1"
        sx={{
          fontSize: { xs: 24, sm: 28 },
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: -0.5,
        }}
      >
        Global Greenhouse Gas Emissions
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: 13, mt: 0.5 }} variant="body2">
        Analytical overview · scoped filters · data integrity indicators
      </Typography>
    </Box>
  );
}

function DashboardControls({
  availableSectorYears,
  countries,
  country,
  effectiveSectorYear,
  gas,
  onCountryChange,
  onGasChange,
  onSectorYearChange,
  sectorYearSnapped,
}: {
  availableSectorYears: number[];
  countries: CountryOption[];
  country: string;
  effectiveSectorYear: number;
  gas: Gas;
  onCountryChange: (country: string) => void;
  onGasChange: (gas: Gas) => void;
  onSectorYearChange: (year: number) => void;
  sectorYearSnapped: boolean;
}) {
  return (
    <Box
      aria-label="Dashboard filters"
      component="div"
      role="toolbar"
      sx={{
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      <Box
        sx={{
          alignItems: { xs: "stretch", md: "flex-end" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: cohereTokens.spacing.md, md: cohereTokens.spacing.md },
          minWidth: "fit-content",
        }}
      >
        <CountrySelect
          ariaLabel="Country"
          countries={countries ?? []}
          id="dashboard-country"
          label="Country"
          onChange={onCountryChange}
          value={country}
        />
        <YearSelect
          ariaLabel="Sector year selection"
          id="dashboard-sector-year"
          label="Year"
          onChange={onSectorYearChange}
          snapped={sectorYearSnapped}
          value={effectiveSectorYear}
          years={availableSectorYears}
        />
        <GasControl ariaLabel="Gas" onChange={onGasChange} value={gas} />
      </Box>
    </Box>
  );
}

function sanitizeCountry(value: string | null) {
  return value && /^[A-Za-z]{3}$/.test(value) ? value.toUpperCase() : DEFAULT_COUNTRY;
}

function sanitizeYear(value: string | null) {
  const year = Number(value);
  return Number.isInteger(year) && year >= 1990 && year <= 2030 ? year : DEFAULT_YEAR;
}

function sanitizeGas(value: string | null): Gas {
  return isGas(value) ? value : DEFAULT_GAS;
}

function closestAvailableYear(target: number, years: number[]) {
  return years.reduce((closest, year) => {
    const currentDistance = Math.abs(year - target);
    const closestDistance = Math.abs(closest - target);

    if (currentDistance < closestDistance) return year;
    if (currentDistance === closestDistance) return Math.max(year, closest);
    return closest;
  }, years[0]);
}
