import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import { getSectorBreakdown } from "@/lib/services/emissions";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/emissions", () => ({
  getSectorBreakdown: vi.fn(),
}));

describe("GET /api/emissions/sector", () => {
  it("returns sector data", async () => {
    const mockSector = {
      country: { code: "THA", name: "Thailand" },
      year: 2020,
      unit: "percent" as const,
      sectors: { transport: 20, manufacturing: null, electricity: null, buildings: null, other: null },
    };
    vi.mocked(getSectorBreakdown).mockResolvedValue(mockSector);

    const req = new NextRequest("http://localhost/api/emissions/sector?country=THA&year=2020");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockSector);
    expect(getSectorBreakdown).toHaveBeenCalledWith({ country: "THA", year: 2020 });
  });
});
