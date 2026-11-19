import { generateTopic15RealZerosAndMultiplicitiesOutput } from "@math-platform/math-content/knowledge-space";

export interface Topic15RealZerosAndMultiplicitiesPair {
  readonly zero: number;
  readonly multiplicity: number;
}

export interface Topic15RealZerosAndMultiplicitiesAnswers {
  readonly a: readonly Topic15RealZerosAndMultiplicitiesPair[];
  readonly b: readonly Topic15RealZerosAndMultiplicitiesPair[];
}

type PartId = "a" | "b";
type Pair = Topic15RealZerosAndMultiplicitiesPair;

const PART_IDS: readonly PartId[] = ["a", "b"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isCanonicalPairs(value: unknown): value is readonly Pair[] {
  if (!Array.isArray(value) || (value.length !== 2 && value.length !== 3)) return false;

  const zeros = new Set<number>();
  return value.every((pair) => {
    if (!isRecord(pair) || Object.keys(pair).sort().join(",") !== "multiplicity,zero") return false;
    if (typeof pair.zero !== "number" || !Number.isSafeInteger(pair.zero)) return false;
    if (
      typeof pair.multiplicity !== "number" ||
      !Number.isSafeInteger(pair.multiplicity) ||
      pair.multiplicity < 1 ||
      pair.multiplicity > 6
    )
      return false;
    if (zeros.has(pair.zero)) return false;
    zeros.add(pair.zero);
    return true;
  });
}

function hasExpectedPairs(submitted: readonly Pair[], expected: readonly Pair[]): boolean {
  if (submitted.length !== expected.length) return false;
  const submittedSorted = [...submitted].sort((left, right) => left.zero - right.zero);
  const expectedSorted = [...expected].sort((left, right) => left.zero - right.zero);
  return submittedSorted.every((pair, index) => {
    const expectedPair = expectedSorted[index];
    return (
      expectedPair !== undefined &&
      pair.zero === expectedPair.zero &&
      pair.multiplicity === expectedPair.multiplicity
    );
  });
}

export function gradeTopic15RealZerosAndMultiplicities(
  seed: number,
  answers: Topic15RealZerosAndMultiplicitiesAnswers,
): {
  score: number;
  maxScore: number;
  parts: {
    partId: string;
    rawAnswer: unknown;
    isCorrect: boolean;
    score: number;
    maxScore: number;
  }[];
} {
  const expected = generateTopic15RealZerosAndMultiplicitiesOutput(seed).expectedAnswer as {
    a: readonly Pair[];
    b: readonly Pair[];
  };
  const parts = PART_IDS.map((partId) => {
    const rawAnswer = isRecord(answers) ? answers[partId] : undefined;
    const isCorrect = isCanonicalPairs(rawAnswer) && hasExpectedPairs(rawAnswer, expected[partId]);
    return {
      partId,
      rawAnswer,
      isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1,
    };
  });

  return {
    score: parts.reduce((total, part) => total + part.score, 0),
    maxScore: 2,
    parts,
  };
}
