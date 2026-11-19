import { describe, expect, it } from "vitest";

import { generateTopic16EquationEndBehaviorOutput } from "../knowledge-space/generators/topic16-equation-end-behavior";
import {
  getPropsSchema,
  polynomialEquationEndBehaviorSchema,
  SCHEMA_REGISTRY,
  type ActivityComponentKey,
  type PolynomialEquationEndBehaviorProps,
} from "../schemas";

describe("polynomial equation end-behavior schema registration", () => {
  it("exposes the schema through the public index and registry", () => {
    const key: ActivityComponentKey = "polynomial-equation-end-behavior";
    const output = generateTopic16EquationEndBehaviorOutput(2);
    const independentProps = {
      ...(output.data.rendererProps as Record<string, unknown>),
      presentationMode: "independent_practice",
    } as PolynomialEquationEndBehaviorProps;

    expect(polynomialEquationEndBehaviorSchema.safeParse(independentProps).success).toBe(true);
    expect(SCHEMA_REGISTRY[key]).toBe(polynomialEquationEndBehaviorSchema);
    expect(getPropsSchema(key)).toBe(polynomialEquationEndBehaviorSchema);
  });
});
