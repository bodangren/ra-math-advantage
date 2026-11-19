import { generateTopic12QuadraticNegativeRateIntervalChoiceOutput } from "@math-platform/math-content/knowledge-space";

export interface Topic12QuadraticNegativeRateIntervalChoiceAnswers {
  readonly selectedOptionId: string;
}

export function gradeTopic12QuadraticNegativeRateIntervalChoice(
  seed: number,
  answers: Topic12QuadraticNegativeRateIntervalChoiceAnswers,
) {
  const expected =
    generateTopic12QuadraticNegativeRateIntervalChoiceOutput(seed).expectedAnswer.selectedOptionId;
  const rawAnswer = answers.selectedOptionId;
  const isCorrect = rawAnswer === expected;

  return {
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    parts: [
      {
        partId: "selectedOptionId",
        rawAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
      },
    ],
  };
}
