import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import { getEmissionsSector } from "@/lib/services/emissions";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/emissions", () => ({
  getEmissionsSector: vi.fn(),
}));

describe("GET /api/emissions/sector", () => {
  it("returns sector data", async () => {
    const mockSector = {
      country: { code: "THA", name: "Thailand" },
      year: 2020,
      unit: "percent",
      sectors: { transport: 20 },
    };
    vi.mocked(getEmissionsSector).mockResolvedValue(mockSector as any);

    const req = new NextRequest("http://localhost/api/emissions/sector?country=THA&year=2020");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockSector);
    expect(getEmissionsSector).toHaveBeenCalledWith("THA", 2020);
  });
});
