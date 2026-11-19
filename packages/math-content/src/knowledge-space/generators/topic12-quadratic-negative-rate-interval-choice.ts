import type { GeneratorOutput } from "@math-platform/knowledge-space-practice";

import { mulberry32 } from "../../utils/prng";

export type Topic12QuadraticNegativeRateIntervalRateSign = "positive" | "negative";

export interface Topic12QuadraticNegativeRateIntervalChoiceOption {
  readonly id: string;
  readonly label: string;
  readonly rateSign: Topic12QuadraticNegativeRateIntervalRateSign;
  readonly startInput: number;
  readonly endInput: number;
}

export interface Topic12QuadraticNegativeRateIntervalChoiceVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly functionName: string;
  readonly constantTerm: number;
  readonly linearCoefficient: number;
  readonly quadraticCoefficient: number;
  readonly domain: readonly [number, number];
  readonly options: readonly Topic12QuadraticNegativeRateIntervalChoiceOption[];
}

export const TOPIC12_QUADRATIC_NEGATIVE_RATE_INTERVAL_CHOICE_NODE_ID =
  "math.precalc.skill.1.2.determine-negative-rate-intervals-for-quadratics";

const SOURCE_PROMPT =
  "The function k is defined by k(x) = 3.16 + 4.2x - 0.85x^2 for -10 <= x <= 10. Which statement about k is correct?";
const GENERATED_FUNCTION_NAME = "k";

const SOURCE_OPTIONS: readonly Topic12QuadraticNegativeRateIntervalChoiceOption[] = [
  { id: "A", label: "A", rateSign: "positive", startInput: -10, endInput: 8.348 },
  { id: "B", label: "B", rateSign: "positive", startInput: -0.663, endInput: 5.605 },
  { id: "C", label: "C", rateSign: "negative", startInput: -10, endInput: 2.47 },
  { id: "D", label: "D", rateSign: "negative", startInput: 2.47, endInput: 10 },
];

function roundToHundredth(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundToThousandth(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }
  return shuffled;
}

function sourceVariant(): Topic12QuadraticNegativeRateIntervalChoiceVariant {
  return {
    seed: 0,
    prompt: SOURCE_PROMPT,
    functionName: GENERATED_FUNCTION_NAME,
    constantTerm: 3.16,
    linearCoefficient: 4.2,
    quadraticCoefficient: -0.85,
    domain: [-10, 10],
    options: SOURCE_OPTIONS,
  };
}

function generatedVariant(seed: number): Topic12QuadraticNegativeRateIntervalChoiceVariant {
  const random = mulberry32(seed);
  const constantTerm = roundToHundredth(-2 + random() * 8);
  const linearCoefficient = roundToHundredth(-3.6 + random() * 7.2);
  const quadraticCoefficient = -roundToHundredth(0.55 + random() * 0.5);
  const domain: readonly [number, number] = [-10, 10];
  const vertexX = -linearCoefficient / (2 * quadraticCoefficient);
  const vertexFloor = Math.floor(vertexX * 1000) / 1000;
  const vertexCeil = Math.ceil(vertexX * 1000) / 1000;
  const leftOfVertex = roundToThousandth(vertexFloor - 1.5);
  const rightOfVertex = roundToThousandth(vertexCeil + 1.5);

  const statements: readonly Omit<
    Topic12QuadraticNegativeRateIntervalChoiceOption,
    "id" | "label"
  >[] = [
    { rateSign: "negative", startInput: domain[0], endInput: leftOfVertex },
    { rateSign: "positive", startInput: domain[0], endInput: rightOfVertex },
    { rateSign: "positive", startInput: leftOfVertex, endInput: domain[1] },
    { rateSign: "negative", startInput: vertexCeil, endInput: domain[1] },
  ];
  const options = shuffle(statements, random).map((statement, index) => ({
    ...statement,
    id: String.fromCharCode(65 + index),
    label: String.fromCharCode(65 + index),
  }));
  const linearTerm =
    linearCoefficient >= 0 ? `+ ${linearCoefficient}x` : `- ${Math.abs(linearCoefficient)}x`;
  const quadraticTerm =
    quadraticCoefficient < 0
      ? `- ${Math.abs(quadraticCoefficient)}x^2`
      : `+ ${quadraticCoefficient}x^2`;
  const equation = `${constantTerm} ${linearTerm} ${quadraticTerm}`;

  return {
    seed,
    prompt: `The function ${GENERATED_FUNCTION_NAME} is defined by ${GENERATED_FUNCTION_NAME}(x) = ${equation} for -10 <= x <= 10. Which statement about ${GENERATED_FUNCTION_NAME} is correct?`,
    functionName: GENERATED_FUNCTION_NAME,
    constantTerm,
    linearCoefficient,
    quadraticCoefficient,
    domain,
    options,
  };
}

export function generateTopic12QuadraticNegativeRateIntervalChoice(
  seed: number,
): Topic12QuadraticNegativeRateIntervalChoiceVariant {
  if (!Number.isInteger(seed) || seed < 0) {
    throw new RangeError("seed must be a non-negative integer");
  }
  return seed === 0 ? sourceVariant() : generatedVariant(seed);
}

function correctOptionId(variant: Topic12QuadraticNegativeRateIntervalChoiceVariant): string {
  const vertexX = -variant.linearCoefficient / (2 * variant.quadraticCoefficient);
  const option = variant.options.find(
    (candidate) =>
      candidate.rateSign === "negative" &&
      candidate.startInput >= vertexX - 0.001 &&
      candidate.endInput > vertexX,
  );
  if (!option) {
    throw new Error("quadratic negative-rate interval generator has no valid negative-rate option");
  }
  return option.id;
}

function buildSolutionSteps(
  variant: Topic12QuadraticNegativeRateIntervalChoiceVariant,
): readonly string[] {
  const answer = correctOptionId(variant);
  if (variant.seed === 0) {
    return [
      "The quadratic opens downward.",
      "The vertex is at x = 2.470.",
      "The rate is negative to the right of the vertex, so option D is correct.",
    ];
  }
  const vertexX = -variant.linearCoefficient / (2 * variant.quadraticCoefficient);
  return [
    "The quadratic coefficient is negative, so the parabola opens downward.",
    `The vertex is at x = ${vertexX.toFixed(3)}.`,
    `The rate is negative to the right of the vertex, so option ${answer} is correct.`,
  ];
}

export function generateTopic12QuadraticNegativeRateIntervalChoiceOutput(
  seed: number,
): GeneratorOutput {
  const variant = generateTopic12QuadraticNegativeRateIntervalChoice(seed);
  const answer = { selectedOptionId: correctOptionId(variant) };
  const rendererProps = {
    prompt: variant.prompt,
    functionName: variant.functionName,
    constantTerm: variant.constantTerm,
    linearCoefficient: variant.linearCoefficient,
    quadraticCoefficient: variant.quadraticCoefficient,
    domain: variant.domain,
    options: variant.options,
    presentationMode: "independent_practice" as const,
  };

  return {
    prompt: variant.prompt,
    data: { seed, rendererProps },
    expectedAnswer: answer,
    solutionSteps: buildSolutionSteps(variant).map((description) => ({ description })),
    gradingMetadata: {
      partAnswers: answer,
      partMaxScores: { selectedOptionId: 1 },
      partGradingRules: { selectedOptionId: "exact_match" },
    },
  };
}
