import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import { getEmissionsTrend } from "@/lib/services/emissions";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/emissions", () => ({
  getEmissionsTrend: vi.fn(),
}));

describe("GET /api/emissions/trend", () => {
  it("returns trend data", async () => {
    const mockTrend = {
      country: { code: "THA", name: "Thailand" },
      gas: "TOTAL",
      unit: "kt_co2e" as const,
      points: [{ year: 2020, value: 100 }],
    };
    vi.mocked(getEmissionsTrend).mockResolvedValue(mockTrend);

    const req = new NextRequest("http://localhost/api/emissions/trend?country=THA");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockTrend);
    expect(getEmissionsTrend).toHaveBeenCalledWith({
      country: "THA",
      gas: "TOTAL",
      fromYear: undefined,
      toYear: undefined,
    });
  });

  it("validates year range", async () => {
    const req = new NextRequest("http://localhost/api/emissions/trend?country=THA&fromYear=2020&toYear=2010");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe("INVALID_PARAMS");
  });

  it("returns 404 if country not found", async () => {
    vi.mocked(getEmissionsTrend).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/emissions/trend?country=XXX");
    const res = await GET(req);

    expect(res.status).toBe(404);
  });
});
