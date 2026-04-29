"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { memo, useMemo } from "react";
import { ChartEmpty } from "@/components/dashboard/chart-card";
import type { TrendData } from "@/lib/dashboard-types";
import { formatCompact, formatNumber, formatUnit, gasLabel } from "@/lib/dashboard-types";
import { cohereTokens } from "@/theme";

type TrendChartProps = {
  data: TrendData;
};

const CHART_MARGIN = { bottom: 8, left: 12, right: 20, top: 18 };
const AXIS_TICK = { fill: cohereTokens.colors.slate, fontSize: cohereTokens.typography.micro.fontSize };

export const TrendChart = memo(function TrendChart({ data }: TrendChartProps) {
  const validPoints = useMemo(
    () => data.points.filter((point) => point.value !== null),
    [data.points],
  );
  // Only flag a gap when the null is surrounded by valid points on both sides —
  // trailing/leading nulls don't produce a visible broken line.
  const hasMissing = useMemo(() => {
    const pts = data.points;
    for (let i = 1; i < pts.length - 1; i++) {
      if (pts[i].value === null) {
        const hasBefore = pts.slice(0, i).some((p) => p.value !== null);
        const hasAfter = pts.slice(i + 1).some((p) => p.value !== null);
        if (hasBefore && hasAfter) return true;
      }
    }
    return false;
  }, [data.points]);
  const missingPoints = useMemo(() => {
    const pts = data.points;
    return pts.filter((point, i) => {
      if (point.value !== null) return false;
      const hasBefore = pts.slice(0, i).some((p) => p.value !== null);
      const hasAfter = pts.slice(i + 1).some((p) => p.value !== null);
      return hasBefore && hasAfter;
    });
  }, [data.points]);
  const dot = useMemo(
    () => ({ r: validPoints.length <= 2 ? 4 : 2, fill: cohereTokens.colors.primary }),
    [validPoints.length],
  );

  if (!data.points.length || validPoints.length === 0) {
    return <ChartEmpty message={`No emissions trend data available for ${data.country.name}.`} />;
  }

  return (
    <Stack spacing={cohereTokens.spacing.sm} sx={{ height: "100%", minHeight: 0 }}>
      <Box sx={{ flex: 1, minHeight: { xs: 230, md: 168 }, width: "100%" }}>
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data.points} margin={CHART_MARGIN}>
            <CartesianGrid stroke={cohereTokens.colors.cardBorder} vertical={false} />
            <XAxis dataKey="year" stroke={cohereTokens.colors.slate} tick={AXIS_TICK} />
            <YAxis
              stroke={cohereTokens.colors.slate}
              tick={AXIS_TICK}
              tickFormatter={(value: number) => formatCompact(value)}
              width={70}
            />
            {missingPoints.map((point) => (
              <ReferenceLine
                ifOverflow="extendDomain"
                key={point.year}
                stroke={cohereTokens.colors.hairline}
                strokeDasharray="4 4"
                x={point.year}
              />
            ))}
            <Tooltip
              content={(props) => (
                <TrendTooltip
                  {...props}
                  countryName={data.country.name}
                  gas={gasLabel(data.gas)}
                  unit={formatUnit(data.unit)}
                />
              )}
            />
            <Line
              connectNulls={false}
              dataKey="value"
              dot={dot}
              isAnimationActive={false}
              name={gasLabel(data.gas)}
              stroke={cohereTokens.colors.primary}
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      {hasMissing ? (
        <Typography color="text.secondary" variant="caption">
          Missing data gap shown where reported values are null.
        </Typography>
      ) : null}
      {validPoints.length <= 2 ? (
        <Typography color="text.secondary" variant="caption">
          Only {validPoints.length === 1 ? "one data point is" : "two data points are"} available
          for this selection.
        </Typography>
      ) : null}
    </Stack>
  );
});

type TrendTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ value?: unknown }>;
  countryName: string;
  gas: string;
  unit: string;
};

function TrendTooltip({ active, payload, label, countryName, gas, unit }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;

  const raw = payload[0]?.value;
  const value = raw === undefined || raw === null ? null : Number(raw);

  // All-null points don't fire tooltip via recharts; this handles edge cases explicitly.
  const displayValue = value === null ? "No data" : `${formatNumber(value)} ${unit}`;

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
        Year: {label}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: cohereTokens.typography.micro.fontSize, lineHeight: 1.4 }}>
        {gas}: {displayValue}
      </Typography>
    </Paper>
  );
}
