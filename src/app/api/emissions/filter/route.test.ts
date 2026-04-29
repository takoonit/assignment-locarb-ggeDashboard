import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import { getFilteredEmission } from "@/lib/services/emissions";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/emissions", () => ({
  getFilteredEmission: vi.fn(),
}));

describe("GET /api/emissions/filter", () => {
  it("returns filter data", async () => {
    const mockFilter = {
      country: { code: "THA", name: "Thailand" },
      year: 2020,
      gas: "CO2",
      unit: "kt_co2e" as const,
      value: 100,
    };
    vi.mocked(getFilteredEmission).mockResolvedValue(mockFilter);

    const req = new NextRequest("http://localhost/api/emissions/filter?country=THA&gas=CO2&year=2020");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockFilter);
    expect(getFilteredEmission).toHaveBeenCalledWith({ country: "THA", gas: "CO2", year: 2020 });
  });
});
