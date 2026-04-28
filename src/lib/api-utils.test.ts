import { describe, it, expect, vi } from "vitest";
import { withApiErrorHandling, ApiError } from "./api-utils";
import { NextRequest, NextResponse } from "next/server";

describe("withApiErrorHandling", () => {
  it("returns handler response on success", async () => {
    const handler = vi.fn().mockResolvedValue(NextResponse.json({ data: "ok" }));
    const wrapped = withApiErrorHandling(handler);
    
    const req = new NextRequest("http://localhost");
    const res = await wrapped(req, {});
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toBe("ok");
  });

  it("handles ApiError", async () => {
    const handler = vi.fn().mockImplementation(() => {
      throw new ApiError("NOT_FOUND", { id: "123" }, 404);
    });
    const wrapped = withApiErrorHandling(handler);

    const req = new NextRequest("http://localhost");
    const res = await wrapped(req, {});
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error.code).toBe("NOT_FOUND");
    expect(data.error.details.id).toBe("123");
  });

  it("handles unhandled errors as INTERNAL_ERROR", async () => {
    const handler = vi.fn().mockImplementation(() => {
      throw new Error("Unexpected crash");
    });
    const wrapped = withApiErrorHandling(handler);

    const req = new NextRequest("http://localhost");
    // Silence console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    const res = await wrapped(req, {});
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error.code).toBe("INTERNAL_ERROR");
    
    consoleSpy.mockRestore();
  });
});
