import { generatorOutputSchema } from "@math-platform/knowledge-space-practice";
import { describe, expect, it } from "vitest";

import {
  generateTopic15PolynomialInequality,
  generateTopic15PolynomialInequalityOutput,
  getGenerator,
  TOPIC15_POLYNOMIAL_INEQUALITY_SIGN_CHART_NODE_ID,
} from "../../index";

const GENERATOR_KEY = "topic15-polynomial-inequality-sign-chart";
const NODE_ID = "math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts";
const OPERATORS = ["<", "<=", ">", ">="] as const;
const SIGNS = ["+", "-"] as const;
type Operator = (typeof OPERATORS)[number];
type Sign = (typeof SIGNS)[number];
type Bound = number | "-∞" | "∞";
type Interval = {
  left: Bound;
  right: Bound;
  leftClosed: boolean;
  rightClosed: boolean;
};
type GeneratedVariant = {
  seed: number;
  prompt: string;
  expression: string;
  operator: Operator;
  distinctRootCount: number;
};
type GeneratedOutput = {
  prompt: string;
  data: {
    seed: number;
    rendererProps: Record<string, unknown>;
  };
  expectedAnswer: {
    roots: number[];
    intervalSigns: Sign[];
    solution: string;
  };
  solutionSteps: Array<{ description: string }>;
  gradingMetadata: {
    partAnswers: GeneratedOutput["expectedAnswer"];
    partMaxScores: { roots: number; intervalSigns: number; solution: number };
    partGradingRules: { roots: "custom"; intervalSigns: "exact_match"; solution: "custom" };
  };
};

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

function formatBound(bound: Bound): string {
  return typeof bound === "number" ? String(bound) : bound;
}

function boundValue(bound: Bound): number {
  if (bound === "-∞") return Number.NEGATIVE_INFINITY;
  if (bound === "∞") return Number.POSITIVE_INFINITY;
  return bound;
}

function rebuildCanonicalSolution(roots: number[], signs: Sign[], operator: Operator): string {
  const keepsPositive = operator === ">" || operator === ">=";
  const inclusive = operator === "<=" || operator === ">=";
  const intervals: Interval[] = roots.map((root, index) => ({
    left: index === 0 ? "-∞" : roots[index - 1],
    right: root,
    leftClosed: index > 0 && inclusive,
    rightClosed: inclusive,
  }));
  intervals.push({
    left: roots[roots.length - 1] ?? "-∞",
    right: "∞",
    leftClosed: inclusive,
    rightClosed: false,
  });

  const selected = intervals.filter((_, index) =>
    keepsPositive ? signs[index] === "+" : signs[index] === "-",
  );
  if (inclusive) {
    for (const root of roots) {
      selected.push({ left: root, right: root, leftClosed: true, rightClosed: true });
    }
  }
  selected.sort(
    (left, right) =>
      boundValue(left.left) - boundValue(right.left) ||
      boundValue(left.right) - boundValue(right.right),
  );
  const merged: Interval[] = [];
  for (const interval of selected) {
    const previous = merged.at(-1);
    if (
      previous &&
      previous.right === interval.left &&
      previous.rightClosed &&
      interval.leftClosed
    ) {
      previous.right = interval.right;
      previous.rightClosed = interval.rightClosed;
    } else {
      merged.push({ ...interval });
    }
  }

  return merged
    .map((interval) => {
      const leftMark = interval.leftClosed ? "[" : "(";
      const rightMark = interval.rightClosed ? "]" : ")";
      return `${leftMark}${formatBound(interval.left)}, ${formatBound(interval.right)}${rightMark}`;
    })
    .join(" ∪ ");
}

function expectPracticeProps(output: GeneratedOutput, variant: GeneratedVariant): void {
  expect(output.data.rendererProps).toEqual({
    prompt: variant.prompt,
    expression: variant.expression,
    operator: variant.operator,
    distinctRootCount: variant.distinctRootCount,
    presentationMode: "independent_practice",
  });
  for (const key of [
    "answer",
    "answers",
    "correctAnswer",
    "correctAnswers",
    "criticalPoints",
    "expectedAnswer",
    "grading",
    "gradingMetadata",
    "intervalSigns",
    "roots",
    "signs",
    "solution",
    "solutionSteps",
    "testPoints",
  ]) {
    expect(serializedKeys(output.data.rendererProps)).not.toContain(key);
  }
}

describe("Topic 1.5 polynomial inequality sign-chart generator", () => {
  it("reproduces the three authored Topic 1.5 problems", () => {
    const cases = [
      {
        seed: 0,
        expression: "(x - 3)(x + 1)(x + 4)",
        operator: ">" as const,
        roots: [-4, -1, 3],
        intervalSigns: ["-", "+", "-", "+"] as Sign[],
        solution: "(-4, -1) ∪ (3, ∞)",
        sourceFacts: ["-4", "-1", "3", "-5", "-2", "0", "4", "strict"],
      },
      {
        seed: 1,
        expression: "(x+2)^2(x-5)",
        operator: "<=" as const,
        roots: [-2, 5],
        intervalSigns: ["-", "-", "+"] as Sign[],
        solution: "(-∞, 5]",
        sourceFacts: ["-2", "5", "even", "odd", "include"],
      },
      {
        seed: 2,
        expression: "(x+3)(x-1)(x-2)",
        operator: "<" as const,
        roots: [-3, 1, 2],
        intervalSigns: ["-", "+", "-", "+"] as Sign[],
        solution: "(-∞, -3) ∪ (1, 2)",
        sourceFacts: ["-3", "1", "2", "strict"],
      },
    ];

    for (const expected of cases) {
      const variant = generateTopic15PolynomialInequality(expected.seed) as GeneratedVariant;
      const output = generateTopic15PolynomialInequalityOutput(expected.seed) as GeneratedOutput;

      expect(variant.seed).toBe(expected.seed);
      expect(variant.expression).toBe(expected.expression);
      expect(variant.operator).toBe(expected.operator);
      expect(variant.distinctRootCount).toBe(expected.roots.length);
      expect(variant.prompt).toContain(expected.expression);
      expect(variant.prompt).toContain(expected.operator);
      expect(output.prompt).toBe(variant.prompt);
      expect(output.data.seed).toBe(expected.seed);
      expect(output.expectedAnswer).toEqual({
        roots: expected.roots,
        intervalSigns: expected.intervalSigns,
        solution: expected.solution,
      });
      expectPracticeProps(output, variant);
      expect(output.solutionSteps.length).toBeGreaterThanOrEqual(4);
      const solutionText = output.solutionSteps
        .map((step) => step.description)
        .join(" ")
        .toLowerCase();
      for (const fact of expected.sourceFacts) expect(solutionText).toContain(fact.toLowerCase());
      expect(solutionText).toContain(expected.solution.toLowerCase());
      expect(output.gradingMetadata).toEqual({
        partAnswers: {
          roots: expected.roots,
          intervalSigns: expected.intervalSigns,
          solution: expected.solution,
        },
        partMaxScores: { roots: 1, intervalSigns: 1, solution: 1 },
        partGradingRules: { roots: "custom", intervalSigns: "exact_match", solution: "custom" },
      });
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
    }
  });

  it("rebuilds the canonical solution from the structured sign chart", () => {
    for (let seed = 0; seed <= 50; seed += 1) {
      const output = generateTopic15PolynomialInequalityOutput(seed) as GeneratedOutput;
      const { roots, intervalSigns, solution } = output.expectedAnswer;
      const variant = generateTopic15PolynomialInequality(seed) as GeneratedVariant;

      expect(roots).toEqual([...roots].sort((left, right) => left - right));
      expect(new Set(roots).size).toBe(roots.length);
      expect(intervalSigns).toHaveLength(variant.distinctRootCount + 1);
      expect(solution).toBe(rebuildCanonicalSolution(roots, intervalSigns, variant.operator));
    }
  });

  it("includes an isolated inclusive root as a singleton interval", () => {
    const sampledSeed = Array.from({ length: 48 }, (_, index) => index + 3).find((seed) => {
      const variant = generateTopic15PolynomialInequality(seed) as GeneratedVariant;
      const output = generateTopic15PolynomialInequalityOutput(seed) as GeneratedOutput;
      return variant.operator === ">=" && output.expectedAnswer.intervalSigns.join(",") === "-,-,+";
    });
    expect(sampledSeed).toBeDefined();

    const variant = generateTopic15PolynomialInequality(sampledSeed as number) as GeneratedVariant;
    const output = generateTopic15PolynomialInequalityOutput(
      sampledSeed as number,
    ) as GeneratedOutput;
    const { roots, intervalSigns } = output.expectedAnswer;
    const expectedSolution = rebuildCanonicalSolution(roots, intervalSigns, variant.operator);

    expect(roots).toHaveLength(2);
    expect(expectedSolution).toBe(`[${roots[0]}, ${roots[0]}] ∪ [${roots[1]}, ∞)`);
    expect(output.expectedAnswer.solution).toBe(expectedSolution);
  });

  it("generates the two bounded families with all strict and inclusive operators", () => {
    const operators = new Set<Operator>();
    const families = new Set<number>();
    const expressions = new Set<string>();

    for (let seed = 3; seed <= 50; seed += 1) {
      const variant = generateTopic15PolynomialInequality(seed) as GeneratedVariant;
      const output = generateTopic15PolynomialInequalityOutput(seed) as GeneratedOutput;
      const { roots, intervalSigns } = output.expectedAnswer;

      expect(variant).toEqual(generateTopic15PolynomialInequality(seed));
      expect(output).toEqual(generateTopic15PolynomialInequalityOutput(seed));
      operators.add(variant.operator);
      families.add(variant.distinctRootCount);
      expressions.add(variant.expression);
      expect(roots).toHaveLength(variant.distinctRootCount);
      expect(roots.every((root) => Number.isInteger(root) && root >= -5 && root <= 5)).toBe(true);
      expect(new Set(roots).size).toBe(roots.length);
      expect(variant.distinctRootCount === 2 || variant.distinctRootCount === 3).toBe(true);
      expect(intervalSigns.every((sign) => sign === "+" || sign === "-")).toBe(true);

      if (variant.distinctRootCount === 2) {
        expect(["<=", ">="]).toContain(variant.operator);
        expect(intervalSigns).toHaveLength(3);
        expect(intervalSigns[2]).toBe("+");
        expect(
          intervalSigns.slice(0, -1).filter((sign, index) => sign !== intervalSigns[index + 1]),
        ).toHaveLength(1);
      } else {
        expect(["<", ">"]).toContain(variant.operator);
        expect(intervalSigns).toEqual(["-", "+", "-", "+"]);
      }
    }

    expect(families).toEqual(new Set([2, 3]));
    expect(operators).toEqual(new Set(OPERATORS));
    expect(expressions.size).toBeGreaterThanOrEqual(10);
  });

  it("resolves the exact generator identity through the public registry seam", () => {
    const generator = getGenerator(GENERATOR_KEY);

    expect(generator.key).toBe(GENERATOR_KEY);
    expect(generator.nodeIds).toEqual([NODE_ID]);
    expect(TOPIC15_POLYNOMIAL_INEQUALITY_SIGN_CHART_NODE_ID).toBe(NODE_ID);
    expect(generator.generate({ nodeId: NODE_ID, seed: 7, difficulty: 0.5 })).toEqual(
      generateTopic15PolynomialInequalityOutput(7),
    );
  });

  it("rejects invalid seeds at the public boundary", () => {
    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
      "1",
      null,
      undefined,
    ]) {
      expect(() => generateTopic15PolynomialInequality(seed as number)).toThrow(RangeError);
      expect(() => generateTopic15PolynomialInequalityOutput(seed as number)).toThrow(RangeError);
    }
  });
});
