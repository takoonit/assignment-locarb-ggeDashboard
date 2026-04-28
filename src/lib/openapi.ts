type JsonSchema = Record<string, unknown>;

const errorCodes = [
  "INVALID_PARAMS",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_ERROR",
] as const;

const gasValues = ["TOTAL", "CO2", "CH4", "N2O", "HFC", "PFC", "SF6"] as const;

const countryCodeSchema = {
  type: "string",
  pattern: "^[A-Z]{3}$",
  example: "THA",
};

const yearSchema = {
  type: "integer",
  minimum: 1990,
  maximum: 2030,
  example: 2020,
};

const nullableNumberSchema = {
  type: ["number", "null"],
};

const gasSchema = {
  type: "string",
  enum: gasValues,
  example: "CO2",
};

const countrySummarySchema = {
  type: "object",
  required: ["code", "name"],
  properties: {
    code: countryCodeSchema,
    name: { type: "string", example: "Thailand" },
  },
};

const countrySchema = {
  allOf: [
    countrySummarySchema,
    {
      type: "object",
      required: ["isRegion"],
      properties: {
        isRegion: { type: "boolean", example: false },
      },
    },
  ],
};

const persistedCountrySchema = {
  allOf: [
    countrySchema,
    {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", example: "country_id" },
      },
    },
  ],
};

const annualEmissionSchema = {
  type: "object",
  required: ["id", "countryCode", "year", "total", "co2", "ch4", "n2o", "hfc", "pfc", "sf6"],
  properties: {
    id: { type: "string", example: "annual_emission_id" },
    countryCode: countryCodeSchema,
    year: yearSchema,
    total: nullableNumberSchema,
    co2: nullableNumberSchema,
    ch4: nullableNumberSchema,
    n2o: nullableNumberSchema,
    hfc: nullableNumberSchema,
    pfc: nullableNumberSchema,
    sf6: nullableNumberSchema,
  },
};

const sectorShareSchema = {
  type: "object",
  required: [
    "id",
    "countryCode",
    "year",
    "transport",
    "manufacturing",
    "electricity",
    "buildings",
    "other",
  ],
  properties: {
    id: { type: "string", example: "sector_share_id" },
    countryCode: countryCodeSchema,
    year: yearSchema,
    transport: nullableNumberSchema,
    manufacturing: nullableNumberSchema,
    electricity: nullableNumberSchema,
    buildings: nullableNumberSchema,
    other: nullableNumberSchema,
  },
};

const deletedSchema = {
  type: "object",
  required: ["deleted", "id"],
  properties: {
    deleted: { type: "boolean", const: true },
    id: { type: "string" },
  },
};

const response = (schema: JsonSchema, description = "Successful response.") => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["data"],
        properties: {
          data: schema,
        },
      },
    },
  },
});

const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  },
});

const queryParameter = (
  name: string,
  schema: JsonSchema,
  required = false,
  description?: string,
) => ({
  name,
  in: "query",
  required,
  ...(description ? { description } : {}),
  schema,
});

const pathParameter = (name: string) => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string" },
});

const jsonBody = (schema: JsonSchema) => ({
  required: true,
  content: {
    "application/json": {
      schema,
    },
  },
});

export function generateOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Lo-Carb GGE Dashboard API",
      version: "0.1.0",
      description: "Greenhouse gas emissions dashboard API.",
    },
    servers: [{ url: "/" }],
    paths: {
      "/api/openapi": {
        get: {
          tags: ["Documentation"],
          summary: "Get OpenAPI document",
          responses: {
            200: response({ type: "object" }, "Raw OpenAPI JSON document."),
          },
        },
      },
      "/api/docs": {
        get: {
          tags: ["Documentation"],
          summary: "View interactive API docs",
          responses: {
            200: {
              description: "HTML API reference.",
              content: {
                "text/html": {
                  schema: { type: "string" },
                },
              },
            },
          },
        },
      },
      "/api/countries": {
        get: {
          tags: ["Countries"],
          summary: "List countries",
          parameters: [
            queryParameter("includeRegions", { type: "boolean" }, false),
          ],
          responses: {
            200: response({ type: "array", items: { $ref: "#/components/schemas/Country" } }),
            400: errorResponse("Invalid query parameters."),
          },
        },
        post: {
          tags: ["Countries"],
          summary: "Create country",
          requestBody: jsonBody({ $ref: "#/components/schemas/CreateCountryBody" }),
          responses: {
            200: response({ $ref: "#/components/schemas/PersistedCountry" }),
            400: errorResponse("Invalid body."),
            401: errorResponse("Unauthenticated."),
            403: errorResponse("Forbidden."),
            409: errorResponse("Country code already exists."),
          },
        },
      },
      "/api/countries/{id}": {
        patch: {
          tags: ["Countries"],
          summary: "Update country",
          parameters: [pathParameter("id")],
          requestBody: jsonBody({ $ref: "#/components/schemas/UpdateCountryBody" }),
          responses: {
            200: response({ $ref: "#/components/schemas/PersistedCountry" }),
            400: errorResponse("Invalid id or body."),
            401: errorResponse("Unauthenticated."),
            403: errorResponse("Forbidden."),
            404: errorResponse("Country does not exist."),
            409: errorResponse("Country code already exists."),
          },
        },
        delete: {
          tags: ["Countries"],
          summary: "Delete country",
          parameters: [pathParameter("id")],
          responses: {
            200: response({ $ref: "#/components/schemas/DeleteResponse" }),
            401: errorResponse("Unauthenticated."),
            403: errorResponse("Forbidden."),
            404: errorResponse("Country does not exist."),
          },
        },
      },
      "/api/emissions/trend": {
        get: {
          tags: ["Emissions"],
          summary: "Get emissions trend",
          parameters: [
            queryParameter("country", countryCodeSchema, true),
            queryParameter("gas", gasSchema),
            queryParameter("fromYear", yearSchema),
            queryParameter("toYear", yearSchema),
          ],
          responses: {
            200: response({ $ref: "#/components/schemas/TrendResponse" }),
            400: errorResponse("Invalid country, gas, or year range."),
            404: errorResponse("Country does not exist."),
          },
        },
      },
      "/api/emissions/map": {
        get: {
          tags: ["Emissions"],
          summary: "Get emissions map",
          parameters: [
            queryParameter("year", yearSchema, true),
            queryParameter("gas", gasSchema),
            queryParameter("includeRegions", { type: "boolean" }),
          ],
          responses: {
            200: response({ $ref: "#/components/schemas/MapResponse" }),
            400: errorResponse("Invalid year, gas, or includeRegions value."),
          },
        },
      },
      "/api/emissions/sector": {
        get: {
          tags: ["Emissions"],
          summary: "Get sector breakdown",
          parameters: [
            queryParameter("country", countryCodeSchema, true),
            queryParameter("year", yearSchema, true),
          ],
          responses: {
            200: response({ $ref: "#/components/schemas/SectorBreakdownResponse" }),
            400: errorResponse("Invalid country or year."),
            404: errorResponse("Country does not exist."),
          },
        },
      },
      "/api/emissions/filter": {
        get: {
          tags: ["Emissions"],
          summary: "Get filtered emissions value",
          parameters: [
            queryParameter("country", countryCodeSchema, true),
            queryParameter("gas", gasSchema, true),
            queryParameter("year", yearSchema, true),
          ],
          responses: {
            200: response({ $ref: "#/components/schemas/FilteredEmissionResponse" }),
            400: errorResponse("Invalid country, gas, or year."),
            404: errorResponse("Country does not exist."),
          },
        },
      },
      "/api/emissions": {
        post: {
          tags: ["Emissions"],
          summary: "Create emissions record",
          requestBody: jsonBody({ $ref: "#/components/schemas/CreateEmissionBody" }),
          responses: {
            200: response({ $ref: "#/components/schemas/AnnualEmission" }),
            400: errorResponse("Invalid body."),
            401: errorResponse("Unauthenticated."),
            403: errorResponse("Forbidden."),
            404: errorResponse("Country code does not exist."),
            409: errorResponse("Record already exists for this country and year."),
          },
        },
      },
      "/api/emissions/{id}": {
        patch: {
          tags: ["Emissions"],
          summary: "Update emissions record",
          parameters: [pathParameter("id")],
          requestBody: jsonBody({ $ref: "#/components/schemas/UpdateEmissionBody" }),
          responses: {
            200: response({ $ref: "#/components/schemas/AnnualEmission" }),
            400: errorResponse("Invalid id or body."),
            401: errorResponse("Unauthenticated."),
            403: errorResponse("Forbidden."),
            404: errorResponse("Emissions record does not exist."),
            409: errorResponse("Updated year would create a duplicate."),
          },
        },
        delete: {
          tags: ["Emissions"],
          summary: "Delete emissions record",
          parameters: [pathParameter("id")],
          responses: {
            200: response({ $ref: "#/components/schemas/DeleteResponse" }),
            401: errorResponse("Unauthenticated."),
            403: errorResponse("Forbidden."),
            404: errorResponse("Emissions record does not exist."),
          },
        },
      },
      "/api/sector-shares": {
        post: {
          tags: ["Sector Shares"],
          summary: "Create sector share record",
          requestBody: jsonBody({ $ref: "#/components/schemas/CreateSectorShareBody" }),
          responses: {
            200: response({ $ref: "#/components/schemas/SectorShare" }),
            400: errorResponse("Invalid body."),
            401: errorResponse("Unauthenticated."),
            403: errorResponse("Forbidden."),
            404: errorResponse("Country code does not exist."),
            409: errorResponse("Sector data already exists for this country and year."),
          },
        },
      },
      "/api/sector-shares/{id}": {
        patch: {
          tags: ["Sector Shares"],
          summary: "Update sector share record",
          parameters: [pathParameter("id")],
          requestBody: jsonBody({ $ref: "#/components/schemas/UpdateSectorShareBody" }),
          responses: {
            200: response({ $ref: "#/components/schemas/SectorShare" }),
            400: errorResponse("Invalid id or body."),
            401: errorResponse("Unauthenticated."),
            403: errorResponse("Forbidden."),
            404: errorResponse("Sector share record does not exist."),
            409: errorResponse("Updated record would create a duplicate."),
          },
        },
        delete: {
          tags: ["Sector Shares"],
          summary: "Delete sector share record",
          parameters: [pathParameter("id")],
          responses: {
            200: response({ $ref: "#/components/schemas/DeleteResponse" }),
            401: errorResponse("Unauthenticated."),
            403: errorResponse("Forbidden."),
            404: errorResponse("Sector share record does not exist."),
          },
        },
      },
    },
    components: {
      schemas: {
        Country: countrySchema,
        PersistedCountry: persistedCountrySchema,
        AnnualEmission: annualEmissionSchema,
        SectorShare: sectorShareSchema,
        DeleteResponse: deletedSchema,
        ErrorResponse: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["code", "details"],
              properties: {
                code: {
                  type: "string",
                  enum: errorCodes,
                },
                details: {
                  type: "object",
                  additionalProperties: true,
                },
              },
            },
          },
        },
        CreateCountryBody: countrySchema,
        UpdateCountryBody: {
          type: "object",
          properties: {
            name: { type: "string" },
            isRegion: { type: "boolean" },
          },
        },
        CreateEmissionBody: {
          ...annualEmissionSchema,
          required: annualEmissionSchema.required.filter((key) => key !== "id"),
          properties: Object.fromEntries(
            Object.entries(annualEmissionSchema.properties).filter(([key]) => key !== "id"),
          ),
        },
        UpdateEmissionBody: {
          type: "object",
          required: ["year"],
          properties: {
            year: yearSchema,
            total: nullableNumberSchema,
            co2: nullableNumberSchema,
            ch4: nullableNumberSchema,
            n2o: nullableNumberSchema,
            hfc: nullableNumberSchema,
            pfc: nullableNumberSchema,
            sf6: nullableNumberSchema,
          },
        },
        CreateSectorShareBody: {
          ...sectorShareSchema,
          required: sectorShareSchema.required.filter((key) => key !== "id"),
          properties: Object.fromEntries(
            Object.entries(sectorShareSchema.properties).filter(([key]) => key !== "id"),
          ),
        },
        UpdateSectorShareBody: {
          type: "object",
          properties: {
            transport: nullableNumberSchema,
            manufacturing: nullableNumberSchema,
            electricity: nullableNumberSchema,
            buildings: nullableNumberSchema,
            other: nullableNumberSchema,
          },
        },
        TrendResponse: {
          type: "object",
          required: ["country", "gas", "unit", "points"],
          properties: {
            country: countrySummarySchema,
            gas: gasSchema,
            unit: { type: "string", const: "kt_co2e" },
            points: {
              type: "array",
              items: {
                type: "object",
                required: ["year", "value"],
                properties: {
                  year: yearSchema,
                  value: nullableNumberSchema,
                },
              },
            },
          },
        },
        MapResponse: {
          type: "object",
          required: ["year", "gas", "unit", "countries"],
          properties: {
            year: yearSchema,
            gas: gasSchema,
            unit: { type: "string", const: "kt_co2e" },
            countries: {
              type: "array",
              items: {
                type: "object",
                required: ["countryCode", "countryName", "value"],
                properties: {
                  countryCode: countryCodeSchema,
                  countryName: { type: "string" },
                  value: nullableNumberSchema,
                },
              },
            },
          },
        },
        SectorBreakdownResponse: {
          type: "object",
          required: ["country", "year", "unit", "sectors"],
          properties: {
            country: countrySummarySchema,
            year: yearSchema,
            unit: { type: "string", const: "percent" },
            sectors: {
              type: "object",
              required: ["transport", "manufacturing", "electricity", "buildings", "other"],
              properties: {
                transport: nullableNumberSchema,
                manufacturing: nullableNumberSchema,
                electricity: nullableNumberSchema,
                buildings: nullableNumberSchema,
                other: nullableNumberSchema,
              },
            },
          },
        },
        FilteredEmissionResponse: {
          type: "object",
          required: ["country", "year", "gas", "unit", "value"],
          properties: {
            country: countrySummarySchema,
            year: yearSchema,
            gas: gasSchema,
            unit: { type: "string", const: "kt_co2e" },
            value: nullableNumberSchema,
          },
        },
      },
    },
  };
}
