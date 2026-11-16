import { generateTopic12NegativeRateContextChoiceOutput } from '@math-platform/math-content/knowledge-space';

export interface Topic12NegativeRateContextChoiceAnswers {
  readonly selectedOptionId: string;
}

export function gradeTopic12NegativeRateContextChoice(
  seed: number,
  answers: Topic12NegativeRateContextChoiceAnswers,
) {
  const expected = generateTopic12NegativeRateContextChoiceOutput(seed).expectedAnswer.selectedOptionId;
  const rawAnswer = answers.selectedOptionId;
  const isCorrect = rawAnswer === expected;

  return {
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    parts: [
      {
        partId: 'selectedOptionId',
        rawAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
      },
    ],
  };
}
