import { describe, expect, it } from "vitest";

import {
  generateTopic16EquationEndBehavior,
  generateTopic16EquationEndBehaviorOutput,
} from "../topic16-equation-end-behavior";

const SOURCE_PROMPT =
  "Determine the end behavior for the following polynomials. Limit notation is not necessary.";

const SOURCE_ITEMS = [
  { id: "a", functionName: "f", expression: "4x^5" },
  { id: "b", functionName: "g", expression: "(1/2)x^4" },
  { id: "c", functionName: "y", expression: "-2(x + 3)^6" },
  { id: "d", functionName: "h", expression: "3 - x^5" },
  { id: "e", functionName: "k", expression: "8x^2 + 4 - x^5" },
  { id: "f", functionName: "m", expression: "2x(x - 1)(6 - x)" },
] as const;

const SOURCE_ANSWERS = {
  a_leftEnd: "down",
  a_rightEnd: "up",
  b_leftEnd: "up",
  b_rightEnd: "up",
  c_leftEnd: "down",
  c_rightEnd: "down",
  d_leftEnd: "up",
  d_rightEnd: "down",
  e_leftEnd: "up",
  e_rightEnd: "down",
  f_leftEnd: "up",
  f_rightEnd: "down",
} as const;

const SOURCE_SOLUTION_STEPS = [
  "a) The leading term is 4x^5. The degree is odd and the leading coefficient is positive, so the left end is down and the right end is up.",
  "b) The leading term is (1/2)x^4. The degree is even and the leading coefficient is positive, so both ends are up.",
  "c) The leading term is -2x^6. The degree is even and the leading coefficient is negative, so both ends are down.",
  "d) The leading term is -x^5. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.",
  "e) The leading term is -x^5. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.",
  "f) The leading term is -2x^3. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.",
] as const;

const PART_IDS = Object.keys(SOURCE_ANSWERS);
const SOURCE_MAX_SCORES = Object.fromEntries(PART_IDS.map((partId) => [partId, 1]));
const SOURCE_GRADING_RULES = Object.fromEntries(PART_IDS.map((partId) => [partId, "exact_match"]));

const AUTHORITY_KEYS = [
  "answer",
  "answers",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "maxScore",
  "score",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "authority",
];

type GeneratedOutput = {
  readonly prompt: string;
  readonly data: {
    readonly seed: number;
    readonly rendererProps: Record<string, unknown>;
  };
  readonly expectedAnswer: Record<string, string>;
  readonly solutionSteps: ReadonlyArray<{ description: string }>;
  readonly gradingMetadata: {
    readonly partAnswers: Record<string, string>;
    readonly partMaxScores: Record<string, number>;
    readonly partGradingRules: Record<string, string>;
  };
};

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

function expectNoAuthority(value: unknown): void {
  for (const key of serializedKeys(value)) {
    expect(AUTHORITY_KEYS).not.toContain(key);
  }
}

function asOutput(value: unknown): GeneratedOutput {
  return value as GeneratedOutput;
}

describe("Topic 1.6 equation end-behavior generator", () => {
  it("rejects invalid negative, fractional, and unsafe seeds", () => {
    for (const seed of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => generateTopic16EquationEndBehavior(seed)).toThrow(RangeError);
      expect(() => generateTopic16EquationEndBehaviorOutput(seed)).toThrow(RangeError);
    }
  });

  it("reproduces the six authored PDF Example 3 items at seed 0", () => {
    const output = asOutput(generateTopic16EquationEndBehaviorOutput(0));

    expect(output.prompt).toBe(SOURCE_PROMPT);
    expect(output.data.seed).toBe(0);
    expect(output.data.rendererProps).toEqual({
      prompt: SOURCE_PROMPT,
      items: SOURCE_ITEMS,
      presentationMode: "independent_practice",
    });
    expect(Object.keys(output.data.rendererProps).sort()).toEqual([
      "items",
      "presentationMode",
      "prompt",
    ]);
    expect(output.expectedAnswer).toEqual(SOURCE_ANSWERS);
    expect(output.solutionSteps.map((step) => step.description)).toEqual(SOURCE_SOLUTION_STEPS);
    expect(output.gradingMetadata).toEqual({
      partAnswers: SOURCE_ANSWERS,
      partMaxScores: SOURCE_MAX_SCORES,
      partGradingRules: SOURCE_GRADING_RULES,
    });
    expect(Object.values(output.gradingMetadata.partMaxScores)).toEqual(
      Array.from({ length: 12 }, () => 1),
    );
    expect(Object.values(output.gradingMetadata.partGradingRules)).toEqual(
      Array.from({ length: 12 }, () => "exact_match"),
    );
    expectNoAuthority(output.data.rendererProps);
  });

  it("is deterministic for repeated nonzero seeds and varies seed 1 from seed 2", () => {
    expect(generateTopic16EquationEndBehavior(1)).toEqual(generateTopic16EquationEndBehavior(1));
    expect(generateTopic16EquationEndBehaviorOutput(1)).toEqual(
      generateTopic16EquationEndBehaviorOutput(1),
    );
    expect(generateTopic16EquationEndBehavior(1)).not.toEqual(
      generateTopic16EquationEndBehavior(2),
    );
  });

  it("preserves six item identities and generates all six required form categories", () => {
    const expectedIds = SOURCE_ITEMS.map((item) => item.id);
    const expectedFunctionNames = SOURCE_ITEMS.map((item) => item.functionName);
    const outputs = [1, 2].map((seed) => asOutput(generateTopic16EquationEndBehaviorOutput(seed)));

    for (const output of outputs) {
      const rendererProps = output.data.rendererProps;
      const items = rendererProps.items as Array<{
        id: string;
        functionName: string;
        expression: string;
      }>;
      expect(items).toHaveLength(6);
      expect(items.map((item) => item.id)).toEqual(expectedIds);
      expect(items.map((item) => item.functionName)).toEqual(expectedFunctionNames);
      expect(Object.keys(rendererProps).sort()).toEqual(["items", "presentationMode", "prompt"]);
      expect(rendererProps.presentationMode).toBe("independent_practice");
      expect(Object.keys(output.expectedAnswer)).toHaveLength(12);
      expect(output.expectedAnswer).toEqual(output.gradingMetadata.partAnswers);
      expect(
        Object.values(output.expectedAnswer).every((value) => value === "up" || value === "down"),
      ).toBe(true);
      expectNoAuthority(rendererProps);

      const expressions = items.map((item) => item.expression);
      expect(expressions[0]).toMatch(/x\^\d+$/);
      expect(expressions[1]).toMatch(/^\(\d+\/\d+\)x\^\d+$/);
      expect(expressions[2]).toMatch(/^[-\d]+\(x [+-] \d+\)\^\d+$/);
      expect(expressions[3]).toMatch(/^[-\d]+ - [-\d]*x\^\d+$/);
      expect(expressions[4]).toMatch(/x\^\d+.*[+-].*x\^\d+/);
      expect(expressions[5]).toMatch(/^[-\d]*x\([^)]*\)\([^)]*\)$/);
    }
  });
});
