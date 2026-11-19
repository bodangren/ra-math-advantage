import { generateTopic14PolynomialEndBehaviorOutput } from "../knowledge-space";
import { getPropsSchema, polynomialEndBehaviorSchema } from "../schemas";
import { describe, expect, it } from "vitest";

const SOURCE_PROPS = generateTopic14PolynomialEndBehaviorOutput(0).data.rendererProps as Record<
  string,
  unknown
>;

function modeProps(mode: "worked_example" | "guided_practice" | "independent_practice") {
  if (mode === "worked_example") {
    return {
      ...SOURCE_PROPS,
      presentationMode: mode,
      correctAnswers: {
        leftEnd: "negative_infinity",
        rightEnd: "negative_infinity",
      },
      steps: [
        "The leading term is -3x^4.",
        "The degree is 4, which is even.",
        "The leading coefficient is -3, which is negative.",
        "An even degree gives the same end direction, and a negative leading coefficient makes both ends fall.",
        "As x approaches negative infinity, f(x) approaches negative infinity.",
        "As x approaches positive infinity, f(x) approaches negative infinity.",
      ],
      finalAnswer: "Both ends of the graph fall toward negative infinity.",
    };
  }
  if (mode === "guided_practice") {
    return {
      ...SOURCE_PROPS,
      presentationMode: mode,
      guidedSteps: [
        "Identify the leading term.",
        "Check the degree parity.",
        "Use the coefficient sign.",
      ],
      fieldHelp: "Use the leading coefficient and degree to select each end behavior.",
    };
  }
  return { ...SOURCE_PROPS, presentationMode: mode };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe("polynomial end behavior schema", () => {
  it("accepts live seed-0 Worked, Guided, and Independent props", () => {
    expect(polynomialEndBehaviorSchema.safeParse(modeProps("worked_example")).success).toBe(true);
    expect(polynomialEndBehaviorSchema.safeParse(modeProps("guided_practice")).success).toBe(true);
    expect(polynomialEndBehaviorSchema.safeParse(modeProps("independent_practice")).success).toBe(
      true,
    );
    expect(getPropsSchema("polynomial-end-behavior")).toBe(polynomialEndBehaviorSchema);
  });

  it("accepts every live public generator variant through seed 999", () => {
    for (let seed = 0; seed <= 999; seed += 1) {
      const props = generateTopic14PolynomialEndBehaviorOutput(seed).data.rendererProps as Record<
        string,
        unknown
      >;
      expect(polynomialEndBehaviorSchema.safeParse(props).success).toBe(true);
      const leadingTerm = props.leadingTerm as { coefficient: number; exponent: number };
      expect(Math.abs(leadingTerm.coefficient)).toBeGreaterThanOrEqual(1);
      expect(Math.abs(leadingTerm.coefficient)).toBeLessThanOrEqual(9);
      expect(leadingTerm.exponent).toBeGreaterThanOrEqual(2);
      expect(leadingTerm.exponent).toBeLessThanOrEqual(7);
    }
  });

  it("rejects blanks, unknown fields, malformed scaffolds, and authority in practice modes", () => {
    const invalidCases: unknown[] = [];
    for (const field of ["prompt", "title"]) {
      const value = modeProps("independent_practice") as Record<string, unknown>;
      value[field] = "   ";
      invalidCases.push(value);
    }
    const malformedTerm = clone(modeProps("independent_practice")) as Record<string, unknown>;
    malformedTerm.leadingTerm = { coefficient: 0, exponent: 4 };
    invalidCases.push(malformedTerm);
    const malformedExponent = clone(modeProps("independent_practice")) as Record<string, unknown>;
    malformedExponent.leadingTerm = { coefficient: 3, exponent: 8 };
    invalidCases.push(malformedExponent);
    const unknownRoot = clone(modeProps("independent_practice")) as Record<string, unknown>;
    unknownRoot.extra = true;
    invalidCases.push(unknownRoot);
    const unknownTerm = clone(modeProps("independent_practice")) as Record<string, unknown>;
    unknownTerm.leadingTerm = { coefficient: 3, exponent: 4, answer: "hidden" };
    invalidCases.push(unknownTerm);
    const unknownWorkedAnswer = clone(modeProps("worked_example")) as Record<string, unknown>;
    unknownWorkedAnswer.correctAnswers = {
      leftEnd: "negative_infinity",
      rightEnd: "negative_infinity",
      answer: "hidden",
    };
    invalidCases.push(unknownWorkedAnswer);
    const independentAuthority = clone(modeProps("independent_practice")) as Record<
      string,
      unknown
    >;
    independentAuthority.correctAnswers = {
      leftEnd: "negative_infinity",
      rightEnd: "negative_infinity",
    };
    invalidCases.push(independentAuthority);
    const guidedAuthority = clone(modeProps("guided_practice")) as Record<string, unknown>;
    guidedAuthority.finalAnswer = "hidden";
    invalidCases.push(guidedAuthority);
    const badGuided = clone(modeProps("guided_practice")) as Record<string, unknown>;
    badGuided.guidedSteps = ["one", "two"];
    invalidCases.push(badGuided);
    for (const value of invalidCases) {
      expect(polynomialEndBehaviorSchema.safeParse(value).success).toBe(false);
    }
  });

  it("requires the exact Worked answer shape and derives both ends from parity and sign", () => {
    const valid = modeProps("worked_example");
    const wrongLeft = clone(valid) as Record<string, unknown>;
    wrongLeft.correctAnswers = { leftEnd: "positive_infinity", rightEnd: "negative_infinity" };
    expect(polynomialEndBehaviorSchema.safeParse(wrongLeft).success).toBe(false);

    const wrongRight = clone(valid) as Record<string, unknown>;
    wrongRight.correctAnswers = { leftEnd: "negative_infinity", rightEnd: "positive_infinity" };
    expect(polynomialEndBehaviorSchema.safeParse(wrongRight).success).toBe(false);

    for (const coefficient of [-9, -1, 1, 9]) {
      for (const exponent of [2, 3, 6, 7]) {
        const props = {
          ...modeProps("worked_example"),
          leadingTerm: { coefficient, exponent },
          correctAnswers: {
            rightEnd: coefficient > 0 ? "positive_infinity" : "negative_infinity",
            leftEnd:
              exponent % 2 === 0
                ? coefficient > 0
                  ? "positive_infinity"
                  : "negative_infinity"
                : coefficient > 0
                  ? "negative_infinity"
                  : "positive_infinity",
          },
        };
        expect(polynomialEndBehaviorSchema.safeParse(props).success).toBe(true);
      }
    }
  });
});
