import { API_ERROR_CODES } from "@/lib/api/error";

type JsonSchema = Record<string, unknown>;
type OpenApiDocument = Record<string, unknown> & {
  components?: { schemas?: Record<string, JsonSchema> };
  info: { title: string; version: string; description: string };
  openapi: string;
  paths?: Record<
    string,
    Record<string, Record<string, unknown> & { operationId?: string; parameters?: unknown[]; summary?: string }>
  >;
};

const nullableNumber: JsonSchema = { type: ["number", "null"] };

const schemas = {
  CountryCode: {
    type: "string",
    minLength: 3,
    maxLength: 3,
    example: "THA",
  },
  Year: {
    type: "integer",
    minimum: 1990,
    maximum: 2030,
    example: 2020,
  },
  Gas: {
    type: "string",
    enum: ["TOTAL", "CO2", "CH4", "N2O", "HFC", "PFC", "SF6"],
  },
  CountrySummary: {
    type: "object",
    required: ["code", "name"],
    properties: {
      code: { $ref: "#/components/schemas/CountryCode" },
      name: { type: "string", example: "Thailand" },
    },
  },
  Country: {
    type: "object",
    required: ["code", "name", "isRegion"],
    properties: {
      code: { $ref: "#/components/schemas/CountryCode" },
      name: { type: "string", example: "Thailand" },
      isRegion: { type: "boolean", example: false },
    },
  },
  CountryList: {
    type: "array",
    items: { $ref: "#/components/schemas/Country" },
  },
  PersistedCountry: {
    type: "object",
    required: ["id", "code", "name", "isRegion"],
    properties: {
      id: { type: "string", example: "country_id" },
      code: { $ref: "#/components/schemas/CountryCode" },
      name: { type: "string", example: "Thailand" },
      isRegion: { type: "boolean", example: false },
    },
  },
  AnnualEmission: {
    type: "object",
    required: ["id", "countryCode", "year", "total", "co2", "ch4", "n2o", "hfc", "pfc", "sf6"],
    properties: {
      id: { type: "string", example: "emission_id" },
      countryCode: { $ref: "#/components/schemas/CountryCode" },
      year: { $ref: "#/components/schemas/Year" },
      total: nullableNumber,
      co2: nullableNumber,
      ch4: nullableNumber,
      n2o: nullableNumber,
      hfc: nullableNumber,
      pfc: nullableNumber,
      sf6: nullableNumber,
    },
  },
  SectorShare: {
    type: "object",
    required: ["id", "countryCode", "year", "transport", "manufacturing", "electricity", "buildings", "other"],
    properties: {
      id: { type: "string", example: "sector_share_id" },
      countryCode: { $ref: "#/components/schemas/CountryCode" },
      year: { $ref: "#/components/schemas/Year" },
      transport: nullableNumber,
      manufacturing: nullableNumber,
      electricity: nullableNumber,
      buildings: nullableNumber,
      other: nullableNumber,
    },
  },
  DeleteResponse: {
    type: "object",
    required: ["deleted", "id"],
    properties: {
      deleted: { const: true },
      id: { type: "string" },
    },
  },
  ErrorResponse: {
    type: "object",
    required: ["error"],
    properties: {
      error: {
        type: "object",
        required: ["code", "details"],
        properties: {
          code: { type: "string", enum: [...API_ERROR_CODES] },
          details: { type: "object", additionalProperties: true },
        },
      },
    },
  },
  SuccessResponse: {
    type: "object",
    required: ["data"],
    properties: {
      data: {},
    },
  },
  TrendResponse: {
    type: "object",
    required: ["country", "gas", "unit", "points"],
    properties: {
      country: { $ref: "#/components/schemas/CountrySummary" },
      gas: { $ref: "#/components/schemas/Gas" },
      unit: { const: "kt_co2e" },
      points: {
        type: "array",
        items: {
          type: "object",
          required: ["year", "value"],
          properties: {
            year: { $ref: "#/components/schemas/Year" },
            value: nullableNumber,
          },
        },
      },
    },
  },
  MapResponse: {
    type: "object",
    required: ["year", "gas", "unit", "countries"],
    properties: {
      year: { $ref: "#/components/schemas/Year" },
      gas: { $ref: "#/components/schemas/Gas" },
      unit: { const: "kt_co2e" },
      countries: {
        type: "array",
        items: {
          type: "object",
          required: ["countryCode", "countryName", "value"],
          properties: {
            countryCode: { $ref: "#/components/schemas/CountryCode" },
            countryName: { type: "string" },
            value: nullableNumber,
          },
        },
      },
    },
  },
  SectorBreakdownResponse: {
    type: "object",
    required: ["country", "year", "unit", "sectors"],
    properties: {
      country: { $ref: "#/components/schemas/CountrySummary" },
      year: { $ref: "#/components/schemas/Year" },
      unit: { const: "percent" },
      sectors: {
        type: "object",
        required: ["transport", "manufacturing", "electricity", "buildings", "other"],
        properties: {
          transport: nullableNumber,
          manufacturing: nullableNumber,
          electricity: nullableNumber,
          buildings: nullableNumber,
          other: nullableNumber,
        },
      },
    },
  },
  FilteredEmissionResponse: {
    type: "object",
    required: ["country", "year", "gas", "unit", "value"],
    properties: {
      country: { $ref: "#/components/schemas/CountrySummary" },
      year: { $ref: "#/components/schemas/Year" },
      gas: { $ref: "#/components/schemas/Gas" },
      unit: { const: "kt_co2e" },
      value: nullableNumber,
    },
  },
  CreateCountryBody: {
    type: "object",
    required: ["code", "name"],
    properties: {
      code: { $ref: "#/components/schemas/CountryCode" },
      name: { type: "string", minLength: 1 },
      isRegion: { type: "boolean", default: false },
    },
  },
  UpdateCountryBody: {
    type: "object",
    properties: {
      code: { $ref: "#/components/schemas/CountryCode" },
      name: { type: "string", minLength: 1 },
      isRegion: { type: "boolean" },
    },
  },
  CreateEmissionBody: {
    type: "object",
    required: ["countryCode", "year"],
    properties: {
      countryCode: { $ref: "#/components/schemas/CountryCode" },
      year: { $ref: "#/components/schemas/Year" },
      total: nullableNumber,
      co2: nullableNumber,
      ch4: nullableNumber,
      n2o: nullableNumber,
      hfc: nullableNumber,
      pfc: nullableNumber,
      sf6: nullableNumber,
    },
  },
  UpdateEmissionBody: {
    type: "object",
    properties: {
      year: { $ref: "#/components/schemas/Year" },
      total: nullableNumber,
      co2: nullableNumber,
      ch4: nullableNumber,
      n2o: nullableNumber,
      hfc: nullableNumber,
      pfc: nullableNumber,
      sf6: nullableNumber,
    },
  },
  CreateSectorShareBody: {
    type: "object",
    required: ["countryCode", "year"],
    properties: {
      countryCode: { $ref: "#/components/schemas/CountryCode" },
      year: { $ref: "#/components/schemas/Year" },
      transport: nullableNumber,
      manufacturing: nullableNumber,
      electricity: nullableNumber,
      buildings: nullableNumber,
      other: nullableNumber,
    },
  },
  UpdateSectorShareBody: {
    type: "object",
    properties: {
      year: { $ref: "#/components/schemas/Year" },
      transport: nullableNumber,
      manufacturing: nullableNumber,
      electricity: nullableNumber,
      buildings: nullableNumber,
      other: nullableNumber,
    },
  },
};

const ref = (name: keyof typeof schemas) => ({ $ref: `#/components/schemas/${name}` });

function success(schemaName: keyof typeof schemas) {
  return {
    description: "Successful response.",
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["data"],
          properties: { data: ref(schemaName) },
        },
      },
    },
  };
}

function error(description: string) {
  return {
    description,
    content: { "application/json": { schema: ref("ErrorResponse") } },
  };
}

function body(schemaName: keyof typeof schemas) {
  return {
    required: true,
    content: { "application/json": { schema: ref(schemaName) } },
  };
}

const countryParam = {
  name: "country",
  in: "query",
  required: true,
  schema: { ...schemas.CountryCode, example: "THA" },
};

const yearParam = {
  name: "year",
  in: "query",
  required: true,
  schema: { ...schemas.Year, example: 2020 },
};

const gasParam = {
  name: "gas",
  in: "query",
  required: false,
  schema: { ...schemas.Gas, default: "TOTAL" },
};

const pathIdParam = (example: string) => ({
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", minLength: 1, example },
});

export function generateOpenApiDocument(): OpenApiDocument {
  return {
    openapi: "3.1.0",
    info: {
      title: "Lo-Carb GGE Dashboard API",
      version: "0.1.0",
      description: "Greenhouse gas emissions dashboard API.",
    },
    servers: [{ url: "/", description: "Production" }],
    tags: [
      { name: "Countries", description: "Country reference data management." },
      { name: "Emissions", description: "Annual greenhouse gas emission records and aggregated views." },
      { name: "Sector Shares", description: "Per-sector emission share records by country and year." },
      { name: "Internal", description: "Meta-endpoints: OpenAPI document and interactive docs." },
    ],
    paths: {
      "/api/openapi": {
        get: {
          tags: ["Internal"],
          summary: "Get OpenAPI document",
          responses: { 200: success("SuccessResponse") },
        },
      },
      "/api/docs": {
        get: {
          tags: ["Internal"],
          summary: "View interactive API docs",
          responses: { 200: { description: "HTML API reference." } },
        },
      },
      "/api/countries": {
        get: {
          tags: ["Countries"],
          summary: "List countries",
          parameters: [
            {
              name: "includeRegions",
              in: "query",
              required: false,
              schema: { type: "boolean", default: false },
            },
          ],
          responses: { 200: success("CountryList"), 400: error("Invalid query parameters.") },
        },
        post: {
          operationId: "createCountry",
          tags: ["Countries"],
          summary: "Create country",
          requestBody: body("CreateCountryBody"),
          responses: {
            200: success("PersistedCountry"),
            400: error("Invalid body."),
            401: error("Unauthenticated."),
            403: error("Forbidden."),
            409: error("Country code already exists."),
          },
        },
      },
      "/api/countries/{id}": {
        patch: writePath("updateCountry", "Countries", "Update country", "UpdateCountryBody", "PersistedCountry", "country_id"),
        delete: deletePath("deleteCountry", "Countries", "Delete country", "country_id"),
      },
      "/api/emissions": {
        post: writePath("createEmission", "Emissions", "Create emissions record", "CreateEmissionBody", "AnnualEmission", "emission_id", false),
      },
      "/api/emissions/{id}": {
        patch: writePath("updateEmission", "Emissions", "Update emissions record", "UpdateEmissionBody", "AnnualEmission", "emission_id"),
        delete: deletePath("deleteEmission", "Emissions", "Delete emissions record", "emission_id"),
      },
      "/api/emissions/trend": {
        get: {
          tags: ["Emissions"],
          summary: "Get emissions trend",
          parameters: [
            countryParam,
            gasParam,
            { name: "fromYear", in: "query", required: false, schema: { ...schemas.Year, default: 1990, example: 1990 } },
            { name: "toYear", in: "query", required: false, schema: { ...schemas.Year, default: 2030, example: 2030 } },
          ],
          responses: {
            200: success("TrendResponse"),
            400: error("Invalid country, gas, or year range."),
            404: error("Country does not exist."),
          },
        },
      },
      "/api/emissions/map": {
        get: {
          tags: ["Emissions"],
          summary: "Get emissions map",
          parameters: [
            yearParam,
            gasParam,
            { name: "includeRegions", in: "query", required: false, schema: { type: "boolean", default: false } },
          ],
          responses: { 200: success("MapResponse"), 400: error("Invalid year, gas, or includeRegions value.") },
        },
      },
      "/api/emissions/sector": {
        get: {
          tags: ["Emissions"],
          summary: "Get sector breakdown",
          parameters: [countryParam, yearParam],
          responses: {
            200: success("SectorBreakdownResponse"),
            400: error("Invalid country or year."),
            404: error("Country does not exist."),
          },
        },
      },
      "/api/emissions/filter": {
        get: {
          tags: ["Emissions"],
          summary: "Get filtered emissions value",
          parameters: [countryParam, { ...gasParam, required: true }, yearParam],
          responses: {
            200: success("FilteredEmissionResponse"),
            400: error("Invalid country, gas, or year."),
            404: error("Country does not exist."),
          },
        },
      },
      "/api/sector-shares": {
        post: writePath("createSectorShare", "Sector Shares", "Create sector share record", "CreateSectorShareBody", "SectorShare", "sector_share_id", false),
      },
      "/api/sector-shares/{id}": {
        patch: writePath("updateSectorShare", "Sector Shares", "Update sector share record", "UpdateSectorShareBody", "SectorShare", "sector_share_id"),
        delete: deletePath("deleteSectorShare", "Sector Shares", "Delete sector share record", "sector_share_id"),
      },
    },
    components: { schemas },
  };
}

function writePath(
  operationId: string,
  tag: string,
  summary: string,
  bodyName: keyof typeof schemas,
  responseName: keyof typeof schemas,
  idExample: string,
  includeId = true,
) {
  return {
    operationId,
    tags: [tag],
    summary,
    ...(includeId ? { parameters: [pathIdParam(idExample)] } : {}),
    requestBody: body(bodyName),
    responses: {
      200: success(responseName),
      400: error("Invalid id or body."),
      401: error("Unauthenticated."),
      403: error("Forbidden."),
      404: error("Resource does not exist."),
      409: error("Record already exists or would create a duplicate."),
    },
  };
}

function deletePath(operationId: string, tag: string, summary: string, idExample: string) {
  return {
    operationId,
    tags: [tag],
    summary,
    parameters: [pathIdParam(idExample)],
    responses: {
      200: success("DeleteResponse"),
      401: error("Unauthenticated."),
      403: error("Forbidden."),
      404: error("Resource does not exist."),
    },
  };
}
