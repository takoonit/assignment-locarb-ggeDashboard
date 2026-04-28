import { describe, expect, it } from "vitest";
import { generateOpenApiDocument } from "./openapi";

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

    expect(Object.keys(document.paths)).toEqual(
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
    expect(document.paths["/api/countries"].get).toBeDefined();
    expect(document.paths["/api/countries"].post).toBeDefined();
    expect(document.paths["/api/emissions/{id}"].patch).toBeDefined();
    expect(document.paths["/api/sector-shares/{id}"].delete).toBeDefined();
  });

  it("keeps null-preserving response schemas explicit", () => {
    const document = generateOpenApiDocument();
    const schemas = document.components.schemas;

    expect(schemas.TrendResponse.properties.points.items.properties.value).toEqual({
      type: ["number", "null"],
    });
    expect(
      schemas.SectorBreakdownResponse.properties.sectors.properties.electricity,
    ).toEqual({ type: ["number", "null"] });
    expect(schemas.FilteredEmissionResponse.properties.value).toEqual({
      type: ["number", "null"],
    });
  });
});
