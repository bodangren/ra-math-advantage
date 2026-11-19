import { describe, expect, it } from "vitest";

import { getPropsSchema, polynomialDegreeLeadingCoefficientSchema } from "../schemas";
import { generateTopic14PolynomialDegreeLeadingCoefficientOutput } from "../knowledge-space/generators/topic14-polynomial-degree-leading-coefficient";

const SOURCE_OUTPUT = generateTopic14PolynomialDegreeLeadingCoefficientOutput(0);
const SOURCE_RENDERER_PROPS = SOURCE_OUTPUT.data.rendererProps as Record<string, unknown>;

function clone(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function publicProps(seed: number): Record<string, unknown> {
  return clone(generateTopic14PolynomialDegreeLeadingCoefficientOutput(seed).data.rendererProps);
}

function workedProps(): Record<string, unknown> {
  return {
    ...publicProps(0),
    presentationMode: "worked_example",
    correctAnswers: SOURCE_OUTPUT.expectedAnswer,
    steps: [
      "Find each greatest exponent.",
      "Read each matching coefficient.",
      "State each result.",
    ],
    finalAnswer:
      "a) degree 4, leading coefficient 3; b) degree 3, leading coefficient -7; c) degree 0, leading coefficient 4.",
  };
}

function guidedProps(): Record<string, unknown> {
  return {
    ...publicProps(1),
    presentationMode: "guided_practice",
    guidedSteps: ["List the terms in each polynomial.", "Find the greatest exponent in each item."],
    fieldHelp: "Use the term with the greatest exponent to identify both values.",
  };
}

function expectRejected(value: unknown): void {
  expect(polynomialDegreeLeadingCoefficientSchema.safeParse(value).success).toBe(false);
}

describe("polynomial-degree-leading-coefficient schema", () => {
  it("accepts exact seed-0 Independent props and valid Guided and Worked forms", () => {
    expect(publicProps(0)).toEqual({
      prompt: "Find the leading coefficient and degree.",
      items: SOURCE_RENDERER_PROPS.items,
      presentationMode: "independent_practice",
    });
    expect(polynomialDegreeLeadingCoefficientSchema.safeParse(publicProps(0)).success).toBe(true);
    expect(polynomialDegreeLeadingCoefficientSchema.safeParse(guidedProps()).success).toBe(true);
    expect(polynomialDegreeLeadingCoefficientSchema.safeParse(workedProps()).success).toBe(true);
  });

  it("resolves the exact schema and accepts generated Independent props for seeds 0 through 999", () => {
    expect(getPropsSchema("polynomial-degree-leading-coefficient")).toBe(
      polynomialDegreeLeadingCoefficientSchema,
    );
    for (let seed = 0; seed < 1000; seed += 1) {
      expect(polynomialDegreeLeadingCoefficientSchema.safeParse(publicProps(seed)).success).toBe(
        true,
      );
    }
  });

  it("rejects malformed items, terms, and unknown fields", () => {
    const base = publicProps(0);
    const items = base.items as Array<Record<string, unknown>>;
    const terms = items[0]!.terms as Array<Record<string, unknown>>;

    expectRejected({ ...base, items: items.slice(0, 2) });
    expectRejected({ ...base, items: [items[0], items[0], items[2]] });
    expectRejected({ ...base, items: [{ ...items[0], functionName: " " }, items[1], items[2]] });
    expectRejected({ ...base, items: [{ ...items[0], terms: [] }, items[1], items[2]] });
    expectRejected({
      ...base,
      items: [
        { ...items[0], terms: [{ ...terms[0], coefficient: 0 }, ...terms.slice(1)] },
        items[1],
        items[2],
      ],
    });
    expectRejected({
      ...base,
      items: [
        { ...items[0], terms: [{ ...terms[0], coefficient: Number.NaN }, ...terms.slice(1)] },
        items[1],
        items[2],
      ],
    });
    expectRejected({
      ...base,
      items: [
        { ...items[0], terms: [{ ...terms[0], exponent: -1 }, ...terms.slice(1)] },
        items[1],
        items[2],
      ],
    });
    expectRejected({
      ...base,
      items: [
        { ...items[0], terms: [{ ...terms[0], exponent: 1.5 }, ...terms.slice(1)] },
        items[1],
        items[2],
      ],
    });
    expectRejected({
      ...base,
      items: [
        {
          ...items[0],
          terms: [{ ...terms[0], exponent: Number.MAX_SAFE_INTEGER + 1 }, ...terms.slice(1)],
        },
        items[1],
        items[2],
      ],
    });
    expectRejected({
      ...base,
      items: [
        { ...items[0], terms: [terms[0], { ...terms[1], exponent: terms[0]!.exponent }] },
        items[1],
        items[2],
      ],
    });
    expectRejected({ ...base, unexpected: true });
    expectRejected({
      ...base,
      items: [{ ...items[0], unexpected: true }, items[1], items[2]],
    });
    expectRejected({
      ...base,
      items: [
        { ...items[0], terms: [{ ...terms[0], unexpected: true }, ...terms.slice(1)] },
        items[1],
        items[2],
      ],
    });
  });

  it("rejects invalid Worked authority and Worked text", () => {
    const valid = workedProps();
    const correctAnswers = clone(valid.correctAnswers);
    expectRejected({ ...valid, correctAnswers: undefined });
    expectRejected({ ...valid, correctAnswers: { ...correctAnswers, a_degree: 3 } });
    expectRejected({ ...valid, correctAnswers: { ...correctAnswers, a_leading_coefficient: -3 } });
    expectRejected({ ...valid, correctAnswers: { ...correctAnswers, a_degree: Number.NaN } });
    expectRejected({ ...valid, correctAnswers: { ...correctAnswers, a_degree: 4, extra: 1 } });
    expectRejected({ ...valid, correctAnswers: { ...correctAnswers, a_degree: undefined } });
    expectRejected({ ...valid, steps: ["one", "two"] });
    expectRejected({ ...valid, steps: ["one", " ", "three"] });
    expectRejected({ ...valid, finalAnswer: " " });
  });

  it("rejects malformed Guided scaffolds and authority outside Worked mode", () => {
    const guided = guidedProps();
    const independent = publicProps(0);
    expectRejected({ ...guided, guidedSteps: ["one"] });
    expectRejected({ ...guided, guidedSteps: ["one", " "] });
    expectRejected({ ...guided, fieldHelp: " " });
    expectRejected({ ...guided, correctAnswers: SOURCE_OUTPUT.expectedAnswer });
    expectRejected({ ...independent, steps: ["one", "two", "three"] });
    expectRejected({ ...independent, finalAnswer: "answer" });
    expectRejected({ ...independent, gradingMetadata: {} });
    expectRejected({ ...independent, score: 1 });
    expectRejected({ ...independent, answer: "quadratic" });
    expectRejected({ ...independent, presentationMode: "unknown" });
  });
});
