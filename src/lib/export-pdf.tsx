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
});

type ChartPdfProps = {
  imageData: string;
  subtitle: string;
  timestamp: string;
  title: string;
};

export function ChartPdfDocument({ imageData, subtitle, timestamp, title }: ChartPdfProps) {
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

        <View style={styles.footer}>
          <Text>Exported on {timestamp} · Data provided by Lo-Carb GGE Dashboard</Text>
        </View>
      </Page>
    </Document>
  );
}
