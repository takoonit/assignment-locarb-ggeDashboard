import { z } from "zod";

export const CountryCodeSchema = z
  .string()
  .length(3)
  .transform((val) => val.toUpperCase());

export const GasSchema = z.enum([
  "TOTAL",
  "CO2",
  "CH4",
  "N2O",
  "HFC",
  "PFC",
  "SF6",
]);

export const YearSchema = z.coerce
  .number()
  .int()
  .min(1990)
  .max(2030);

export const OptionalYearSchema = z.preprocess(
  (val) => (val === null || val === "" ? undefined : val),
  YearSchema.optional()
);

export const BooleanStringSchema = z
  .preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.enum(["true", "false"]).optional()
  )
  .transform((val) => val === "true");

export const CountriesQuerySchema = z.object({
  includeRegions: BooleanStringSchema,
});

export const TrendQuerySchema = z.object({
  country: CountryCodeSchema,
  gas: GasSchema.default("TOTAL"),
  fromYear: OptionalYearSchema,
  toYear: OptionalYearSchema,
}).refine(
  (data) => {
    if (data.fromYear && data.toYear) {
      return data.fromYear <= data.toYear;
    }
    return true;
  },
  {
    message: "fromYear must be less than or equal to toYear",
    path: ["fromYear"],
  }
);

export const MapQuerySchema = z.object({
  year: YearSchema,
  gas: GasSchema.default("TOTAL"),
  includeRegions: BooleanStringSchema,
});

export const SectorQuerySchema = z.object({
  country: CountryCodeSchema,
  year: YearSchema,
});

export const FilterQuerySchema = z.object({
  country: CountryCodeSchema,
  gas: GasSchema,
  year: YearSchema,
});
