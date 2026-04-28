import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#116149",
      dark: "#0B4434",
      light: "#4E927A",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#2F6F8F",
      dark: "#214F66",
      light: "#73A7BE",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F6F8F5",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#16211D",
      secondary: "#5C6A64",
    },
    divider: "#DCE5DE",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), Arial, Helvetica, sans-serif',
    h1: {
      fontSize: "clamp(2.25rem, 5vw, 4.25rem)",
      fontWeight: 700,
      lineHeight: 1.05,
    },
    h2: {
      fontSize: "1.25rem",
      fontWeight: 700,
      lineHeight: 1.25,
    },
    body1: {
      lineHeight: 1.7,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #DCE5DE",
          boxShadow: "0 14px 40px rgba(22, 33, 29, 0.08)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
        },
      },
    },
  },
});
