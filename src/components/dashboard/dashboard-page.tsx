"use client";

import AutoGraphIcon from "@mui/icons-material/AutoGraph";
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
const FALLBACK_AVAILABLE_YEARS = [2022, 2020, 2019];

export function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialCountry = sanitizeCountry(searchParams.get("country"));
  const initialYear = sanitizeYear(searchParams.get("year") ?? searchParams.get("sectorYear") ?? searchParams.get("mapYear"));
  const initialGas = sanitizeGas(searchParams.get("gas") ?? searchParams.get("trendGas") ?? searchParams.get("mapGas"));

  const [country, setCountry] = useState(initialCountry);
  const [year, setYear] = useState(initialYear);
  const [gas, setGas] = useState<Gas>(initialGas);

  const countries = useCountries();
  const countryOptions = countries.data ?? [];
  const selectedCountryName =
    countryOptions.find((item) => item.code === country)?.name ?? country;

  const trend = useTrendData(country, gas);
  const sectorYearOptions = useAvailableSectorYears(country);
  const mapYearOptions = useAvailableMapYears();

  const availableSectorYears = useMemo(
    () => sectorYearOptions.data ?? FALLBACK_AVAILABLE_YEARS,
    [sectorYearOptions.data],
  );
  const availableMapYears = useMemo(
    () => mapYearOptions.data ?? FALLBACK_AVAILABLE_YEARS,
    [mapYearOptions.data],
  );

  // Snap to the closest available year if the selected year has no data for this country.
  const effectiveSectorYear = useMemo(() => {
    if (availableSectorYears.length === 0 || availableSectorYears.includes(year)) return year;
    return closestAvailableYear(year, availableSectorYears);
  }, [availableSectorYears, year]);

  // Snap to the closest available year if the selected year has no global map data.
  const effectiveMapYear = useMemo(() => {
    if (availableMapYears.length === 0 || availableMapYears.includes(year)) return year;
    return closestAvailableYear(year, availableMapYears);
  }, [availableMapYears, year]);

  const sector = useSectorData(country, effectiveSectorYear);
  const map = useMapData(effectiveMapYear, gas);

  const query = useMemo(
    () => ({ country, year: effectiveSectorYear, gas }),
    [country, effectiveSectorYear, gas],
  );

  const updateQuery = useCallback((next: Partial<typeof query>) => {
    const merged = { ...query, ...next };
    const params = new URLSearchParams();

    if (merged.country !== DEFAULT_COUNTRY) params.set("country", merged.country);
    if (merged.year !== DEFAULT_YEAR) params.set("year", String(merged.year));
    if (merged.gas !== DEFAULT_GAS) params.set("gas", merged.gas);

    const href = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(href, { scroll: false });
  }, [pathname, query, router]);

  useEffect(() => {
    if (effectiveSectorYear === year) return;
    updateQuery({ year: effectiveSectorYear });
  }, [effectiveSectorYear, updateQuery, year]);

  useEffect(() => {
    if (effectiveMapYear === year) return;
    updateQuery({ year: effectiveMapYear });
  }, [effectiveMapYear, updateQuery, year]);

  function handleCountry(nextCountry: string) {
    setCountry(nextCountry);
    updateQuery({ country: nextCountry });
  }

  function handleSectorYear(nextYear: number) {
    setYear(nextYear);
    updateQuery({ year: nextYear });
  }

  function handleMapYear(nextYear: number) {
    setYear(nextYear);
    updateQuery({ year: nextYear });
  }

  function handleGas(nextGas: Gas) {
    setGas(nextGas);
    updateQuery({ gas: nextGas });
  }

  return (
    <Box
      component="main"
      sx={{
        bgcolor: cohereTokens.colors.canvas,
        minHeight: "100vh",
        overflow: { md: "hidden" },
      }}
    >
      <Box
        sx={{
          height: { md: "100dvh" },
          maxWidth: 1600,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 2.5, xl: 3 },
          py: { xs: 3, md: 1.5 },
        }}
      >
        <Stack spacing={{ xs: 3, md: 1.35 }} sx={{ height: { md: "100%" }, minHeight: 0 }}>
          <Header />
          <DashboardControls
            availableSectorYears={availableSectorYears}
            countries={countryOptions}
            country={country}
            effectiveSectorYear={effectiveSectorYear}
            gas={gas}
            onCountryChange={handleCountry}
            onGasChange={handleGas}
            onSectorYearChange={handleSectorYear}
            sectorYearSnapped={effectiveSectorYear !== year}
          />

          <Box
            sx={{
              alignItems: "stretch",
              display: "grid",
              flex: { md: 1 },
              gap: { xs: 2, md: 1.5 },
              gridTemplateColumns: {
                xs: "1fr",
                lg: "minmax(0, 1.45fr) minmax(320px, 0.55fr)",
              },
              gridTemplateRows: { lg: "minmax(258px, 0.43fr) minmax(0, 0.57fr)" },
              minHeight: 0,
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
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={cohereTokens.spacing.md} sx={{ alignItems: { sm: "flex-end" }, flexWrap: "wrap" }}>
                    <YearSelect
                      id="map-year"
                      label="Year"
                      ariaLabel="Map year selection"
                      onChange={handleMapYear}
                      value={effectiveMapYear}
                      years={availableMapYears}
                      snapped={effectiveMapYear !== year}
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
    if (!trend.data) return (
      <ChartEmpty
        message="Awaiting selection. Choose a country and gas to see historical emission trends since 1990."
      />
    );
    return <TrendChart data={trend.data} />;
  }

  function renderSector() {
    if (sector.isLoading || countries.isLoading) return <ChartSkeleton />;
    if (sector.isError) return <ChartError onRetry={() => void sector.refetch()} />;
    if (!sector.data) return (
      <ChartEmpty
        message="Sector data unavailable for this view. Try selecting a different reporting year or country."
      />
    );
    const maxSectorYear = availableSectorYears.length > 0
      ? Math.max(...availableSectorYears)
      : undefined;
    return <SectorChart data={sector.data} maxAvailableYear={maxSectorYear} />;
  }

  function renderMap() {
    if (map.isLoading) return <ChartSkeleton />;
    if (map.isError) return <ChartError onRetry={() => void map.refetch()} />;
    if (!map.data) return (
      <ChartEmpty
        message="Global dataset could not be loaded for the selected year."
      />
    );
    return <WorldMap data={map.data} onSelectCountry={handleCountry} selectedCountry={country} />;
  }
}

function Header() {
  return (
    <Box
      component="header"
      sx={{
        alignItems: "center",
        borderBottom: `1px solid ${cohereTokens.colors.hairline}`,
        display: "flex",
        gap: cohereTokens.spacing.md,
        justifyContent: "space-between",
        pb: { xs: 2, md: 1 },
      }}
    >
      <Stack direction="row" spacing={cohereTokens.spacing.md} sx={{ alignItems: "center", minWidth: 0 }}>
        <Box
          sx={{
            alignItems: "center",
            bgcolor: cohereTokens.colors.primary,
            borderRadius: cohereTokens.rounded.sm,
            color: cohereTokens.colors.canvas,
            display: "flex",
            flexShrink: 0,
            height: { xs: 40, md: 34 },
            justifyContent: "center",
            width: { xs: 40, md: 34 },
          }}
        >
          <AutoGraphIcon aria-hidden="true" fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h1"
            variant="h1"
            sx={{
              fontSize: { xs: 28, sm: 34, md: 34 },
              lineHeight: 1.05,
              letterSpacing: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: { md: "nowrap" },
            }}
          >
            Global Greenhouse Gas Emissions
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              mt: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: { md: "nowrap" },
            }}
            variant="body2"
          >
            Analytical overview · scoped filters · data integrity indicators
          </Typography>
        </Box>
      </Stack>
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
        alignItems: { xs: "stretch", md: "center" },
        display: "inline-flex",
        flexShrink: 0,
        maxWidth: "100%",
        width: "fit-content",
      }}
    >
      <Box
        sx={{
          alignItems: { xs: "stretch", md: "flex-end" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: cohereTokens.spacing.md, md: cohereTokens.spacing.sm },
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
