import { generateTopic15LeastPolynomialDegreeOutput } from "@math-platform/math-content/knowledge-space";

export interface Topic15LeastPolynomialDegreeAnswers {
  readonly leastDegree: number;
}

export function gradeTopic15LeastPolynomialDegree(
  seed: number,
  answers: Topic15LeastPolynomialDegreeAnswers,
) {
  const expected = generateTopic15LeastPolynomialDegreeOutput(seed).expectedAnswer.leastDegree;
  const rawAnswer =
    answers && typeof answers === "object"
      ? (answers as { leastDegree?: unknown }).leastDegree
      : undefined;
  const isCorrect =
    typeof rawAnswer === "number" &&
    Number.isFinite(rawAnswer) &&
    Number.isSafeInteger(rawAnswer) &&
    rawAnswer === expected;

  return {
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    parts: [
      {
        partId: "leastDegree",
        rawAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
      },
    ],
  };
}
