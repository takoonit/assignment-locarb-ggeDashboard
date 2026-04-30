"use client";

import { Box } from "@mui/material";
import { ResponsiveContainer } from "recharts";
import { type ReactNode, useEffect, useRef, useState } from "react";

type ChartSize = {
  width: number;
  height: number;
};

type MeasuredResponsiveContainerProps = {
  minHeight: number;
  children: ReactNode;
};

// Waits until the actual size of the container is known before drawing the chart, preventing errors about impossible dimensions.
export function MeasuredResponsiveContainer({
  minHeight,
  children,
}: MeasuredResponsiveContainerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [measuredSize, setMeasuredSize] = useState<ChartSize | null>(() =>
    typeof ResizeObserver === "undefined"
      ? { width: 1, height: minHeight }
      : null,
  );

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;

    if (typeof ResizeObserver === "undefined") return;

    const update = () => {
      const width = Math.round(node.clientWidth);
      const height = Math.round(node.clientHeight);

      if (width <= 0 || height <= 0) {
        setMeasuredSize((current) => (current === null ? current : null));
        return;
      }

      setMeasuredSize((current) =>
        current?.width === width && current.height === height
          ? current
          : { width, height },
      );
    };

    update();

    const observer = new ResizeObserver(() => {
      update();
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Box ref={hostRef} sx={{ height: "100%", minHeight, minWidth: 0, width: "100%" }}>
      {measuredSize ? (
        <ResponsiveContainer
          height="100%"
          initialDimension={measuredSize}
          minHeight={minHeight}
          minWidth={0}
          width="100%"
        >
          {children}
        </ResponsiveContainer>
      ) : null}
    </Box>
  );
}
