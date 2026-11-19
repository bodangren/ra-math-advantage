import { generateTopic12PointwiseLeastRateChoice } from "@math-platform/math-content/knowledge-space";

export interface Topic12PointwiseLeastRateChoiceAnswers {
  readonly selectedOptionId: string;
}

export function gradeTopic12PointwiseLeastRateChoice(
  seed: number,
  answers: Topic12PointwiseLeastRateChoiceAnswers,
) {
  const variant = generateTopic12PointwiseLeastRateChoice(seed);
  const rawAnswer = answers.selectedOptionId;
  const isCorrect = rawAnswer === variant.correctOptionId;

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
