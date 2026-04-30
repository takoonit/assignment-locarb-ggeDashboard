"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Box, IconButton, Paper, Slider, Stack, Typography } from "@mui/material";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { memo, useMemo, useState } from "react";
import { ChartEmpty } from "@/components/dashboard/chart-card";
import { MeasuredResponsiveContainer } from "@/components/dashboard/measured-responsive-container";
import type { TrendData } from "@/lib/dashboard-types";
import { formatCompact, formatNumber, formatUnit, gasLabel, normalizeTrendPoints } from "@/lib/dashboard-types";
import { cohereTokens } from "@/theme";

type TrendChartProps = {
  data: TrendData;
};

const CHART_MARGIN = { bottom: 8, left: 12, right: 20, top: 18 };
const AXIS_TICK = { fill: cohereTokens.colors.slate, fontSize: cohereTokens.typography.micro.fontSize };

export const TrendChart = memo(function TrendChart({ data }: TrendChartProps) {
  const points = useMemo(() => normalizeTrendPoints(data.points), [data.points]);
  const validPoints = useMemo(
    () => points.filter((point) => point.value !== null),
    [points],
  );
  const allYears = useMemo(() => points.map((point) => point.year), [points]);
  const minYear = allYears.length > 0 ? Math.min(...allYears) : undefined;
  const maxYear = allYears.length > 0 ? Math.max(...allYears) : undefined;

  const sliderMarks = useMemo(() => {
    if (minYear === undefined || maxYear === undefined) return [];
    const marks = [];
    for (let year = minYear; year <= maxYear; year++) {
      const isBoundary = year % 5 === 0 || year === minYear || year === maxYear;
      marks.push({
        value: year,
        label: isBoundary ? `${year}` : undefined,
      });
    }
    return marks;
  }, [minYear, maxYear]);

  const [sliderValue, setSliderValue] = useState<number | undefined>(maxYear);

  const visiblePoints = useMemo(() => {
    if (!sliderValue) return points;
    return points.filter((point) => point.year <= sliderValue);
  }, [points, sliderValue]);
  // Only flag a gap when the null is surrounded by valid points on both sides —
  // trailing/leading nulls don't produce a visible broken line.
  const hasMissing = useMemo(() => {
    const pts = points;
    for (let i = 1; i < pts.length - 1; i++) {
      if (pts[i].value === null) {
        const hasBefore = pts.slice(0, i).some((p) => p.value !== null);
        const hasAfter = pts.slice(i + 1).some((p) => p.value !== null);
        if (hasBefore && hasAfter) return true;
      }
    }
    return false;
  }, [points]);
  const missingPoints = useMemo(() => {
    const pts = points;
    return pts.filter((point, i) => {
      if (point.value !== null) return false;
      const hasBefore = pts.slice(0, i).some((p) => p.value !== null);
      const hasAfter = pts.slice(i + 1).some((p) => p.value !== null);
      return hasBefore && hasAfter;
    });
  }, [points]);
  const dot = useMemo(
    () => ({ r: validPoints.length <= 2 ? 4 : 2, fill: cohereTokens.colors.primary }),
    [validPoints.length],
  );

  if (!points.length || validPoints.length === 0) {
    return <ChartEmpty message={`No emissions trend data available for ${data.country.name}.`} />;
  }

  return (
    <Stack spacing={cohereTokens.spacing.sm} sx={{ height: "100%", minHeight: 0 }}>
      <Box sx={{ height: { xs: 230, md: 168 }, minWidth: 0, width: "100%" }}>
        <MeasuredResponsiveContainer minHeight={168}>
          <LineChart data={visiblePoints} margin={CHART_MARGIN}>
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
              cursor={{ stroke: cohereTokens.colors.actionBlue, strokeDasharray: "4 4" }}
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
              activeDot={{
                fill: cohereTokens.colors.actionBlue,
                r: 5,
                stroke: cohereTokens.colors.canvas,
                strokeWidth: 2,
              }}
              dot={(props) => {
                const pointYear = Number((props as { payload?: { year?: number } }).payload?.year);
                if (sliderValue && pointYear === sliderValue) {
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      fill={cohereTokens.colors.actionBlue}
                      r={5}
                      stroke={cohereTokens.colors.canvas}
                      strokeWidth={2}
                    />
                  );
                }

                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    fill={cohereTokens.colors.primary}
                    r={dot.r}
                  />
                );
              }}
              isAnimationActive={false}
              name={gasLabel(data.gas)}
              stroke={cohereTokens.colors.primary}
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </MeasuredResponsiveContainer>
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
      {minYear !== undefined && maxYear !== undefined ? (
        <Box
          className="chart-export-exclude"
          sx={{
            bgcolor: "rgba(240,238,231,0.7)",
            border: `1px solid ${cohereTokens.colors.cardBorder}`,
            borderRadius: `${cohereTokens.rounded.md}px`,
            px: { xs: 1.5, md: 2 },
            py: 1.25,
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between" }}>
            <Box>
              <Typography
                sx={{
                  color: cohereTokens.colors.bodyMuted,
                  fontFamily: cohereTokens.font.mono,
                  fontSize: 11,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Timeline scrubber
              </Typography>
              <Typography sx={{ fontSize: 13, mt: 0.35 }}>
                Drag the year slider to reveal the trend progressively through time.
              </Typography>
            </Box>
            <Typography
              sx={{
                color: cohereTokens.colors.primary,
                fontFamily: cohereTokens.font.mono,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              Selected year: {sliderValue}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1 }}>
            <IconButton
              aria-label="Previous trend year"
              disabled={sliderValue === minYear}
              onClick={() => setSliderValue((current) => (current && current > minYear ? current - 1 : current))}
              size="small"
              sx={{
                border: `1px solid ${cohereTokens.colors.borderLight}`,
                borderRadius: `${cohereTokens.rounded.sm}px`,
              }}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Slider
                aria-label="Trend timeline year"
                marks={sliderMarks}
                max={maxYear}
                min={minYear}
                onChange={(_, value) => {
                  if (typeof value === "number") setSliderValue(value);
                }}
                step={1}
                sx={{
                  color: cohereTokens.colors.primary,
                  "& .MuiSlider-mark": {
                    bgcolor: cohereTokens.colors.hairline,
                    borderRadius: "50%",
                    height: 2,
                    opacity: 0.7,
                    width: 2,
                  },
                  "& .MuiSlider-markActive": {
                    bgcolor: cohereTokens.colors.hairline,
                    opacity: 0.4,
                  },
                  "& .MuiSlider-markLabel": {
                    color: cohereTokens.colors.bodyMuted,
                    fontFamily: cohereTokens.font.mono,
                    fontSize: 11,
                  },
                  "& .MuiSlider-thumb": {
                    boxShadow: "0 6px 14px rgba(16,35,31,0.18)",
                  },
                  "& .MuiSlider-track": {
                    border: 0,
                  },
                  "& .MuiSlider-rail": {
                    bgcolor: cohereTokens.colors.hairline,
                    opacity: 1,
                  },
                  "& .MuiSlider-valueLabel": {
                    bgcolor: cohereTokens.colors.primary,
                    borderRadius: `${cohereTokens.rounded.xs}px`,
                    fontFamily: cohereTokens.font.mono,
                    fontSize: 12,
                    fontWeight: 600,
                  },
                }}
                value={sliderValue ?? minYear}
                valueLabelDisplay="on"
              />
            </Box>
            <IconButton
              aria-label="Next trend year"
              disabled={sliderValue === maxYear}
              onClick={() => setSliderValue((current) => (current && current < maxYear ? current + 1 : current))}
              size="small"
              sx={{
                border: `1px solid ${cohereTokens.colors.borderLight}`,
                borderRadius: `${cohereTokens.rounded.sm}px`,
              }}
            >
              <ChevronRight size={16} />
            </IconButton>
          </Stack>
        </Box>
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
