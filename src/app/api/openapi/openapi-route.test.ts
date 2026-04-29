import { describe, expect, it } from "vitest";

describe("GET /api/openapi", () => {
  it("returns the generated OpenAPI JSON document", async () => {
    const { GET } = await import("./route");
    const response = GET();

    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toMatchObject({
      openapi: "3.1.0",
      paths: {
        "/api/countries": expect.any(Object),
        "/api/sector-shares/{id}": expect.any(Object),
      },
    });
  });
});
