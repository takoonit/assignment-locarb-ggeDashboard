"use client";

import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { Box, Container, Stack, Typography } from "@mui/material";
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
import type { Gas } from "@/lib/dashboard-types";
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
  const initialSectorYear = sanitizeYear(searchParams.get("sectorYear"));
  const initialMapYear = sanitizeYear(searchParams.get("mapYear"));
  const initialGas = sanitizeGas(searchParams.get("gas"));

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

  const availableSectorYears = useMemo(() => sectorYearOptions.data ?? [], [sectorYearOptions.data]);
  const availableMapYears = useMemo(() => mapYearOptions.data ?? [], [mapYearOptions.data]);

  const effectiveSectorYear = useMemo(() => {
    if (availableSectorYears.length === 0 || availableSectorYears.includes(sectorYear)) return sectorYear;
    return closestAvailableYear(sectorYear, availableSectorYears);
  }, [availableSectorYears, sectorYear]);

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

  const updateQuery = useCallback((next: Partial<typeof query>) => {
    const merged = { ...query, ...next };
    const params = new URLSearchParams();

    if (merged.country !== DEFAULT_COUNTRY) params.set("country", merged.country);
    if (merged.sectorYear !== DEFAULT_YEAR) params.set("sectorYear", String(merged.sectorYear));
    if (merged.mapYear !== DEFAULT_YEAR) params.set("mapYear", String(merged.mapYear));
    if (merged.gas !== DEFAULT_GAS) params.set("gas", merged.gas);

    const href = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(href, { scroll: false });
  }, [pathname, query, router]);

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
    <Box component="main" sx={{ bgcolor: cohereTokens.colors.canvas, minHeight: "100vh" }}>
      <Container maxWidth={false} sx={{ maxWidth: 1480, px: { xs: cohereTokens.spacing.lg, md: cohereTokens.spacing.xxl }, py: cohereTokens.spacing.xxl }}>
        <Stack spacing={cohereTokens.spacing.xl}>
          <Header selectedCountryName={selectedCountryName} gas={gas} year={effectiveSectorYear} />

          <Box
            sx={{
              display: "grid",
              gap: cohereTokens.spacing.xl,
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.35fr) minmax(360px, 0.65fr)" },
            }}
          >
            <ChartCard
              title="Emissions trend"
              subtitle={`${selectedCountryName} · ${gasLabel(gas)} · Full available range`}
              controls={
                <Stack direction={{ xs: "column", sm: "row" }} spacing={cohereTokens.spacing.md} sx={{ flexWrap: "wrap" }}>
                  <CountrySelect
                    countries={countryOptions}
                    id="trend-country"
                    label="Trend country"
                    onChange={handleCountry}
                    value={country}
                  />
                  <GasControl ariaLabel="Trend gas" onChange={handleGas} value={gas} />
                </Stack>
              }
            >
              {renderTrend()}
            </ChartCard>

            <ChartCard
              title="Sector breakdown"
              subtitle={`${selectedCountryName} · ${effectiveSectorYear} · CO2 share of fuel combustion`}
              controls={
                <YearSelect
                  id="sector-year"
                  label="Sector year"
                  onChange={handleSectorYear}
                  value={effectiveSectorYear}
                  years={availableSectorYears}
                />
              }
            >
              {renderSector()}
            </ChartCard>

            <Box sx={{ gridColumn: "1 / -1" }}>
              <ChartCard
                tall
                title="World emissions map"
                subtitle={`${effectiveMapYear} · ${gasLabel(gas)} emissions`}
                controls={
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={cohereTokens.spacing.md} sx={{ flexWrap: "wrap" }}>
                    <YearSelect
                      id="map-year"
                      label="Map year"
                      onChange={handleMapYear}
                      value={effectiveMapYear}
                      years={availableMapYears}
                    />
                    <GasControl ariaLabel="Map gas" onChange={handleGas} value={gas} />
                  </Stack>
                }
              >
                {renderMap()}
              </ChartCard>
            </Box>
          </Box>
        </Stack>
      </Container>
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
    return <SectorChart data={sector.data} />;
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

function Header({
  gas,
  selectedCountryName,
  year,
}: {
  gas: Gas;
  selectedCountryName: string;
  year: number;
}) {
  return (
    <Box
      component="header"
      sx={{
        alignItems: { xs: "flex-start", md: "center" },
        borderBottom: `1px solid ${cohereTokens.colors.hairline}`,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: cohereTokens.spacing.lg,
        justifyContent: "space-between",
        pb: cohereTokens.spacing.xl,
      }}
    >
      <Stack direction="row" spacing={cohereTokens.spacing.md} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            alignItems: "center",
            bgcolor: cohereTokens.colors.primary,
            borderRadius: cohereTokens.rounded.sm,
            color: cohereTokens.colors.canvas,
            display: "flex",
            height: 42,
            justifyContent: "center",
            width: 42,
          }}
        >

          <AutoGraphIcon aria-hidden="true" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h1"
            variant="h1"
            sx={{
              fontSize: { xs: 34, md: 44, xl: 52 },
              lineHeight: 1.02,
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
              mt: cohereTokens.spacing.xxs,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: { md: "nowrap" },
            }}
            variant="body2"
          >
            Analytical greenhouse gas emissions overview · scoped filters · data integrity indicators
          </Typography>
        </Box>
      </Stack>
      <Box
        sx={{
          bgcolor: cohereTokens.colors.forestGreen,
          borderRadius: cohereTokens.rounded.sm,
          color: cohereTokens.colors.onDark,
          flexShrink: 0,
          maxWidth: { xs: "100%", md: 300 },
          px: cohereTokens.spacing.xl,
          py: cohereTokens.spacing.md,
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.7)" }} variant="caption">
          Current context
        </Typography>
        <Typography
          sx={{
            fontFamily: cohereTokens.font.mono,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          variant="body2"
        >
          {selectedCountryName} · {year} · {gasLabel(gas)}
        </Typography>
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
