import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";
import { metadata } from "./layout";
import { Providers } from "./providers";

const replaceMock = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => searchParams,
}));

function renderDashboard() {
  return render(
    <Providers>
      <Home />
    </Providers>,
  );
}

const countries = [
  { code: "THA", name: "Thailand", isRegion: false },
  { code: "USA", name: "United States", isRegion: false },
];

function mockFetch() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(input.toString(), "http://localhost");

    if (url.pathname === "/api/countries") {
      return Response.json({ data: countries });
    }

    if (url.pathname === "/api/emissions/trend") {
      return Response.json({
        data: {
          country: { code: url.searchParams.get("country") ?? "THA", name: "Thailand" },
          gas: url.searchParams.get("gas") ?? "TOTAL",
          unit: "kt_co2e",
          points: [
            { year: 2019, value: 12 },
            { year: 2020, value: 15 },
            { year: 2021, value: null },
            { year: 2022, value: 18 },
          ],
        },
      });
    }

    if (url.pathname === "/api/emissions/sector") {
      const requestedYear = Number(url.searchParams.get("year") ?? 2020);
      const hasSectorData = [2022, 2020, 2019].includes(requestedYear);

      return Response.json({
        data: {
          country: { code: url.searchParams.get("country") ?? "THA", name: "Thailand" },
          year: requestedYear,
          unit: "percent",
          sectors: hasSectorData
            ? {
                transport: 25.4,
                manufacturing: 0,
                electricity: null,
                buildings: 7.1,
                other: 3.4,
              }
            : {
                transport: null,
                manufacturing: null,
                electricity: null,
                buildings: null,
                other: null,
              },
        },
      });
    }

    if (url.pathname === "/api/emissions/map") {
      return Response.json({
        data: {
          year: Number(url.searchParams.get("year") ?? 2020),
          gas: url.searchParams.get("gas") ?? "TOTAL",
          unit: "kt_co2e",
          countries: [
            { countryCode: "THA", countryName: "Thailand", value: 100 },
            { countryCode: "USA", countryName: "United States", value: null },
          ],
        },
      });
    }

    if (url.pathname === "/api/emissions/map/years") {
      return Response.json({ data: [2022, 2020, 2019] });
    }

    if (url.pathname === "/api/emissions/sector/years") {
      return Response.json({ data: [2022, 2020, 2019] });
    }

    return Response.json({ error: { code: "NOT_FOUND", details: {} } }, { status: 404 });
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function lastUrlFor(fetchMock: ReturnType<typeof mockFetch>, path: string) {
  const call = [...fetchMock.mock.calls]
    .reverse()
    .find(([input]) => new URL(input.toString(), "http://localhost").pathname === path);

  if (!call) throw new Error(`No fetch call for ${path}`);
  return new URL(call[0].toString(), "http://localhost");
}

async function waitForYearOptions(region: HTMLElement) {
  await waitFor(() => {
    expect(within(region).getByText("2020")).toBeInTheDocument();
  });
}

describe("Epic 3 dashboard", () => {
  beforeEach(() => {
    searchParams = new URLSearchParams();
    replaceMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("uses Lo-Carb metadata instead of the starter metadata", () => {
    expect(metadata.title).toBe("Lo-Carb GGE Dashboard");
    expect(metadata.description).toBe(
      "Explore greenhouse gas emissions by country, gas, sector, and year.",
    );
  });

  it("renders the dashboard shell with scoped controls and map legend", async () => {
    mockFetch();
    renderDashboard();

    expect(
      screen.getByRole("heading", { level: 1, name: /global greenhouse gas emissions/i }),
    ).toBeInTheDocument();

    const trend = await screen.findByRole("region", { name: /emissions trend/i });
    const sector = screen.getByRole("region", { name: /sector breakdown/i });
    const map = screen.getByRole("region", { name: /world emissions map/i });
    const dashboardControls = screen.getByRole("toolbar", { name: /dashboard filters/i });

    expect(within(dashboardControls).getByLabelText(/^country$/i)).toBeInTheDocument();
    expect(within(dashboardControls).getByRole("radiogroup", { name: /^gas$/i })).toBeInTheDocument();
    expect(within(dashboardControls).getByText(/^year$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^context$/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Takoon Chiengtong")).not.toBeInTheDocument();

    expect(within(trend).queryByLabelText(/country/i)).not.toBeInTheDocument();
    expect(within(trend).queryByRole("radiogroup", { name: /trend gas/i })).not.toBeInTheDocument();
    expect(within(trend).queryByLabelText(/trend year/i)).not.toBeInTheDocument();

    expect(within(sector).queryByLabelText(/sector country/i)).not.toBeInTheDocument();
    expect(within(sector).queryByLabelText(/sector year selection/i)).not.toBeInTheDocument();
    expect(within(sector).queryByRole("radiogroup", { name: /sector gas/i })).not.toBeInTheDocument();

    expect(within(map).getByText("2020")).toBeInTheDocument();
    expect(within(map).getByText(/^year$/i)).toBeInTheDocument();
    expect(within(map).queryByRole("radiogroup", { name: /map gas/i })).not.toBeInTheDocument();
    expect(await within(map).findByText("Low")).toBeInTheDocument();
    expect(within(map).getByText("High")).toBeInTheDocument();
    expect(within(map).queryByText("No data")).not.toBeInTheDocument();
    expect(within(map).queryByText("Not tracked")).not.toBeInTheDocument();

    await waitForYearOptions(dashboardControls);
  }, 10_000);

  it("initializes API requests from URL query defaults", async () => {
    searchParams = new URLSearchParams("country=USA&year=2021&gas=CO2");
    const fetchMock = mockFetch();

    renderDashboard();

    await waitFor(() => {
      expect(lastUrlFor(fetchMock, "/api/emissions/trend").searchParams.get("country")).toBe(
        "USA",
      );
    });

    expect(lastUrlFor(fetchMock, "/api/emissions/trend").searchParams.get("gas")).toBe("CO2");
    expect(lastUrlFor(fetchMock, "/api/emissions/sector").searchParams.get("country")).toBe(
      "USA",
    );
    await waitFor(() => {
      expect(lastUrlFor(fetchMock, "/api/emissions/sector").searchParams.get("year")).toBe(
        "2022",
      );
    });

    expect(lastUrlFor(fetchMock, "/api/emissions/map").searchParams.get("year")).toBe("2022");
    expect(lastUrlFor(fetchMock, "/api/emissions/map").searchParams.get("gas")).toBe("CO2");
  });

  it("keeps gas scoped to trend and map while sector ignores it", async () => {
    const fetchMock = mockFetch();

    renderDashboard();

    await screen.findByRole("region", { name: /emissions trend/i });
    await waitForYearOptions(screen.getByRole("toolbar", { name: /dashboard filters/i }));
    const sectorCallsBefore = fetchMock.mock.calls.filter(
      ([input]) => new URL(input.toString(), "http://localhost").pathname === "/api/emissions/sector",
    ).length;

    fireEvent.click(screen.getByRole("radio", { name: "HFC" }));

    await waitFor(() => {
      expect(lastUrlFor(fetchMock, "/api/emissions/trend").searchParams.get("gas")).toBe("HFC");
    });

    expect(lastUrlFor(fetchMock, "/api/emissions/map").searchParams.get("gas")).toBe("HFC");
    const sectorCallsAfter = fetchMock.mock.calls.filter(
      ([input]) => new URL(input.toString(), "http://localhost").pathname === "/api/emissions/sector",
    ).length;
    expect(sectorCallsAfter).toBe(sectorCallsBefore);
    expect(replaceMock).toHaveBeenCalledWith("/?gas=HFC", { scroll: false });
  });

  it("renders trend null gaps and sector zero/null values explicitly", async () => {
    mockFetch();

    renderDashboard();

    const trend = await screen.findByRole("region", { name: /emissions trend/i });
    const sector = screen.getByRole("region", { name: /sector breakdown/i });

    expect(await within(trend).findByText(/missing data gap/i)).toBeInTheDocument();
    expect(within(sector).getAllByText("Manufacturing").length).toBeGreaterThan(0);
    expect(within(sector).getAllByText("0%").length).toBeGreaterThan(0);
    expect(within(sector).getAllByText("Electricity").length).toBeGreaterThan(0);
    expect(within(sector).getByText("No data")).toBeInTheDocument();
    });

    it("provides export buttons for trend, sector, and map charts", async () => {
    mockFetch();
    renderDashboard();

    const trend = await screen.findByRole("region", { name: /emissions trend/i });
    const sector = screen.getByRole("region", { name: /sector breakdown/i });
    const map = screen.getByRole("region", { name: /world emissions map/i });

    expect(within(trend).getByRole("button", { name: /export pdf/i })).toBeInTheDocument();
    expect(within(sector).getByRole("button", { name: /export pdf/i })).toBeInTheDocument();
    expect(within(map).getByRole("button", { name: /export pdf/i })).toBeInTheDocument();
    });

    it("updates the line chart progressively with slider steppers", async () => {

    mockFetch();

    renderDashboard();

    const trend = await screen.findByRole("region", { name: /emissions trend/i });
    expect(await within(trend).findByText(/selected year: 2022/i)).toBeInTheDocument();

    fireEvent.click(within(trend).getByRole("button", { name: /previous trend year/i }));
    fireEvent.click(within(trend).getByRole("button", { name: /previous trend year/i }));
    fireEvent.click(within(trend).getByRole("button", { name: /previous trend year/i }));

    await waitFor(() => {
      expect(within(trend).getByText(/selected year: 2019/i)).toBeInTheDocument();
      expect(
        within(trend).getByText(/reveal the trend progressively through time/i),
      ).toBeInTheDocument();
    });

    expect(within(trend).getByRole("button", { name: /previous trend year/i })).toBeDisabled();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
