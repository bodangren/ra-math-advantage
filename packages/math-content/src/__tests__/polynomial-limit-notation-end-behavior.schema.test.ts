import { describe, expect, it } from "vitest";

import { getPropsSchema, type ActivityComponentKey } from "../schemas";
import {
  polynomialLimitNotationEndBehaviorSchema,
  type PolynomialLimitNotationEndBehaviorProps,
} from "../schemas/polynomial-limit-notation-end-behavior.schema";
import { generateTopic16LimitNotationEndBehaviorOutput } from "../knowledge-space/generators/topic16-limit-notation-end-behavior";

const SOURCE_PROMPT = "Write limit statements for the end behavior of the following polynomials.";

const SOURCE_ITEMS = [
  { id: "a", functionName: "f", expression: "-3x^4" },
  { id: "b", functionName: "g", expression: "5x^3 + 2x^2 - 7" },
] as const;

const SOURCE_ANSWERS = {
  a_leftLimit: "negative_infinity",
  a_rightLimit: "negative_infinity",
  b_leftLimit: "negative_infinity",
  b_rightLimit: "positive_infinity",
} as const;

const SOURCE_STEPS = generateTopic16LimitNotationEndBehaviorOutput(0).solutionSteps.map(
  (step) => step.description,
);
const FINAL_ANSWER = "The four polynomial end-behavior limit statements are shown above.";
const GUIDED_STEPS = [
  "Identify the leading term for each polynomial.",
  "Use degree parity and the leading coefficient.",
  "Write the left-end and right-end limit statements.",
] as const;
const FIELD_HELP = "Choose positive infinity or negative infinity for each formal limit statement.";

type IndependentProps = Extract<
  PolynomialLimitNotationEndBehaviorProps,
  { presentationMode: "independent_practice" }
>;
type WorkedProps = Extract<
  PolynomialLimitNotationEndBehaviorProps,
  { presentationMode: "worked_example" }
>;
type GuidedProps = Extract<
  PolynomialLimitNotationEndBehaviorProps,
  { presentationMode: "guided_practice" }
>;

function independentProps(seed: number): IndependentProps {
  return generateTopic16LimitNotationEndBehaviorOutput(seed).data.rendererProps as IndependentProps;
}

const WORKED_PROPS: WorkedProps = {
  prompt: SOURCE_PROMPT,
  items: SOURCE_ITEMS,
  presentationMode: "worked_example",
  correctAnswers: SOURCE_ANSWERS,
  steps: SOURCE_STEPS,
  finalAnswer: FINAL_ANSWER,
};

const GUIDED_PROPS: GuidedProps = {
  prompt: SOURCE_PROMPT,
  items: SOURCE_ITEMS,
  presentationMode: "guided_practice",
  guidedSteps: GUIDED_STEPS,
  fieldHelp: FIELD_HELP,
};

const AUTHORITY_KEYS = [
  "answer",
  "answers",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "authority",
];

function without(value: object, key: string): Record<string, unknown> {
  const copy = { ...value } as Record<string, unknown>;
  delete copy[key];
  return copy;
}

function withItem(value: IndependentProps, index: number, item: object): Record<string, unknown> {
  const items = [...value.items];
  items[index] = item as (typeof items)[number];
  return { ...value, items };
}

describe("polynomial-limit-notation-end-behavior schema", () => {
  it("accepts the live independent renderer props for seeds 0 through 999", () => {
    for (let seed = 0; seed <= 999; seed += 1) {
      const props = independentProps(seed);
      const parsed = polynomialLimitNotationEndBehaviorSchema.safeParse(props);

      expect(parsed.success).toBe(true);
      expect(Object.keys(props).sort()).toEqual(["items", "presentationMode", "prompt"]);
      expect(props.presentationMode).toBe("independent_practice");
      expect(props.prompt).toBe(SOURCE_PROMPT);
      expect(AUTHORITY_KEYS.some((key) => key in props)).toBe(false);
      expect("seed" in props).toBe(false);
      expect("leadingTerm" in props).toBe(false);
      expect("limitFrame" in props).toBe(false);
    }
  });

  it("accepts exact Worked and Guided mode shapes", () => {
    const worked = polynomialLimitNotationEndBehaviorSchema.safeParse(WORKED_PROPS);
    const guided = polynomialLimitNotationEndBehaviorSchema.safeParse(GUIDED_PROPS);

    expect(worked.success).toBe(true);
    expect(guided.success).toBe(true);
    expect(WORKED_PROPS.correctAnswers).toEqual(SOURCE_ANSWERS);
    expect(WORKED_PROPS.steps).toEqual(SOURCE_STEPS);
    expect(WORKED_PROPS.finalAnswer).toBe(FINAL_ANSWER);
    expect(GUIDED_PROPS.guidedSteps).toHaveLength(3);
    expect(GUIDED_PROPS.guidedSteps.every((step) => step.trim().length > 0)).toBe(true);
    expect(GUIDED_PROPS.fieldHelp.trim().length).toBeGreaterThan(0);
    expect(
      polynomialLimitNotationEndBehaviorSchema.safeParse({
        ...WORKED_PROPS,
        title: "Review polynomial end behavior",
      }).success,
    ).toBe(true);
  });

  it("resolves the exact public schema key", () => {
    const key: ActivityComponentKey = "polynomial-limit-notation-end-behavior";

    expect(getPropsSchema(key)).toBe(polynomialLimitNotationEndBehaviorSchema);
  });

  it("rejects missing, blank, reordered, wrong, extra, and hidden fields", () => {
    const independent = independentProps(1);
    const firstItem = independent.items[0]!;
    const secondItem = independent.items[1]!;
    const invalidValues: unknown[] = [
      without(independent, "prompt"),
      without(independent, "items"),
      without(independent, "presentationMode"),
      { ...independent, prompt: "  " },
      { ...independent, title: "  " },
      { ...independent, items: [] },
      { ...independent, items: [firstItem] },
      { ...independent, items: [firstItem, secondItem, secondItem] },
      { ...independent, items: [secondItem, firstItem] },
      withItem(independent, 0, { ...firstItem, id: "b" }),
      withItem(independent, 0, { ...firstItem, functionName: "g" }),
      withItem(independent, 0, { ...firstItem, expression: " " }),
      withItem(independent, 0, { ...firstItem, extra: "hidden" }),
      { ...independent, seed: 1 },
      { ...independent, leadingTerm: { coefficient: 5, exponent: 3 } },
      { ...independent, limitFrame: {} },
      { ...independent, leftLimit: "negative_infinity" },
      { ...independent, rightLimit: "positive_infinity" },
    ];

    for (const value of invalidValues) {
      expect(polynomialLimitNotationEndBehaviorSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rejects authority fields and mode-specific field leakage", () => {
    const independent = independentProps(1);
    for (const key of [...AUTHORITY_KEYS, "guidedSteps", "fieldHelp"]) {
      expect(
        polynomialLimitNotationEndBehaviorSchema.safeParse({
          ...independent,
          [key]: key === "guidedSteps" ? GUIDED_STEPS : key === "fieldHelp" ? FIELD_HELP : {},
        }).success,
      ).toBe(false);
    }

    expect(
      polynomialLimitNotationEndBehaviorSchema.safeParse({
        ...GUIDED_PROPS,
        correctAnswers: SOURCE_ANSWERS,
      }).success,
    ).toBe(false);
    expect(
      polynomialLimitNotationEndBehaviorSchema.safeParse({
        ...GUIDED_PROPS,
        steps: SOURCE_STEPS,
        finalAnswer: FINAL_ANSWER,
      }).success,
    ).toBe(false);
    expect(
      polynomialLimitNotationEndBehaviorSchema.safeParse({
        ...WORKED_PROPS,
        guidedSteps: GUIDED_STEPS,
        fieldHelp: FIELD_HELP,
      }).success,
    ).toBe(false);
  });

  it("rejects invalid canonical answers and mode-specific field counts", () => {
    expect(
      polynomialLimitNotationEndBehaviorSchema.safeParse({
        ...WORKED_PROPS,
        correctAnswers: { ...SOURCE_ANSWERS, a_leftLimit: "up" },
      }).success,
    ).toBe(false);
    expect(
      polynomialLimitNotationEndBehaviorSchema.safeParse({
        ...WORKED_PROPS,
        correctAnswers: { ...SOURCE_ANSWERS, extra: "positive_infinity" },
      }).success,
    ).toBe(false);
    expect(
      polynomialLimitNotationEndBehaviorSchema.safeParse({
        ...WORKED_PROPS,
        steps: SOURCE_STEPS.slice(0, 1),
      }).success,
    ).toBe(false);
    expect(
      polynomialLimitNotationEndBehaviorSchema.safeParse({
        ...GUIDED_PROPS,
        guidedSteps: GUIDED_STEPS.slice(0, 2),
      }).success,
    ).toBe(false);
    expect(
      polynomialLimitNotationEndBehaviorSchema.safeParse({
        ...GUIDED_PROPS,
        guidedSteps: [...GUIDED_STEPS, "Extra step"],
      }).success,
    ).toBe(false);
    expect(
      polynomialLimitNotationEndBehaviorSchema.safeParse({
        ...WORKED_PROPS,
        presentationMode: "independent_practice",
      }).success,
    ).toBe(false);
    expect(
      polynomialLimitNotationEndBehaviorSchema.safeParse({
        ...GUIDED_PROPS,
        presentationMode: "worked_example",
      }).success,
    ).toBe(false);
  });

  it("rejects missing and blank required fields and mismatched item data", () => {
    const independent = independentProps(1);
    const secondItem = independent.items[1]!;
    const invalidValues: unknown[] = [
      without(WORKED_PROPS, "correctAnswers"),
      without(WORKED_PROPS, "steps"),
      without(WORKED_PROPS, "finalAnswer"),
      without(GUIDED_PROPS, "guidedSteps"),
      without(GUIDED_PROPS, "fieldHelp"),
      { ...WORKED_PROPS, steps: ["", SOURCE_STEPS[1]] },
      { ...WORKED_PROPS, finalAnswer: " " },
      { ...GUIDED_PROPS, guidedSteps: ["", GUIDED_STEPS[1], GUIDED_STEPS[2]] },
      { ...GUIDED_PROPS, fieldHelp: " " },
      { ...independent, unexpected: "unknown" },
      withItem(independent, 1, { ...secondItem, id: "a" }),
      withItem(independent, 1, { ...secondItem, functionName: "f" }),
      {
        ...WORKED_PROPS,
        correctAnswers: {
          a_leftLimit: SOURCE_ANSWERS.a_leftLimit,
          a_rightLimit: SOURCE_ANSWERS.a_rightLimit,
          b_leftLimit: SOURCE_ANSWERS.b_leftLimit,
        },
      },
      withItem(independent, 1, { ...secondItem, expression: " " }),
    ];

    for (const value of invalidValues) {
      expect(polynomialLimitNotationEndBehaviorSchema.safeParse(value).success).toBe(false);
    }
  });
});
