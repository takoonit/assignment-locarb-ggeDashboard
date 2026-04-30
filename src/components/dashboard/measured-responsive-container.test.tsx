import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MeasuredResponsiveContainer } from "./measured-responsive-container";

const responsiveContainerSpy = vi.fn(
  ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="responsive-container">{children}</div>,
);

vi.mock("recharts", () => ({
  ResponsiveContainer: (props: {
    children: React.ReactNode;
    initialDimension?: { width: number; height: number };
  }) => responsiveContainerSpy(props),
}));

class ResizeObserverMock {
  observe() {}

  disconnect() {}
}

describe("MeasuredResponsiveContainer", () => {
  let originalResizeObserver: typeof ResizeObserver | undefined;
  let originalGetBoundingClientRect: typeof HTMLElement.prototype.getBoundingClientRect;
  let clientWidth: PropertyDescriptor | undefined;
  let clientHeight: PropertyDescriptor | undefined;

  beforeEach(() => {
    responsiveContainerSpy.mockClear();
    originalResizeObserver = globalThis.ResizeObserver;
    originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
    clientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
    clientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");

    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 320,
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: () => 168,
    });
    HTMLElement.prototype.getBoundingClientRect = () =>
      ({
        width: 320,
        height: 168,
        top: 0,
        left: 0,
        bottom: 168,
        right: 320,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalResizeObserver === undefined) {
      delete (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
    } else {
      globalThis.ResizeObserver = originalResizeObserver;
    }

    if (clientWidth) {
      Object.defineProperty(HTMLElement.prototype, "clientWidth", clientWidth);
    }
    if (clientHeight) {
      Object.defineProperty(HTMLElement.prototype, "clientHeight", clientHeight);
    }
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("does not emit the Recharts invalid-size warning when the host already has a measured size", async () => {
    render(
      <MeasuredResponsiveContainer minHeight={168}>
        <div data-testid="chart-child" />
      </MeasuredResponsiveContainer>,
    );

    expect(await screen.findByTestId("chart-child")).toBeInTheDocument();
    expect(responsiveContainerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        initialDimension: { width: 320, height: 168 },
      }),
    );
  });
});
