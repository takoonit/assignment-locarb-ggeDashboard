import { describe, expect, it } from "vitest";
import { normalizeTrendPoints } from "./dashboard-types";

describe("normalizeTrendPoints", () => {
  it("fills missing years with null values so sparse API results render visible chart gaps", () => {
    expect(
      normalizeTrendPoints([
        { year: 2019, value: 12 },
        { year: 2021, value: 18 },
      ]),
    ).toEqual([
      { year: 2019, value: 12 },
      { year: 2020, value: null },
      { year: 2021, value: 18 },
    ]);
  });

  it("preserves explicit null values that already exist in the series", () => {
    expect(
      normalizeTrendPoints([
        { year: 2019, value: 12 },
        { year: 2020, value: null },
        { year: 2021, value: 18 },
      ]),
    ).toEqual([
      { year: 2019, value: 12 },
      { year: 2020, value: null },
      { year: 2021, value: 18 },
    ]);
  });
});
