import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import { listCountries } from "@/lib/services/emissions";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/emissions", () => ({
  listCountries: vi.fn(),
}));

describe("GET /api/countries", () => {
  it("returns countries list", async () => {
    const mockCountries = [{ code: "THA", name: "Thailand", isRegion: false }];
    vi.mocked(listCountries).mockResolvedValue(mockCountries);

    const req = new NextRequest("http://localhost/api/countries");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockCountries);
    expect(listCountries).toHaveBeenCalledWith({ includeRegions: false });
  });

  it("handles includeRegions=true", async () => {
    vi.mocked(listCountries).mockResolvedValue([]);

    const req = new NextRequest("http://localhost/api/countries?includeRegions=true");
    await GET(req);

    expect(listCountries).toHaveBeenCalledWith({ includeRegions: true });
  });

  it("returns 400 for invalid includeRegions", async () => {
    const req = new NextRequest("http://localhost/api/countries?includeRegions=invalid");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe("INVALID_PARAMS");
  });
});
