import { describe, expect, it } from "vitest";
import { generateOpenApiDocument } from "./openapi";

type TestSchema = Record<string, unknown> & {
  enum?: string[];
  items?: TestSchema;
  properties?: Record<string, TestSchema>;
  required?: string[];
};

type SchemaMap = Record<string, TestSchema>;
type TestParameter = {
  name: string;
  schema?: TestSchema;
};

function schemas(): SchemaMap {
  return generateOpenApiDocument().components?.schemas as SchemaMap;
}

function properties(schema: TestSchema): Record<string, TestSchema> {
  return schema.properties ?? {};
}

function parameters(path: string, method: "get"): TestParameter[] {
  const operation = generateOpenApiDocument().paths?.[path]?.[method] as
    | { parameters?: TestParameter[] }
    | undefined;

  return operation?.parameters ?? [];
}

function parameter(path: string, name: string): TestParameter {
  const found = parameters(path, "get").find((item) => item.name === name);
  expect(found).toBeDefined();
  return found!;
}

describe("generateOpenApiDocument", () => {
  it("generates the Lo-Carb OpenAPI document without optional docs dependencies", () => {
    const document = generateOpenApiDocument();

    expect(document.openapi).toBe("3.1.0");
    expect(document.info.title).toBe("Lo-Carb GGE Dashboard API");
    expect(document.paths?.["/api/openapi"]?.get?.summary).toBe(
      "Get OpenAPI document",
    );
    expect(document.paths?.["/api/docs"]?.get?.summary).toBe(
      "View interactive API docs",
    );
    expect(document.paths?.["/api/emissions/trend"]?.get?.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          in: "query",
          name: "country",
          required: true,
        }),
      ]),
    );
    expect(document.components?.schemas?.Country).toBeDefined();
    expect(document.components?.schemas?.ErrorResponse).toBeDefined();
  });

  it("documents every Epic 2 API contract path", () => {
    const document = generateOpenApiDocument();

    expect(Object.keys(document.paths ?? {})).toEqual(
      expect.arrayContaining([
        "/api/countries",
        "/api/countries/{id}",
        "/api/emissions",
        "/api/emissions/{id}",
        "/api/emissions/trend",
        "/api/emissions/map",
        "/api/emissions/sector",
        "/api/emissions/filter",
        "/api/sector-shares",
        "/api/sector-shares/{id}",
        "/api/openapi",
        "/api/docs",
      ]),
    );
    expect(document.paths?.["/api/countries"]?.get).toBeDefined();
    expect(document.paths?.["/api/countries"]?.post).toBeDefined();
    expect(document.paths?.["/api/emissions/{id}"]?.patch).toBeDefined();
    expect(document.paths?.["/api/sector-shares/{id}"]?.delete).toBeDefined();
  });

  it("keeps null-preserving response schemas explicit", () => {
    const documentSchemas = schemas();

    expect(
      properties(properties(documentSchemas.TrendResponse).points.items ?? {})
        .value,
    ).toEqual({ type: ["number", "null"] });
    expect(
      properties(properties(documentSchemas.SectorBreakdownResponse).sectors)
        .electricity,
    ).toEqual({ type: ["number", "null"] });
    expect(properties(documentSchemas.FilteredEmissionResponse).value).toEqual({
      type: ["number", "null"],
    });
  });

  it("matches B7 partial update route behavior for emissions bodies", () => {
    const schema = schemas().UpdateEmissionBody;

    expect(schema.required ?? []).not.toContain("year");
    expect(properties(schema).co2).toEqual({ type: ["number", "null"] });
  });

  it("documents gas enum, year bounds, envelopes, and errors from shared schemas", () => {
    const documentSchemas = schemas();

    expect(documentSchemas.Gas.enum).toEqual([
      "TOTAL",
      "CO2",
      "CH4",
      "N2O",
      "HFC",
      "PFC",
      "SF6",
    ]);
    expect(documentSchemas.Year).toMatchObject({ minimum: 1990, maximum: 2030 });
    expect(properties(documentSchemas.SuccessResponse).data).toBeDefined();
    expect(
      properties(properties(documentSchemas.ErrorResponse).error).code.enum,
    ).toEqual([
      "INVALID_PARAMS",
      "UNAUTHENTICATED",
      "FORBIDDEN",
      "NOT_FOUND",
      "CONFLICT",
      "INTERNAL_ERROR",
    ]);
  });

  it("documents route query defaults used by the API", () => {
    expect(parameter("/api/countries", "includeRegions").schema).toMatchObject({
      default: false,
    });
    expect(parameter("/api/emissions/map", "gas").schema).toMatchObject({
      default: "TOTAL",
    });
    expect(parameter("/api/emissions/map", "includeRegions").schema).toMatchObject({
      default: false,
    });
    expect(parameter("/api/emissions/trend", "gas").schema).toMatchObject({
      default: "TOTAL",
    });
    expect(parameter("/api/emissions/trend", "fromYear").schema).toMatchObject({
      default: 1990,
    });
    expect(parameter("/api/emissions/trend", "toYear").schema).toMatchObject({
      default: 2030,
    });
  });

  it("documents example values for required query params", () => {
    expect(parameter("/api/emissions/map", "year").schema).toMatchObject({
      example: 2020,
    });
    expect(parameter("/api/emissions/trend", "country").schema).toMatchObject({
      example: "THA",
    });
    expect(parameter("/api/emissions/sector", "country").schema).toMatchObject({
      example: "THA",
    });
    expect(parameter("/api/emissions/sector", "year").schema).toMatchObject({
      example: 2020,
    });
    expect(parameter("/api/emissions/filter", "country").schema).toMatchObject({
      example: "THA",
    });
    expect(parameter("/api/emissions/filter", "year").schema).toMatchObject({
      example: 2020,
    });
  });
});
