"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { memo, useMemo } from "react";
import { ChartEmpty } from "@/components/dashboard/chart-card";
import type { SectorData } from "@/lib/dashboard-types";
import { SECTOR_KEYS, SECTOR_LABELS, formatNumber } from "@/lib/dashboard-types";
import { cohereTokens } from "@/theme";

type SectorChartProps = {
  data: SectorData;
  maxAvailableYear?: number;
};

const CHART_MARGIN = { bottom: 4, left: 12, right: 56, top: 4 };
const AXIS_TICK = { fill: cohereTokens.colors.slate, fontSize: cohereTokens.typography.micro.fontSize };

export const SectorChart = memo(function SectorChart({ data, maxAvailableYear }: SectorChartProps) {
  const values = useMemo(
    () =>
      SECTOR_KEYS.map((key) => ({
        key,
        label: SECTOR_LABELS[key],
        value: data.sectors[key],
        displayValue:
          data.sectors[key] === null ? "No data" : `${formatNumber(data.sectors[key])}%`,
        chartValue: data.sectors[key] ?? 0,
      })),
    [data.sectors],
  );
  const hasAnyValue = values.some((item) => item.value !== null);

  if (!hasAnyValue) {
    const noSectorDataAtAll = maxAvailableYear === undefined;
    const outOfRange = !noSectorDataAtAll && data.year > maxAvailableYear!;
    const message = noSectorDataAtAll
      ? `No sector breakdown available for ${data.country.name}.`
      : outOfRange
        ? `No sector breakdown available for ${data.country.name} in ${data.year}. Sector data is only available up to ${maxAvailableYear}.`
        : `No sector breakdown available for ${data.country.name} in ${data.year}.`;
    return <ChartEmpty message={message} />;
  }

  return (
    <Stack spacing={cohereTokens.spacing.sm} sx={{ height: "100%", minHeight: 0 }}>
      <Typography color="text.secondary" sx={{ fontSize: cohereTokens.typography.micro.fontSize }}>
        Comparing reported sector emissions shares for {data.country.name} in {data.year}.
      </Typography>
      <Box sx={{ height: { xs: 230, md: 128 }, flexShrink: 0, width: "100%" }}>
        <ResponsiveContainer height="100%" width="100%" minHeight={128}>
          <BarChart
            data={values}
            layout="vertical"
            margin={CHART_MARGIN}
          >
            <CartesianGrid horizontal={false} stroke={cohereTokens.colors.cardBorder} />
            <XAxis
              domain={[0, 100]}
              stroke={cohereTokens.colors.slate}
              tick={AXIS_TICK}
              tickFormatter={(value: number) => `${value}%`}
              type="number"
            />
            <YAxis
              dataKey="label"
              interval={0}
              stroke={cohereTokens.colors.slate}
              tick={AXIS_TICK}
              type="category"
              width={80}
            />
            <Tooltip
              cursor={{ fill: cohereTokens.colors.softEarth }}
              content={(props) => (
                <SectorTooltip {...props} countryName={data.country.name} year={data.year} />
              )}
            />
            <Bar barSize={22} dataKey="chartValue" isAnimationActive={false} radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="displayValue"
                position="right"
                style={{
                  fill: cohereTokens.colors.slate,
                  fontSize: cohereTokens.typography.micro.fontSize,
                  fontFamily: cohereTokens.font.mono,
                }}
              />
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
        aria-label="Sector values"
        sx={{
          display: "grid",
          gap: cohereTokens.spacing.tiny,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
        }}
      >
        {values.map((item) => (
          <Box
            key={item.key}
            sx={{
              alignItems: "center",
              borderTop: `1px solid ${cohereTokens.colors.cardBorder}`,
              display: "flex",
              justifyContent: "space-between",
              minWidth: 0,
              pt: cohereTokens.spacing.tiny,
            }}
          >
            <Typography sx={{ fontSize: cohereTokens.typography.micro.fontSize }}>
              {item.label}
            </Typography>
            <Typography
              sx={{
                color: item.value === null ? cohereTokens.colors.bodyMuted : cohereTokens.colors.ink,
                fontFamily: cohereTokens.font.mono,
                fontSize: cohereTokens.typography.micro.fontSize,
                ml: cohereTokens.spacing.md,
                whiteSpace: "nowrap",
              }}
            >
              {item.displayValue}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
});

type SectorTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ payload?: { displayValue: string } }>;
  countryName?: string;
  year?: number;
};

function SectorTooltip({ active, payload, label, countryName, year }: SectorTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = (payload[0] as { payload?: { displayValue: string } } | undefined)?.payload;
  const displayValue = item?.displayValue ?? "No data";

  return (
    <Paper
      elevation={4}
      sx={{
        borderRadius: cohereTokens.rounded.xs,
        maxWidth: 220,
        px: 1.5,
        py: 1,
      }}
    >
      <Typography sx={{ fontWeight: 600, fontSize: cohereTokens.typography.micro.fontSize, lineHeight: 1.4 }}>
        {countryName}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: cohereTokens.typography.micro.fontSize, lineHeight: 1.4 }}>
        {year} · {label}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: cohereTokens.typography.micro.fontSize, lineHeight: 1.4 }}>
        Share of fuel combustion CO2: {displayValue}
      </Typography>
    </Paper>
  );
}
