"use client";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { RefObject } from "react";
import { useChartExport } from "@/hooks/use-chart-export";
import { cohereTokens } from "@/theme";

type ExportButtonProps = {
  filename: string;
  label?: string;
  nodeRef: RefObject<HTMLElement | null>;
  subtitle: string;
  title: string;
};

export function ExportButton({
  filename,
  label = "Export PDF",
  nodeRef,
  subtitle,
  title,
}: ExportButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { exportToPdf, isExporting } = useChartExport();

  async function handleExport() {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
      return;
    }

    await exportToPdf(nodeRef.current, title, subtitle, filename);
  }

  return (
    <Tooltip title={session ? "Download chart as PDF" : "Sign in to export this chart"}>
      <span>
        <Button
          disabled={isExporting}
          onClick={() => void handleExport()}
          size="small"
          startIcon={
            isExporting ? <CircularProgress color="inherit" size={15} /> : <PictureAsPdfIcon />
          }
          sx={{
            borderRadius: cohereTokens.rounded.pill,
            color: session ? cohereTokens.colors.actionBlue : cohereTokens.colors.muted,
            fontSize: 12,
            fontWeight: 600,
            px: 1.5,
            textTransform: "none",
            "&:hover": {
              bgcolor: session ? cohereTokens.colors.paleBlue : "transparent",
            },
          }}
        >
          {isExporting ? "Generating..." : label}
        </Button>
      </span>
    </Tooltip>
  );
}
