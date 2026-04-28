import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PublicIcon from "@mui/icons-material/Public";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import StackedBarChartIcon from "@mui/icons-material/StackedBarChart";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";

const foundationCards = [
  {
    title: "Country coverage",
    description:
      "Prepare country and region records for filterable emissions exploration.",
    icon: <PublicIcon aria-hidden="true" />,
  },
  {
    title: "Emissions trends",
    description:
      "Reserve the dashboard space for gas-specific time series by country.",
    icon: <QueryStatsIcon aria-hidden="true" />,
  },
  {
    title: "Sector breakdown",
    description:
      "Keep sector shares explicit so missing values never become zeroes.",
    icon: <StackedBarChartIcon aria-hidden="true" />,
  },
];

export default function Home() {
  return (
    <Box component="main" sx={{ minHeight: "100vh", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Stack spacing={{ xs: 4, md: 6 }}>
          <Stack spacing={3} sx={{ maxWidth: 820 }}>
            <Chip
              color="primary"
              label="Greenhouse gas emissions intelligence"
              sx={{ alignSelf: "flex-start", fontWeight: 700 }}
            />
            <Typography variant="h1">Lo-Carb GGE Dashboard</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
              A focused foundation for exploring greenhouse gas emissions by
              country, gas, sector, and year without hiding missing data.
            </Typography>
            <Box>
              <Button
                endIcon={<ArrowForwardIcon />}
                href="#foundation"
                size="large"
                variant="contained"
              >
                View foundation
              </Button>
            </Box>
          </Stack>

          <Box
            id="foundation"
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
            }}
          >
            {foundationCards.map((card) => (
              <Card key={card.title}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        alignItems: "center",
                        bgcolor: "primary.light",
                        borderRadius: 2,
                        color: "primary.contrastText",
                        display: "flex",
                        height: 44,
                        justifyContent: "center",
                        width: 44,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography component="h2" variant="h2">
                      {card.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {card.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
