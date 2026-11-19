import type { GeneratorOutput, GradingMetadata } from "@math-platform/knowledge-space-practice";

import { mulberry32 } from "../../utils/prng";

export interface Topic15LeastPolynomialDegreeVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly givenNonrealZero: string;
  readonly realZeroCount: number;
}

export const TOPIC15_LEAST_POLYNOMIAL_DEGREE_NODE_ID =
  "math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs";

const SOURCE_PROMPT =
  "The zero x = i√3 is given for a real-coefficient polynomial f. Its graph shows at least 3 real zeros. What is the least possible degree of f?";

function randomInteger(random: () => number, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function formatImaginaryCoefficient(value: number): string {
  return value === 1 ? "i" : `${value}i`;
}

function formatNonrealZero(realPart: number, imaginaryPart: number): string {
  if (realPart === 0) return formatImaginaryCoefficient(imaginaryPart);
  return `${realPart}${imaginaryPart > 0 ? " + " : " - "}${formatImaginaryCoefficient(Math.abs(imaginaryPart))}`;
}

function formatConjugate(realPart: number, imaginaryPart: number): string {
  if (realPart === 0) return `-${formatImaginaryCoefficient(imaginaryPart)}`;
  return `${realPart} - ${formatImaginaryCoefficient(imaginaryPart)}`;
}

function validateSeed(seed: number): void {
  if (typeof seed !== "number" || !Number.isSafeInteger(seed) || seed < 0) {
    throw new RangeError("seed must be a non-negative safe integer");
  }
}

function sourceVariant(): Topic15LeastPolynomialDegreeVariant {
  return {
    seed: 0,
    prompt: SOURCE_PROMPT,
    givenNonrealZero: "i√3",
    realZeroCount: 3,
  };
}

type BuiltVariant = {
  readonly variant: Topic15LeastPolynomialDegreeVariant;
  readonly realPart: number;
  readonly imaginaryPart: number;
};

function generatedVariant(seed: number): BuiltVariant {
  const random = mulberry32(seed);
  const realPart = randomInteger(random, -4, 4);
  const imaginaryPart = randomInteger(random, 1, 5);
  const realZeroCount = randomInteger(random, 1, 5);
  const givenNonrealZero = formatNonrealZero(realPart, imaginaryPart);

  return {
    variant: {
      seed,
      prompt: `The zero x = ${givenNonrealZero} is given for a real-coefficient polynomial f. Its graph shows at least ${realZeroCount} real zeros. What is the least possible degree of f?`,
      givenNonrealZero,
      realZeroCount,
    },
    realPart,
    imaginaryPart,
  };
}

function buildVariant(seed: number): BuiltVariant {
  return seed === 0
    ? { variant: sourceVariant(), realPart: 0, imaginaryPart: 3 }
    : generatedVariant(seed);
}

function sourceSolutionSteps(): Array<{ description: string }> {
  return [
    { description: "Because f has real coefficients, x = -i√3 is also a zero." },
    {
      description:
        "The conjugate pair contributes 2 nonreal zeros, and the graph shows at least 3 real zeros.",
    },
    { description: "Therefore, the least possible degree is 2 + 3 = 5." },
  ];
}

function generatedSolutionSteps(
  variant: Topic15LeastPolynomialDegreeVariant,
  realPart: number,
  imaginaryPart: number,
): Array<{ description: string }> {
  const conjugate = formatConjugate(realPart, imaginaryPart);
  const leastDegree = variant.realZeroCount + 2;

  return [
    {
      description: `Because f has real coefficients, the conjugate of x = ${variant.givenNonrealZero} is also a zero: x = ${conjugate}.`,
    },
    {
      description: `The conjugate pair contributes 2 nonreal zeros, and the graph shows at least ${variant.realZeroCount} real zeros.`,
    },
    {
      description: `Therefore, the least possible degree is 2 + ${variant.realZeroCount} = ${leastDegree}.`,
    },
  ];
}

export function generateTopic15LeastPolynomialDegree(
  seed: number,
): Topic15LeastPolynomialDegreeVariant {
  validateSeed(seed);
  return buildVariant(seed).variant;
}

export function generateTopic15LeastPolynomialDegreeOutput(seed: number): GeneratorOutput {
  validateSeed(seed);
  const built = buildVariant(seed);
  const variant = built.variant;
  const leastDegree = variant.realZeroCount + 2;
  const expectedAnswer = { leastDegree };
  const gradingMetadata: GradingMetadata = {
    partAnswers: expectedAnswer,
    partMaxScores: { leastDegree: 1 },
    partGradingRules: { leastDegree: "exact_match" },
  };

  return {
    prompt: variant.prompt,
    data: {
      seed,
      rendererProps: {
        prompt: variant.prompt,
        givenNonrealZero: variant.givenNonrealZero,
        realZeroCount: variant.realZeroCount,
        presentationMode: "independent_practice",
      },
    },
    expectedAnswer,
    solutionSteps:
      seed === 0
        ? sourceSolutionSteps()
        : generatedSolutionSteps(variant, built.realPart, built.imaginaryPart),
    gradingMetadata,
  };
}
