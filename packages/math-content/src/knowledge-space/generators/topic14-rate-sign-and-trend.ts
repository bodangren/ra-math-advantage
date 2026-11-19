import type { GeneratorOutput } from "@math-platform/knowledge-space-practice";

import { mulberry32 } from "../../utils/prng";

export type Topic14RateSign = "positive" | "negative";
export type Topic14RateTrend = "increasing" | "decreasing";

export interface Topic14RateSignAndTrendPoint {
  readonly x: number;
  readonly y: number;
}

export type Topic14RateSignAndTrendInterval = readonly [number, number];

export interface Topic14RateSignAndTrendVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly functionName: "h";
  readonly interval: Topic14RateSignAndTrendInterval;
  readonly points: readonly Topic14RateSignAndTrendPoint[];
}

export const TOPIC14_RATE_SIGN_AND_TREND_NODE_ID =
  "math.precalc.skill.1.4.describe-rate-of-change-behavior-on-intervals";

const SOURCE_PROMPT = "Determine the rate sign and rate trend of h on the interval (3, 4).";
const GENERATED_PROMPT = "Determine the rate sign and rate trend of h on the displayed interval.";
const SAMPLE_STEP = 0.25;

type RateAnswer = {
  readonly rateSign: Topic14RateSign;
  readonly rateTrend: Topic14RateTrend;
};

type BuiltVariant = {
  readonly variant: Topic14RateSignAndTrendVariant;
  readonly answer: RateAnswer;
};

function randomInteger(random: () => number, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function roundForDisplay(value: number): number {
  return Number(value.toFixed(6));
}

function evaluateQuadratic(
  startingY: number,
  initialSlope: number,
  curvature: number,
  distanceFromStart: number,
): number {
  return startingY + initialSlope * distanceFromStart + 0.5 * curvature * distanceFromStart ** 2;
}

function samplePoints(
  startingY: number,
  initialSlope: number,
  curvature: number,
  interval: Topic14RateSignAndTrendInterval,
): Topic14RateSignAndTrendPoint[] {
  return Array.from({ length: 5 }, (_, index) => {
    const x = interval[0] + index * SAMPLE_STEP;
    return {
      x,
      y: roundForDisplay(
        evaluateQuadratic(startingY, initialSlope, curvature, index * SAMPLE_STEP),
      ),
    };
  });
}

function classifyPoints(points: readonly Topic14RateSignAndTrendPoint[]): RateAnswer {
  const slopes = points
    .slice(1)
    .map((point, index) => (point.y - points[index]!.y) / (point.x - points[index]!.x));
  const rateSign: Topic14RateSign = slopes[0]! > 0 ? "positive" : "negative";
  const rateTrend: Topic14RateTrend = slopes.every(
    (slope, index) => index === 0 || slope > slopes[index - 1]!,
  )
    ? "increasing"
    : "decreasing";
  return { rateSign, rateTrend };
}

function sourceVariant(): BuiltVariant {
  const interval: Topic14RateSignAndTrendInterval = [3, 4];
  const points = samplePoints(0, 12, -4, interval);
  return {
    variant: {
      seed: 0,
      prompt: SOURCE_PROMPT,
      functionName: "h",
      interval,
      points,
    },
    answer: { rateSign: "positive", rateTrend: "decreasing" },
  };
}

function generatedVariant(seed: number): BuiltVariant {
  const random = mulberry32(seed);
  const intervalStart = randomInteger(random, -6, 6);
  const interval: Topic14RateSignAndTrendInterval = [intervalStart, intervalStart + 1];
  const sign: 1 | -1 = random() < 0.5 ? 1 : -1;
  const trendIncreasing = random() < 0.5;
  const initialSlope = sign * randomInteger(random, 4, 10);
  const curvatureMagnitude = randomInteger(random, 1, 3);
  const curvature = trendIncreasing ? curvatureMagnitude : -curvatureMagnitude;
  const startingY = randomInteger(random, -20, 20);
  const points = samplePoints(startingY, initialSlope, curvature, interval);

  return {
    variant: {
      seed,
      prompt: `${GENERATED_PROMPT} (${interval[0]}, ${interval[1]}).`,
      functionName: "h",
      interval,
      points,
    },
    answer: classifyPoints(points),
  };
}

function buildForSeed(seed: number): BuiltVariant {
  return seed === 0 ? sourceVariant() : generatedVariant(seed);
}

function sourceSolutionSteps(): Array<{ description: string }> {
  return [
    { description: "On (3, 4), h rises, so the rate of change is positive." },
    {
      description:
        "The graph flattens as x increases, so the positive rate of change is decreasing.",
    },
    { description: "Therefore, the rate sign is positive and the rate trend is decreasing." },
  ];
}

function generatedSolutionSteps(
  variant: Topic14RateSignAndTrendVariant,
  answer: RateAnswer,
): Array<{ description: string }> {
  const slopes = variant.points
    .slice(1)
    .map((point, index) =>
      roundForDisplay((point.y - variant.points[index]!.y) / (point.x - variant.points[index]!.x)),
    );
  return [
    {
      description: `The sampled rates on (${variant.interval[0]}, ${variant.interval[1]}) are ${slopes.join(", ")}.`,
    },
    {
      description: `The rates are ${answer.rateSign}, because the graph ${answer.rateSign === "positive" ? "rises" : "falls"} across the interval.`,
    },
    {
      description: `The rates are ${answer.rateTrend}, because they ${answer.rateTrend === "increasing" ? "increase" : "decrease"} from left to right.`,
    },
  ];
}

function validateSeed(seed: number): void {
  if (!Number.isSafeInteger(seed) || seed < 0) {
    throw new RangeError("seed must be a non-negative safe integer");
  }
}

export function generateTopic14RateSignAndTrend(seed: number): Topic14RateSignAndTrendVariant {
  validateSeed(seed);
  return buildForSeed(seed).variant;
}

export function generateTopic14RateSignAndTrendOutput(seed: number): GeneratorOutput {
  validateSeed(seed);
  const { variant, answer } = buildForSeed(seed);
  const solutionSteps =
    seed === 0 ? sourceSolutionSteps() : generatedSolutionSteps(variant, answer);

  return {
    prompt: variant.prompt,
    data: {
      seed,
      rendererProps: {
        prompt: variant.prompt,
        functionName: variant.functionName,
        interval: variant.interval,
        points: variant.points,
        presentationMode: "independent_practice",
      },
    },
    expectedAnswer: answer,
    solutionSteps,
    gradingMetadata: {
      partAnswers: answer,
      partMaxScores: { rateSign: 1, rateTrend: 1 },
      partGradingRules: { rateSign: "exact_match", rateTrend: "exact_match" },
    },
  };
}
