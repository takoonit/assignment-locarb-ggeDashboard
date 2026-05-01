"use client";

import { ChevronRight, Download, FileText, Image as ImageIcon } from "lucide-react";
import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Stack, Tooltip, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RefObject } from "react";
import { useChartExport } from "@/hooks/use-chart-export";
import { cohereTokens } from "@/theme";
import type { PdfTableData } from "@/lib/export-pdf";

type ExportButtonProps = {
  filename: string;
  label?: string;
  nodeRef: RefObject<HTMLElement | null>;
  subtitle: string;
  title: string;
  tableData?: PdfTableData;
};

export function ExportButton({
  filename,
  label = "Export",
  nodeRef,
  subtitle,
  title,
  tableData,
}: ExportButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { exportToPdf, exportToImage, isExporting } = useChartExport();
  const [open, setOpen] = useState(false);

  function handleExportClick() {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
      return;
    }
    setOpen(true);
  }

  async function handleExportPdf() {
    setOpen(false);
    await exportToPdf(nodeRef.current, title, subtitle, filename, tableData);
  }

  async function handleExportImage() {
    setOpen(false);
    await exportToImage(nodeRef.current, filename);
  }

  return (
    <>
      <Tooltip title={session ? "Download chart" : "Sign in to export this chart"}>
        <span>
          <Button
            disabled={isExporting}
            onClick={handleExportClick}
            size="small"
            startIcon={
              isExporting ? <CircularProgress color="inherit" size={15} /> : <Download size={16} color={cohereTokens.colors.muted} />
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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: cohereTokens.rounded.md, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 1, textAlign: "center" }}>
          Export options
        </DialogTitle>
        <DialogContent sx={{ px: 2, pb: 3, pt: 1 }}>
          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() => void handleExportPdf()}
              sx={{
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                borderColor: cohereTokens.colors.borderLight,
                color: cohereTokens.colors.carbonBlack,
                textTransform: "none",
                "&:hover": { borderColor: cohereTokens.colors.actionBlue, bgcolor: cohereTokens.colors.paleBlue },
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "center" }}>
                <FileText size={24} color={cohereTokens.colors.error} />
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Document (PDF)</Typography>
                  <Typography variant="body2" sx={{ color: cohereTokens.colors.bodyMuted, fontSize: 12 }}>
                    Best for printing and sharing
                  </Typography>
                </Box>
              </Box>
              <ChevronRight size={20} color={cohereTokens.colors.muted} />
            </Button>
            <Button
              variant="outlined"
              onClick={() => void handleExportImage()}
              sx={{
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                borderColor: cohereTokens.colors.borderLight,
                color: cohereTokens.colors.carbonBlack,
                textTransform: "none",
                "&:hover": { borderColor: cohereTokens.colors.actionBlue, bgcolor: cohereTokens.colors.paleBlue },
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "center" }}>
                <ImageIcon size={24} color={cohereTokens.colors.actionBlue} />
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Image (PNG)</Typography>
                  <Typography variant="body2" sx={{ color: cohereTokens.colors.bodyMuted, fontSize: 12 }}>
                    Best for presentations and slides
                  </Typography>
                </Box>
              </Box>
              <ChevronRight size={20} color={cohereTokens.colors.muted} />
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
