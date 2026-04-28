import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import "@/lib/zod-openapi";
import { z } from "zod";
import { API_ERROR_CODES } from "@/lib/api-utils";
import {
  countriesQuerySchema,
  countryCodeSchema,
  createCountryBodySchema,
  createEmissionBodySchema,
  createSectorShareBodySchema,
  gasSchema,
  booleanQuerySchema,
  nullableNumberSchema,
  updateCountryBodySchema,
  updateEmissionBodySchema,
  updateSectorShareBodySchema,
  yearSchema,
} from "@/lib/api-schemas";

const registry = new OpenAPIRegistry();

const CountryIdParam = z.string().min(1).openapi({
  param: { name: "id", in: "path" },
  example: "country_id",
});

const EmissionIdParam = z.string().min(1).openapi({
  param: { name: "id", in: "path" },
  example: "emission_id",
});

const SectorShareIdParam = z.string().min(1).openapi({
  param: { name: "id", in: "path" },
  example: "sector_share_id",
});

const CountryCode = registry.register("CountryCode", countryCodeSchema);
const Year = registry.register("Year", yearSchema);
const Gas = registry.register("Gas", gasSchema);
const NullableNumber = nullableNumberSchema;

const CountrySummary = registry.register(
  "CountrySummary",
  z.object({
    code: CountryCode,
    name: z.string().openapi({ example: "Thailand" }),
  }),
);

const Country = registry.register(
  "Country",
  z.object({
    code: CountryCode,
    name: z.string().openapi({ example: "Thailand" }),
    isRegion: z.boolean().openapi({ example: false }),
  }),
);

const PersistedCountry = registry.register(
  "PersistedCountry",
  Country.extend({
    id: z.string().openapi({ example: "country_id" }),
  }),
);

const AnnualEmission = registry.register(
  "AnnualEmission",
  z.object({
    id: z.string().openapi({ example: "emission_id" }),
    countryCode: CountryCode,
    year: Year,
    total: NullableNumber,
    co2: NullableNumber,
    ch4: NullableNumber,
    n2o: NullableNumber,
    hfc: NullableNumber,
    pfc: NullableNumber,
    sf6: NullableNumber,
  }),
);

const SectorShare = registry.register(
  "SectorShare",
  z.object({
    id: z.string().openapi({ example: "sector_share_id" }),
    countryCode: CountryCode,
    year: Year,
    transport: NullableNumber,
    manufacturing: NullableNumber,
    electricity: NullableNumber,
    buildings: NullableNumber,
    other: NullableNumber,
  }),
);

const DeleteResponse = registry.register(
  "DeleteResponse",
  z.object({
    deleted: z.literal(true),
    id: z.string(),
  }),
);

const CountryCodeParam = countryCodeSchema.openapi({ example: "THA" });
const YearParam = yearSchema.openapi({ example: 2020 });
const FromYearParam = yearSchema.default(1990).openapi({ example: 1990 });
const ToYearParam = yearSchema.default(2030).openapi({ example: 2030 });
const DefaultGasParam = gasSchema.default("TOTAL");

const trendOpenApiQuerySchema = z
  .object({
    country: CountryCodeParam,
    gas: DefaultGasParam,
    fromYear: FromYearParam,
    toYear: ToYearParam,
  })
  .refine((value) => value.fromYear <= value.toYear, {
    message: "fromYear must be less than or equal to toYear",
    path: ["fromYear"],
  });

const mapOpenApiQuerySchema = z.object({
  year: YearParam,
  gas: DefaultGasParam,
  includeRegions: booleanQuerySchema.default(false),
});

const sectorOpenApiQuerySchema = z.object({
  country: CountryCodeParam,
  year: YearParam,
});

const filterOpenApiQuerySchema = z.object({
  country: CountryCodeParam,
  gas: gasSchema,
  year: YearParam,
});

const ErrorResponse = registry.register(
  "ErrorResponse",
  z.object({
    error: z.object({
      code: z.enum(API_ERROR_CODES),
      details: z.record(z.string(), z.unknown()),
    }),
  }),
);

registry.register(
  "SuccessResponse",
  z.object({
    data: z.unknown(),
  }),
);

const TrendResponse = registry.register(
  "TrendResponse",
  z.object({
    country: CountrySummary,
    gas: Gas,
    unit: z.literal("kt_co2e"),
    points: z.array(
      z.object({
        year: Year,
        value: NullableNumber,
      }),
    ),
  }),
);

const MapResponse = registry.register(
  "MapResponse",
  z.object({
    year: Year,
    gas: Gas,
    unit: z.literal("kt_co2e"),
    countries: z.array(
      z.object({
        countryCode: CountryCode,
        countryName: z.string(),
        value: NullableNumber,
      }),
    ),
  }),
);

const SectorBreakdownResponse = registry.register(
  "SectorBreakdownResponse",
  z.object({
    country: CountrySummary,
    year: Year,
    unit: z.literal("percent"),
    sectors: z.object({
      transport: NullableNumber,
      manufacturing: NullableNumber,
      electricity: NullableNumber,
      buildings: NullableNumber,
      other: NullableNumber,
    }),
  }),
);

const FilteredEmissionResponse = registry.register(
  "FilteredEmissionResponse",
  z.object({
    country: CountrySummary,
    year: Year,
    gas: Gas,
    unit: z.literal("kt_co2e"),
    value: NullableNumber,
  }),
);

const CreateCountryBody = registry.register(
  "CreateCountryBody",
  createCountryBodySchema,
);
const UpdateCountryBody = registry.register(
  "UpdateCountryBody",
  updateCountryBodySchema,
);
const CreateEmissionBody = registry.register(
  "CreateEmissionBody",
  createEmissionBodySchema,
);
const UpdateEmissionBody = registry.register(
  "UpdateEmissionBody",
  updateEmissionBodySchema,
);
const CreateSectorShareBody = registry.register(
  "CreateSectorShareBody",
  createSectorShareBodySchema,
);
const UpdateSectorShareBody = registry.register(
  "UpdateSectorShareBody",
  updateSectorShareBodySchema,
);

const dataResponse = (schema: z.ZodType) => ({
  description: "Successful response.",
  content: {
    "application/json": {
      schema: z.object({ data: schema }),
    },
  },
});

const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: ErrorResponse,
    },
  },
});

const jsonBody = (schema: z.ZodType) => ({
  required: true,
  content: {
    "application/json": {
      schema,
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/openapi",
  tags: ["Internal"],
  summary: "Get OpenAPI document",
  description: "Returns the raw OpenAPI 3.1 JSON document describing this API.",
  responses: {
    200: dataResponse(z.object({}).passthrough()),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/docs",
  tags: ["Internal"],
  summary: "View interactive API docs",
  description: "Renders the Scalar interactive API reference UI.",
  responses: {
    200: {
      description: "HTML API reference.",
      content: { "text/html": { schema: z.string() } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/countries",
  tags: ["Countries"],
  summary: "List countries",
  description:
    "Returns all countries (and optionally regions) stored in the system. Use `includeRegions=true` to include aggregate regional entries.",
  request: { query: countriesQuerySchema },
  responses: {
    200: dataResponse(z.array(Country)),
    400: errorResponse("Invalid query parameters."),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/countries",
  operationId: "createCountry",
  tags: ["Countries"],
  summary: "Create country",
  description: "Creates a new country entry. The country code must be unique.",
  request: { body: jsonBody(CreateCountryBody) },
  responses: {
    200: dataResponse(PersistedCountry),
    400: errorResponse("Invalid body."),
    401: errorResponse("Unauthenticated."),
    403: errorResponse("Forbidden."),
    409: errorResponse("Country code already exists."),
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/countries/{id}",
  operationId: "updateCountry",
  tags: ["Countries"],
  summary: "Update country",
  description:
    "Partially updates an existing country. Only provided fields are changed.",
  request: { params: z.object({ id: CountryIdParam }), body: jsonBody(UpdateCountryBody) },
  responses: {
    200: dataResponse(PersistedCountry),
    400: errorResponse("Invalid id or body."),
    401: errorResponse("Unauthenticated."),
    403: errorResponse("Forbidden."),
    404: errorResponse("Country does not exist."),
    409: errorResponse("Country code already exists."),
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/countries/{id}",
  operationId: "deleteCountry",
  tags: ["Countries"],
  summary: "Delete country",
  description: "Permanently deletes a country and returns its id on success.",
  request: { params: z.object({ id: CountryIdParam }) },
  responses: {
    200: dataResponse(DeleteResponse),
    401: errorResponse("Unauthenticated."),
    403: errorResponse("Forbidden."),
    404: errorResponse("Country does not exist."),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/emissions/trend",
  tags: ["Emissions"],
  summary: "Get emissions trend",
  description:
    "Returns a time series of annual emissions for a single country and gas type over the given year range.",
  request: { query: trendOpenApiQuerySchema },
  responses: {
    200: dataResponse(TrendResponse),
    400: errorResponse("Invalid country, gas, or year range."),
    404: errorResponse("Country does not exist."),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/emissions/map",
  tags: ["Emissions"],
  summary: "Get emissions map",
  description:
    "Returns per-country emission values for a single year and gas, suitable for choropleth map rendering.",
  request: { query: mapOpenApiQuerySchema },
  responses: {
    200: dataResponse(MapResponse),
    400: errorResponse("Invalid year, gas, or includeRegions value."),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/emissions/sector",
  tags: ["Emissions"],
  summary: "Get sector breakdown",
  description:
    "Returns the percentage breakdown of emissions by sector (transport, manufacturing, electricity, buildings, other) for a country and year.",
  request: { query: sectorOpenApiQuerySchema },
  responses: {
    200: dataResponse(SectorBreakdownResponse),
    400: errorResponse("Invalid country or year."),
    404: errorResponse("Country does not exist."),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/emissions/filter",
  tags: ["Emissions"],
  summary: "Get filtered emissions value",
  description:
    "Returns a single emission value for a specific country, year, and gas type.",
  request: { query: filterOpenApiQuerySchema },
  responses: {
    200: dataResponse(FilteredEmissionResponse),
    400: errorResponse("Invalid country, gas, or year."),
    404: errorResponse("Country does not exist."),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/emissions",
  operationId: "createEmission",
  tags: ["Emissions"],
  summary: "Create emissions record",
  description:
    "Creates a new annual emissions record for a country. The combination of country code and year must be unique.",
  request: { body: jsonBody(CreateEmissionBody) },
  responses: {
    200: dataResponse(AnnualEmission),
    400: errorResponse("Invalid body."),
    401: errorResponse("Unauthenticated."),
    403: errorResponse("Forbidden."),
    404: errorResponse("Country code does not exist."),
    409: errorResponse("Record already exists for this country and year."),
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/emissions/{id}",
  operationId: "updateEmission",
  tags: ["Emissions"],
  summary: "Update emissions record",
  description: "Partially updates an existing annual emissions record.",
  request: { params: z.object({ id: EmissionIdParam }), body: jsonBody(UpdateEmissionBody) },
  responses: {
    200: dataResponse(AnnualEmission),
    400: errorResponse("Invalid id or body."),
    401: errorResponse("Unauthenticated."),
    403: errorResponse("Forbidden."),
    404: errorResponse("Emissions record does not exist."),
    409: errorResponse("Updated year would create a duplicate."),
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/emissions/{id}",
  operationId: "deleteEmission",
  tags: ["Emissions"],
  summary: "Delete emissions record",
  description: "Permanently deletes an annual emissions record.",
  request: { params: z.object({ id: EmissionIdParam }) },
  responses: {
    200: dataResponse(DeleteResponse),
    401: errorResponse("Unauthenticated."),
    403: errorResponse("Forbidden."),
    404: errorResponse("Emissions record does not exist."),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/sector-shares",
  operationId: "createSectorShare",
  tags: ["Sector Shares"],
  summary: "Create sector share record",
  description:
    "Creates a sector breakdown record for a country and year. The combination of country code and year must be unique.",
  request: { body: jsonBody(CreateSectorShareBody) },
  responses: {
    200: dataResponse(SectorShare),
    400: errorResponse("Invalid body."),
    401: errorResponse("Unauthenticated."),
    403: errorResponse("Forbidden."),
    404: errorResponse("Country code does not exist."),
    409: errorResponse("Sector data already exists for this country and year."),
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/sector-shares/{id}",
  operationId: "updateSectorShare",
  tags: ["Sector Shares"],
  summary: "Update sector share record",
  description: "Partially updates an existing sector share record.",
  request: { params: z.object({ id: SectorShareIdParam }), body: jsonBody(UpdateSectorShareBody) },
  responses: {
    200: dataResponse(SectorShare),
    400: errorResponse("Invalid id or body."),
    401: errorResponse("Unauthenticated."),
    403: errorResponse("Forbidden."),
    404: errorResponse("Sector share record does not exist."),
    409: errorResponse("Updated record would create a duplicate."),
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/sector-shares/{id}",
  operationId: "deleteSectorShare",
  tags: ["Sector Shares"],
  summary: "Delete sector share record",
  description: "Permanently deletes a sector share record.",
  request: { params: z.object({ id: SectorShareIdParam }) },
  responses: {
    200: dataResponse(DeleteResponse),
    401: errorResponse("Unauthenticated."),
    403: errorResponse("Forbidden."),
    404: errorResponse("Sector share record does not exist."),
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Lo-Carb GGE Dashboard API",
      version: "0.1.0",
      description: "Greenhouse gas emissions dashboard API.",
    },
    servers: [{ url: "/", description: "Production" }],
    tags: [
      { name: "Countries", description: "Country reference data management." },
      {
        name: "Emissions",
        description:
          "Annual greenhouse gas emission records and aggregated views (trend, map, sector, filter).",
      },
      {
        name: "Sector Shares",
        description: "Per-sector emission share records by country and year.",
      },
      {
        name: "Internal",
        description: "Meta-endpoints: OpenAPI document and interactive docs.",
      },
    ],
  });
}
