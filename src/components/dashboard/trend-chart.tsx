"use client";

import { Box, Stack, Typography } from "@mui/material";
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
import { ChartEmpty } from "@/components/dashboard/chart-card";
import type { TrendData } from "@/lib/dashboard-types";
import { formatCompact, formatNumber, gasLabel } from "@/lib/dashboard-types";
import { cohereTokens } from "@/theme";

type TrendChartProps = {
  data: TrendData;
};

export function TrendChart({ data }: TrendChartProps) {
  const hasPoints = data.points.length > 0;
  const validPoints = data.points.filter((point) => point.value !== null);
  const hasMissing = data.points.some((point) => point.value === null);

  if (!hasPoints || validPoints.length === 0) {
    return <ChartEmpty message={`No emissions trend data available for ${data.country.name}.`} />;
  }

  return (
    <Stack spacing={cohereTokens.spacing.md} sx={{ height: "100%" }}>
      <Typography color="text.secondary" variant="body2">
        {data.country.name} · {gasLabel(data.gas)} · {data.unit}
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 270, width: "100%" }}>
        <ResponsiveContainer height="100%" width="100%">
          <LineChart
            data={data.points}
            margin={{ bottom: 8, left: 12, right: 20, top: 18 }}
          >
            <CartesianGrid stroke={cohereTokens.colors.cardBorder} vertical={false} />
            <XAxis
              dataKey="year"
              stroke={cohereTokens.colors.slate}
              tick={{ fill: cohereTokens.colors.slate, fontSize: cohereTokens.typography.micro.fontSize }}
            />
            <YAxis
              stroke={cohereTokens.colors.slate}
              tick={{ fill: cohereTokens.colors.slate, fontSize: cohereTokens.typography.micro.fontSize }}
              tickFormatter={(value: number) => formatCompact(value)}
              width={70}
            />
            {data.points
              .filter((point) => point.value === null)
              .map((point) => (
                <ReferenceLine
                  ifOverflow="extendDomain"
                  key={point.year}
                  stroke={cohereTokens.colors.hairline}
                  strokeDasharray="4 4"
                  x={point.year}
                />
              ))}
            <Tooltip
              formatter={(value) => [`${formatNumber(Number(value))} ${data.unit}`, gasLabel(data.gas)]}
              labelFormatter={(year) => `Year: ${year}`}
            />
            <Line
              connectNulls={false}
              dataKey="value"
              dot={{ r: validPoints.length <= 2 ? 4 : 2, fill: cohereTokens.colors.primary }}
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
}
