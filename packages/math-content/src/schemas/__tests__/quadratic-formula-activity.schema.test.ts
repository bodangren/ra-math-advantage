import { describe, expect, it } from "vitest";
import { getPropsSchema, quadraticFormulaActivitySchema } from "../index";

const base = { prompt: "Solve.", equation: "x^2 + 4x - 17 = 0" };

describe("quadraticFormulaActivitySchema", () => {
  it("accepts source steps only for Worked props", () => {
    expect(
      quadraticFormulaActivitySchema.parse({
        ...base,
        presentationMode: "worked",
        workedSteps: [{ description: "Substitute." }],
      }),
    ).toBeTruthy();
    expect(() =>
      quadraticFormulaActivitySchema.parse({
        ...base,
        presentationMode: "guided",
        workedSteps: [{ description: "Leaked." }],
      }),
    ).toThrow();
    expect(() =>
      quadraticFormulaActivitySchema.parse({
        ...base,
        presentationMode: "independent",
        workedSteps: [{ description: "Leaked." }],
      }),
    ).toThrow();
  });

  it.each(["rootCount", "solutions", "expectedAnswer", "partAnswers"])(
    "rejects the private %s field",
    (key) =>
      expect(() =>
        quadraticFormulaActivitySchema.parse({
          ...base,
          presentationMode: "independent",
          [key]: [],
        }),
      ).toThrow(),
  );

  it("registers the public quadratic-formula schema", () => {
    expect(getPropsSchema("quadratic-formula")).toBe(quadraticFormulaActivitySchema);
  });
});
