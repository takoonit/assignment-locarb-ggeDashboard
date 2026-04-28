import {
  Box,
  FormControl,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { CountryOption, Gas } from "@/lib/dashboard-types";
import { GAS_OPTIONS } from "@/lib/dashboard-types";
import { cohereTokens } from "@/theme";

type CountrySelectProps = {
  id: string;
  label: string;
  countries: CountryOption[];
  value: string;
  onChange: (value: string) => void;
};

export function CountrySelect({ id, label, countries, value, onChange }: CountrySelectProps) {
  return (
    <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
      <ControlLabel htmlFor={id}>{label}</ControlLabel>
      <Select
        native
        id={id}
        inputProps={{ "aria-label": label, id }}
        value={value}
        onChange={(event: SelectChangeEvent<string>) => onChange(event.target.value)}
      >
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}

type YearSelectProps = {
  id: string;
  label: string;
  value: number;
  years: number[];
  onChange: (value: number) => void;
};

export function YearSelect({ id, label, value, years, onChange }: YearSelectProps) {
  return (
    <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 132 } }}>
      <ControlLabel htmlFor={id}>{label}</ControlLabel>
      <Select
        native
        disabled={years.length === 0}
        id={id}
        inputProps={{ "aria-label": label, id }}
        value={years.includes(value) ? String(value) : ""}
        onChange={(event: SelectChangeEvent<string>) => onChange(Number(event.target.value))}
      >
        {years.length === 0 ? <option value="">No years</option> : null}
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}

function ControlLabel({ children, htmlFor }: { children: string; htmlFor: string }) {
  return (
    <Typography
      component="label"
      htmlFor={htmlFor}
      sx={{
        color: cohereTokens.colors.bodyMuted,
        fontFamily: cohereTokens.font.mono,
        fontSize: cohereTokens.typography.micro.fontSize,
        letterSpacing: "0.04em",
        mb: cohereTokens.spacing.xs,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Typography>
  );
}

type GasControlProps = {
  ariaLabel: string;
  value: Gas;
  onChange: (value: Gas) => void;
};

export function GasControl({ ariaLabel, value, onChange }: GasControlProps) {
  return (
    <Stack spacing={cohereTokens.spacing.xs}>
      <Typography
        component="span"
        sx={{
          color: cohereTokens.colors.bodyMuted,
          fontFamily: cohereTokens.font.mono,
          fontSize: cohereTokens.typography.micro.fontSize,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        Gas
      </Typography>
      <Box
        aria-label={ariaLabel}
        role="radiogroup"
        sx={{
          border: `1px solid ${cohereTokens.colors.borderLight}`,
          borderRadius: cohereTokens.rounded.xs,
          display: "flex",
          flexWrap: "wrap",
          gap: cohereTokens.spacing.tiny,
          p: cohereTokens.spacing.tiny,
        }}
      >
        {GAS_OPTIONS.map((gas) => {
          const selected = value === gas.value;
          return (
            <Box
              component="button"
              key={gas.value}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(gas.value)}
              sx={{
                bgcolor: selected ? cohereTokens.colors.primary : "transparent",
                border: 0,
                borderRadius: cohereTokens.rounded.xs,
                color: selected ? cohereTokens.colors.canvas : cohereTokens.colors.ink,
                cursor: "pointer",
                font: "inherit",
                fontSize: cohereTokens.typography.mono.fontSize,
                fontWeight: 500,
                minHeight: 44, // WCAG 2.5.5 target size
                minWidth: 44,
                px: 2,
                py: 1,
                transition: "background-color 120ms ease, color 120ms ease",
                "&:focus-visible": {
                  outline: `2px solid ${cohereTokens.colors.focusBlue}`,
                  outlineOffset: 2,
                },
                "&:hover": {
                  bgcolor: selected ? cohereTokens.colors.primary : cohereTokens.colors.softEarth,
                },
              }}
              type="button"
            >
              {gas.label}
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
