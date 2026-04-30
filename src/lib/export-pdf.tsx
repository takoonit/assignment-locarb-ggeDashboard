import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 40,
  },
  header: {
    borderBottom: "1pt solid #d8dedb",
    marginBottom: 20,
    paddingBottom: 10,
  },
  title: {
    color: "#10231f",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#596963",
    fontSize: 12,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  chartImage: {
    height: "auto",
    width: "100%",
  },
  footer: {
    borderTop: "1pt solid #d8dedb",
    bottom: 30,
    color: "#8a9691",
    fontSize: 10,
    left: 40,
    paddingTop: 10,
    position: "absolute",
    right: 40,
    textAlign: "center",
  },
  table: {
    display: "flex",
    flexDirection: "column",
    marginTop: 20,
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #eef2ef",
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "2pt solid #d8dedb",
    paddingVertical: 8,
    backgroundColor: "#fafaf8",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: "#404b48",
    paddingHorizontal: 8,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
    color: "#10231f",
    paddingHorizontal: 8,
  },
});

export type PdfTableData = {
  headers: string[];
  rows: string[][];
};

type ChartPdfProps = {
  imageData: string;
  subtitle: string;
  timestamp: string;
  title: string;
  tableData?: PdfTableData;
};

export function ChartPdfDocument({ imageData, subtitle, timestamp, title, tableData }: ChartPdfProps) {
  return (
    <Document title={`${title} - Lo-Carb Export`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Lo-Carb</Text>
          <Text style={styles.subtitle}>Greenhouse Gas Emissions Analytical Export</Text>
        </View>

        <View style={styles.chartContainer}>
          <Text style={{ color: "#1f2926", fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            {title}
          </Text>
          <Text style={{ color: "#65746f", fontSize: 12, marginBottom: 20 }}>{subtitle}</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={imageData} style={styles.chartImage} />
        </View>

        {tableData && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              {tableData.headers.map((header, i) => (
                <Text key={i} style={styles.tableCellHeader}>
                  {header}
                </Text>
              ))}
            </View>
            {tableData.rows.map((row, i) => (
              <View key={i} style={styles.tableRow}>
                {row.map((cell, j) => (
                  <Text key={j} style={styles.tableCell}>
                    {cell}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>Exported on {timestamp} · Data provided by Lo-Carb GGE Dashboard</Text>
        </View>
      </Page>
    </Document>
  );
}
