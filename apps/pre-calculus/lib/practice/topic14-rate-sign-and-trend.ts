import { generateTopic14RateSignAndTrendOutput } from '@math-platform/math-content/knowledge-space';

export interface Topic14RateSignAndTrendAnswers {
  readonly rateSign: string;
  readonly rateTrend: string;
}

const PART_IDS = ['rateSign', 'rateTrend'] as const;

function isCanonicalAnswer(
  partId: (typeof PART_IDS)[number],
  rawAnswer: unknown,
): rawAnswer is string {
  if (typeof rawAnswer !== 'string') return false;
  return partId === 'rateSign'
    ? rawAnswer === 'positive' || rawAnswer === 'negative'
    : rawAnswer === 'increasing' || rawAnswer === 'decreasing';
}

export function gradeTopic14RateSignAndTrend(
  seed: number,
  answers: Topic14RateSignAndTrendAnswers,
) {
  const expected = generateTopic14RateSignAndTrendOutput(seed).expectedAnswer as Record<
    (typeof PART_IDS)[number],
    string
  >;
  const parts = PART_IDS.map((partId) => {
    const rawAnswer = answers[partId];
    const isCorrect = isCanonicalAnswer(partId, rawAnswer)
      && rawAnswer === expected[partId];
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
