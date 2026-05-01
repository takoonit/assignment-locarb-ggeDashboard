/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

// Mock next-auth/middleware
vi.mock("next-auth/middleware", () => ({
  withAuth: (middlewareOrOptions: unknown, maybeOptions?: unknown) => {
    let options = maybeOptions as any;
    const middleware = typeof middlewareOrOptions === "function" ? middlewareOrOptions as any : undefined;

    if (!middleware) {
      options = middlewareOrOptions as any;
    }

    const wrapped = (req: any) => {
      // Simulate withAuth behavior: call authorized callback
      if (!options?.callbacks?.authorized({ token: req.nextauth.token })) {
        return NextResponse.redirect(new URL("/api/auth/signin", req.url));
      }
      return middleware ? middleware(req) : undefined;
    };
    return wrapped;
  },
}));

describe("middleware", () => {
  it("redirects to signin if authenticated but not admin", async () => {
    const { default: middleware } = await import("./middleware");

    const req = {
      url: "http://localhost/admin",
      nextauth: {
        token: { role: "VIEWER" }
      },
      nextUrl: new URL("http://localhost/admin")
    };

    const res = await (middleware as any)(req, {} as any);

    expect(res.headers.get("location")).toContain("/api/auth/signin");
  });

  it("does not redirect if authenticated as admin", async () => {
    const { default: middleware } = await import("./middleware");

    const req = {
      url: "http://localhost/admin",
      nextauth: {
        token: { role: "ADMIN" }
      },
      nextUrl: new URL("http://localhost/admin")
    };

    const res = await (middleware as any)(req, {} as any);

    expect(res).toBeUndefined();
  });

  it("redirects to signin if not authenticated", async () => {
    const { default: middleware } = await import("./middleware");

    const req = {
      url: "http://localhost/admin",
      nextauth: {
        token: null
      },
      nextUrl: new URL("http://localhost/admin")
    };

    const res = await (middleware as any)(req, {} as any);

    expect(res.headers.get("location")).toContain("/api/auth/signin");
  });
});
