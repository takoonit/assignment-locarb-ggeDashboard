import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import { getEmissionsMap } from "@/lib/services/emissions";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/emissions", () => ({
  getEmissionsMap: vi.fn(),
}));

describe("GET /api/emissions/map", () => {
  it("returns map data", async () => {
    const mockMap = {
      year: 2020,
      gas: "TOTAL",
      unit: "kt_co2e",
      countries: [{ countryCode: "THA", countryName: "Thailand", value: 100 }],
    };
    vi.mocked(getEmissionsMap).mockResolvedValue(mockMap);

    const req = new NextRequest("http://localhost/api/emissions/map?year=2020");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockMap);
    expect(getEmissionsMap).toHaveBeenCalledWith(2020, "TOTAL", false);
  });

  it("returns 400 for missing year", async () => {
    const req = new NextRequest("http://localhost/api/emissions/map");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe("INVALID_PARAMS");
  });
});
