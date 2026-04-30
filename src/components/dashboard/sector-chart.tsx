"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { memo, useMemo } from "react";
import type { RectangleProps } from "recharts";
import { ChartEmpty } from "@/components/dashboard/chart-card";
import { MeasuredResponsiveContainer } from "@/components/dashboard/measured-responsive-container";
import type { SectorData } from "@/lib/dashboard-types";
import { SECTOR_KEYS, SECTOR_LABELS, formatNumber } from "@/lib/dashboard-types";
import { cohereTokens } from "@/theme";

type SectorChartProps = {
  data: SectorData;
  maxAvailableYear?: number;
};

const CHART_MARGIN = { bottom: 4, left: 12, right: 56, top: 4 };
const AXIS_TICK = { fill: cohereTokens.colors.slate, fontSize: cohereTokens.typography.micro.fontSize };

/** Minimum bar width in px for 0 / null values so they remain visible. */
const MIN_BAR_PX = 4;

/**
 * Custom bar shape that enforces a minimum width for zero/null-valued sectors
 * so the bar is always visible and the layout never collapses.
 */
function SectorBarShape(props: RectangleProps & { value?: number; payload?: { value: number | null } }) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  const rawValue = payload?.value;
  const isNull = rawValue === null;
  const isZero = rawValue === 0;
  const needsMinWidth = (isNull || isZero) && width < MIN_BAR_PX;
  const effectiveWidth = needsMinWidth ? MIN_BAR_PX : width;

  const fill = isNull ? cohereTokens.colors.softEarth : cohereTokens.colors.primary;
  const stroke = isNull ? cohereTokens.colors.hairline : isZero ? cohereTokens.colors.slate : cohereTokens.colors.primary;
  const strokeDasharray = isNull ? "3 3" : undefined;
  const opacity = isNull ? 0.6 : isZero ? 0.45 : 1;
  const radius = 4;

  return (
    <rect
      x={x}
      y={y}
      width={effectiveWidth}
      height={height}
      fill={fill}
      stroke={stroke}
      strokeWidth={isNull || isZero ? 1 : 0}
      strokeDasharray={strokeDasharray}
      opacity={opacity}
      rx={radius}
      ry={radius}
    />
  );
}

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

  const allZero = values.every((item) => item.value === 0);

  return (
    <Stack spacing={cohereTokens.spacing.sm} sx={{ height: "100%", minHeight: 0 }}>
      <Typography color="text.secondary" sx={{ fontSize: cohereTokens.typography.micro.fontSize }}>
        Comparing reported sector emissions shares for {data.country.name} in {data.year}.
        {allZero && " All sectors report 0\u2009% share."}
      </Typography>
      <Box sx={{ height: { xs: 230, md: 128 }, flexShrink: 0, width: "100%" }}>
        <MeasuredResponsiveContainer minHeight={128}>
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
            <Bar
              barSize={22}
              dataKey="chartValue"
              isAnimationActive={false}
              shape={<SectorBarShape />}
            >
              <LabelList
                dataKey="displayValue"
                position="right"
                style={{
                  fill: cohereTokens.colors.slate,
                  fontSize: cohereTokens.typography.micro.fontSize,
                  fontFamily: cohereTokens.font.mono,
                }}
              />
            </Bar>
          </BarChart>
        </MeasuredResponsiveContainer>
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
                color: item.value === null
                  ? cohereTokens.colors.bodyMuted
                  : item.value === 0
                    ? cohereTokens.colors.slate
                    : cohereTokens.colors.ink,
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
