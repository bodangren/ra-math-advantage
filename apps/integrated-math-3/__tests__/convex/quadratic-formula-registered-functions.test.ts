import { describe, expect, it } from "vitest";
import * as activities from "@/convex/activities";

const registeredFunctions = activities as unknown as Record<
  string,
  { _handler?: unknown; _args?: unknown; _returns?: unknown } | undefined
>;

describe("quadratic-formula Convex functions", () => {
  it.each([
    "startQuadraticFormulaAttempt",
    "getQuadraticFormulaAttempt",
    "checkQuadraticFormulaDiscriminant",
  ])("%s is registered as a Convex function", (name) => {
    const registered = registeredFunctions[name];
    expect(registered).toBeDefined();
    expect(typeof registered?._handler).toBe("function");
    expect(registered?._args).toBeDefined();
    expect(registered?._returns).toBeDefined();
  });
});
