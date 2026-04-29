import { describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock next-auth/middleware
vi.mock("next-auth/middleware", () => ({
  withAuth: (middlewareOrOptions: any, maybeOptions: any) => {
    let options = maybeOptions;
    let middleware = typeof middlewareOrOptions === "function" ? middlewareOrOptions : undefined;

    if (!middleware) {
      options = middlewareOrOptions;
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
    } as any;

    const res = middleware(req);

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
    } as any;

    const res = middleware(req);

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
    } as any;

    const res = middleware(req);

    expect(res.headers.get("location")).toContain("/api/auth/signin");
  });
});
