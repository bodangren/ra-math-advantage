import { generateTopic13RatePatternClassificationOutput } from '@math-platform/math-content/knowledge-space';

export interface Topic13RatePatternClassificationAnswers {
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

const CASE_IDS = ['a', 'b', 'c'] as const;

export function gradeTopic13RatePatternClassification(
  seed: number,
  answers: Topic13RatePatternClassificationAnswers,
): { score: number; maxScore: number; parts: { partId: string; rawAnswer: string; isCorrect: boolean; score: number; maxScore: number }[] } {
  const expected = generateTopic13RatePatternClassificationOutput(seed).expectedAnswer as Record<typeof CASE_IDS[number], string>;
  const parts = CASE_IDS.map((partId) => {
    const rawAnswer = answers[partId];
    const isCorrect = rawAnswer === expected[partId];
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
