"use client";

import GitHubIcon from "@mui/icons-material/GitHub";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { Box, Button, Container, Typography, Stack } from "@mui/material";
import { signIn } from "next-auth/react";
import { cohereTokens } from "@/theme";
import { useSearchParams } from "next/navigation";

export function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        flex: 1,
        minHeight: "100%",
      }}
    >
      {/* Left: Branding Panel (Drenched) */}
      <Box
        sx={{
          bgcolor: cohereTokens.colors.forestGreen,
          color: cohereTokens.colors.onDark,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: { xs: 6, md: 10, lg: 12 },
          position: "relative",
          width: { xs: "100%", md: "42%" },
        }}
      >
        <Stack spacing={4} sx={{ maxWidth: 480 }}>
          <Box
            sx={{
              alignItems: "center",
              bgcolor: "rgba(255, 255, 255, 0.15)",
              borderRadius: 1,
              display: "flex",
              height: 48,
              justifyContent: "center",
              width: 48,
            }}
          >
            <AutoGraphIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 56, lg: 72 },
                fontWeight: 700,
                letterSpacing: -2,
                lineHeight: 1,
                mb: 2,
              }}
            >
              Lo-Carb
            </Typography>
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: { xs: 18, lg: 20 },
                lineHeight: 1.4,
                maxWidth: 400,
              }}
            >
              Analytical instrument for global greenhouse gas emissions.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ alignItems: "center", opacity: 0.6 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: 12,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              System Status:
            </Typography>
            <Box
              sx={{
                bgcolor: "#4ade80",
                borderRadius: "50%",
                height: 8,
                width: 8,
              }}
            />
            <Typography
              sx={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: 12,
                letterSpacing: 1,
              }}
            >
              Secure
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Right: Auth Action Panel */}
      <Box
        sx={{
          alignItems: "center",
          bgcolor: cohereTokens.colors.canvas,
          display: "flex",
          flex: 1,
          justifyContent: "center",
          p: 6,
        }}
      >
        <Container maxWidth="xs">
          <Stack spacing={6}>
            <Box sx={{ display: { xs: "block", md: "none" }, textAlign: "center" }}>
               {/* Redundant for mobile since top panel exists, but keeps structure consistent */}
            </Box>

            <Stack spacing={3}>
              <Box>
                <Typography
                  sx={{
                    color: cohereTokens.colors.primary,
                    fontSize: 24,
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  Authorized access
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Please sign in with your provider to access the dashboard and administrative tools.
                </Typography>
              </Box>

              {error && (
                <Box
                  sx={{
                    bgcolor: "#fef2f2",
                    border: `1px solid ${cohereTokens.colors.error}`,
                    borderRadius: cohereTokens.rounded.sm,
                    p: 2,
                  }}
                >
                  <Typography color="error" variant="body2">
                    {getErrorMessage(error)}
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                onClick={() => signIn("github", { callbackUrl })}
                startIcon={<GitHubIcon />}
                variant="contained"
                sx={{
                  bgcolor: cohereTokens.colors.carbonBlack,
                  borderRadius: cohereTokens.rounded.pill,
                  color: cohereTokens.colors.onPrimary,
                  fontWeight: 600,
                  py: 1.75,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: cohereTokens.colors.primary,
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Sign in with GitHub
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
              Access restricted to authorized personnel. <br />
              Data integrity first.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

function getErrorMessage(error: string) {
  switch (error) {
    case "Signin":
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
    case "EmailCreateAccount":
    case "Callback":
      return "An error occurred during the sign-in process. Please try again.";
    case "OAuthAccountNotLinked":
      return "To confirm your identity, please sign in with the same account you used originally.";
    case "EmailSignin":
      return "The e-mail could not be sent.";
    case "CredentialsSignin":
      return "Sign in failed. Check the details you provided are correct.";
    case "SessionRequired":
      return "Please sign in to access this page.";
    default:
      return "An unexpected error occurred.";
  }
}
