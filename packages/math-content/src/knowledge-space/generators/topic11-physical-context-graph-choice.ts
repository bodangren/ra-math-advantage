import { mulberry32 } from "../../utils/prng";
import type { GeneratorOutput } from "@math-platform/knowledge-space-practice";

export type Topic11PhysicalContextGraphChoiceShape =
  | "linear-increasing"
  | "slope-increases-then-decreases"
  | "rise-fall-rise"
  | "steep-gentle-steep";

export type Topic11PhysicalContextContainerProfile =
  | "constant-width"
  | "wide-narrow-wide"
  | "narrow-wide-narrow";

export interface Topic11PhysicalContextGraphChoiceOption {
  readonly id: string;
  readonly label: string;
  readonly shape: Topic11PhysicalContextGraphChoiceShape;
  readonly accessibleDescription: string;
}

export interface Topic11PhysicalContextGraphChoiceVariant {
  readonly seed: number;
  readonly prompt: string;
  readonly contextDescription: string;
  readonly xLabel: string;
  readonly yLabel: string;
  readonly containerProfile: Topic11PhysicalContextContainerProfile;
  readonly options: readonly Topic11PhysicalContextGraphChoiceOption[];
  readonly correctOptionId: string;
  readonly reasoning: readonly string[];
}

export const TOPIC11_PHYSICAL_CONTEXT_GRAPH_CHOICE_NODE_ID =
  "math.precalc.skill.1.1.select-a-graph-that-models-a-physical-context";

const SHAPES: readonly Topic11PhysicalContextGraphChoiceShape[] = [
  "linear-increasing",
  "slope-increases-then-decreases",
  "rise-fall-rise",
  "steep-gentle-steep",
];

const SHAPE_DESCRIPTIONS: Record<Topic11PhysicalContextGraphChoiceShape, string> = {
  "linear-increasing": "A straight line that rises at a constant rate.",
  "slope-increases-then-decreases":
    "A graph that stays increasing while its slope increases and then decreases.",
  "rise-fall-rise": "A graph that rises, then falls, then rises again.",
  "steep-gentle-steep": "A graph that rises steeply, then gently, then steeply.",
};

const PROFILE_DATA: Record<
  Topic11PhysicalContextContainerProfile,
  {
    readonly contextDescription: string;
    readonly correctShape: Topic11PhysicalContextGraphChoiceShape;
    readonly reasoning: readonly [string, string];
  }
> = {
  "constant-width": {
    contextDescription: "The container has a constant width from bottom to top.",
    correctShape: "linear-increasing",
    reasoning: [
      "A container with the same width throughout and constant volume inflow gives a constant height rate.",
      "Choose the straight increasing graph because the height rises at a constant rate.",
    ],
  },
  "wide-narrow-wide": {
    contextDescription:
      "The vessel is wide at the bottom, narrow in the middle, and wide at the top.",
    correctShape: "slope-increases-then-decreases",
    reasoning: [
      "Height rises slowly in the wide bottom, faster in the narrow middle, then slowly in the wide top.",
      "Choose the always-increasing graph whose slope increases and then decreases.",
    ],
  },
  "narrow-wide-narrow": {
    contextDescription: "The vase has a narrow base, a wide rounded middle, and a narrow neck.",
    correctShape: "steep-gentle-steep",
    reasoning: [
      "Height rises quickly in the narrow base, gently in the wide middle, then quickly in the narrow neck.",
      "Choose the always-increasing graph with steep, gentle, then steep sections.",
    ],
  },
};

const PROFILE_NAMES: readonly Topic11PhysicalContextContainerProfile[] = [
  "constant-width",
  "wide-narrow-wide",
  "narrow-wide-narrow",
];

const SOURCE_OPTIONS: readonly Topic11PhysicalContextGraphChoiceOption[] = [
  {
    id: "A",
    label: "A",
    shape: "linear-increasing",
    accessibleDescription: SHAPE_DESCRIPTIONS["linear-increasing"],
  },
  {
    id: "B",
    label: "B",
    shape: "slope-increases-then-decreases",
    accessibleDescription: SHAPE_DESCRIPTIONS["slope-increases-then-decreases"],
  },
  {
    id: "C",
    label: "C",
    shape: "rise-fall-rise",
    accessibleDescription: SHAPE_DESCRIPTIONS["rise-fall-rise"],
  },
  {
    id: "D",
    label: "D",
    shape: "steep-gentle-steep",
    accessibleDescription: SHAPE_DESCRIPTIONS["steep-gentle-steep"],
  },
];

const SOURCE_PROMPT =
  "The figure shows an empty vase. At t = 0, water pours into the vase at a constant rate until the vase is full. Time in seconds is the independent variable, and water height in inches is the dependent variable. Select the possible graph.";

function buildOptions(random: () => number): readonly Topic11PhysicalContextGraphChoiceOption[] {
  const shapes = [...SHAPES];
  for (let index = shapes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shapes[index], shapes[swapIndex]] = [shapes[swapIndex]!, shapes[index]!];
  }

  return shapes.map((shape, index) => ({
    id: String.fromCharCode(65 + index),
    label: String.fromCharCode(65 + index),
    shape,
    accessibleDescription: SHAPE_DESCRIPTIONS[shape],
  }));
}

export function generateTopic11PhysicalContextGraphChoice(
  seed: number,
): Topic11PhysicalContextGraphChoiceVariant {
  if (!Number.isInteger(seed) || seed < 0) {
    throw new RangeError("seed must be a non-negative integer");
  }

  if (seed === 0) {
    return {
      seed: 0,
      prompt: SOURCE_PROMPT,
      contextDescription: "The vase has a narrow base, a wide rounded middle, and a narrow neck.",
      xLabel: "Time (seconds)",
      yLabel: "Height (inches)",
      containerProfile: "narrow-wide-narrow",
      options: SOURCE_OPTIONS,
      correctOptionId: "D",
      reasoning: [
        "Time in seconds is the independent variable, and water height in inches is the dependent variable.",
        "A constant inflow does not make height increase at a constant rate because the vase width changes.",
        "The narrow base, wide middle, and narrow neck produce fast, gentle, and fast height change, so graph D is possible.",
      ],
    };
  }

  const random = mulberry32(seed);
  const containerProfile = PROFILE_NAMES[Math.floor(random() * PROFILE_NAMES.length)]!;
  const profile = PROFILE_DATA[containerProfile];
  const options = buildOptions(random);
  const correctOptionId = options.find((option) => option.shape === profile.correctShape)!.id;

  return {
    seed,
    prompt:
      "Water pours into a vessel at a constant rate until it is full. Time is the independent variable, and water height is the dependent variable. Select the possible graph for the vessel shown by the context.",
    contextDescription: profile.contextDescription,
    xLabel: "Time",
    yLabel: "Water height",
    containerProfile,
    options,
    correctOptionId,
    reasoning: [
      "Time is the independent variable, and water height is the dependent variable.",
      "The constant water inflow combines with the vessel width to determine how quickly height changes.",
      ...profile.reasoning,
    ],
  };
}

export function generateTopic11PhysicalContextGraphChoiceOutput(seed: number): GeneratorOutput {
  const variant = generateTopic11PhysicalContextGraphChoice(seed);
  const rendererProps = {
    prompt: variant.prompt,
    contextDescription: variant.contextDescription,
    xLabel: variant.xLabel,
    yLabel: variant.yLabel,
    containerProfile: variant.containerProfile,
    options: variant.options,
    presentationMode: "independent_practice" as const,
  };
  const expectedAnswer = { selectedOptionId: variant.correctOptionId };

  return {
    prompt: variant.prompt,
    data: { seed, rendererProps },
    expectedAnswer,
    solutionSteps: variant.reasoning.map((description) => ({ description })),
    gradingMetadata: {
      partAnswers: expectedAnswer,
      partMaxScores: { selectedOptionId: 1 },
      partGradingRules: { selectedOptionId: "exact_match" },
    },
  };
}
