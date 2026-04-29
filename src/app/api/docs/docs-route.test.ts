import { describe, expect, it } from "vitest";

describe("GET /api/docs", () => {
  it("renders the Scalar API reference for the OpenAPI route", async () => {
    const { GET } = await import("./route");
    const response = GET();
    const html = await response.text();

    expect(response.headers.get("content-type")).toContain("text/html");
    expect(html).toContain("/api/openapi");
    expect(html).toContain("Scalar");
    expect(html).toContain('"hiddenClients": true');
  });
});
