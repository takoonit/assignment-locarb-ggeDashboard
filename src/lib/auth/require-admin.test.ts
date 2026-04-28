import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/error";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth/config", () => ({
  authOptions: {},
  auth: vi.fn(),
}));

describe("requireAdmin", () => {
  it("throws UNAUTHENTICATED when there is no session", async () => {
    const { auth } = await import("@/lib/auth/config");
    vi.mocked(auth).mockResolvedValueOnce(null);

    const { requireAdmin } = await import("./require-admin");

    await expect(requireAdmin()).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
      status: 401,
    });
  });

  it("throws FORBIDDEN when authenticated but role is VIEWER", async () => {
    const { auth } = await import("@/lib/auth/config");
    vi.mocked(auth).mockResolvedValueOnce({
      user: { email: "viewer@example.com", role: "VIEWER" },
      expires: "",
    });

    const { requireAdmin } = await import("./require-admin");

    await expect(requireAdmin()).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  it("returns session when user is ADMIN", async () => {
    const { auth } = await import("@/lib/auth/config");
    const session = {
      user: { email: "admin@example.com", role: "ADMIN" },
      expires: "",
    };
    vi.mocked(auth).mockResolvedValueOnce(session);

    const { requireAdmin } = await import("./require-admin");
    const result = await requireAdmin();

    expect(result).toEqual(session);
  });

  it("thrown errors are instances of ApiError", async () => {
    const { auth } = await import("@/lib/auth/config");
    vi.mocked(auth).mockResolvedValueOnce(null);

    const { requireAdmin } = await import("./require-admin");

    await expect(requireAdmin()).rejects.toBeInstanceOf(ApiError);
  });
});
