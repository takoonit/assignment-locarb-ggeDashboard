import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import { getCountries } from "@/lib/services/emissions";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/emissions", () => ({
  getCountries: vi.fn(),
}));

describe("GET /api/countries", () => {
  it("returns countries list", async () => {
    const mockCountries = [{ code: "THA", name: "Thailand", isRegion: false }];
    vi.mocked(getCountries).mockResolvedValue(mockCountries);

    const req = new NextRequest("http://localhost/api/countries");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockCountries);
    expect(getCountries).toHaveBeenCalledWith(false);
  });

  it("handles includeRegions=true", async () => {
    vi.mocked(getCountries).mockResolvedValue([]);

    const req = new NextRequest("http://localhost/api/countries?includeRegions=true");
    await GET(req);

    expect(getCountries).toHaveBeenCalledWith(true);
  });

  it("returns 400 for invalid includeRegions", async () => {
    const req = new NextRequest("http://localhost/api/countries?includeRegions=invalid");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe("INVALID_PARAMS");
  });
});
