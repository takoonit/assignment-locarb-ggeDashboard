import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { cohereTokens } from "@/theme";

type ChartCardProps = {
  title: string;
  subtitle: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
  tall?: boolean;
  sx?: SxProps<Theme>;
};

export function ChartCard({ title, subtitle, controls, children, tall = false, sx }: ChartCardProps) {
  const titleId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`;

  return (
    <Card
      component="section"
      aria-labelledby={titleId}
      role="region"
      sx={{
        borderRadius: `${cohereTokens.rounded.lg}px`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        ...sx,
      }}
    >
      <Box
        sx={{
          alignItems: { xs: "stretch", sm: "flex-start" },
          borderBottom: `1px solid ${cohereTokens.colors.cardBorder}`,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
          justifyContent: "space-between",
          px: { xs: 2, md: 1.75 },
          pt: { xs: 2, md: 1.35 },
          pb: { xs: 1.5, md: 1.1 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            id={titleId}
            component="h2"
            variant="h3"
            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: cohereTokens.colors.bodyMuted,
              mt: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        {controls ? (
          <Box sx={{ flexShrink: 0 }}>
            {controls}
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: { xs: tall ? 300 : 240, md: 0 },
          overflow: "hidden",
          px: { xs: 2, md: 1.75 },
          py: { xs: 2, md: 1.25 },
        }}
      >
        {children}
      </Box>
    </Card>
  );
}

export function ChartSkeleton({ label = "Loading data" }: { label?: string }) {
  return (
    <Stack aria-label={label} role="status" spacing={1} sx={{ height: "100%" }}>
      <Skeleton height={18} width="32%" />
      <Box
        sx={{
          alignItems: "end",
          display: "grid",
          flex: 1,
          gap: 1,
          gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
          minHeight: 120,
        }}
      >
        {[38, 54, 46, 70, 64, 82, 58, 76].map((height, index) => (
          <Skeleton
            height={`${height}%`}
            key={`${height}-${index}`}
            sx={{ minHeight: 34 }}
            variant="rounded"
          />
        ))}
      </Box>
      <Skeleton height={14} width="44%" />
    </Stack>
  );
}

export function ChartError({
  message = "Failed to load data.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Alert
      action={
        onRetry ? (
          <Button color="inherit" onClick={onRetry} size="small">
            Retry
          </Button>
        ) : null
      }
      icon={<ErrorOutlinedIcon fontSize="inherit" />}
      severity="error"
      sx={{ borderRadius: cohereTokens.rounded.sm }}
    >
      {message}
    </Alert>
  );
}

export function ChartEmpty({ message }: { message: string }) {
  return (
    <Box
      sx={{
        alignItems: "center",
        bgcolor: cohereTokens.colors.softEarth,
        border: `1px solid ${cohereTokens.colors.hairline}`,
        borderRadius: cohereTokens.rounded.sm,
        color: cohereTokens.colors.bodyMuted,
        display: "flex",
        minHeight: 260,
        justifyContent: "center",
        p: 3,
        textAlign: "center",
      }}
    >
      <Typography>{message}</Typography>
    </Box>
  );
}
