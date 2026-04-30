import { render, screen } from "@testing-library/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { MapData } from "@/lib/dashboard-types";
import { theme } from "@/theme";
import { WorldMap } from "./world-map";

vi.mock("react-simple-maps", () => ({
  ComposableMap: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  Geographies: ({
    children,
  }: {
    children: (arg: {
      geographies: Array<{ rsmKey: string; id: string; properties: { name: string } }>;
    }) => ReactNode;
  }) =>
    children({
      geographies: [
        { rsmKey: "geo-tha", id: "764", properties: { name: "Thailand" } },
        { rsmKey: "geo-usa", id: "840", properties: { name: "United States" } },
        { rsmKey: "geo-bra", id: "076", properties: { name: "Brazil" } },
        { rsmKey: "geo-can", id: "124", properties: { name: "Canada" } },
        { rsmKey: "geo-unknown", id: "999", properties: { name: "Unknownland" } },
      ],
    }),
  Geography: ({
    "aria-label": ariaLabel,
    geography,
    style,
  }: {
    "aria-label": string;
    geography: { rsmKey: string };
    style: { default: { fill: string } };
  }) => <path aria-label={ariaLabel} data-testid={geography.rsmKey} fill={style.default.fill} />,
}));

function renderWorldMap(data: MapData) {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WorldMap data={data} onSelectCountry={() => {}} selectedCountry="THA" />
    </ThemeProvider>,
  );
}

describe("WorldMap", () => {
  it("uses the same high-contrast palette for every gas", () => {
    renderWorldMap({
      year: 2020,
      gas: "HFC",
      unit: "kt_co2e",
      countries: [
        { countryCode: "THA", countryName: "Thailand", value: 10 },
        { countryCode: "USA", countryName: "United States", value: 20 },
        { countryCode: "BRA", countryName: "Brazil", value: 25 },
        { countryCode: "CAN", countryName: "Canada", value: 45 },
      ],
    });

    const lowCountry = screen.getByLabelText(/thailand: 10/i);
    const secondLevelCountry = screen.getByLabelText(/united states: 20/i);
    const thirdLevelCountry = screen.getByLabelText(/brazil: 25/i);
    const highCountry = screen.getByLabelText(/canada: 45/i);
    const scale = screen.getByText("Low").nextElementSibling as HTMLElement;
    const swatches = Array.from(scale.children) as HTMLElement[];

    expect(lowCountry).toHaveAttribute("fill", "#d6eef7");
    expect(secondLevelCountry).toHaveAttribute("fill", "#73b7d6");
    expect(thirdLevelCountry).toHaveAttribute("fill", "#f3d98b");
    expect(highCountry).toHaveAttribute("fill", "#a63d1f");
    expect(swatches).toHaveLength(5);
    expect(getComputedStyle(swatches[0]).backgroundColor).toBe("rgb(214, 238, 247)");
    expect(getComputedStyle(swatches[1]).backgroundColor).toBe("rgb(115, 183, 214)");
    expect(getComputedStyle(swatches[2]).backgroundColor).toBe("rgb(243, 217, 139)");
    expect(getComputedStyle(swatches[3]).backgroundColor).toBe("rgb(229, 139, 58)");
    expect(getComputedStyle(swatches[4]).backgroundColor).toBe("rgb(166, 61, 31)");
  });

  it("keeps special states distinct while hiding them from the legend", () => {
    renderWorldMap({
      year: 2020,
      gas: "CH4",
      unit: "kt_co2e",
      countries: [
        { countryCode: "THA", countryName: "Thailand", value: null },
        { countryCode: "USA", countryName: "United States", value: 20 },
        { countryCode: "BRA", countryName: "Brazil", value: 50 },
      ],
    });

    expect(screen.getByLabelText(/thailand: no data/i)).toHaveAttribute("fill", "#e7ece9");
    expect(screen.getByLabelText(/unknownland: not tracked/i)).toHaveAttribute("fill", "#f5f2eb");
    expect(screen.queryByText("No data")).not.toBeInTheDocument();
    expect(screen.queryByText("Not tracked")).not.toBeInTheDocument();
  });

  it("keeps the same tracked scale for total and non-total gases", () => {
    const totalData: MapData = {
      year: 2020,
      gas: "TOTAL",
      unit: "kt_co2e",
      countries: [
        { countryCode: "THA", countryName: "Thailand", value: 10 },
        { countryCode: "USA", countryName: "United States", value: 20 },
        { countryCode: "BRA", countryName: "Brazil", value: 25 },
      ],
    };

    const { rerender } = renderWorldMap(totalData);
    const totalScale = Array.from(
      (screen.getByText("Low").nextElementSibling as HTMLElement).children,
    ).map((node) => getComputedStyle(node as HTMLElement).backgroundColor);

    rerender(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <WorldMap
          data={{ ...totalData, gas: "CO2" }}
          onSelectCountry={() => {}}
          selectedCountry="THA"
        />
      </ThemeProvider>,
    );

    const co2Scale = Array.from(
      (screen.getByText("Low").nextElementSibling as HTMLElement).children,
    ).map((node) => getComputedStyle(node as HTMLElement).backgroundColor);

    expect(co2Scale).toEqual(totalScale);
  });
});
