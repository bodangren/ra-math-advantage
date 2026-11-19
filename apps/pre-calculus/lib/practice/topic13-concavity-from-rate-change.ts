import { generateTopic13ConcavityFromRateChangeOutput } from "@math-platform/math-content/knowledge-space";

export interface Topic13ConcavityFromRateChangeAnswers {
  readonly classification: string;
}

export function gradeTopic13ConcavityFromRateChange(
  seed: number,
  answers: Topic13ConcavityFromRateChangeAnswers,
) {
  const expected = generateTopic13ConcavityFromRateChangeOutput(seed).expectedAnswer as {
    classification: string;
  };
  const rawAnswer = answers.classification;
  const isCorrect = rawAnswer === expected.classification;

  return {
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    parts: [
      {
        partId: "classification",
        rawAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
      },
    ],
  };
}
