import type { GeneratorOutput, GradingMetadata } from "@math-platform/knowledge-space-practice";

import { mulberry32 } from "../../utils/prng";

export type Topic16EquationEndBehaviorItemId = "a" | "b" | "c" | "d" | "e" | "f";
export type Topic16EquationEndBehaviorFunctionName = "f" | "g" | "y" | "h" | "k" | "m";
export type Topic16EquationEndBehaviorEnd = "up" | "down";
export type Topic16EquationEndBehaviorPartId =
  `${Topic16EquationEndBehaviorItemId}_${"leftEnd" | "rightEnd"}`;

export interface Topic16EquationEndBehaviorItem {
  readonly id: Topic16EquationEndBehaviorItemId;
  readonly functionName: Topic16EquationEndBehaviorFunctionName;
  readonly expression: string;
}

export type Topic16EquationEndBehaviorAnswers = Record<
  Topic16EquationEndBehaviorPartId,
  Topic16EquationEndBehaviorEnd
>;

export interface Topic16EquationEndBehaviorVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly items: readonly Topic16EquationEndBehaviorItem[];
}

export const TOPIC16_EQUATION_END_BEHAVIOR_NODE_ID =
  "math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations";

const SOURCE_PROMPT =
  "Determine the end behavior for the following polynomials. Limit notation is not necessary.";

const SOURCE_ITEMS: readonly Topic16EquationEndBehaviorItem[] = [
  { id: "a", functionName: "f", expression: "4x^5" },
  { id: "b", functionName: "g", expression: "(1/2)x^4" },
  { id: "c", functionName: "y", expression: "-2(x + 3)^6" },
  { id: "d", functionName: "h", expression: "3 - x^5" },
  { id: "e", functionName: "k", expression: "8x^2 + 4 - x^5" },
  { id: "f", functionName: "m", expression: "2x(x - 1)(6 - x)" },
];

const SOURCE_LEADING_TERMS = [
  { coefficient: 4, exponent: 5 },
  { coefficient: 1 / 2, exponent: 4 },
  { coefficient: -2, exponent: 6 },
  { coefficient: -1, exponent: 5 },
  { coefficient: -1, exponent: 5 },
  { coefficient: -2, exponent: 3 },
] as const;

const SOURCE_ANSWERS: Topic16EquationEndBehaviorAnswers = {
  a_leftEnd: "down",
  a_rightEnd: "up",
  b_leftEnd: "up",
  b_rightEnd: "up",
  c_leftEnd: "down",
  c_rightEnd: "down",
  d_leftEnd: "up",
  d_rightEnd: "down",
  e_leftEnd: "up",
  e_rightEnd: "down",
  f_leftEnd: "up",
  f_rightEnd: "down",
};

const SOURCE_SOLUTION_STEPS = [
  "a) The leading term is 4x^5. The degree is odd and the leading coefficient is positive, so the left end is down and the right end is up.",
  "b) The leading term is (1/2)x^4. The degree is even and the leading coefficient is positive, so both ends are up.",
  "c) The leading term is -2x^6. The degree is even and the leading coefficient is negative, so both ends are down.",
  "d) The leading term is -x^5. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.",
  "e) The leading term is -x^5. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.",
  "f) The leading term is -2x^3. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.",
] as const;

type LeadingTerm = {
  readonly coefficient: number;
  readonly exponent: number;
};

type BuiltItem = {
  readonly item: Topic16EquationEndBehaviorItem;
  readonly leadingTerm: LeadingTerm;
};

type BuiltVariant = {
  readonly variant: Topic16EquationEndBehaviorVariant;
  readonly leadingTerms: readonly LeadingTerm[];
};

function validateSeed(seed: number): void {
  if (typeof seed !== "number" || !Number.isSafeInteger(seed) || seed < 0) {
    throw new RangeError("seed must be a non-negative safe integer");
  }
}

function randomInteger(random: () => number, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function formatCoefficient(coefficient: number): string {
  return coefficient === 1 ? "" : coefficient === -1 ? "-" : String(coefficient);
}

function classifyEnds(leadingTerm: LeadingTerm): {
  leftEnd: Topic16EquationEndBehaviorEnd;
  rightEnd: Topic16EquationEndBehaviorEnd;
} {
  const rightEnd: Topic16EquationEndBehaviorEnd = leadingTerm.coefficient > 0 ? "up" : "down";
  const leftEnd = leadingTerm.exponent % 2 === 0 ? rightEnd : rightEnd === "up" ? "down" : "up";
  return { leftEnd, rightEnd };
}

function buildAnswers(leadingTerms: readonly LeadingTerm[]): Topic16EquationEndBehaviorAnswers {
  const answers = {} as Topic16EquationEndBehaviorAnswers;
  for (const [index, leadingTerm] of leadingTerms.entries()) {
    const itemId = SOURCE_ITEMS[index]?.id;
    if (!itemId) throw new Error("Missing Topic 1.6 item identity");
    const ends = classifyEnds(leadingTerm);
    answers[`${itemId}_leftEnd`] = ends.leftEnd;
    answers[`${itemId}_rightEnd`] = ends.rightEnd;
  }
  return answers;
}

function sourceVariant(): BuiltVariant {
  return {
    variant: {
      seed: 0,
      prompt: SOURCE_PROMPT,
      items: SOURCE_ITEMS,
    },
    leadingTerms: SOURCE_LEADING_TERMS,
  };
}

function generatedItem(
  random: () => number,
  seed: number,
  id: Topic16EquationEndBehaviorItemId,
  functionName: Topic16EquationEndBehaviorFunctionName,
  category: number,
): BuiltItem {
  if (category === 0) {
    const magnitude = 1 + (seed % 9);
    const coefficient = seed % 2 === 0 ? magnitude : -magnitude;
    const exponent = 2 + (seed % 5);
    return {
      item: { id, functionName, expression: `${formatCoefficient(coefficient)}x^${exponent}` },
      leadingTerm: { coefficient, exponent },
    };
  }

  if (category === 1) {
    const numerator = 1;
    const denominator = randomInteger(random, 2, 7);
    const exponent = randomInteger(random, 2, 6);
    return {
      item: { id, functionName, expression: `(${numerator}/${denominator})x^${exponent}` },
      leadingTerm: { coefficient: numerator / denominator, exponent },
    };
  }

  if (category === 2) {
    const rawCoefficient = randomInteger(random, -8, 8);
    const coefficient =
      rawCoefficient === 0 || rawCoefficient === 1
        ? 2
        : rawCoefficient === -1
          ? -2
          : rawCoefficient;
    const shift = randomInteger(random, 1, 6);
    const exponent = randomInteger(random, 2, 6);
    return {
      item: {
        id,
        functionName,
        expression: `${formatCoefficient(coefficient)}(x + ${shift})^${exponent}`,
      },
      leadingTerm: { coefficient, exponent },
    };
  }

  if (category === 3) {
    const constant = randomInteger(random, -8, 8) || 3;
    const coefficient = randomInteger(random, 1, 8);
    const exponent = randomInteger(random, 2, 7);
    return {
      item: {
        id,
        functionName,
        expression: `${constant} - ${formatCoefficient(coefficient)}x^${exponent}`,
      },
      leadingTerm: { coefficient: -coefficient, exponent },
    };
  }

  if (category === 4) {
    const lowerCoefficient = randomInteger(random, 2, 8);
    const lowerExponent = randomInteger(random, 2, 4);
    const constant = randomInteger(random, 1, 8);
    const leadingCoefficient = randomInteger(random, 2, 8);
    const leadingExponent = randomInteger(random, 5, 7);
    return {
      item: {
        id,
        functionName,
        expression: `${lowerCoefficient}x^${lowerExponent} + ${constant} - ${leadingCoefficient}x^${leadingExponent}`,
      },
      leadingTerm: { coefficient: -leadingCoefficient, exponent: leadingExponent },
    };
  }

  const coefficient = randomInteger(random, 1, 8);
  const firstRoot = randomInteger(random, 1, 5);
  const secondRoot = randomInteger(random, 6, 10);
  return {
    item: {
      id,
      functionName,
      expression: `${formatCoefficient(coefficient)}x(x - ${firstRoot})(${secondRoot} - x)`,
    },
    leadingTerm: { coefficient: -coefficient, exponent: 3 },
  };
}

function generatedVariant(seed: number): BuiltVariant {
  const random = mulberry32(seed);
  const ids: readonly Topic16EquationEndBehaviorItemId[] = ["a", "b", "c", "d", "e", "f"];
  const functionNames: readonly Topic16EquationEndBehaviorFunctionName[] = [
    "f",
    "g",
    "y",
    "h",
    "k",
    "m",
  ];
  const builtItems = ids.map((id, index) =>
    generatedItem(random, seed, id, functionNames[index]!, index),
  );
  return {
    variant: {
      seed,
      prompt: SOURCE_PROMPT,
      items: builtItems.map(({ item }) => item),
    },
    leadingTerms: builtItems.map(({ leadingTerm }) => leadingTerm),
  };
}

function buildVariant(seed: number): BuiltVariant {
  return seed === 0 ? sourceVariant() : generatedVariant(seed);
}

function solutionSteps(
  items: readonly Topic16EquationEndBehaviorItem[],
  leadingTerms: readonly LeadingTerm[],
  answers: Topic16EquationEndBehaviorAnswers,
): Array<{ description: string }> {
  return items.map((item, index) => {
    const leadingTerm = leadingTerms[index]!;
    const leadingTermText =
      item.id === "b"
        ? item.expression
        : `${formatCoefficient(leadingTerm.coefficient)}x^${leadingTerm.exponent}`;
    const sign = leadingTerm.coefficient > 0 ? "positive" : "negative";
    const parity = leadingTerm.exponent % 2 === 0 ? "even" : "odd";
    const left = answers[`${item.id}_leftEnd`];
    const right = answers[`${item.id}_rightEnd`];
    return {
      description: `${item.id}) The leading term is ${leadingTermText}. The degree is ${leadingTerm.exponent}, which is ${parity}, and the leading coefficient is ${sign}. The left end is ${left} and the right end is ${right}.`,
    };
  });
}

function gradingMetadata(answers: Topic16EquationEndBehaviorAnswers): GradingMetadata {
  const partIds = Object.keys(answers);
  return {
    partAnswers: answers,
    partMaxScores: Object.fromEntries(partIds.map((partId) => [partId, 1])),
    partGradingRules: Object.fromEntries(partIds.map((partId) => [partId, "exact_match"])),
  };
}

export function generateTopic16EquationEndBehavior(
  seed: number,
): Topic16EquationEndBehaviorVariant {
  validateSeed(seed);
  return buildVariant(seed).variant;
}

export function generateTopic16EquationEndBehaviorOutput(seed: number): GeneratorOutput {
  validateSeed(seed);
  const built = buildVariant(seed);
  const answers = seed === 0 ? SOURCE_ANSWERS : buildAnswers(built.leadingTerms);
  return {
    prompt: built.variant.prompt,
    data: {
      seed,
      rendererProps: {
        prompt: built.variant.prompt,
        items: built.variant.items,
        presentationMode: "independent_practice",
      },
    },
    expectedAnswer: answers,
    solutionSteps:
      seed === 0
        ? SOURCE_SOLUTION_STEPS.map((description) => ({ description }))
        : solutionSteps(built.variant.items, built.leadingTerms, answers),
    gradingMetadata: gradingMetadata(answers),
  };
}
