import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: requireAdminMock,
}));

describe("admin layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminMock.mockResolvedValue(undefined);
  });

  it("requires an admin session before rendering admin content", async () => {
    const { default: AdminLayout } = await import("./layout");

    const layout = await AdminLayout({
      children: <div>Protected admin content</div>,
    });

    render(layout);

    expect(requireAdminMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Protected admin content")).toBeInTheDocument();
  });
});
