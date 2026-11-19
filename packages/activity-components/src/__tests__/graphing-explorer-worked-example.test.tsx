import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GraphingExplorer } from "../components/graphing/GraphingExplorer";

describe("GraphingExplorer worked quadratic example", () => {
  it("shows the 1-1-1 table method as a completed mathematical demonstration", () => {
    const { container } = render(
      <GraphingExplorer
        activityId="math.im3.skill.1.1.graph-quadratic-functions.worked_example"
        mode="teaching"
        equation="f(x) = x^2 + 2x - 3"
        variant="plot_from_equation"
      />,
    );

    expect(screen.getByText("Worked example")).toBeTruthy();
    expect(screen.getByText("Step 1: Analyze the function")).toBeTruthy();
    expect(screen.getByText("Step 2: Graph the function")).toBeTruthy();
    expect(screen.getByText("Step 3: Analyze the graph")).toBeTruthy();
    expect(container.querySelector('[data-testid="worked-equation"] .katex')).toBeTruthy();
    expect(container.querySelector('[data-testid="worked-axis"] .katex')).toBeTruthy();

    const tableValues = screen.getAllByRole("spinbutton");
    expect(tableValues.map((input) => (input as HTMLInputElement).value)).toEqual([
      "0",
      "-3",
      "-4",
      "-3",
      "0",
    ]);
    expect(tableValues.every((input) => (input as HTMLInputElement).disabled)).toBe(true);
    expect(container.querySelectorAll(".point-marker")).toHaveLength(5);
    const functionCurve = container.querySelector(".function-curve");
    expect(functionCurve).toBeTruthy();
    expect(functionCurve!.tagName).toBe("path");

    const curvePoints = functionCurve!
      .getAttribute("d")!
      .match(/[ML][^ML]+/g)!
      .map((command) => command.slice(1).trim().split(/[ ,]+/).map(Number) as [number, number]);
    const vertex = curvePoints.reduce((nearest, point) =>
      Math.abs(point[0] - 270) < Math.abs(nearest[0] - 270) ? point : nearest,
    );
    expect(vertex[0]).toBeCloseTo(270, 4);
    expect(vertex[1]).toBeCloseTo(420, 4);
    expect(screen.getByText("The domain is all real numbers.")).toBeTruthy();
    expect(container.querySelector('[data-testid="worked-range"] .katex')).toBeTruthy();
  });
});
