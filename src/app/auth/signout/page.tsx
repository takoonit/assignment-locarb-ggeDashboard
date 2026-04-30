"use client";

import { LogOut } from "lucide-react";
import { Box, Button, Container, Typography, Stack, Paper } from "@mui/material";
import { signOut } from "next-auth/react";
import { cohereTokens } from "@/theme";
import Link from "next/link";

export default function SignOutPage() {
  return (
    <Box
      sx={{
        alignItems: "center",
        bgcolor: cohereTokens.colors.softEarth,
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        py: 8,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            bgcolor: cohereTokens.colors.canvas,
            border: `1px solid ${cohereTokens.colors.borderLight}`,
            borderRadius: cohereTokens.rounded.lg,
            overflow: "hidden",
            p: 6,
          }}
        >
          <Stack spacing={4}>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  color: cohereTokens.colors.primary,
                  fontSize: 36,
                  fontWeight: 600,
                  letterSpacing: "-0.72px",
                  lineHeight: 1.2,
                  mb: 1,
                }}
              >
                Sign out
              </Typography>
              <Typography
                sx={{
                  color: cohereTokens.colors.bodyMuted,
                  fontSize: 16,
                  lineHeight: 1.5,
                }}
              >
                Are you sure you want to end your session?
              </Typography>
            </Box>

            <Stack spacing={2}>
              <Button
                fullWidth
                onClick={() => signOut({ callbackUrl: "/" })}
                startIcon={<LogOut size={18} />}
                variant="contained"
                sx={{
                  bgcolor: cohereTokens.colors.error,
                  borderRadius: cohereTokens.rounded.pill,
                  color: "#ffffff",
                  fontWeight: 600,
                  py: 1.5,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#9b1c12",
                  },
                }}
              >
                Sign out
              </Button>
              <Button
                component={Link}
                fullWidth
                href="/"
                sx={{
                  borderRadius: cohereTokens.rounded.pill,
                  color: cohereTokens.colors.primary,
                  fontWeight: 600,
                  py: 1.5,
                  textTransform: "none",
                }}
              >
                Cancel
              </Button>
            </Stack>

            <Typography
              align="center"
              sx={{
                color: cohereTokens.colors.muted,
                fontSize: 12,
              }}
              variant="caption"
            >
              Thank you for maintaining data integrity.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
