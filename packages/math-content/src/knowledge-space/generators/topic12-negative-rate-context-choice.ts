import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

import { mulberry32 } from '../../utils/prng';

export interface Topic12NegativeRateContextChoiceOption {
  readonly id: string;
  readonly label: string;
  readonly xDefinition: string;
  readonly yDefinition: string;
}

export interface Topic12NegativeRateContextChoiceVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly options: readonly Topic12NegativeRateContextChoiceOption[];
}

export const TOPIC12_NEGATIVE_RATE_CONTEXT_CHOICE_NODE_ID =
  'math.precalc.skill.1.2.model-negative-rate-contexts';

const SOURCE_PROMPT = 'The graph of the function y = f(x) in the xy-plane always has a negative rate of change. Which of the following definitions for the variables x and y would best model the function f?';
const GENERATED_PROMPT = 'Choose the definitions for x and y that model a function with an always-negative rate of change.';

type ContextKind = 'always-negative' | 'positive' | 'not-always-negative';

interface ContextDefinition extends Topic12NegativeRateContextChoiceOption {
  readonly kind: ContextKind;
}

const SOURCE_CONTEXTS: readonly ContextDefinition[] = [
  {
    id: 'A',
    label: 'A',
    xDefinition: 'the age, in years, of a young child',
    yDefinition: 'the height, in inches, of the young child',
    kind: 'positive',
  },
  {
    id: 'B',
    label: 'B',
    xDefinition: 'the total number of points scored in a basketball game',
    yDefinition: 'the time remaining, in seconds, in the game',
    kind: 'always-negative',
  },
  {
    id: 'C',
    label: 'C',
    xDefinition: 'the time, in seconds, since a ball was thrown straight up in the air',
    yDefinition: 'the height, in feet, of the ball',
    kind: 'not-always-negative',
  },
  {
    id: 'D',
    label: 'D',
    xDefinition: 'the radius, in meters, of a circle',
    yDefinition: 'the area, in square inches, of the circle',
    kind: 'positive',
  },
];

const ALWAYS_NEGATIVE_CONTEXTS: readonly ContextDefinition[] = [
  {
    id: 'negative-pages',
    label: 'negative-pages',
    xDefinition: 'pages read',
    yDefinition: 'pages remaining in a fixed book',
    kind: 'always-negative',
  },
  {
    id: 'negative-inventory',
    label: 'negative-inventory',
    xDefinition: 'units sold',
    yDefinition: 'units remaining in fixed inventory',
    kind: 'always-negative',
  },
  {
    id: 'negative-countdown',
    label: 'negative-countdown',
    xDefinition: 'elapsed countdown time',
    yDefinition: 'time remaining',
    kind: 'always-negative',
  },
  {
    id: 'negative-drained',
    label: 'negative-drained',
    xDefinition: 'quantity drained',
    yDefinition: 'quantity remaining in a tank',
    kind: 'always-negative',
  },
];

const POSITIVE_CONTEXTS: readonly ContextDefinition[] = [
  {
    id: 'positive-age',
    label: 'positive-age',
    xDefinition: 'age of a child',
    yDefinition: 'height of the child',
    kind: 'positive',
  },
  {
    id: 'positive-radius',
    label: 'positive-radius',
    xDefinition: 'radius of a circle',
    yDefinition: 'area of the circle',
    kind: 'positive',
  },
  {
    id: 'positive-distance',
    label: 'positive-distance',
    xDefinition: 'distance traveled',
    yDefinition: 'fuel used by a vehicle',
    kind: 'positive',
  },
  {
    id: 'positive-study',
    label: 'positive-study',
    xDefinition: 'side length of a square',
    yDefinition: 'area of the square',
    kind: 'positive',
  },
];

const NOT_ALWAYS_NEGATIVE_CONTEXTS: readonly ContextDefinition[] = [
  {
    id: 'not-negative-ball',
    label: 'not-negative-ball',
    xDefinition: 'time since a toy rocket launched',
    yDefinition: 'rocket height',
    kind: 'not-always-negative',
  },
  {
    id: 'not-negative-temperature',
    label: 'not-negative-temperature',
    xDefinition: 'time after sunrise',
    yDefinition: 'air temperature',
    kind: 'not-always-negative',
  },
  {
    id: 'not-negative-runner',
    label: 'not-negative-runner',
    xDefinition: 'elapsed time for a Ferris wheel car',
    yDefinition: 'height of the Ferris wheel car',
    kind: 'not-always-negative',
  },
  {
    id: 'not-negative-tide',
    label: 'not-negative-tide',
    xDefinition: 'time since high tide',
    yDefinition: 'water level at the shore',
    kind: 'not-always-negative',
  },
];

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }
  return shuffled;
}

function selectPair<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
}

function toPublicOption(context: ContextDefinition, id: string): Topic12NegativeRateContextChoiceOption {
  return {
    id,
    label: id,
    xDefinition: context.xDefinition,
    yDefinition: context.yDefinition,
  };
}

function sourceVariant(): Topic12NegativeRateContextChoiceVariant {
  return {
    seed: 0,
    prompt: SOURCE_PROMPT,
    options: SOURCE_CONTEXTS.map((context) => ({
      id: context.id,
      label: context.label,
      xDefinition: context.xDefinition,
      yDefinition: context.yDefinition,
    })),
  };
}

function generatedVariant(seed: number): Topic12NegativeRateContextChoiceVariant {
  const random = mulberry32(seed);
  const negative = selectPair(ALWAYS_NEGATIVE_CONTEXTS, random);
  const positiveIndex = Math.floor(random() * POSITIVE_CONTEXTS.length);
  const positiveOne = POSITIVE_CONTEXTS[positiveIndex]!;
  const positiveTwo = POSITIVE_CONTEXTS[(positiveIndex + 1 + Math.floor(random() * (POSITIVE_CONTEXTS.length - 1))) % POSITIVE_CONTEXTS.length]!;
  const notAlwaysNegative = selectPair(NOT_ALWAYS_NEGATIVE_CONTEXTS, random);
  const contexts = shuffle([negative, positiveOne, positiveTwo, notAlwaysNegative], random);

  return {
    seed,
    prompt: GENERATED_PROMPT,
    options: contexts.map((context, index) => toPublicOption(context, String.fromCharCode(65 + index))),
  };
}

export function generateTopic12NegativeRateContextChoice(seed: number): Topic12NegativeRateContextChoiceVariant {
  if (!Number.isInteger(seed) || seed < 0) {
    throw new RangeError('seed must be a non-negative integer');
  }
  return seed === 0 ? sourceVariant() : generatedVariant(seed);
}

function isAlwaysNegative(option: Topic12NegativeRateContextChoiceOption): boolean {
  return [...SOURCE_CONTEXTS, ...ALWAYS_NEGATIVE_CONTEXTS].some((context) => (
    context.xDefinition === option.xDefinition
    && context.yDefinition === option.yDefinition
    && context.kind === 'always-negative'
  ));
}

function correctOptionId(options: readonly Topic12NegativeRateContextChoiceOption[]): string {
  return options.find((option) => isAlwaysNegative(option))!.id;
}

function buildSolutionSteps(
  seed: number,
  options: readonly Topic12NegativeRateContextChoiceOption[],
): readonly string[] {
  const answer = correctOptionId(options);
  if (seed === 0) {
    return [
      'For an always-negative rate, x increases while y decreases.',
      'Option B models this: as points scored increase, time remaining in the game decreases.',
      'Options A and D increase, and option C does not always decrease. Therefore, option B is correct.',
    ];
  }
  return [
    'For an always-negative rate, x must increase while y decreases.',
    `Option ${answer} is the only definition with that relationship.`,
    `The other definitions increase together or do not always decrease. Therefore, option ${answer} is correct.`,
  ];
}

export function generateTopic12NegativeRateContextChoiceOutput(seed: number): GeneratorOutput {
  const variant = generateTopic12NegativeRateContextChoice(seed);
  const answer = { selectedOptionId: correctOptionId(variant.options) };
  const rendererProps = {
    prompt: variant.prompt,
    options: variant.options,
    presentationMode: 'independent_practice' as const,
  };

  return {
    prompt: variant.prompt,
    data: { seed, rendererProps },
    expectedAnswer: answer,
    solutionSteps: buildSolutionSteps(seed, variant.options).map((description) => ({ description })),
    gradingMetadata: {
      partAnswers: answer,
      partMaxScores: { selectedOptionId: 1 },
      partGradingRules: { selectedOptionId: 'exact_match' },
    },
  };
}
