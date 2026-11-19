import type { GeneratorOutput } from "@math-platform/knowledge-space-practice";

import { mulberry32 } from "../../utils/prng";

export type Topic15PolynomialInequalityOperator = "<" | "<=" | ">" | ">=";
export type Topic15PolynomialInequalitySign = "+" | "-";

export interface Topic15PolynomialInequalityVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly expression: string;
  readonly operator: Topic15PolynomialInequalityOperator;
  readonly distinctRootCount: number;
}

export interface Topic15PolynomialInequalityAnswers {
  readonly roots: readonly number[];
  readonly intervalSigns: readonly Topic15PolynomialInequalitySign[];
  readonly solution: string;
}

export const TOPIC15_POLYNOMIAL_INEQUALITY_SIGN_CHART_NODE_ID =
  "math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts";

type Factor = {
  readonly root: number;
  readonly multiplicity: 1 | 2;
};

type InternalVariant = Topic15PolynomialInequalityVariant & {
  readonly factors: readonly Factor[];
};

type Bound = number | "-∞" | "∞";

type Interval = {
  left: Bound;
  right: Bound;
  leftClosed: boolean;
  rightClosed: boolean;
};

function validateSeed(seed: number): void {
  if (typeof seed !== "number" || !Number.isSafeInteger(seed) || seed < 0) {
    throw new RangeError("seed must be a non-negative safe integer");
  }
}

function formatFactor(factor: Factor, compact: boolean): string {
  const rootText =
    factor.root === 0
      ? "x"
      : compact
        ? `(x${factor.root < 0 ? "+" : "-"}${Math.abs(factor.root)})`
        : `(x ${factor.root < 0 ? "+" : "-"} ${Math.abs(factor.root)})`;
  return factor.multiplicity === 1 ? rootText : `${rootText}^${factor.multiplicity}`;
}

function formatExpression(factors: readonly Factor[], compact: boolean): string {
  return factors.map((factor) => formatFactor(factor, compact)).join("");
}

function sourceVariant(seed: 0 | 1 | 2): InternalVariant {
  if (seed === 0) {
    const factors = [
      { root: 3, multiplicity: 1 },
      { root: -1, multiplicity: 1 },
      { root: -4, multiplicity: 1 },
    ] as const;
    return {
      seed,
      prompt: "Solve (x - 3)(x + 1)(x + 4) > 0.",
      expression: "(x - 3)(x + 1)(x + 4)",
      operator: ">",
      distinctRootCount: 3,
      factors,
    };
  }

  if (seed === 1) {
    const factors = [
      { root: -2, multiplicity: 2 },
      { root: 5, multiplicity: 1 },
    ] as const;
    return {
      seed,
      prompt: "Solve (x+2)^2(x-5) <= 0.",
      expression: "(x+2)^2(x-5)",
      operator: "<=",
      distinctRootCount: 2,
      factors,
    };
  }

  const factors = [
    { root: -3, multiplicity: 1 },
    { root: 1, multiplicity: 1 },
    { root: 2, multiplicity: 1 },
  ] as const;
  return {
    seed,
    prompt: "Solve (x+3)(x-1)(x-2) < 0.",
    expression: "(x+3)(x-1)(x-2)",
    operator: "<",
    distinctRootCount: 3,
    factors,
  };
}

function chooseRoots(random: () => number, count: number): number[] {
  const roots: number[] = [];
  while (roots.length < count) {
    const root = -5 + Math.floor(random() * 11);
    if (!roots.includes(root)) roots.push(root);
  }
  return roots.sort((left, right) => left - right);
}

function generatedVariant(seed: number): InternalVariant {
  const random = mulberry32(seed);
  const useTwoRootFamily = seed % 2 === 1;
  const rootCount = useTwoRootFamily ? 2 : 3;
  const roots = chooseRoots(random, rootCount);
  const factors: Factor[] = useTwoRootFamily
    ? roots.map((root, index) => ({
        root,
        multiplicity: (index === 0 ? (random() < 0.5 ? 2 : 1) : 1) as 1 | 2,
      }))
    : roots.map((root) => ({ root, multiplicity: 1 as const }));

  if (useTwoRootFamily && factors.every((factor) => factor.multiplicity === 1)) {
    factors[0] = { root: factors[0]?.root ?? roots[0] ?? 0, multiplicity: 2 };
  }

  const operator = useTwoRootFamily ? (seed % 4 < 2 ? "<=" : ">=") : seed % 4 < 2 ? "<" : ">";
  const expression = formatExpression(factors, true);
  return {
    seed,
    prompt: `Solve ${expression} ${operator} 0.`,
    expression,
    operator,
    distinctRootCount: rootCount,
    factors,
  };
}

function buildVariant(seed: number): InternalVariant {
  return seed <= 2 ? sourceVariant(seed as 0 | 1 | 2) : generatedVariant(seed);
}

function evaluateSign(
  factors: readonly Factor[],
  testPoint: number,
): Topic15PolynomialInequalitySign {
  let value = 1;
  for (const factor of factors) {
    value *= (testPoint - factor.root) ** factor.multiplicity;
  }
  return value > 0 ? "+" : "-";
}

function buildTestPoints(roots: readonly number[], seed: number): number[] {
  if (seed === 0) return [-5, -2, 0, 4];
  if (seed === 1) return [-3, 0, 6];
  if (seed === 2) return [-4, -1, 1.5, 3];

  const points: number[] = [];
  for (let index = 0; index <= roots.length; index += 1) {
    if (index === 0) {
      points.push((roots[0] ?? 0) - 1);
    } else if (index === roots.length) {
      points.push((roots[roots.length - 1] ?? 0) + 1);
    } else {
      points.push(((roots[index - 1] ?? 0) + (roots[index] ?? 0)) / 2);
    }
  }
  return points;
}

function formatBound(bound: Bound): string {
  return typeof bound === "number" ? String(bound) : bound;
}

function boundValue(bound: Bound): number {
  if (bound === "-∞") return Number.NEGATIVE_INFINITY;
  if (bound === "∞") return Number.POSITIVE_INFINITY;
  return bound;
}

function buildSolution(
  roots: readonly number[],
  signs: readonly Topic15PolynomialInequalitySign[],
  operator: Topic15PolynomialInequalityOperator,
): string {
  const keepsPositive = operator === ">" || operator === ">=";
  const inclusive = operator === "<=" || operator === ">=";
  const intervals: Interval[] = roots.map((root, index) => ({
    left: index === 0 ? "-∞" : (roots[index - 1] ?? "-∞"),
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

function formatPoints(points: readonly number[]): string {
  return points.join(", ");
}

function formatSigns(signs: readonly Topic15PolynomialInequalitySign[]): string {
  return signs.join(", ");
}

function buildSolutionSteps(
  variant: InternalVariant,
  roots: readonly number[],
  points: readonly number[],
  signs: readonly Topic15PolynomialInequalitySign[],
  solution: string,
): Array<{ description: string }> {
  const rootDescription = roots
    .map((root) => {
      const factor = variant.factors.find((entry) => entry.root === root);
      const multiplicity = factor?.multiplicity ?? 1;
      const parity = multiplicity % 2 === 0 ? "even" : "odd";
      return `x = ${root} (${parity} multiplicity ${multiplicity})`;
    })
    .join(", ");
  const endpointRule =
    variant.operator === "<" || variant.operator === ">"
      ? "The inequality is strict, so the roots are not included."
      : `The inequality is inclusive (${variant.operator}), so the roots are included where the polynomial equals zero.`;
  return [
    { description: `The critical points are ${rootDescription}.` },
    {
      description: `Test points ${formatPoints(points)} give signs ${formatSigns(signs)} from left to right.`,
    },
    { description: endpointRule },
    { description: `Therefore, the solution is ${solution}.` },
  ];
}

export function generateTopic15PolynomialInequality(
  seed: number,
): Topic15PolynomialInequalityVariant {
  validateSeed(seed);
  const variant = buildVariant(seed);
  return {
    seed: variant.seed,
    prompt: variant.prompt,
    expression: variant.expression,
    operator: variant.operator,
    distinctRootCount: variant.distinctRootCount,
  };
}

export function generateTopic15PolynomialInequalityOutput(seed: number): GeneratorOutput {
  validateSeed(seed);
  const variant = buildVariant(seed);
  const roots = variant.factors.map((factor) => factor.root).sort((left, right) => left - right);
  const testPoints = buildTestPoints(roots, seed);
  const intervalSigns = testPoints.map((point) => evaluateSign(variant.factors, point));
  const solution = buildSolution(roots, intervalSigns, variant.operator);
  const expectedAnswer = {
    roots,
    intervalSigns,
    solution,
  } satisfies Topic15PolynomialInequalityAnswers;

  return {
    prompt: variant.prompt,
    data: {
      seed,
      rendererProps: {
        prompt: variant.prompt,
        expression: variant.expression,
        operator: variant.operator,
        distinctRootCount: variant.distinctRootCount,
        presentationMode: "independent_practice",
      },
    },
    expectedAnswer,
    solutionSteps: buildSolutionSteps(variant, roots, testPoints, intervalSigns, solution),
    gradingMetadata: {
      partAnswers: expectedAnswer,
      partMaxScores: { roots: 1, intervalSigns: 1, solution: 1 },
      partGradingRules: { roots: "custom", intervalSigns: "exact_match", solution: "custom" },
    },
  };
}
