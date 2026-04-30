"use client";

import { pdf } from "@react-pdf/renderer";
import * as htmlToImage from "html-to-image";
import { useCallback, useState } from "react";
import { ChartPdfDocument } from "@/lib/export-pdf";
import type { PdfTableData } from "@/lib/export-pdf";

export function useChartExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = useCallback(
    async (node: HTMLElement | null, title: string, subtitle: string, filename: string, tableData?: PdfTableData) => {
      if (!node) return;

      try {
        setIsExporting(true);

        const dataUrl = await htmlToImage.toPng(node, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
          style: {
            padding: "12px",
          },
          filter: (n) => {
            if (n instanceof Element && n.classList?.contains("chart-export-exclude")) {
              return false;
            }
            return true;
          },
        });

        const timestamp = new Date().toLocaleString();
        const blob = await pdf(
          <ChartPdfDocument
            imageData={dataUrl}
            subtitle={subtitle}
            timestamp={timestamp}
            title={title}
            tableData={tableData}
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

  const exportToImage = useCallback(
    async (node: HTMLElement | null, filename: string) => {
      if (!node) return;

      try {
        setIsExporting(true);

        const dataUrl = await htmlToImage.toPng(node, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
          style: {
            padding: "12px",
          },
          filter: (n) => {
            if (n instanceof Element && n.classList?.contains("chart-export-exclude")) {
              return false;
            }
            return true;
          },
        });

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Failed to export chart as image:", error);
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return {
    exportToPdf,
    exportToImage,
    isExporting,
  };
}
