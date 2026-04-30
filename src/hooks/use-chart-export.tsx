"use client";

import { pdf } from "@react-pdf/renderer";
import * as htmlToImage from "html-to-image";
import { useCallback, useState } from "react";
import { ChartPdfDocument } from "@/lib/export-pdf";

export function useChartExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = useCallback(
    async (node: HTMLElement | null, title: string, subtitle: string, filename: string) => {
      if (!node) return;

      try {
        setIsExporting(true);

        const dataUrl = await htmlToImage.toPng(node, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
          style: {
            padding: "12px",
          },
        });

        const timestamp = new Date().toLocaleString();
        const blob = await pdf(
          <ChartPdfDocument
            imageData={dataUrl}
            subtitle={subtitle}
            timestamp={timestamp}
            title={title}
          />,
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to export chart:", error);
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return {
    exportToPdf,
    isExporting,
  };
}
