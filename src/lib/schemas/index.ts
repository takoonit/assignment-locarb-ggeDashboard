import { z } from "zod";
import { ApiError } from "@/lib/api/error";

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

// Write body schemas
export const createCountryBodySchema = z.object({
  code: z.string().length(3),
  name: z.string().min(1),
  isRegion: z.boolean().optional().default(false),
});

export const updateCountryBodySchema = z.object({
  code: z.string().length(3).optional(),
  name: z.string().min(1).optional(),
  isRegion: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided.",
});

const nullableNumber = z.number().nullable();

export const createEmissionBodySchema = z.object({
  countryCode: z.string().length(3),
  year: YearSchema,
  total: nullableNumber.optional().default(null),
  co2: nullableNumber.optional().default(null),
  ch4: nullableNumber.optional().default(null),
  n2o: nullableNumber.optional().default(null),
  hfc: nullableNumber.optional().default(null),
  pfc: nullableNumber.optional().default(null),
  sf6: nullableNumber.optional().default(null),
});

export const updateEmissionBodySchema = z.object({
  year: YearSchema.optional(),
  total: nullableNumber.optional(),
  co2: nullableNumber.optional(),
  ch4: nullableNumber.optional(),
  n2o: nullableNumber.optional(),
  hfc: nullableNumber.optional(),
  pfc: nullableNumber.optional(),
  sf6: nullableNumber.optional(),
});

export const createSectorShareBodySchema = z.object({
  countryCode: z.string().length(3),
  year: YearSchema,
  transport: nullableNumber.optional().default(null),
  manufacturing: nullableNumber.optional().default(null),
  electricity: nullableNumber.optional().default(null),
  buildings: nullableNumber.optional().default(null),
  other: nullableNumber.optional().default(null),
});

export const updateSectorShareBodySchema = z.object({
  year: YearSchema.optional(),
  transport: nullableNumber.optional(),
  manufacturing: nullableNumber.optional(),
  electricity: nullableNumber.optional(),
  buildings: nullableNumber.optional(),
  other: nullableNumber.optional(),
});

export const AdminPageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// camelCase aliases used by openapi.ts
export const countryCodeSchema = CountryCodeSchema;
export const gasSchema = GasSchema;
export const yearSchema = YearSchema;
export const booleanQuerySchema = BooleanStringSchema;
export const nullableNumberSchema = nullableNumber;
export const countriesQuerySchema = CountriesQuerySchema;

// Route helpers
export async function parseJsonBody<T>(
  schema: z.ZodType<T>,
  request: Request,
): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError("INVALID_PARAMS", { message: "Invalid request body." }, 400);
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ApiError("INVALID_PARAMS", { message: "Invalid request body." }, 400);
  }

  return result.data;
}

export function parseIdParam(id: string): string {
  if (!id || id.trim() === "") {
    throw new ApiError("INVALID_PARAMS", { message: "Invalid id." }, 400);
  }
  return id;
}
