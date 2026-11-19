import { generateTopic14PolynomialEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";

export interface Topic14PolynomialEndBehaviorAnswers {
  readonly leftEnd: string;
  readonly rightEnd: string;
}

const PART_IDS = ["leftEnd", "rightEnd"] as const;

function isCanonicalAnswer(
  partId: (typeof PART_IDS)[number],
  rawAnswer: unknown,
): rawAnswer is string {
  if (typeof rawAnswer !== "string") return false;
  return rawAnswer === "positive_infinity" || rawAnswer === "negative_infinity";
}

export function gradeTopic14PolynomialEndBehavior(
  seed: number,
  answers: Topic14PolynomialEndBehaviorAnswers,
) {
  const expected = generateTopic14PolynomialEndBehaviorOutput(seed).expectedAnswer as Record<
    (typeof PART_IDS)[number],
    string
  >;
  const parts = PART_IDS.map((partId) => {
    const rawAnswer = answers[partId];
    const isCorrect = isCanonicalAnswer(partId, rawAnswer) && rawAnswer === expected[partId];
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
    maxScore: 2,
    parts,
  };
}
