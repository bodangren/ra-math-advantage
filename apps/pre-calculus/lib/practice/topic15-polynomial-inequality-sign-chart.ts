import { generateTopic15PolynomialInequalityOutput } from "@math-platform/math-content/knowledge-space";

export interface Topic15PolynomialInequalitySignChartAnswers {
  readonly roots: readonly number[];
  readonly intervalSigns: readonly ("+" | "-")[];
  readonly solution: string;
}

type Bound = number | "-infinity" | "infinity";
type ParsedInterval = {
  readonly left: Bound;
  readonly right: Bound;
  readonly leftClosed: boolean;
  readonly rightClosed: boolean;
};

function parseEndpoint(value: string): Bound | null {
  const normalized = value.trim().toLowerCase();
  if (
    normalized === "∞" ||
    normalized === "+∞" ||
    normalized === "inf" ||
    normalized === "+inf" ||
    normalized === "infinity" ||
    normalized === "+infinity"
  )
    return "infinity";
  if (normalized === "-∞" || normalized === "-inf" || normalized === "-infinity")
    return "-infinity";
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function boundValue(bound: Bound): number {
  if (bound === "-infinity") return Number.NEGATIVE_INFINITY;
  if (bound === "infinity") return Number.POSITIVE_INFINITY;
  return bound;
}

function parseInterval(value: string): ParsedInterval | null {
  const text = value.trim();
  if (text.length < 5) return null;
  const opening = text[0];
  const closing = text.at(-1);
  if ((opening !== "(" && opening !== "[") || (closing !== ")" && closing !== "]")) return null;

  const body = text.slice(1, -1);
  const comma = body.indexOf(",");
  if (comma <= 0 || comma !== body.lastIndexOf(",")) return null;
  const left = parseEndpoint(body.slice(0, comma));
  const right = parseEndpoint(body.slice(comma + 1));
  if (left === null || right === null) return null;

  const leftValue = boundValue(left);
  const rightValue = boundValue(right);
  const leftClosed = opening === "[";
  const rightClosed = closing === "]";
  if (leftValue > rightValue) return null;
  if (leftValue === rightValue && !(leftClosed && rightClosed && Number.isFinite(leftValue)))
    return null;
  if (left === "-infinity" || left === "infinity") {
    if (leftClosed) return null;
  }
  if (right === "-infinity" || right === "infinity") {
    if (rightClosed) return null;
  }

  return { left, right, leftClosed, rightClosed };
}

function parseSolution(value: unknown): ParsedInterval[] | null {
  if (typeof value !== "string") return null;
  const components = value.trim().split(/\s*(?:∪|\bU\b)\s*/);
  if (components.length === 0 || components.some((component) => component.trim().length === 0))
    return null;
  const parsed = components.map(parseInterval);
  if (parsed.some((interval) => interval === null)) return null;
  return parsed as ParsedInterval[];
}

function sortIntervals(intervals: readonly ParsedInterval[]): ParsedInterval[] {
  return [...intervals].sort(
    (left, right) =>
      boundValue(left.left) - boundValue(right.left) ||
      boundValue(left.right) - boundValue(right.right) ||
      Number(left.leftClosed) - Number(right.leftClosed) ||
      Number(left.rightClosed) - Number(right.rightClosed),
  );
}

function sameIntervals(left: readonly ParsedInterval[], right: readonly ParsedInterval[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((interval, index) => {
    const expected = right[index];
    return (
      expected !== undefined &&
      interval.left === expected.left &&
      interval.right === expected.right &&
      interval.leftClosed === expected.leftClosed &&
      interval.rightClosed === expected.rightClosed
    );
  });
}

function gradeRoots(rawAnswer: unknown, expectedRoots: readonly number[]): boolean {
  if (!Array.isArray(rawAnswer) || rawAnswer.length !== expectedRoots.length) return false;
  if (
    !rawAnswer.every(
      (root) => typeof root === "number" && Number.isFinite(root) && Number.isSafeInteger(root),
    )
  ) {
    return false;
  }
  const actual = [...rawAnswer].sort((left, right) => left - right) as number[];
  const expected = [...expectedRoots].sort((left, right) => left - right);
  return actual.every((root, index) => root === expected[index]);
}

function gradeSigns(rawAnswer: unknown, expectedSigns: readonly ("+" | "-")[]): boolean {
  return (
    Array.isArray(rawAnswer) &&
    rawAnswer.length === expectedSigns.length &&
    rawAnswer.every((sign, index) => sign === expectedSigns[index])
  );
}

export function gradeTopic15PolynomialInequalitySignChart(
  seed: number,
  answers: Topic15PolynomialInequalitySignChartAnswers,
) {
  const expected = generateTopic15PolynomialInequalityOutput(seed);
  const submitted =
    answers && typeof answers === "object"
      ? (answers as {
          roots?: unknown;
          intervalSigns?: unknown;
          solution?: unknown;
        })
      : {};
  const rawRoots = submitted.roots;
  const rawIntervalSigns = submitted.intervalSigns;
  const rawSolution = submitted.solution;
  const expectedRoots = expected.expectedAnswer.roots as readonly number[];
  const expectedIntervalSigns = expected.expectedAnswer.intervalSigns as readonly ("+" | "-")[];
  const expectedSolution = parseSolution(expected.expectedAnswer.solution);
  const actualSolution = parseSolution(rawSolution);
  const rootsCorrect = gradeRoots(rawRoots, expectedRoots);
  const intervalSignsCorrect = gradeSigns(rawIntervalSigns, expectedIntervalSigns);
  const solutionCorrect =
    expectedSolution !== null &&
    actualSolution !== null &&
    sameIntervals(sortIntervals(actualSolution), sortIntervals(expectedSolution));

  const parts = [
    {
      partId: "roots" as const,
      rawAnswer: rawRoots,
      isCorrect: rootsCorrect,
      score: rootsCorrect ? 1 : 0,
      maxScore: 1,
    },
    {
      partId: "intervalSigns" as const,
      rawAnswer: rawIntervalSigns,
      isCorrect: intervalSignsCorrect,
      score: intervalSignsCorrect ? 1 : 0,
      maxScore: 1,
    },
    {
      partId: "solution" as const,
      rawAnswer: rawSolution,
      isCorrect: solutionCorrect,
      score: solutionCorrect ? 1 : 0,
      maxScore: 1,
    },
  ];

  return {
    score: parts.reduce((total, part) => total + part.score, 0),
    maxScore: 3,
    parts,
  };
}
