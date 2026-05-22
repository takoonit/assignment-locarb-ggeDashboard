import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PresentationPage from "./page";

function renderPresentation() {
  return render(<PresentationPage />);
}

describe("interview presentation page", () => {
  it("presents the Lo-Carb build as a visual interview deck", () => {
    renderPresentation();

    const deck = screen.getByRole("region", { name: /presentation deck/i });

    expect(screen.getByText(/1 \/ 8/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /full-stack emissions product/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/REST API \+ dashboard \+ admin data management/i)).toBeInTheDocument();
    expect(screen.getByText(/Public dashboard/i)).toBeInTheDocument();
    expect(screen.getAllByText(/REST API/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Admin CRUD/i)).toBeInTheDocument();

    expect(within(deck).getByRole("button", { name: /brief/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(within(deck).getByRole("button", { name: /analysis/i }));
    expect(screen.getByText(/2 \/ 8/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /turn the pdf into review signals/i })).toBeInTheDocument();
    expect(screen.getByText("API")).toBeInTheDocument();
    expect(screen.getByText(/Edge cases/i)).toBeInTheDocument();
    expect(screen.getByText(/API correctness, data shape, visible dashboard behavior/i)).toBeInTheDocument();

    fireEvent.click(within(deck).getByRole("button", { name: /data/i }));
    expect(screen.getByText(/3 \/ 8/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /the csv was source data, not app design/i })).toBeInTheDocument();
    expect(screen.getByText(/wide reporting shape/i)).toBeInTheDocument();
    expect(screen.getByText("preserve null")).toBeInTheDocument();
    expect(screen.getByText("label as %")).toBeInTheDocument();
    expect(screen.getByText(/ADR-006/i)).toBeInTheDocument();
    expect(screen.getByText(/ADR-010/i)).toBeInTheDocument();

    fireEvent.click(within(deck).getByRole("button", { name: /plan/i }));
    expect(screen.getByText(/4 \/ 8/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /make the build contract explicit/i })).toBeInTheDocument();
    expect(screen.getByText(/PRD/i)).toBeInTheDocument();
    expect(screen.getByText(/BMAD: Build/i)).toBeInTheDocument();

    fireEvent.click(within(deck).getByRole("button", { name: /stack/i }));
    expect(screen.getByText(/5 \/ 8/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /choose boring tools for the assignment risks/i })).toBeInTheDocument();
    expect(screen.getByText(/Next.js/i)).toBeInTheDocument();
    expect(screen.getByText(/Postgres/i)).toBeInTheDocument();
    expect(screen.getByText(/ADR-002/i)).toBeInTheDocument();

    fireEvent.click(within(deck).getByRole("button", { name: /agents/i }));
    expect(screen.getByText(/6 \/ 8/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /agents worked inside the contract/i })).toBeInTheDocument();
    expect(screen.getByText("Human")).toBeInTheDocument();
    expect(screen.getByText("Codex")).toBeInTheDocument();
    expect(screen.getByText("Claude")).toBeInTheDocument();

    fireEvent.click(within(deck).getByRole("button", { name: /recovery/i }));
    expect(screen.getByText(/7 \/ 8/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /integration drift was found and fixed/i })).toBeInTheDocument();
    expect(screen.getByText(/transparent email/i)).toBeInTheDocument();
    expect(screen.getByText(/stricter workflow ADR-024/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/8 \/ 8/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /what i can walk through now/i })).toBeInTheDocument();
    expect(screen.getByText("API Docs")).toBeInTheDocument();
    expect(screen.getByText("Seed Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Recovery story")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText(/7 \/ 8/i)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText(/8 \/ 8/i)).toBeInTheDocument();

    expect(screen.getByText(/Evidence: Gmail assignment/i)).toBeInTheDocument();
    expect(screen.queryByText(/The main implementation sequence/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Assignment asks on the left/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Core Thesis/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Evidence chain:/i)).not.toBeInTheDocument();
  }, 10_000);
});
