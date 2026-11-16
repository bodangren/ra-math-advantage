import { generateTopic14PolynomialDegreeLeadingCoefficientOutput } from '@math-platform/math-content/knowledge-space';

export interface Topic14PolynomialDegreeLeadingCoefficientAnswers {
  readonly a_degree: string;
  readonly a_leading_coefficient: string;
  readonly b_degree: string;
  readonly b_leading_coefficient: string;
  readonly c_degree: string;
  readonly c_leading_coefficient: string;
}

const PART_IDS = [
  'a_degree',
  'a_leading_coefficient',
  'b_degree',
  'b_leading_coefficient',
  'c_degree',
  'c_leading_coefficient',
] as const;

function parseDecimal(rawAnswer: unknown): number | null {
  if (typeof rawAnswer !== 'string') return null;
  const trimmed = rawAnswer.trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function gradeTopic14PolynomialDegreeLeadingCoefficient(
  seed: number,
  answers: Topic14PolynomialDegreeLeadingCoefficientAnswers,
): { score: number; maxScore: number; parts: { partId: string; rawAnswer: string; isCorrect: boolean; score: number; maxScore: number }[] } {
  const expected = generateTopic14PolynomialDegreeLeadingCoefficientOutput(seed).expectedAnswer as Record<typeof PART_IDS[number], number>;
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
    maxScore: 6,
    parts,
  };
}
