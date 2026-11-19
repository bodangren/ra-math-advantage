import type { GeneratorOutput } from "@math-platform/knowledge-space-practice";

import { mulberry32 } from "../../utils/prng";

export type Topic14PolynomialEndBehaviorEnd = "positive_infinity" | "negative_infinity";

export interface Topic14PolynomialEndBehaviorLeadingTerm {
  readonly coefficient: number;
  readonly exponent: number;
}

export interface Topic14PolynomialEndBehaviorVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly functionName: "f";
  readonly leadingTerm: Topic14PolynomialEndBehaviorLeadingTerm;
}

export type Topic14PolynomialEndBehaviorAnswer = {
  readonly leftEnd: Topic14PolynomialEndBehaviorEnd;
  readonly rightEnd: Topic14PolynomialEndBehaviorEnd;
};

export const TOPIC14_POLYNOMIAL_END_BEHAVIOR_NODE_ID =
  "math.precalc.skill.1.4.determine-end-behavior-from-leading-term";

const SOURCE_PROMPT = "Determine the end behavior of f(x) = -3x^4 from its leading term.";

function formatLeadingTerm(leadingTerm: Topic14PolynomialEndBehaviorLeadingTerm): string {
  const coefficient =
    leadingTerm.coefficient === 1
      ? ""
      : leadingTerm.coefficient === -1
        ? "-"
        : String(leadingTerm.coefficient);
  return `${coefficient}x^${leadingTerm.exponent}`;
}

function formatEndForStudent(end: Topic14PolynomialEndBehaviorEnd): string {
  return end.replace("_", " ");
}

function classifyEnds(coefficient: number, exponent: number): Topic14PolynomialEndBehaviorAnswer {
  const rightEnd: Topic14PolynomialEndBehaviorEnd =
    coefficient > 0 ? "positive_infinity" : "negative_infinity";
  const leftEnd =
    exponent % 2 === 0
      ? rightEnd
      : rightEnd === "positive_infinity"
        ? "negative_infinity"
        : "positive_infinity";
  return { leftEnd, rightEnd };
}

function validateSeed(seed: number): void {
  if (typeof seed !== "number" || !Number.isSafeInteger(seed) || seed < 0) {
    throw new RangeError("seed must be a non-negative safe integer");
  }
}

function buildVariant(seed: number): Topic14PolynomialEndBehaviorVariant {
  if (seed === 0) {
    return {
      seed: 0,
      prompt: SOURCE_PROMPT,
      functionName: "f",
      leadingTerm: { coefficient: -3, exponent: 4 },
    };
  }

  const random = mulberry32(seed);
  const magnitude = 1 + Math.floor(random() * 9);
  const coefficient = seed % 2 === 0 ? magnitude : -magnitude;
  const exponent = 2 + 2 * (seed % 3) + (Math.floor(seed / 2) % 2);
  const leadingTerm = { coefficient, exponent };

  return {
    seed,
    prompt: `Determine the end behavior of f(x) = ${formatLeadingTerm(leadingTerm)} from its leading term.`,
    functionName: "f",
    leadingTerm,
  };
}

function sourceSolutionSteps(): Array<{ description: string }> {
  return [
    { description: "The leading term is -3x^4." },
    { description: "The degree is 4, which is even." },
    { description: "The leading coefficient is -3, which is negative." },
    {
      description:
        "An even degree gives the same end direction, and a negative leading coefficient makes both ends fall.",
    },
    { description: "As x approaches negative infinity, f(x) approaches negative infinity." },
    { description: "As x approaches positive infinity, f(x) approaches negative infinity." },
  ];
}

function generatedSolutionSteps(
  leadingTerm: Topic14PolynomialEndBehaviorLeadingTerm,
  answer: Topic14PolynomialEndBehaviorAnswer,
): Array<{ description: string }> {
  const parity = leadingTerm.exponent % 2 === 0 ? "even" : "odd";
  const sign = leadingTerm.coefficient > 0 ? "positive" : "negative";
  const directionRule = parity === "even" ? "the same direction" : "opposite directions";
  return [
    { description: `The leading term is ${formatLeadingTerm(leadingTerm)}.` },
    { description: `The degree is ${leadingTerm.exponent}, which is ${parity}.` },
    { description: `The leading coefficient is ${leadingTerm.coefficient}, which is ${sign}.` },
    {
      description: `An ${parity} degree gives ${directionRule}; the ${sign} leading coefficient determines the right end.`,
    },
    {
      description: `As x approaches negative infinity, f(x) approaches ${formatEndForStudent(answer.leftEnd)}.`,
    },
    {
      description: `As x approaches positive infinity, f(x) approaches ${formatEndForStudent(answer.rightEnd)}.`,
    },
  ];
}

export function generateTopic14PolynomialEndBehavior(
  seed: number,
): Topic14PolynomialEndBehaviorVariant {
  validateSeed(seed);
  return buildVariant(seed);
}

export function generateTopic14PolynomialEndBehaviorOutput(seed: number): GeneratorOutput {
  validateSeed(seed);
  const variant = buildVariant(seed);
  const { coefficient, exponent } = variant.leadingTerm;
  const expectedAnswer = classifyEnds(coefficient, exponent);

  return {
    prompt: variant.prompt,
    data: {
      seed,
      rendererProps: {
        prompt: variant.prompt,
        functionName: variant.functionName,
        leadingTerm: variant.leadingTerm,
        presentationMode: "independent_practice",
      },
    },
    expectedAnswer,
    solutionSteps:
      seed === 0
        ? sourceSolutionSteps()
        : generatedSolutionSteps(variant.leadingTerm, expectedAnswer),
    gradingMetadata: {
      partAnswers: expectedAnswer,
      partMaxScores: { leftEnd: 1, rightEnd: 1 },
      partGradingRules: { leftEnd: "exact_match", rightEnd: "exact_match" },
    },
  };
}
