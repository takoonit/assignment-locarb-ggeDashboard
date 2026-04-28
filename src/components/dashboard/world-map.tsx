"use client";

import { Box, Stack, Typography } from "@mui/material";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { ChartEmpty } from "@/components/dashboard/chart-card";
import type { Gas, MapData } from "@/lib/dashboard-types";
import { formatCompact, gasLabel } from "@/lib/dashboard-types";
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
  if (!data.countries.length) {
    return <ChartEmpty message="No map data available for this selection." />;
  }

  const values = data.countries.map((c) => c.value).filter((v): v is number => v !== null);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const byCode = new Map(data.countries.map((c) => [c.countryCode, c]));

  return (
    <Stack spacing={cohereTokens.spacing.lg}>
      <Box
        sx={{
          bgcolor: cohereTokens.colors.paleBlue,
          border: `1px solid ${cohereTokens.colors.cardBorder}`,
          borderRadius: cohereTokens.rounded.sm,
          overflow: "hidden",
        }}
      >
        <ComposableMap height={340} projection="geoEqualEarth" projectionConfig={{ scale: 153 }}>
          <Geographies geography={WORLD_TOPO_URL}>
            {({ geographies }: { geographies: GeographyShape[] }) =>
              geographies.map((geo) => {
                const numId = String(geo.id ?? "").padStart(3, "0");
                const code = NUM_TO_A3[numId] ?? "";
                const country = code ? byCode.get(code) : undefined;
                const value = country?.value ?? null;
                const selected = selectedCountry === code;

                return (
                  <Geography
                    aria-label={`${(country?.countryName ?? geo.properties?.name ?? code) || "Unknown"}: ${
                      value === null ? "No data" : `${formatCompact(value)} ${data.unit}`
                    }`}
                    geography={geo}
                    key={geo.rsmKey}
                    onClick={() => {
                      if (country) onSelectCountry(country.countryCode);
                    }}
                    role="button"
                    style={{
                      default: {
                        fill: colorForValue(value, min, max, data.gas, !!country),
                        outline: "none",
                        stroke: selected ? cohereTokens.colors.actionBlue : cohereTokens.colors.canvas,
                        strokeWidth: selected ? 1.8 : 0.5,
                      },
                      hover: {
                        fill: country
                          ? (value === null ? cohereTokens.colors.hairline : cohereTokens.colors.forestGreen)
                          : cohereTokens.colors.softEarth,
                        outline: "none",
                        stroke: cohereTokens.colors.ink,
                        strokeWidth: 1.2,
                      },
                      pressed: {
                        fill: cohereTokens.colors.forestGreen,
                        outline: "none",
                      },
                    }}
                    tabIndex={country ? 0 : -1}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </Box>
      <MapLegend gas={data.gas} max={max} min={min} unit={data.unit} year={data.year} />
    </Stack>
  );
}

function colorForValue(value: number | null, min: number, max: number, gas: Gas, tracked: boolean) {
  if (!tracked) return cohereTokens.colors.softEarth;
  if (value === null) return cohereTokens.colors.hairline;
  if (max <= min) return cohereTokens.colors.actionBlue;

  const ratio = (value - min) / (max - min);
  if (ratio > 0.8) return cohereTokens.colors.forestGreen;
  if (ratio > 0.6) return cohereTokens.colors.primary;
  if (ratio > 0.4) return cohereTokens.colors.actionBlue;
  if (ratio > 0.2) return gas === "TOTAL" ? cohereTokens.colors.slate : cohereTokens.colors.warningAmber;
  return cohereTokens.colors.hairline;
}

function MapLegend({
  gas,
  max,
  min,
  unit,
  year,
}: {
  gas: Gas;
  max: number;
  min: number;
  unit: string;
  year: number;
}) {
  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
        flexWrap: "wrap",
        gap: 1.25,
        justifyContent: "space-between",
      }}
    >
      <Typography color="text.secondary" variant="body2">
        {year} · {gasLabel(gas)} emissions · {unit}
      </Typography>
      <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Typography variant="caption">Low</Typography>
        <Box sx={{ display: "flex" }}>
          {[
            cohereTokens.colors.hairline,
            cohereTokens.colors.slate,
            cohereTokens.colors.actionBlue,
            cohereTokens.colors.primary,
            cohereTokens.colors.forestGreen,
          ].map((color) => (
            <Box key={color} sx={{ bgcolor: color, height: 10, width: 24 }} />
          ))}
        </Box>
        <Typography variant="caption">High</Typography>
        <Typography color="text.secondary" variant="caption">
          {formatCompact(min)} - {formatCompact(max)}
        </Typography>
        <Box
          sx={{
            bgcolor: cohereTokens.colors.hairline,
            border: `1px dashed ${cohereTokens.colors.slate}`,
            height: 10,
            ml: 1,
            width: 18,
          }}
        />
        <Typography variant="caption">No data</Typography>
        <Box
          sx={{
            bgcolor: cohereTokens.colors.softEarth,
            height: 10,
            ml: 0.5,
            width: 18,
          }}
        />
        <Typography variant="caption">Not tracked</Typography>
      </Box>
    </Box>
  );
}
