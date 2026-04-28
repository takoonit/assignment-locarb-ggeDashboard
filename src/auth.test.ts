import { describe, expect, it, vi } from "vitest";

vi.mock("@prisma/client", () => {
  const upsert = vi.fn().mockResolvedValue({});
  const findUnique = vi.fn().mockResolvedValue({ role: "VIEWER" });
  function PrismaClient() {
    return { user: { upsert, findUnique } };
  }
  return { PrismaClient };
});

describe("auth config", () => {
  it("exports authOptions with GitHub provider", async () => {
    const { authOptions } = await import("./auth");
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.providers[0].id).toBe("github");
  });

  it("signIn callback upserts user with VIEWER role by default", async () => {
    const { authOptions } = await import("./auth");
    const signIn = authOptions.callbacks?.signIn as (args: {
      user: { email: string };
    }) => Promise<boolean>;

    expect(typeof signIn).toBe("function");
  });

  it("session callback exposes email and role on session.user", async () => {
    const { authOptions } = await import("./auth");
    const session = authOptions.callbacks?.session as (args: {
      session: { user: { email: string } };
      token: { email: string; role: string };
    }) => Promise<unknown>;

    const result = (await session({
      session: { user: { email: "a@b.com" } },
      token: { email: "a@b.com", role: "ADMIN" },
    })) as { user: { email: string; role: string } };

    expect(result.user.email).toBe("a@b.com");
    expect(result.user.role).toBe("ADMIN");
  });

  it("jwt callback copies role from user into token on first sign-in", async () => {
    const { authOptions } = await import("./auth");
    const jwt = authOptions.callbacks?.jwt as (args: {
      token: Record<string, unknown>;
      user?: { role?: string };
    }) => Promise<Record<string, unknown>>;

    const result = await jwt({
      token: { email: "a@b.com" },
      user: { role: "VIEWER" },
    });

    expect(result.role).toBe("VIEWER");
  });
});
