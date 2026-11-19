import { generateTopic12PointwiseRateOrderingOutput } from "@math-platform/math-content/knowledge-space";

export interface Topic12PointwiseRateOrderingAnswers {
  readonly orderedPointIds: readonly string[];
}

export function gradeTopic12PointwiseRateOrdering(
  seed: number,
  answers: Topic12PointwiseRateOrderingAnswers,
) {
  const output = generateTopic12PointwiseRateOrderingOutput(seed);
  const expected = output.expectedAnswer as { orderedPointIds: readonly string[] };
  const rawAnswer = answers.orderedPointIds;
  const isCorrect =
    rawAnswer.length === 3 &&
    rawAnswer.every((pointId, index) => pointId === expected.orderedPointIds[index]);

  return {
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    parts: [
      {
        partId: "orderedPointIds",
        rawAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
      },
    ],
  };
}
