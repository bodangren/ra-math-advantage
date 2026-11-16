import { generateTopic11PhysicalContextGraphChoice } from '@math-platform/math-content/knowledge-space';

export interface Topic11PhysicalContextGraphChoiceAnswers {
  readonly selectedOptionId: string;
}

export function gradeTopic11PhysicalContextGraphChoice(
  seed: number,
  answers: Topic11PhysicalContextGraphChoiceAnswers,
) {
  const variant = generateTopic11PhysicalContextGraphChoice(seed);
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
