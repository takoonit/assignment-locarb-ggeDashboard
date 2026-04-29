"use client";

import GitHubIcon from "@mui/icons-material/GitHub";
import { Box, Button, Container, Typography, Stack, Paper } from "@mui/material";
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
        alignItems: "center",
        bgcolor: cohereTokens.colors.paleGreen,
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
                variant="h1"
                sx={{
                  color: cohereTokens.colors.primary,
                  fontSize: 56,
                  fontWeight: 600,
                  letterSpacing: "-1.68px",
                  lineHeight: 1.05,
                  mb: 1,
                }}
              >
                Lo-Carb
              </Typography>
              <Typography
                sx={{
                  color: cohereTokens.colors.bodyMuted,
                  fontSize: 18,
                  lineHeight: 1.5,
                }}
              >
                Analytical instrument for global greenhouse gas emissions.
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
                py: 1.5,
                textTransform: "none",
                "&:hover": {
                  bgcolor: cohereTokens.colors.primary,
                },
              }}
            >
              Sign in with GitHub
            </Button>

            <Typography
              align="center"
              sx={{
                color: cohereTokens.colors.muted,
                fontSize: 12,
              }}
              variant="caption"
            >
              Access restricted to authorized personnel. Data integrity first.
            </Typography>
          </Stack>
        </Paper>
      </Container>
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
