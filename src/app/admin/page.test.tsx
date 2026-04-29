import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/error";

const requireAdminMock = vi.hoisted(() => vi.fn());
const serviceMock = vi.hoisted(() => ({
  listAdminAnnualEmissions: vi.fn(),
  listAdminCountries: vi.fn(),
  listAdminSectorShares: vi.fn(),
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
    expect(serviceMock.listAdminCountries).not.toHaveBeenCalled();
    expect(serviceMock.listAdminAnnualEmissions).not.toHaveBeenCalled();
    expect(serviceMock.listAdminSectorShares).not.toHaveBeenCalled();
  });
});
