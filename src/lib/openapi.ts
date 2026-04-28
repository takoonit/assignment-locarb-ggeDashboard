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
  filterQuerySchema,
  gasSchema,
  mapQuerySchema,
  nullableNumberSchema,
  sectorQuerySchema,
  trendQuerySchema,
  updateCountryBodySchema,
  updateEmissionBodySchema,
  updateSectorShareBodySchema,
  yearSchema,
} from "@/lib/api-schemas";

const registry = new OpenAPIRegistry();

const IdParam = z.string().min(1).openapi({
  param: {
    name: "id",
    in: "path",
  },
  example: "country_id",
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
    id: z.string().openapi({ example: "annual_emission_id" }),
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
  tags: ["Documentation"],
  summary: "Get OpenAPI document",
  responses: {
    200: dataResponse(z.object({}).passthrough()),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/docs",
  tags: ["Documentation"],
  summary: "View interactive API docs",
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
  request: { query: countriesQuerySchema },
  responses: {
    200: dataResponse(z.array(Country)),
    400: errorResponse("Invalid query parameters."),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/countries",
  tags: ["Countries"],
  summary: "Create country",
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
  tags: ["Countries"],
  summary: "Update country",
  request: { params: z.object({ id: IdParam }), body: jsonBody(UpdateCountryBody) },
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
  tags: ["Countries"],
  summary: "Delete country",
  request: { params: z.object({ id: IdParam }) },
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
  request: { query: trendQuerySchema },
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
  request: { query: mapQuerySchema },
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
  request: { query: sectorQuerySchema },
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
  request: { query: filterQuerySchema },
  responses: {
    200: dataResponse(FilteredEmissionResponse),
    400: errorResponse("Invalid country, gas, or year."),
    404: errorResponse("Country does not exist."),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/emissions",
  tags: ["Emissions"],
  summary: "Create emissions record",
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
  tags: ["Emissions"],
  summary: "Update emissions record",
  request: { params: z.object({ id: IdParam }), body: jsonBody(UpdateEmissionBody) },
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
  tags: ["Emissions"],
  summary: "Delete emissions record",
  request: { params: z.object({ id: IdParam }) },
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
  tags: ["Sector Shares"],
  summary: "Create sector share record",
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
  tags: ["Sector Shares"],
  summary: "Update sector share record",
  request: { params: z.object({ id: IdParam }), body: jsonBody(UpdateSectorShareBody) },
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
  tags: ["Sector Shares"],
  summary: "Delete sector share record",
  request: { params: z.object({ id: IdParam }) },
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
    servers: [{ url: "/" }],
  });
}
