import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";
import { metadata } from "./layout";

describe("Lo-Carb app foundation", () => {
  it("uses Lo-Carb metadata instead of the starter metadata", () => {
    expect(metadata.title).toBe("Lo-Carb GGE Dashboard");
    expect(metadata.description).toBe(
      "Explore greenhouse gas emissions by country, gas, sector, and year.",
    );
  });

  it("renders the Lo-Carb dashboard foundation", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: /lo-carb gge dashboard/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/greenhouse gas emissions intelligence/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/country coverage/i)).toBeInTheDocument();
    expect(screen.getByText(/emissions trends/i)).toBeInTheDocument();
    expect(screen.getByText(/sector breakdown/i)).toBeInTheDocument();
  });
});
