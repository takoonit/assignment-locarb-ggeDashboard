"use client";

import { Box } from "@mui/material";
import { ResponsiveContainer } from "recharts";
import { type ReactNode, useEffect, useRef, useState } from "react";

type MeasuredResponsiveContainerProps = {
  minHeight: number;
  children: ReactNode;
};

export function MeasuredResponsiveContainer({
  minHeight,
  children,
}: MeasuredResponsiveContainerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(() => typeof ResizeObserver === "undefined");

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;

    if (typeof ResizeObserver === "undefined") return;

    const update = () => {
      const nextReady = node.clientWidth > 0 && node.clientHeight > 0;
      setReady((current) => (current === nextReady ? current : nextReady));
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
      {ready ? (
        <ResponsiveContainer height="100%" minHeight={minHeight} minWidth={0} width="100%">
          {children}
        </ResponsiveContainer>
      ) : null}
    </Box>
  );
}
