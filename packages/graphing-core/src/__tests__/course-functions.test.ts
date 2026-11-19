import { describe, expect, it } from "vitest";
import { evaluateFunction } from "../canvas-utils";
describe("course function evaluation", () => {
  it.each([
    ["y = 1/x", 2, 0.5],
    ["y = x^3 - 4x", 2, 0],
    ["y = sqrt(x)", 4, 2],
    ["y = sin(x)", Math.PI / 2, 1],
    ["y = cos(x)", 0, 1],
    ["y = tan(x)", 0, 0],
    ["y = 2^x", 3, 8],
    ["y = ln(x)", Math.E, 1],
    ["y = log(x)", 100, 2],
    ["f(x) = (x-2)^2 + 1", 3, 2],
    ["y = -x^2", 2, -4],
    ["y = 2^-x", 2, 0.25],
    ["y = (x+2)(x-1)", 3, 10],
    ["h(t) = -16t^2+80t+4", 1, 68],
  ])("%s at %s", (expression, x, expected) =>
    expect(evaluateFunction(expression, x)).toBeCloseTo(expected),
  );
  it.each(["garbage", "x;alert(1)", "x+unknown", "x^", "x=2", "f(x)+g(x)"])(
    "rejects unsupported input %s",
    (expression) => {
      expect(evaluateFunction(expression, 2)).toBeNaN();
    },
  );
});

it("does not join a rational graph across its asymptote", async () => {
  const { generateFunctionPath } = await import("../canvas-utils");
  const path = generateFunctionPath("1/x", [-2, 2], [-4, 4], 100, 100);
  expect((path.match(/M/g) ?? []).length).toBe(2);
});
