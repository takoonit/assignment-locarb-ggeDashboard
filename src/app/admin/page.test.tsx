import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/error";

const requireAdminMock = vi.hoisted(() => vi.fn());
const serviceMock = vi.hoisted(() => ({
  listAdminAnnualEmissionsPaged: vi.fn(),
  listAdminCountriesPaged: vi.fn(),
  listAdminSectorSharesPaged: vi.fn(),
}));

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("@/lib/services/emissions", () => serviceMock);

vi.mock("@/components/admin/admin-page-client", () => ({
  AdminPageClient: () => <div>Admin client</div>,
}));

describe("admin page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires an admin session before loading editable rows", async () => {
    requireAdminMock.mockRejectedValueOnce(
      new ApiError("UNAUTHENTICATED", {}, 401),
    );

    const { default: AdminPage } = await import("./page");

    await expect(AdminPage()).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    expect(serviceMock.listAdminCountriesPaged).not.toHaveBeenCalled();
    expect(serviceMock.listAdminAnnualEmissionsPaged).not.toHaveBeenCalled();
    expect(serviceMock.listAdminSectorSharesPaged).not.toHaveBeenCalled();
  });

  it("preloads the visible admin tab before rendering the client", async () => {
    requireAdminMock.mockResolvedValueOnce({ user: { role: "ADMIN" } });
    serviceMock.listAdminAnnualEmissionsPaged.mockResolvedValueOnce({
      data: [],
      page: 2,
      pageSize: 20,
      total: 0,
    });

    const { default: AdminPage } = await import("./page");

    await AdminPage({
      searchParams: Promise.resolve({ page: "2", tab: "emissions" }),
    });

    expect(serviceMock.listAdminAnnualEmissionsPaged).toHaveBeenCalledWith({
      page: 2,
      pageSize: 20,
    });
    expect(serviceMock.listAdminCountriesPaged).not.toHaveBeenCalled();
    expect(serviceMock.listAdminSectorSharesPaged).not.toHaveBeenCalled();
  });
});
