import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/error";

const authMock = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
}));

const serviceMock = vi.hoisted(() => ({
  createCountry: vi.fn(),
  updateCountry: vi.fn(),
  deleteCountry: vi.fn(),
  createAnnualEmission: vi.fn(),
  updateAnnualEmission: vi.fn(),
  deleteAnnualEmission: vi.fn(),
  createSectorShare: vi.fn(),
  updateSectorShare: vi.fn(),
  deleteSectorShare: vi.fn(),
}));

vi.mock("@/lib/auth/require-admin", () => authMock);
vi.mock("@/lib/services/emissions", () => serviceMock);

const jsonRequest = (path: string, body: unknown) =>
  new NextRequest(`http://localhost${path}`, {
    method: "POST",
    body: JSON.stringify(body),
  });

const emptyRequest = (path: string) =>
  new NextRequest(`http://localhost${path}`, { method: "DELETE" });

const routeContext = (id: string) => ({ params: Promise.resolve({ id }) });

async function expectError(
  response: Response,
  status: number,
  code: string,
  details?: Record<string, unknown>,
) {
  expect(response.status).toBe(status);
  const body = await response.json();
  expect(body).toMatchObject({ error: { code } });
  if (details) {
    expect(body.error.details).toMatchObject(details);
  }
}

describe("B7 write API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.requireAdmin.mockResolvedValue(undefined);
  });

  it("rejects unauthenticated writes before calling services", async () => {
    authMock.requireAdmin.mockRejectedValueOnce(
      new ApiError("UNAUTHENTICATED", {}, 401),
    );

    const { POST } = await import("./countries/route");
    const response = await POST(
      jsonRequest("/api/countries", {
        code: "THA",
        name: "Thailand",
        isRegion: false,
      }),
    );

    await expectError(response, 401, "UNAUTHENTICATED");
    expect(serviceMock.createCountry).not.toHaveBeenCalled();
  });

  it("rejects forbidden writes before calling services", async () => {
    authMock.requireAdmin.mockRejectedValueOnce(new ApiError("FORBIDDEN", {}, 403));

    const { POST } = await import("./emissions/route");
    const response = await POST(
      jsonRequest("/api/emissions", {
        countryCode: "THA",
        year: 2020,
        total: null,
        co2: null,
        ch4: null,
        n2o: null,
        hfc: null,
        pfc: null,
        sf6: null,
      }),
    );

    await expectError(response, 403, "FORBIDDEN");
    expect(serviceMock.createAnnualEmission).not.toHaveBeenCalled();
  });

  it("creates, updates, and deletes countries through the service layer", async () => {
    serviceMock.createCountry.mockResolvedValueOnce({
      id: "country-1",
      code: "THA",
      name: "Thailand",
      isRegion: false,
    });
    serviceMock.updateCountry.mockResolvedValueOnce({
      id: "country-1",
      code: "THA",
      name: "Thailand",
      isRegion: true,
    });
    serviceMock.deleteCountry.mockResolvedValueOnce({
      deleted: true,
      id: "country-1",
    });

    const collectionRoute = await import("./countries/route");
    const idRoute = await import("./countries/[id]/route");

    const createResponse = await collectionRoute.POST(
      jsonRequest("/api/countries", {
        code: "THA",
        name: "Thailand",
        isRegion: false,
      }),
    );
    const updateResponse = await idRoute.PATCH(
      jsonRequest("/api/countries/country-1", { isRegion: true }),
      routeContext("country-1"),
    );
    const deleteResponse = await idRoute.DELETE(
      emptyRequest("/api/countries/country-1"),
      routeContext("country-1"),
    );

    expect(createResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(200);
    expect(serviceMock.createCountry).toHaveBeenCalledWith({
      code: "THA",
      name: "Thailand",
      isRegion: false,
    });
    expect(serviceMock.updateCountry).toHaveBeenCalledWith("country-1", {
      isRegion: true,
    });
    expect(serviceMock.deleteCountry).toHaveBeenCalledWith("country-1");
  });

  it("rejects invalid country bodies with concise validation details", async () => {
    const { POST } = await import("./countries/route");
    const response = await POST(
      jsonRequest("/api/countries", { code: "Thailand", name: "" }),
    );

    await expectError(response, 400, "INVALID_PARAMS", {
      message: "Invalid request body.",
    });
    expect(serviceMock.createCountry).not.toHaveBeenCalled();
  });

  it("maps write service not-found and conflict errors to shared error envelopes", async () => {
    serviceMock.updateCountry.mockRejectedValueOnce(
      new ApiError("NOT_FOUND", { message: "Country not found." }, 404),
    );
    serviceMock.createCountry.mockRejectedValueOnce(
      new ApiError("CONFLICT", { message: "Country code already exists." }, 409),
    );

    const collectionRoute = await import("./countries/route");
    const idRoute = await import("./countries/[id]/route");

    await expectError(
      await idRoute.PATCH(
        jsonRequest("/api/countries/missing", { name: "Missing" }),
        routeContext("missing"),
      ),
      404,
      "NOT_FOUND",
      { message: "Country not found." },
    );
    await expectError(
      await collectionRoute.POST(
        jsonRequest("/api/countries", {
          code: "THA",
          name: "Thailand",
          isRegion: false,
        }),
      ),
      409,
      "CONFLICT",
      { message: "Country code already exists." },
    );
  });

  it("creates, updates, and deletes annual emissions while preserving nulls", async () => {
    const emission = {
      id: "emission-1",
      countryCode: "THA",
      year: 2020,
      total: 403000,
      co2: null,
      ch4: null,
      n2o: null,
      hfc: null,
      pfc: null,
      sf6: null,
    };
    serviceMock.createAnnualEmission.mockResolvedValueOnce(emission);
    serviceMock.updateAnnualEmission.mockResolvedValueOnce({
      ...emission,
      year: 2021,
    });
    serviceMock.deleteAnnualEmission.mockResolvedValueOnce({
      deleted: true,
      id: "emission-1",
    });

    const collectionRoute = await import("./emissions/route");
    const idRoute = await import("./emissions/[id]/route");

    expect(
      await collectionRoute.POST(jsonRequest("/api/emissions", emission)),
    ).toMatchObject({ status: 200 });
    expect(
      await idRoute.PATCH(
        jsonRequest("/api/emissions/emission-1", { year: 2021, co2: null }),
        routeContext("emission-1"),
      ),
    ).toMatchObject({ status: 200 });
    expect(
      await idRoute.DELETE(
        emptyRequest("/api/emissions/emission-1"),
        routeContext("emission-1"),
      ),
    ).toMatchObject({ status: 200 });

    expect(serviceMock.createAnnualEmission).toHaveBeenCalledWith({
      countryCode: "THA",
      year: 2020,
      total: 403000,
      co2: null,
      ch4: null,
      n2o: null,
      hfc: null,
      pfc: null,
      sf6: null,
    });
    expect(serviceMock.updateAnnualEmission).toHaveBeenCalledWith("emission-1", {
      year: 2021,
      co2: null,
    });
  });

  it("creates, updates, and deletes sector shares while preserving nulls", async () => {
    const sectorShare = {
      id: "sector-1",
      countryCode: "THA",
      year: 2020,
      transport: 25.4,
      manufacturing: null,
      electricity: null,
      buildings: null,
      other: 3.4,
    };
    serviceMock.createSectorShare.mockResolvedValueOnce(sectorShare);
    serviceMock.updateSectorShare.mockResolvedValueOnce({
      ...sectorShare,
      electricity: 12.1,
    });
    serviceMock.deleteSectorShare.mockResolvedValueOnce({
      deleted: true,
      id: "sector-1",
    });

    const collectionRoute = await import("./sector-shares/route");
    const idRoute = await import("./sector-shares/[id]/route");

    expect(
      await collectionRoute.POST(jsonRequest("/api/sector-shares", sectorShare)),
    ).toMatchObject({ status: 200 });
    expect(
      await idRoute.PATCH(
        jsonRequest("/api/sector-shares/sector-1", { electricity: 12.1 }),
        routeContext("sector-1"),
      ),
    ).toMatchObject({ status: 200 });
    expect(
      await idRoute.DELETE(
        emptyRequest("/api/sector-shares/sector-1"),
        routeContext("sector-1"),
      ),
    ).toMatchObject({ status: 200 });

    expect(serviceMock.createSectorShare).toHaveBeenCalledWith({
      countryCode: "THA",
      year: 2020,
      transport: 25.4,
      manufacturing: null,
      electricity: null,
      buildings: null,
      other: 3.4,
    });
    expect(serviceMock.updateSectorShare).toHaveBeenCalledWith("sector-1", {
      electricity: 12.1,
    });
  });
});
