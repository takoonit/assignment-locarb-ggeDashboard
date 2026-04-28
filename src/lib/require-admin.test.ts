import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/auth", () => ({
  authOptions: {},
}));

describe("requireAdmin", () => {
  it("returns 401 when unauthenticated", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const { requireAdmin } = await import("./require-admin");
    const result = await requireAdmin();

    expect(result!.status).toBe(401);
    await expect(result!.json()).resolves.toEqual({
      error: {
        code: "UNAUTHENTICATED",
        details: {},
      },
    });
  });

  it("returns 403 when authenticated but role is VIEWER", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: "viewer@example.com", role: "VIEWER" },
      expires: "",
    });

    const { requireAdmin } = await import("./require-admin");
    const result = await requireAdmin();

    expect(result!.status).toBe(403);
    await expect(result!.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        details: {},
      },
    });
  });

  it("returns null when user is ADMIN", async () => {
    const { getServerSession } = await import("next-auth/next");
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: "admin@example.com", role: "ADMIN" },
      expires: "",
    });

    const { requireAdmin } = await import("./require-admin");
    const result = await requireAdmin();

    expect(result).toBeNull();
  });
});
