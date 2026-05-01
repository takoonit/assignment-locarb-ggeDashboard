"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useRef, useState } from "react";
import { ChartEmpty } from "@/components/dashboard/chart-card";
import type { Gas, MapData } from "@/lib/dashboard-types";
import { formatCompact, formatNumber, formatUnit, gasLabel } from "@/lib/dashboard-types";
import { cohereTokens } from "@/theme";

type WorldMapProps = {
  data: MapData;
  selectedCountry: string;
  onSelectCountry: (countryCode: string) => void;
};

type GeographyShape = {
  rsmKey: string;
  id?: string | number;
  properties?: {
    name?: string;
  };
};

type TooltipState = {
  x: number;
  y: number;
  name: string;
  value: number | null;
  status: MapStatus;
} | null;

type MapStatus = "tracked" | "no-data" | "not-tracked";

const TRACKED_SCALE_COLORS = ["#d6eef7", "#73b7d6", "#f3d98b", "#e58b3a", "#a63d1f"] as const;
const NO_DATA_COLOR = "#c4cdc8";
const NOT_TRACKED_COLOR = "#ede5d8";

// ISO numeric (3-digit, zero-padded) → ISO alpha-3
const NUM_TO_A3: Record<string, string> = {
  "004": "AFG", "008": "ALB", "012": "DZA", "024": "AGO", "032": "ARG",
  "036": "AUS", "040": "AUT", "050": "BGD", "056": "BEL", "064": "BTN",
  "068": "BOL", "076": "BRA", "100": "BGR", "104": "MMR", "116": "KHM",
  "120": "CMR", "124": "CAN", "144": "LKA", "152": "CHL", "156": "CHN",
  "170": "COL", "178": "COG", "180": "COD", "188": "CRI", "191": "HRV",
  "192": "CUB", "203": "CZE", "208": "DNK", "218": "ECU", "818": "EGY",
  "231": "ETH", "246": "FIN", "250": "FRA", "276": "DEU", "288": "GHA",
  "300": "GRC", "320": "GTM", "324": "GIN", "344": "HKG", "348": "HUN",
  "356": "IND", "360": "IDN", "364": "IRN", "368": "IRQ", "372": "IRL",
  "376": "ISR", "380": "ITA", "388": "JAM", "392": "JPN", "400": "JOR",
  "398": "KAZ", "404": "KEN", "408": "PRK", "410": "KOR", "414": "KWT",
  "418": "LAO", "422": "LBN", "430": "LBR", "434": "LBY",
  "458": "MYS", "484": "MEX", "504": "MAR", "508": "MOZ", "516": "NAM",
  "524": "NPL", "528": "NLD", "554": "NZL", "566": "NGA", "578": "NOR",
  "586": "PAK", "591": "PAN", "604": "PER", "608": "PHL", "616": "POL",
  "620": "PRT", "634": "QAT", "642": "ROU", "643": "RUS",
  "682": "SAU", "686": "SEN", "694": "SLE", "706": "SOM", "710": "ZAF",
  "724": "ESP", "729": "SDN", "752": "SWE", "756": "CHE", "760": "SYR",
  "158": "TWN", "762": "TJK", "764": "THA", "788": "TUN", "792": "TUR",
  "800": "UGA", "804": "UKR", "784": "ARE", "826": "GBR", "840": "USA",
  "858": "URY", "860": "UZB", "704": "VNM", "887": "YEM", "894": "ZMB",
  "716": "ZWE", "446": "MAC", "466": "MLI", "478": "MRT",
  "450": "MDG", "454": "MWI", "562": "NER", "768": "TGO",
};

const WORLD_TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function WorldMap({ data, selectedCountry, onSelectCountry }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data.countries.length) {
    return <ChartEmpty message="No map data available for this selection." />;
  }

  const values = data.countries.map((c) => c.value).filter((v): v is number => v !== null);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const byCode = new Map(data.countries.map((c) => [c.countryCode, c]));

  function positionFromEvent(evt: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    return {
      x: evt.clientX - (rect?.left ?? 0),
      y: evt.clientY - (rect?.top ?? 0),
    };
  }

  return (
    <Stack spacing={cohereTokens.spacing.sm} sx={{ height: "100%", minHeight: 0 }}>
      <Box
        ref={containerRef}
        sx={{
          bgcolor: cohereTokens.colors.paleBlue,
          border: `1px solid ${cohereTokens.colors.cardBorder}`,
          borderRadius: cohereTokens.rounded.sm,
          flex: 1,
          minHeight: { xs: 260, md: 0 },
          overflow: "hidden",
          position: "relative",
        }}
        onMouseLeave={() => setTooltip(null)}
      >
        <ComposableMap height={224} projection="geoEqualEarth" projectionConfig={{ scale: 132 }}>
          <Geographies geography={WORLD_TOPO_URL}>
            {({ geographies }: { geographies: GeographyShape[] }) =>
              geographies.map((geo) => {
                const numId = String(geo.id ?? "").padStart(3, "0");
                const code = NUM_TO_A3[numId] ?? "";
                const country = code ? byCode.get(code) : undefined;
                const value = country?.value ?? null;
                const status = getMapStatus(country, value);
                const selected = selectedCountry === code;
                const displayName = (country?.countryName ?? geo.properties?.name ?? code) || "Unknown";

                return (
                  <Geography
                    aria-label={`${displayName}: ${formatMapAriaLabel(status, value, data.unit)}`}
                    geography={geo}
                    key={geo.rsmKey}
                    onClick={() => {
                      if (country) onSelectCountry(country.countryCode);
                    }}
                    onMouseEnter={(evt: React.MouseEvent) => {
                      const { x, y } = positionFromEvent(evt);
                      setTooltip({ x, y, name: displayName, status, value });
                    }}
                    onMouseMove={(evt: React.MouseEvent) => {
                      const { x, y } = positionFromEvent(evt);
                      setTooltip((prev) => (prev ? { ...prev, x, y } : prev));
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    role="button"
                    style={{
                      default: {
                        fill: colorForValue(value, min, max, status),
                        outline: "none",
                        stroke: selected ? cohereTokens.colors.actionBlue : cohereTokens.colors.canvas,
                        strokeWidth: selected ? 1.8 : 0.5,
                      },
                      hover: {
                        fill: country
                          ? cohereTokens.colors.forestGreen
                          : cohereTokens.colors.softEarth,
                        outline: "none",
                        stroke: cohereTokens.colors.ink,
                        strokeWidth: 1.2,
                      },
                      pressed: {
                        fill: cohereTokens.colors.forestGreen,
                        outline: "none",
                      },
                      // @ts-expect-error — @types/react-simple-maps omits `focused`; the runtime supports it
                      focused: {
                        fill: country
                          ? cohereTokens.colors.forestGreen
                          : cohereTokens.colors.softEarth,
                        outline: "none",
                        stroke: cohereTokens.colors.focusBlue,
                        strokeWidth: 2,
                      },
                    }}
                    tabIndex={country ? 0 : -1}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {tooltip ? (
          <MapTooltip
            gas={data.gas}
            unit={formatUnit(data.unit)}
            x={tooltip.x}
            y={tooltip.y}
            name={tooltip.name}
            status={tooltip.status}
            value={tooltip.value}
            year={data.year}
          />
        ) : null}

      </Box>
      <MapLegend max={max} min={min} year={data.year} />
    </Stack>
  );
}

function MapTooltip({
  gas,
  name,
  status,
  unit,
  value,
  x,
  y,
  year,
}: {
  gas: Gas;
  name: string;
  status: MapStatus;
  unit: string;
  value: number | null;
  x: number;
  y: number;
  year: number;
}) {
  const OFFSET = 14;
  return (
    <Paper
      elevation={4}
      sx={{
        borderRadius: cohereTokens.rounded.xs,
        left: x + OFFSET,
        maxWidth: 220,
        pointerEvents: "none",
        position: "absolute",
        px: 1.5,
        py: 1,
        top: y + OFFSET,
        zIndex: 10,
      }}
    >
      <Typography
        sx={{ fontWeight: 600, fontSize: cohereTokens.typography.micro.fontSize, lineHeight: 1.4 }}
      >
        {name}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ fontSize: cohereTokens.typography.micro.fontSize, lineHeight: 1.4 }}
      >
        {year} {gasLabel(gas)}: {formatMapTooltipLabel(status, value, unit)}
      </Typography>
    </Paper>
  );
}

function getMapStatus(
  country: MapData["countries"][number] | undefined,
  value: number | null,
): MapStatus {
  if (!country) return "not-tracked";
  if (value === null) return "no-data";
  return "tracked";
}

function formatMapAriaLabel(status: MapStatus, value: number | null, unit: string) {
  if (status === "not-tracked") return "Not in dataset";
  if (status === "no-data") return "No reported emissions";
  return `${formatCompact(value)} ${formatUnit(unit)}`;
}

function formatMapTooltipLabel(status: MapStatus, value: number | null, unit: string) {
  if (status === "not-tracked") return "Not in dataset";
  if (status === "no-data") return "No reported emissions";
  return `${formatNumber(value)} ${unit}`;
}

function colorForValue(value: number | null, min: number, max: number, status: MapStatus) {
  if (status === "not-tracked") return NOT_TRACKED_COLOR;
  if (status === "no-data" || value === null) return NO_DATA_COLOR;
  if (max <= min) return TRACKED_SCALE_COLORS[2];

  const ratio = (value - min) / (max - min);

  if (ratio > 0.8) return TRACKED_SCALE_COLORS[4];
  if (ratio > 0.6) return TRACKED_SCALE_COLORS[3];
  if (ratio > 0.4) return TRACKED_SCALE_COLORS[2];
  if (ratio > 0.2) return TRACKED_SCALE_COLORS[1];
  return TRACKED_SCALE_COLORS[0];
}

function MapLegend({
  max,
  min,
  year,
}: {
  max: number;
  min: number;
  year: number;
}) {
  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
        gap: 2,
        flexShrink: 0,
        flexWrap: "wrap",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Typography variant="caption">Low</Typography>
        <Box sx={{ display: "flex" }}>
          {TRACKED_SCALE_COLORS.map((color) => (
            <Box key={color} sx={{ bgcolor: color, height: 10, width: 24 }} />
          ))}
        </Box>
        <Typography variant="caption">High</Typography>
        <Typography color="text.secondary" variant="caption">
          {formatCompact(min)} - {formatCompact(max)}
        </Typography>
      </Box>
      <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
        <Box
          sx={{
            bgcolor: NO_DATA_COLOR,
            border: `1px solid ${cohereTokens.colors.hairline}`,
            borderRadius: 0.5,
            height: 10,
            width: 14,
          }}
        />
        <Typography color="text.secondary" variant="caption">
          No reported emissions ({year})
        </Typography>
        <Box
          sx={{
            bgcolor: NOT_TRACKED_COLOR,
            border: `1px solid ${cohereTokens.colors.hairline}`,
            borderRadius: 0.5,
            height: 10,
            ml: 0.5,
            width: 14,
          }}
        />
        <Typography color="text.secondary" variant="caption">
          Not in dataset
        </Typography>
      </Box>
    </Box>
  );
}
