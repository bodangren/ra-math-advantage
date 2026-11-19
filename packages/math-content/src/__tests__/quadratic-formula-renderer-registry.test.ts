import { describe, expect, it } from "vitest";
import { quadraticFormulaActivitySchema } from "../schemas/quadratic-formula-activity.schema";
import { getRenderer } from "../knowledge-space/renderers/registry";

describe("quadratic-formula renderer registry", () => {
  it("uses the public quadratic-formula schema", () => {
    expect(getRenderer("quadratic-formula")).toEqual({
      key: "quadratic-formula",
      propsSchema: quadraticFormulaActivitySchema,
    });
  });
});
