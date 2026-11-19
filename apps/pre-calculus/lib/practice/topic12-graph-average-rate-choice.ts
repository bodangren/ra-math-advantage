import { generateTopic12GraphAverageRateChoice } from "@math-platform/math-content/knowledge-space";

export interface Topic12GraphAverageRateChoiceAnswers {
  readonly selectedOptionId: string;
}

export function gradeTopic12GraphAverageRateChoice(
  seed: number,
  answers: Topic12GraphAverageRateChoiceAnswers,
) {
  const variant = generateTopic12GraphAverageRateChoice(seed);
  const rawAnswer = answers.selectedOptionId;
  const isCorrect = typeof rawAnswer === "string" && rawAnswer === variant.correctOptionId;

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
