import { describe, expect, it } from "vitest";
import { theme } from "./theme";

describe("MUI theme foundation", () => {
  it("defines the Lo-Carb visual direction", () => {
    expect(theme.palette.mode).toBe("light");
    expect(theme.palette.primary.main).toBe("#116149");
    expect(theme.palette.secondary.main).toBe("#2F6F8F");
    expect(theme.palette.background.default).toBe("#F6F8F5");
    expect(theme.shape.borderRadius).toBe(8);
    expect(theme.typography.fontFamily).toContain("var(--font-geist-sans)");
  });
});
