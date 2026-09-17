import { generateTopic14PolynomialExtremaFromGraphOutput } from '@math-platform/math-content/knowledge-space';

export interface Topic14PolynomialExtremaFromGraphAnswers {
  readonly relative_minimum_x: string;
  readonly relative_maximum_x: string;
  readonly absolute_minimum_x: string;
}

const PART_IDS = [
  'relative_minimum_x',
  'relative_maximum_x',
  'absolute_minimum_x',
] as const;

function parseDecimal(rawAnswer: unknown): number | null {
  if (typeof rawAnswer !== 'string') return null;
  const trimmed = rawAnswer.trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function gradeTopic14PolynomialExtremaFromGraph(
  seed: number,
  answers: Topic14PolynomialExtremaFromGraphAnswers,
) {
  const expected = generateTopic14PolynomialExtremaFromGraphOutput(seed).expectedAnswer as Record<
    (typeof PART_IDS)[number],
    number
  >;
  const parts = PART_IDS.map((partId) => {
    const rawAnswer = answers[partId];
    const parsedAnswer = parseDecimal(rawAnswer);
    const isCorrect = parsedAnswer !== null && parsedAnswer === expected[partId];
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
