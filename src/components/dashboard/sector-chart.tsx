"use client";

import { Box, Stack, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartEmpty } from "@/components/dashboard/chart-card";
import type { SectorData } from "@/lib/dashboard-types";
import { SECTOR_KEYS, SECTOR_LABELS, formatNumber } from "@/lib/dashboard-types";
import { cohereTokens } from "@/theme";

type SectorChartProps = {
  data: SectorData;
};

export function SectorChart({ data }: SectorChartProps) {
  const values = SECTOR_KEYS.map((key) => ({
    key,
    label: SECTOR_LABELS[key],
    value: data.sectors[key],
    displayValue:
      data.sectors[key] === null ? "No data" : `${formatNumber(data.sectors[key])}%`,
    chartValue: data.sectors[key] ?? 0,
  }));
  const hasAnyValue = values.some((item) => item.value !== null);

  if (!hasAnyValue) {
    return (
      <ChartEmpty
        message={`No sector breakdown available for ${data.country.name} in ${data.year}.`}
      />
    );
  }

  return (
    <Stack spacing={cohereTokens.spacing.md} sx={{ height: "100%" }}>
      <Typography color="text.secondary" variant="body2">
        {data.country.name} · {data.year} · CO2 share of fuel combustion
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 260, width: "100%" }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            data={values}
            margin={{ bottom: 6, left: 8, right: 12, top: 16 }}
          >
            <CartesianGrid stroke={cohereTokens.colors.cardBorder} vertical={false} />
            <XAxis
              dataKey="label"
              interval={0}
              stroke={cohereTokens.colors.slate}
              tick={{ fill: cohereTokens.colors.slate, fontSize: cohereTokens.typography.micro.fontSize }}
            />
            <YAxis
              domain={[0, 100]}
              stroke={cohereTokens.colors.slate}
              tick={{ fill: cohereTokens.colors.slate, fontSize: cohereTokens.typography.micro.fontSize }}
              tickFormatter={(value: number) => `${value}%`}
              width={48}
            />
            <Tooltip
              formatter={(_value, _name, item) => {
                const payload = item.payload as { displayValue: string };
                return [payload.displayValue, "% of fuel combustion CO2 emissions"];
              }}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="chartValue" isAnimationActive={false} radius={[4, 4, 0, 0]}>
              {values.map((item) => (
                <Cell
                  fill={item.value === null ? cohereTokens.colors.softEarth : cohereTokens.colors.primary}
                  key={item.key}
                  stroke={item.value === null ? cohereTokens.colors.hairline : cohereTokens.colors.primary}
                  strokeDasharray={item.value === null ? "3 3" : undefined}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Box
        sx={{
          display: "grid",
          gap: cohereTokens.spacing.sm,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(5, minmax(0, 1fr))" },
        }}
      >
        {values.map((item) => (
          <Box
            key={item.key}
            sx={{
              borderTop: `1px solid ${cohereTokens.colors.cardBorder}`,
              pt: cohereTokens.spacing.sm,
              minWidth: 0,
            }}
          >
            <Typography variant="caption">{item.label}</Typography>
            <Typography color={item.value === null ? "text.secondary" : "text.primary"} variant="body2">
              {item.displayValue}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
