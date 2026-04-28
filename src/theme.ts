import { createTheme } from "@mui/material/styles";

export const cohereTokens = {
  colors: {
    primary: "#10231f",
    carbonBlack: "#050807",
    ink: "#1f2926",
    forestGreen: "#0b3d2e",
    darkTeal: "#082f38",
    canvas: "#ffffff",
    softEarth: "#f0eee7",
    paleGreen: "#eef8ef",
    paleBlue: "#eef6fb",
    hairline: "#d8dedb",
    borderLight: "#e5ebe8",
    cardBorder: "#eef2ef",
    muted: "#596963",
    slate: "#404b48",
    bodyMuted: "#404b48",
    actionBlue: "#2563eb",
    focusBlue: "#3b82f6",
    warningAmber: "#d97706",
    warningSoft: "#fdecc8",
    formFocus: "#14866d",
    onPrimary: "#ffffff",
    onDark: "#ffffff",
    error: "#b42318",
  },
  font: {
    display: "Inter, ui-sans-serif, system-ui, Arial, sans-serif",
    ui: "Inter, ui-sans-serif, system-ui, Arial, sans-serif",
    mono: "JetBrains Mono, ui-monospace, SFMono-Regular, Consolas, monospace",
  },
  typography: {
    hero: { fontSize: 72, fontWeight: 600, letterSpacing: "-2.16px", lineHeight: 1 },
    product: { fontSize: 56, fontWeight: 600, letterSpacing: "-1.68px", lineHeight: 1.05 },
    section: { fontSize: 44, fontWeight: 600, letterSpacing: "-1.1px", lineHeight: 1.1 },
    sectionHeading: { fontSize: 36, fontWeight: 600, letterSpacing: "-0.72px", lineHeight: 1.2 },
    cardHeading: { fontSize: 24, fontWeight: 600, letterSpacing: "-0.24px", lineHeight: 1.25 },
    feature: { fontSize: 20, fontWeight: 600, letterSpacing: 0, lineHeight: 1.3 },
    bodyLarge: { fontSize: 18, fontWeight: 400, letterSpacing: 0, lineHeight: 1.5 },
    body: { fontSize: 16, fontWeight: 400, letterSpacing: 0, lineHeight: 1.5 },
    button: { fontSize: 14, fontWeight: 600, letterSpacing: 0, lineHeight: 1.5 },
    caption: { fontSize: 14, fontWeight: 400, letterSpacing: 0, lineHeight: 1.4 },
    mono: { fontSize: 13, fontWeight: 500, letterSpacing: "0.26px", lineHeight: 1.4 },
    micro: { fontSize: 12, fontWeight: 400, letterSpacing: 0, lineHeight: 1.4 },
  },
  spacing: {
    xxs: "2px",
    tiny: "4px",
    xs: "6px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    xxl: "32px",
    section: "80px",
  },
  rounded: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 22,
    xl: 30,
    pill: 32,
    full: 9999,
  },
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: cohereTokens.colors.primary,
      dark: cohereTokens.colors.carbonBlack,
      light: cohereTokens.colors.forestGreen,
      contrastText: cohereTokens.colors.onPrimary,
    },
    secondary: {
      main: cohereTokens.colors.actionBlue,
      dark: cohereTokens.colors.darkTeal,
      light: cohereTokens.colors.paleBlue,
      contrastText: cohereTokens.colors.onDark,
    },
    error: {
      main: cohereTokens.colors.error,
    },
    background: {
      default: cohereTokens.colors.canvas,
      paper: cohereTokens.colors.canvas,
    },
    text: {
      primary: cohereTokens.colors.ink,
      secondary: cohereTokens.colors.bodyMuted,
    },
    divider: cohereTokens.colors.hairline,
  },
  shape: {
    borderRadius: cohereTokens.rounded.sm,
  },
  typography: {
    fontFamily: cohereTokens.font.ui,
    h1: {
      fontFamily: cohereTokens.font.display,
      ...cohereTokens.typography.hero,
    },
    h2: {
      fontFamily: cohereTokens.font.display,
      ...cohereTokens.typography.sectionHeading,
    },
    h3: {
      fontFamily: cohereTokens.font.display,
      ...cohereTokens.typography.cardHeading,
    },
    body1: cohereTokens.typography.body,
    body2: cohereTokens.typography.caption,
    button: {
      ...cohereTokens.typography.button,
      textTransform: "none",
    },
    caption: cohereTokens.typography.caption,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: cohereTokens.colors.canvas,
          color: cohereTokens.colors.ink,
          fontFeatureSettings: '"tnum"',
        },
        "*": {
          boxSizing: "border-box",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: cohereTokens.colors.canvas,
          border: `1px solid ${cohereTokens.colors.cardBorder}`,
          boxShadow: "none",
          borderRadius: cohereTokens.rounded.lg,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: cohereTokens.rounded.pill,
          padding: "12px 24px",
          textTransform: "none",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: cohereTokens.rounded.sm,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: cohereTokens.colors.formFocus,
          },
        },
      },
    },
  },
});
