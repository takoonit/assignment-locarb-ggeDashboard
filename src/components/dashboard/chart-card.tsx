import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { cohereTokens } from "@/theme";

type ChartCardProps = {
  title: string;
  subtitle: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
  tall?: boolean;
};

export function ChartCard({ title, subtitle, controls, children, tall = false }: ChartCardProps) {
  const titleId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`;

  return (
    <Card
      component="section"
      aria-labelledby={titleId}
      role="region"
      sx={{
        borderColor: cohereTokens.colors.cardBorder,
        borderRadius: cohereTokens.rounded.sm,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <CardHeader
        title={
          <Typography
            id={titleId}
            component="h2"
            variant="h3"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
        }
        subheader={
          <Typography
            variant="body2"
            sx={{
              color: cohereTokens.colors.bodyMuted,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mt: cohereTokens.spacing.xs,
            }}
          >
            {subtitle}
          </Typography>
        }
        action={controls}
        sx={{
          alignItems: "flex-start",
          borderBottom: `1px solid ${cohereTokens.colors.cardBorder}`,
          display: "flex",
          flexDirection: "column",
          gap: cohereTokens.spacing.lg,
          p: { xs: cohereTokens.spacing.lg, md: cohereTokens.spacing.xl },
          "& .MuiCardHeader-content": {
            width: "100%",
            minWidth: 0, // Allow shrinking for truncate
          },
          "& .MuiCardHeader-action": {
            alignSelf: "center",
            m: 0,
            width: "100%",
          },
        }}
      />
      <CardContent
        sx={{
          minHeight: tall ? { xs: 360, md: 480 } : 360,
          p: { xs: cohereTokens.spacing.lg, md: cohereTokens.spacing.xl },
          position: "relative",
          "&:last-child": { pb: { xs: cohereTokens.spacing.lg, md: cohereTokens.spacing.xl } },
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton({ label = "Loading data" }: { label?: string }) {
  return (
    <Stack aria-label={label} role="status" spacing={1.5}>
      <Skeleton height={28} variant="rounded" />
      <Skeleton height={250} variant="rounded" />
      <Skeleton height={18} width="55%" />
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
