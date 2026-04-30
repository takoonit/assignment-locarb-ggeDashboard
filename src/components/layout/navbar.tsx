"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Box, Container, Stack, Typography, Button, IconButton, Tooltip } from "@mui/material";
import { Activity, ShieldCheck, LogOut, FileText } from "lucide-react";
import { cohereTokens } from "@/theme";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const loading = status === "loading";
  const isAdmin = status === "authenticated" && session?.user.role === "ADMIN";

  return (
    <Box
      component="nav"
      sx={{
        bgcolor: cohereTokens.colors.canvas,
        borderBottom: `1px solid ${cohereTokens.colors.hairline}`,
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: 1600, px: { xs: 2, sm: 3 } }}>
        <Stack
          direction="row"
          spacing={3}
          sx={{
            alignItems: "center",
            height: { xs: 56, md: 48 },
            justifyContent: "space-between",
          }}
        >
          {/* Left: Brand */}
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  alignItems: "center",
                  bgcolor: cohereTokens.colors.primary,
                  borderRadius: 0.5,
                  color: cohereTokens.colors.canvas,
                  display: "flex",
                  height: 24,
                  justifyContent: "center",
                  width: 24,
                }}
              >
                <Activity size={16} />
              </Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: -0.2,
                  textTransform: "uppercase",
                }}
              >
                Lo-Carb
              </Typography>
            </Stack>
          </Link>

          {/* Center: Main Nav (Desktop) */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              display: { xs: "none", md: "flex" },
              flex: 1,
              ml: 4,
            }}
          >
            <NavLink active={pathname === "/"} href="/">
              Dashboard
            </NavLink>
            <NavLink active={pathname.startsWith("/api/docs")} href="/api/docs">
              API Docs
            </NavLink>
            {isAdmin && (
              <NavLink active={pathname.startsWith("/admin")} href="/admin">
                Admin
              </NavLink>
            )}
          </Stack>

          {/* Right: Actions/Auth */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
            >
              <Tooltip title="API Docs">
                <IconButton aria-label="Open API docs" component={Link} href="/api/docs" size="small">
                  <FileText
                    size={18}
                    color={pathname.startsWith("/api/docs")
                      ? cohereTokens.colors.primary
                      : cohereTokens.colors.muted}
                  />
                </IconButton>
              </Tooltip>
              {isAdmin && (
                <Tooltip title="Admin Dashboard">
                  <IconButton aria-label="Admin Dashboard" component={Link} href="/admin" size="small">
                    <ShieldCheck
                      size={18}
                      color={pathname.startsWith("/admin")
                        ? cohereTokens.colors.primary
                        : cohereTokens.colors.muted}
                    />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            {!loading && (
              <>
                {session ? (
                  <Button
                    component={Link}
                    href="/auth/signout"
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: cohereTokens.colors.borderLight,
                      borderRadius: cohereTokens.rounded.pill,
                      color: cohereTokens.colors.bodyMuted,
                      display: { xs: "none", sm: "flex" },
                      fontSize: 12,
                      fontWeight: 600,
                      px: 2,
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: cohereTokens.colors.softEarth,
                        borderColor: cohereTokens.colors.hairline,
                        color: cohereTokens.colors.primary,
                      },
                    }}
                  >
                    Sign out
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    href="/auth/signin"
                    size="small"
                    variant="contained"
                    sx={{
                      bgcolor: cohereTokens.colors.carbonBlack,
                      borderRadius: cohereTokens.rounded.pill,
                      color: cohereTokens.colors.onPrimary,
                      fontSize: 12,
                      fontWeight: 700,
                      px: 2.5,
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: cohereTokens.colors.primary,
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Sign in
                  </Button>
                )}

                {session && (
                  <Tooltip title="Sign out">
                    <IconButton
                      aria-label="Sign out"
                      component={Link}
                      href="/auth/signout"
                      size="small"
                      sx={{ display: { xs: "flex", sm: "none" } }}
                    >
                      <LogOut size={18} />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

function NavLink({
  active,
  children,
  href,
}: {
  active: boolean;
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Button
      component={Link}
      href={href}
      size="small"
      sx={{
        color: active ? cohereTokens.colors.primary : cohereTokens.colors.muted,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        minWidth: 0,
        px: 1.5,
        textTransform: "none",
        "&:hover": {
          bgcolor: "transparent",
          color: cohereTokens.colors.primary,
        },
        transition: "color 0.2s ease",
      }}
    >
      {children}
    </Button>
  );
}
