import {
  Box,
  FormControl,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import type { CountryOption, Gas } from "@/lib/dashboard-types";
import { GAS_OPTIONS } from "@/lib/dashboard-types";
import { cohereTokens } from "@/theme";

type CountrySelectProps = {
  id: string;
  label: string;
  ariaLabel?: string;
  countries: CountryOption[];
  value: string;
  onChange: (value: string) => void;
};

export function CountrySelect({ id, label, ariaLabel = label, countries, value, onChange }: CountrySelectProps) {
  return (
    <FormControl size="small" sx={{ mb: 0, minWidth: { xs: "100%", sm: 212 } }}>
      <ControlLabel htmlFor={id}>{label}</ControlLabel>
      <Select
        native
        id={id}
        inputProps={{ "aria-label": ariaLabel, id }}
        value={countries.some((country) => country.code === value) ? value : ""}
        onChange={(event: SelectChangeEvent<string>) => onChange(event.target.value)}
        sx={selectSx}
      >
        {countries.length === 0 ? <option value="">Loading countries</option> : null}
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
  ariaLabel?: string;
  value: number;
  years: number[];
  onChange: (value: number) => void;
  snapped?: boolean;
};

export function YearSelect({ id, label, ariaLabel = label, value, years, onChange, snapped }: YearSelectProps) {
  const minYear = years.length > 0 ? Math.min(...years) : 1990;
  const maxYear = years.length > 0 ? Math.max(...years) : 2030;
  const dayjsValue = dayjs().year(value).startOf("year");

  return (
    <FormControl aria-label={ariaLabel} size="small" sx={{ minWidth: { xs: "100%", sm: 118 } }}>
      <Box sx={{ alignItems: "center", display: "flex", gap: 0.5 }}>
        <ControlLabel htmlFor={id}>{label}</ControlLabel>
        {snapped ? (
          <Tooltip arrow enterTouchDelay={0} title="Showing nearest available year">
            <Box
              aria-label="Showing nearest available year"
              sx={{
                alignItems: "center",
                color: cohereTokens.colors.slate,
                cursor: "help",
                display: "inline-flex",
                mt: "-4px",
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 14 }} />
            </Box>
          </Tooltip>
        ) : null}
      </Box>
      <DatePicker
        views={["year"]}
        openTo="year"
        value={dayjsValue}
        minDate={dayjs().year(minYear).startOf("year")}
        maxDate={dayjs().year(maxYear).startOf("year")}
        disabled={years.length === 0}
        onChange={(newValue) => {
          if (newValue) onChange(newValue.year());
        }}
        shouldDisableYear={(date) => years.length > 0 && !years.includes(date.year())}
        slotProps={{
          textField: {
            id,
            size: "small",
            sx: {
              width: 118,
              "& .MuiOutlinedInput-root": {
                borderRadius: `${cohereTokens.rounded.sm}px`,
                fontSize: cohereTokens.typography.micro.fontSize,
                fontWeight: 500,
                height: 36,
                "& fieldset": { borderColor: cohereTokens.colors.borderLight },
                "&:hover fieldset": { borderColor: cohereTokens.colors.slate },
                "&.Mui-focused fieldset": { borderColor: cohereTokens.colors.formFocus, borderWidth: 1 },
                "&.Mui-disabled": { opacity: 0.45 },
              },
              "& .MuiInputBase-input": {
                color: cohereTokens.colors.ink,
                fontFamily: cohereTokens.font.ui,
                fontSize: cohereTokens.typography.micro.fontSize,
                fontWeight: 500,
                py: "7px",
              },
              "& .MuiInputAdornment-root .MuiSvgIcon-root": {
                color: cohereTokens.colors.slate,
                fontSize: 16,
              },
            },
          },
          popper: {
            sx: {
              "& .MuiPaper-root": {
                border: `1px solid ${cohereTokens.colors.borderLight}`,
                borderRadius: `${cohereTokens.rounded.sm}px`,
                boxShadow: "0 4px 16px rgba(16,35,31,0.10)",
                mt: "4px",
              },
              "& .MuiYearCalendar-root": {
                width: 220,
              },
              "& .MuiPickersYear-yearButton": {
                borderRadius: `${cohereTokens.rounded.xs}px`,
                fontSize: cohereTokens.typography.mono.fontSize,
                fontWeight: 500,
                "&.Mui-selected": {
                  bgcolor: cohereTokens.colors.primary,
                  color: cohereTokens.colors.canvas,
                  "&:hover": { bgcolor: cohereTokens.colors.forestGreen },
                },
                "&:hover:not(.Mui-selected)": {
                  bgcolor: cohereTokens.colors.softEarth,
                },
                "&.Mui-disabled": { opacity: 0.3 },
              },
            },
          },
        }}
      />
    </FormControl>
  );
}

function ControlLabel({ children, htmlFor, asSpan }: { children: string; htmlFor: string; asSpan?: boolean }) {
  return (
    <Typography
      component={asSpan ? "span" : "label"}
      htmlFor={asSpan ? undefined : htmlFor}
      sx={{
        color: cohereTokens.colors.bodyMuted,
        display: "block",
        fontFamily: cohereTokens.font.mono,
        fontSize: cohereTokens.typography.micro.fontSize,
        letterSpacing: "0.04em",
        mb: cohereTokens.spacing.xs,
      }}
    >
      {children}
    </Typography>
  );
}

const selectSx = {
  fontSize: cohereTokens.typography.micro.fontSize,
  fontWeight: 500,
  height: 36,
  borderRadius: `${cohereTokens.rounded.sm}px`,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: cohereTokens.colors.borderLight,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: cohereTokens.colors.slate,
  },
  "& .MuiOutlinedInput-input": {
    fontSize: cohereTokens.typography.micro.fontSize,
    py: "7px",
  },
};

type GasControlProps = {
  ariaLabel: string;
  value: Gas;
  onChange: (value: Gas) => void;
};

export function GasControl({ ariaLabel, value, onChange }: GasControlProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <ControlLabel htmlFor={ariaLabel} asSpan>Gas</ControlLabel>
      <Box
        aria-label={ariaLabel}
        role="radiogroup"
        sx={{
          border: `1px solid ${cohereTokens.colors.borderLight}`,
          borderRadius: cohereTokens.rounded.sm,
          display: "flex",
          flexWrap: "wrap",
          gap: "2px",
          minHeight: 36,
          p: "2px",
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
              title={gas.title}
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
                minHeight: 30,
                px: 1.25,
                py: 0,
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
    </Box>
  );
}
