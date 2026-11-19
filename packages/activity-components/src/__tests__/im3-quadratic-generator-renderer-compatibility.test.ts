import { describe, expect, it } from "vitest";

import { evaluateFunction, generateFunctionPath } from "@math-platform/graphing-core";

describe("IM3 quadratic generator and renderer compatibility", () => {
  it("evaluates and plots the fixed Guided nonzero-linear-term equation", () => {
    const equation = "y = x^2 - x - 2";
    const xValues = [-2, -1, 0, 1, 2];

    expect(xValues.map((x) => evaluateFunction(equation, x))).toEqual([4, 0, -2, -2, 0]);

    const path = generateFunctionPath(equation, [-5, 5], [-10, 10], 600, 600);
    expect(path).toMatch(/^M \d+(?:\.\d+)?,\d+(?:\.\d+)?(?: L \d+(?:\.\d+)?,\d+(?:\.\d+)?)+$/);
    expect(path.split(" ")).toContain("300,360");
  });
});
