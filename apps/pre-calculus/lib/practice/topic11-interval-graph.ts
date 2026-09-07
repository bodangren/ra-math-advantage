import { generateTopic11IntervalGraph } from "@math-platform/math-content/knowledge-space";
import type { Interval } from "@math-platform/math-content/knowledge-space";

export { generateTopic11IntervalGraph };
export type {
  Interval,
  Topic11IntervalGraphPoint as IntervalGraphPoint,
  Topic11IntervalGraphVariant,
} from "@math-platform/math-content/knowledge-space";

export interface Topic11IntervalAnswers {
  readonly increasingIntervals: string;
  readonly decreasingIntervals: string;
  readonly constantIntervals: string;
}

const INTERVAL_FIELDS = [
  "increasingIntervals",
  "decreasingIntervals",
  "constantIntervals",
] as const;

const NUMBER_PATTERN = "[+-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)";
const INTERVAL_PATTERN = new RegExp(
  `(?:\\[(${NUMBER_PATTERN}),(${NUMBER_PATTERN})\\]|\\((${NUMBER_PATTERN}),(${NUMBER_PATTERN})\\))`,
  "y",
);

function parseIntervals(rawAnswer: string): Interval[] | null {
  if (typeof rawAnswer !== "string") return null;
  const normalized = rawAnswer.replace(/\s+/g, "");
  const emptyAnswer = normalized.toLowerCase();
  if (
    emptyAnswer === "none" ||
    emptyAnswer === "nointerval" ||
    emptyAnswer === "nointervals"
  ) {
    return [];
  }

  const intervals: Interval[] = [];
  let cursor = 0;
  while (cursor < normalized.length) {
    if (intervals.length > 0) {
      const separator = normalized[cursor];
      if (separator !== "U" && separator !== "∪") return null;
      cursor += 1;
    }

    INTERVAL_PATTERN.lastIndex = cursor;
    const match = INTERVAL_PATTERN.exec(normalized);
    if (!match || match.index !== cursor) return null;
    const start = Number(match[1] ?? match[3]);
    const end = Number(match[2] ?? match[4]);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end)
      return null;
    intervals.push([start, end]);
    cursor = INTERVAL_PATTERN.lastIndex;
  }

  return intervals.length > 0 ? intervals : null;
}

function intervalsMatch(
  actual: readonly Interval[],
  expected: readonly Interval[],
): boolean {
  if (actual.length !== expected.length) return false;
  const sortIntervals = (intervals: readonly Interval[]) =>
    [...intervals].sort(
      ([startA, endA], [startB, endB]) => startA - startB || endA - endB,
    );
  return sortIntervals(actual).every(([actualStart, actualEnd], index) => {
    const expectedInterval = sortIntervals(expected)[index];
    return (
      expectedInterval?.[0] === actualStart && expectedInterval[1] === actualEnd
    );
  });
}

export function gradeTopic11IntervalGraph(
  seed: number,
  answers: Topic11IntervalAnswers,
): {
  score: number;
  maxScore: number;
  parts: {
    partId: string;
    rawAnswer: string;
    isCorrect: boolean;
    score: number;
    maxScore: number;
  }[];
} {
  const variant = generateTopic11IntervalGraph(seed);
  const expectedIntervals = {
    increasingIntervals: variant.increasingIntervals,
    decreasingIntervals: variant.decreasingIntervals,
    constantIntervals: variant.constantIntervals,
  } satisfies Record<keyof Topic11IntervalAnswers, readonly Interval[]>;
  const parts = INTERVAL_FIELDS.map((partId) => {
    const rawAnswer = answers[partId];
    const parsed = parseIntervals(rawAnswer);
    const isCorrect =
      parsed !== null && intervalsMatch(parsed, expectedIntervals[partId]);
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
    maxScore: 3,
    parts,
  };
}
