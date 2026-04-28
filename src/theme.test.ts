import { describe, expect, it } from "vitest";
import { cohereTokens, theme } from "./theme";

describe("MUI theme foundation", () => {
  it("defines the Cohere-token dashboard direction", () => {
    expect(theme.palette.mode).toBe("light");
    expect(theme.palette.primary.main).toBe(cohereTokens.colors.primary);
    expect(theme.palette.secondary.main).toBe(cohereTokens.colors.actionBlue);
    expect(theme.palette.background.default).toBe(cohereTokens.colors.canvas);
    expect(theme.shape.borderRadius).toBe(8);
    expect(theme.typography.fontFamily).toContain("Unica77 Cohere Web");
    expect(theme.typography.h1?.fontFamily).toContain("CohereText");
  });
});
