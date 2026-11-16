import { generateTopic12TableAverageRateChoice } from '@math-platform/math-content/knowledge-space';

export interface Topic12TableAverageRateChoiceAnswers {
  readonly selectedOptionId: string;
}

export function gradeTopic12TableAverageRateChoice(
  seed: number,
  answers: Topic12TableAverageRateChoiceAnswers,
) {
  const variant = generateTopic12TableAverageRateChoice(seed);
  const rawAnswer = answers.selectedOptionId;
  const isCorrect = typeof rawAnswer === 'string' && rawAnswer === variant.correctOptionId;

  return {
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    parts: [{
      partId: 'selectedOptionId',
      rawAnswer,
      isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1,
    }],
  };
}
