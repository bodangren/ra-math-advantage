import { internalMutation, internalQuery, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { PracticeSubmissionEnvelopeSchema } from "@math-platform/practice-core";
import { generateTopic11IntervalGraphOutput } from "@math-platform/math-content/knowledge-space";
import nodesDocument from "../curriculum/skill-graph/nodes.json";
import blueprintsDocument from "../curriculum/skill-graph/blueprints.json";
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
  PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
  PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
} from "../lib/learning-evidence/precalc-pilot";
export { PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY } from "../lib/learning-evidence/precalc-pilot";
import {
  generateTopic11IntervalGraph,
  gradeTopic11IntervalGraph,
} from "../lib/practice/topic11-interval-graph";
import { gradeTopic11PhysicalContextGraphChoice } from "../lib/practice/topic11-physical-context-graph-choice";
import { gradeTopic12TableAverageRateChoice } from "../lib/practice/topic12-table-average-rate-choice";
import { gradeTopic12GraphAverageRateChoice } from "../lib/practice/topic12-graph-average-rate-choice";
import { gradeTopic12PointwiseLeastRateChoice } from "../lib/practice/topic12-pointwise-least-rate-choice";
import { gradeTopic12PointwiseRateOrdering } from "../lib/practice/topic12-pointwise-rate-ordering";
import { gradeTopic12NegativeRateContextChoice } from "../lib/practice/topic12-negative-rate-context-choice";
import { gradeTopic12QuadraticNegativeRateIntervalChoice } from "../lib/practice/topic12-quadratic-negative-rate-interval-choice";
import { gradeTopic13RatePatternClassification } from "../lib/practice/topic13-rate-pattern-classification";
import { gradeTopic13ConcavityFromRateChange } from "../lib/practice/topic13-concavity-from-rate-change";
import { gradeTopic14PolynomialDegreeLeadingCoefficient } from "../lib/practice/topic14-polynomial-degree-leading-coefficient";
import { gradeTopic14PolynomialExtremaFromGraph } from "../lib/practice/topic14-polynomial-extrema-from-graph";
import { gradeTopic14RateSignAndTrend } from "../lib/practice/topic14-rate-sign-and-trend";
import { gradeTopic14PolynomialEndBehavior } from "../lib/practice/topic14-polynomial-end-behavior";
import { gradeTopic15RealZerosAndMultiplicities } from "../lib/practice/topic15-real-zeros-and-multiplicities";
import { gradeTopic15LeastPolynomialDegree } from "../lib/practice/topic15-least-polynomial-degree";
import { gradeTopic15PolynomialInequalitySignChart } from "../lib/practice/topic15-polynomial-inequality-sign-chart";
import { gradeTopic16EquationEndBehavior } from "../lib/practice/topic16-equation-end-behavior";
import {
  generateTopic13ConcavityFromRateChangeOutput,
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
  generateTopic14PolynomialExtremaFromGraphOutput,
  generateTopic14RateSignAndTrendOutput,
  generateTopic14PolynomialEndBehaviorOutput,
  generateTopic15RealZerosAndMultiplicitiesOutput,
  generateTopic15LeastPolynomialDegreeOutput,
  generateTopic15PolynomialInequalityOutput,
  generateTopic16EquationEndBehaviorOutput,
} from "@math-platform/math-content/knowledge-space";

export const PRECALCULUS_PILOT_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.guided_practice`;
export const PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.independent_practice`;
export const PRECALCULUS_PILOT_COMPONENT_KEY = "precalculus-mastery-advantage-pilot";

export type SelectedPilotPublication = {
  nodes: ReadonlyArray<{ id: string; kind?: string; reviewStatus?: string }>;
  blueprints: ReadonlyArray<{
    nodeId: string;
    reviewStatus?: string;
    rendererKey?: string;
    rendererModeMap?: Record<string, unknown>;
    workedExampleSpec?: unknown;
    guidedPracticeSpec?: unknown;
    independentPracticeSpec?: unknown;
    generatorKey?: string;
    gradingSpec?: unknown;
  }>;
};
const selectedPilotPublication: SelectedPilotPublication = {
  nodes: nodesDocument.nodes,
  blueprints: blueprintsDocument.blueprints,
};
const SELECTED_GUIDED_PROMPT =
  "Identify the intervals where the graph increases, decreases, and stays constant.";
const SELECTED_GUIDED_STEPS = [
  "Mark the domain endpoints and the change points x=3 and x=7.",
  "Read each graph segment from left to right and decide whether it rises, falls, or stays flat.",
  "Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.",
];
const SELECTED_GUIDED_HINTS = [
  "Use the two change points to separate the graph into three segments.",
  "Read each segment from left to right.",
  "Enter none when no segment has the requested behavior.",
];
const SELECTED_GUIDED_CHECKS = [
  { check: "The domain endpoints and both change points are identified." },
  { check: "Each segment is classified as rising, falling, or flat." },
  { check: "All three interval fields are completed." },
];
const SELECTED_FIELD_HELP = {
  increasingIntervals: "Find every segment that rises.",
  decreasingIntervals: "Find every segment that falls.",
  constantIntervals: "Check whether any segment stays flat.",
};
const SELECTED_RUBRIC_CRITERIA = {
  increasingIntervals: "Correct increasing intervals",
  decreasingIntervals: "Correct decreasing intervals",
  constantIntervals: "Correct constant intervals",
} as const;
const SELECTED_VARIANT_PARAMETERS = {
  seed: {
    type: "integer",
    min: 0,
    description: "Deterministic Topic 1.1 interval graph variant seed",
  },
};
const SELECTED_ENVELOPE_KEYS = new Set([
  "activityId",
  "answers",
  "attemptNumber",
  "contractVersion",
  "mode",
  "parts",
  "status",
  "submittedAt",
  "artifact",
  "interactionHistory",
  "analytics",
  "studentFeedback",
  "teacherSummary",
  "timing",
]);
const SELECTED_STORED_PART_KEYS =
  "changedCount|hintsUsed|isCorrect|maxScore|partId|rawAnswer|revealStepsSeen|score";

const TOPIC_11_WORKED_SPEC = {
  prompt: "The graph of f is shown on 0 <= x <= 9. Find all intervals where f is increasing, decreasing, and constant.",
  givens: ["Domain: 0 <= x <= 9", "Change points: x=3 and x=7"],
  target: {
    increasingIntervals: "[0,3] and [7,9].",
    decreasingIntervals: "[3,7].",
    constantIntervals: "none.",
  },
  steps: [
    { description: "Read the graph from left to right.", expression: "x = 0 to x = 9" },
    { description: "The graph rises from x=0 to x=3.", expression: "0 < x < 3" },
    { description: "The graph falls from x=3 to x=7.", expression: "3 < x < 7" },
    { description: "The graph rises from x=7 to x=9.", expression: "7 < x < 9" },
    { description: "State all interval classifications.", expression: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none." },
  ],
  explanation: "Read the graph from left to right. It rises on [0,3] and [7,9]. It falls on [3,7]. It has no constant interval.",
  rendererProps: {
    title: "Worked Example: Classify Graph Intervals",
    prompt: "The graph of f is shown on 0 <= x <= 9. Find all intervals where f is increasing, decreasing, and constant.",
    domain: [0, 9],
    changePoints: [3, 7],
    points: [{ x: 0, y: 1 }, { x: 3, y: 7 }, { x: 7, y: 2 }, { x: 9, y: 6 }],
    presentationMode: "worked_example",
    steps: [
      { description: "Read the graph from left to right.", expression: "x = 0 to x = 9" },
      { description: "The graph rises from x=0 to x=3.", expression: "0 < x < 3" },
      { description: "The graph falls from x=3 to x=7.", expression: "3 < x < 7" },
      { description: "The graph rises from x=7 to x=9.", expression: "7 < x < 9" },
      { description: "State all interval classifications.", expression: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none." },
    ],
    finalAnswer: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none.",
  },
};
function topic11SameJson(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right)
      && left.length === right.length
      && left.every((value, index) => topic11SameJson(value, right[index]));
  }
  if (selectedRecord(left) || selectedRecord(right)) {
    return selectedRecord(left) && selectedRecord(right)
      && Object.keys(left).sort().join("|") === Object.keys(right).sort().join("|")
      && Object.keys(left).every((key) => topic11SameJson(left[key], right[key]));
  }
  return Object.is(left, right);
}

export function isPrecalculusPilotPublished(
  value: SelectedPilotPublication = selectedPilotPublication,
): boolean {
  return (
    value.nodes.some(
      (node) =>
        node.id === PRECALCULUS_PILOT_NODE_ID &&
        node.kind === "skill" &&
        node.reviewStatus === "approved",
    ) &&
    value.blueprints.some((blueprint) => {
      const modeMap = blueprint.rendererModeMap;
      const guided = blueprint.guidedPracticeSpec;
      const independent = blueprint.independentPracticeSpec;
      const guidedProps =
        selectedRecord(guided) && selectedRecord(guided.rendererProps)
          ? guided.rendererProps
          : null;
      const independentProps =
        selectedRecord(independent) && selectedRecord(independent.rendererProps)
          ? independent.rendererProps
          : null;
      const guidedVariant = generateTopic11IntervalGraphOutput(0).data
        .rendererProps as Record<string, unknown>;
      const independentVariant = generateTopic11IntervalGraphOutput(2).data
        .rendererProps as Record<string, unknown>;
      const matchesGeometry = (
        actual: Record<string, unknown>,
        expected: Record<string, unknown>,
      ) =>
        JSON.stringify(actual.domain) === JSON.stringify(expected.domain) &&
        JSON.stringify(actual.changePoints) ===
          JSON.stringify(expected.changePoints) &&
        JSON.stringify(actual.points) === JSON.stringify(expected.points);
      const grading = selectedRecord(blueprint.gradingSpec)
        ? blueprint.gradingSpec
        : null;
      const partIds =
        grading && Array.isArray(grading.partIds) ? grading.partIds : [];
      const rubric =
        grading && Array.isArray(grading.rubric) ? grading.rubric : [];
      return (
        blueprint.nodeId === PRECALCULUS_PILOT_NODE_ID &&
        blueprint.reviewStatus === "approved" &&
        blueprint.rendererKey === "interval-classification" &&
        selectedRecord(modeMap) &&
        modeMap.guidedPractice === "interval-classification" &&
        modeMap.independentPractice === "interval-classification" &&
        selectedRecord(guided) &&
        guided.scaffoldedPrompt === SELECTED_GUIDED_PROMPT &&
        JSON.stringify(guided.stepPrompts) ===
          JSON.stringify(SELECTED_GUIDED_STEPS) &&
        JSON.stringify(guided.hints) ===
          JSON.stringify(SELECTED_GUIDED_HINTS) &&
        JSON.stringify(guided.checksPerStep) ===
          JSON.stringify(SELECTED_GUIDED_CHECKS) &&
        guided.revealPolicy === "one_at_a_time" &&
        guidedProps !== null &&
        Object.keys(guidedProps).sort().join("|") ===
          "changePoints|domain|fieldHelp|guidedSteps|points|presentationMode|prompt|title" &&
        guidedProps.title === "Guided Practice: Classify Graph Intervals" &&
        guidedProps.prompt === SELECTED_GUIDED_PROMPT &&
        guidedProps.presentationMode === "guided_practice" &&
        Array.isArray(guidedProps.guidedSteps) &&
        JSON.stringify(guidedProps.guidedSteps) ===
          JSON.stringify(SELECTED_GUIDED_STEPS) &&
        selectedRecord(guidedProps.fieldHelp) &&
        JSON.stringify(guidedProps.fieldHelp) ===
          JSON.stringify(SELECTED_FIELD_HELP) &&
        matchesGeometry(guidedProps, guidedVariant) &&
        selectedRecord(independent) &&
        JSON.stringify(independent.variantParameters) ===
          JSON.stringify(SELECTED_VARIANT_PARAMETERS) &&
        selectedRecord(independent.answerSchema) &&
        Object.keys(independent.answerSchema).sort().join("|") ===
          "constantIntervals|decreasingIntervals|increasingIntervals" &&
        Object.values(independent.answerSchema).every(
          (value) => value === "string",
        ) &&
        Array.isArray(independent.gradingRules) &&
        independent.gradingRules.length === 3 &&
        independent.gradingRules.every(selectedRecord) &&
        independent.gradingRules
          .map((rule) => rule.partId)
          .slice()
          .sort()
          .join("|") ===
          "constantIntervals|decreasingIntervals|increasingIntervals" &&
        independent.gradingRules.every(
          (rule) => rule.ruleType === "custom" && rule.maxScore === 1,
        ) &&
        independent.replayPolicy === "any_seed" &&
        independentProps !== null &&
        Object.keys(independentProps).sort().join("|") ===
          "changePoints|domain|points|presentationMode|prompt|title" &&
        independentProps.title === "Independent Practice: Classify Graph Intervals" &&
        independentProps.prompt === SELECTED_GUIDED_PROMPT &&
        independentProps.presentationMode === "independent_practice" &&
        matchesGeometry(independentProps, independentVariant) &&
        blueprint.generatorKey === "topic11-interval-graph" &&
        partIds.slice().sort().join("|") ===
          "constantIntervals|decreasingIntervals|increasingIntervals" &&
        grading?.passingScore === 3 &&
        grading.partialCredit === true &&
        rubric.length === 3 &&
        new Set(rubric.filter(selectedRecord).map((row) => row.partId)).size === 3 &&
        rubric.every(
          (row) =>
            selectedRecord(row) &&
            row.points === 1 &&
            typeof row.partId === "string" &&
            partIds.includes(row.partId) &&
            row.criteria ===
              SELECTED_RUBRIC_CRITERIA[
                row.partId as keyof typeof SELECTED_RUBRIC_CRITERIA
              ],
        )
      );
    })
  );
}

const selectedPartValidator = v.object({
  partId: v.string(),
  rawAnswer: v.string(),
  isCorrect: v.optional(v.boolean()),
  score: v.optional(v.number()),
  maxScore: v.optional(v.number()),
  hintsUsed: v.optional(v.number()),
  revealStepsSeen: v.optional(v.number()),
  changedCount: v.optional(v.number()),
});
const selectedDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.string(),
  mode: v.union(
    v.literal("guided_practice"),
    v.literal("independent_practice"),
  ),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    increasingIntervals: v.string(),
    decreasingIntervals: v.string(),
    constantIntervals: v.string(),
  }),
  parts: v.array(selectedPartValidator),
  artifact: v.optional(v.any()),
  interactionHistory: v.optional(v.any()),
  analytics: v.optional(v.any()),
  studentFeedback: v.optional(v.any()),
  teacherSummary: v.optional(v.any()),
  timing: v.optional(v.any()),
});
const selectedResultValidator = v.object({
  submissionId: v.id("activity_submissions"),
  score: v.number(),
  maxScore: v.number(),
  attemptOrdinal: v.number(),
  feedback: v.string(),
});
const selectedExpectedActivity = (
  mode: "guided_practice" | "independent_practice",
) => ({
  stableActivityId:
    mode === "guided_practice"
      ? PRECALCULUS_PILOT_ACTIVITY_ID
      : PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
  displayName:
    mode === "guided_practice"
      ? "Mastery Advantage: Identify Graph Intervals"
      : "Independent Practice: Classify Graph Intervals",
  description:
    mode === "guided_practice"
      ? "Classify the increasing, decreasing, and constant intervals from a graph."
      : "Classify the increasing, decreasing, and constant intervals from a generated graph.",
  props: { nodeId: PRECALCULUS_PILOT_NODE_ID, mode },
  variantSeed: mode === "guided_practice" ? 0 : 2,
});
function selectedRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function selectedSameRecord(a: unknown, b: Record<string, unknown>): boolean {
  return (
    selectedRecord(a) &&
    Object.keys(a).length === Object.keys(b).length &&
    Object.entries(b).every(([key, value]) => a[key] === value)
  );
}
function hasSelectedExpectedActivityIdentity(
  activity: Record<string, unknown>,
  expected: ReturnType<typeof selectedExpectedActivity>,
): boolean {
  return (
    activity.stableActivityId === expected.stableActivityId &&
    activity.componentKey === PRECALCULUS_PILOT_COMPONENT_KEY &&
    activity.displayName === expected.displayName &&
    activity.description === expected.description &&
    selectedSameRecord(activity.props, expected.props) &&
    selectedSameRecord(activity.gradingConfig, { variantSeed: expected.variantSeed })
  );
}
function normalizeSelectedAnswer(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim().replace(/[−–—]/g, "-").replace(/\s+/g, "")
    : null;
}
function canonicalSelectedSubmission(
  data: Record<string, unknown>,
  stableActivityId: string,
  mode: string,
) {
  if (!PracticeSubmissionEnvelopeSchema.safeParse(data).success)
    throw new Error("Invalid Precalculus pilot practice envelope");
  if (
    data.contractVersion !== "practice.v1" ||
    data.activityId !== stableActivityId ||
    data.mode !== mode ||
    data.status !== "submitted"
  )
    throw new Error("Invalid Precalculus pilot practice envelope");
  if (
    !Number.isInteger(data.attemptNumber) ||
    (data.attemptNumber as number) < 1 ||
    typeof data.submittedAt !== "string" ||
    !data.submittedAt.trim() ||
    !Number.isFinite(Date.parse(data.submittedAt))
  )
    throw new Error("Invalid Precalculus pilot practice envelope");
  const allowed = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
    "artifact",
    "interactionHistory",
    "analytics",
    "studentFeedback",
    "teacherSummary",
    "timing",
  ];
  if (Object.keys(data).some((key) => !allowed.includes(key)))
    throw new Error("Invalid Precalculus pilot submission fields");
  if (
    !selectedRecord(data.answers) ||
    Object.keys(data.answers).sort().join("|") !==
      "constantIntervals|decreasingIntervals|increasingIntervals"
  )
    throw new Error("Invalid Precalculus pilot answers");
  const answers = {
    increasingIntervals: normalizeSelectedAnswer(data.answers.increasingIntervals),
    decreasingIntervals: normalizeSelectedAnswer(data.answers.decreasingIntervals),
    constantIntervals: normalizeSelectedAnswer(data.answers.constantIntervals),
  };
  if (Object.values(answers).some((answer) => answer === null))
    throw new Error("Invalid Precalculus pilot answers");
  if (!Array.isArray(data.parts) || data.parts.length !== 3)
    throw new Error("Invalid Precalculus pilot parts");
  const parts = new Map<
    string,
    {
      rawAnswer: string;
      hintsUsed: number;
      revealStepsSeen: number;
      changedCount: number;
    }
  >();
  for (const part of data.parts) {
    if (
      !selectedRecord(part) ||
      typeof part.partId !== "string" ||
      typeof part.rawAnswer !== "string" ||
      parts.has(part.partId)
    )
      throw new Error("Invalid Precalculus pilot parts");
    if (
      Object.keys(part).some(
        (key) =>
          ![
            "partId",
            "rawAnswer",
            "hintsUsed",
            "revealStepsSeen",
            "changedCount",
          ].includes(key),
      )
    )
      throw new Error("Invalid Precalculus pilot parts");
    const hintsUsed = part.hintsUsed ?? 0;
    const revealStepsSeen = part.revealStepsSeen ?? 0;
    const changedCount = part.changedCount ?? 0;
    if (
      ![hintsUsed, revealStepsSeen, changedCount].every(
        (item) =>
          typeof item === "number" && Number.isInteger(item) && item >= 0,
      )
    )
      throw new Error("Invalid Precalculus pilot assistance");
    parts.set(part.partId, {
      rawAnswer: part.rawAnswer,
      hintsUsed: hintsUsed as number,
      revealStepsSeen: revealStepsSeen as number,
      changedCount: changedCount as number,
    });
  }
  for (const key of Object.keys(answers))
    if (parts.get(key)?.rawAnswer !== data.answers[key])
      throw new Error("Precalculus pilot raw answer mismatch");
  return {
    answers: answers as {
      increasingIntervals: string;
      decreasingIntervals: string;
      constantIntervals: string;
    },
    parts,
    optionalFields: Object.fromEntries(
      [
        "artifact",
        "interactionHistory",
        "analytics",
        "studentFeedback",
        "teacherSummary",
        "timing",
      ]
        .filter((key) => key in data)
        .map((key) => [key, data[key]]),
    ),
  };
}

export const PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY = "physical-context-graph-choice";
export const PRECALCULUS_PHYSICAL_CONTEXT_GENERATOR_KEY = "topic11-physical-context-graph-choice";
export const PRECALCULUS_TOPIC_12_COMPONENT_KEY = "table-average-rate-choice";
export const PRECALCULUS_TOPIC_12_GENERATOR_KEY = "topic12-table-average-rate-choice";
export const PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY = "graph-average-rate-choice";
export const PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GENERATOR_KEY = "topic12-graph-average-rate-choice";

export const PRECALCULUS_PILOT_GRADING_CONFIG = {
  variantSeed: 0,
} as const;

export const PRECALCULUS_PILOT_INDEPENDENT_GRADING_CONFIG = {
  variantSeed: 2,
} as const;

export const PRECALCULUS_PHYSICAL_CONTEXT_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_PHYSICAL_CONTEXT_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_PHYSICAL_CONTEXT_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_PHYSICAL_CONTEXT_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_12_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_12_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_12_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY = "pointwise-least-rate-choice";
export const PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY = "topic12-pointwise-least-rate-choice";

export const PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY = "pointwise-rate-ordering";
export const PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GENERATOR_KEY = "topic12-pointwise-rate-ordering";

export const PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY = "negative-rate-context-choice";
export const PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY = "topic12-negative-rate-context-choice";

export const PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY = "quadratic-negative-rate-interval-choice";
export const PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY = "topic12-quadratic-negative-rate-interval-choice";

export const PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY = "rate-pattern-classification";
export const PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GENERATOR_KEY = "topic13-rate-pattern-classification";

export const PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY = "concavity-from-rate-change";
export const PRECALCULUS_TOPIC_13_CONCAVITY_GENERATOR_KEY = "topic13-concavity-from-rate-change";

export const PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_13_CONCAVITY_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_13_CONCAVITY_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_13_CONCAVITY_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY = "polynomial-degree-leading-coefficient";
export const PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GENERATOR_KEY = "topic14-polynomial-degree-leading-coefficient";

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY = "polynomial-extrema-from-graph";
export const PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GENERATOR_KEY = "topic14-polynomial-extrema-from-graph";

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY = "rate-sign-and-trend-from-graph";
export const PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GENERATOR_KEY = "topic14-rate-sign-and-trend";

export const PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY = "polynomial-end-behavior";
export const PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY = "topic14-polynomial-end-behavior";

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY = "real-zeros-and-multiplicities";
export const PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY = "topic15-real-zeros-and-multiplicities-from-factored-form";

export const PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY = "least-polynomial-degree";
export const PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY = "topic15-least-polynomial-degree-from-zeros-and-conjugate-pairs";

export const PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY = "polynomial-inequality-sign-chart";
export const PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY = "topic15-polynomial-inequality-sign-chart";

export const PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY,
  variantSeed: 2,
} as const;

export const PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY = "polynomial-equation-end-behavior";
export const PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY = "topic16-equation-end-behavior";

export const PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
  variantSeed: 0,
} as const;

export const PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
  variantSeed: 1,
} as const;

export const PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG = {
  generatorKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
  variantSeed: 2,
} as const;

const pilotSubmissionReturnValidator = v.object({
  submissionId: v.id("activity_submissions"),
  score: v.number(),
  maxScore: v.number(),
  attemptOrdinal: v.number(),
  feedback: v.string(),
});

const topic11SubmissionReturnValidator = v.object({
  submissionId: v.id("activity_submissions"),
  attemptOrdinal: v.number(),
  submittedAt: v.string(),
});

const physicalContextSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.string(),
  mode: v.union(
    v.literal("worked_example"),
    v.literal("guided_practice"),
    v.literal("independent_practice"),
  ),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    selectedOptionId: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.literal("selectedOptionId"),
    rawAnswer: v.string(),
  })),
});

const physicalContextWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    selectedOptionId: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.literal("selectedOptionId"),
    rawAnswer: v.string(),
  })),
});

const topic12WorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    selectedOptionId: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.literal("selectedOptionId"),
    rawAnswer: v.string(),
  })),
});

const topic12GraphWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    selectedOptionId: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.literal("selectedOptionId"),
    rawAnswer: v.string(),
  })),
});

const topic12PointwiseLeastRateWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    selectedOptionId: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.literal("selectedOptionId"),
    rawAnswer: v.string(),
  })),
});

const topic12NegativeRateContextWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    selectedOptionId: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.literal("selectedOptionId"),
    rawAnswer: v.string(),
  })),
});

const topic12QuadraticNegativeRateIntervalWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    selectedOptionId: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.literal("selectedOptionId"),
    rawAnswer: v.string(),
  })),
});

const topic12PointwiseRateOrderingSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.string(),
  mode: v.union(v.literal("guided_practice"), v.literal("independent_practice")),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    orderedPointIds: v.array(v.string()),
  }),
  parts: v.array(v.object({
    partId: v.literal("orderedPointIds"),
    rawAnswer: v.array(v.string()),
  })),
});

const topic13RatePatternClassificationSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.string(),
  mode: v.union(v.literal("guided_practice"), v.literal("independent_practice")),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    a: v.string(),
    b: v.string(),
    c: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.union(v.literal("a"), v.literal("b"), v.literal("c")),
    rawAnswer: v.string(),
  })),
});

const topic13ConcavitySubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.string(),
  mode: v.union(v.literal("guided_practice"), v.literal("independent_practice")),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    classification: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.literal("classification"),
    rawAnswer: v.string(),
  })),
});

const topic14PolynomialDegreeLeadingCoefficientSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.string(),
  mode: v.union(v.literal("guided_practice"), v.literal("independent_practice")),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    a_degree: v.string(),
    a_leading_coefficient: v.string(),
    b_degree: v.string(),
    b_leading_coefficient: v.string(),
    c_degree: v.string(),
    c_leading_coefficient: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.union(
      v.literal("a_degree"),
      v.literal("a_leading_coefficient"),
      v.literal("b_degree"),
      v.literal("b_leading_coefficient"),
      v.literal("c_degree"),
      v.literal("c_leading_coefficient"),
    ),
    rawAnswer: v.string(),
  })),
});

const topic14PolynomialExtremaSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.string(),
  mode: v.union(v.literal("guided_practice"), v.literal("independent_practice")),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    relative_minimum_x: v.string(),
    relative_maximum_x: v.string(),
    absolute_minimum_x: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.union(
      v.literal("relative_minimum_x"),
      v.literal("relative_maximum_x"),
      v.literal("absolute_minimum_x"),
    ),
    rawAnswer: v.string(),
  })),
});

const topic14RateSignAndTrendSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.string(),
  mode: v.union(v.literal("guided_practice"), v.literal("independent_practice")),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    rateSign: v.string(),
    rateTrend: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.union(v.literal("rateSign"), v.literal("rateTrend")),
    rawAnswer: v.string(),
  })),
});

const topic14PolynomialEndBehaviorSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.string(),
  mode: v.union(v.literal("guided_practice"), v.literal("independent_practice")),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    leftEnd: v.string(),
    rightEnd: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.union(v.literal("leftEnd"), v.literal("rightEnd")),
    rawAnswer: v.string(),
  })),
});

const topic16EquationEndBehaviorSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.union(
    v.literal(PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID),
    v.literal(PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID),
  ),
  mode: v.union(v.literal("guided_practice"), v.literal("independent_practice")),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    a_leftEnd: v.union(v.literal("up"), v.literal("down")),
    a_rightEnd: v.union(v.literal("up"), v.literal("down")),
    b_leftEnd: v.union(v.literal("up"), v.literal("down")),
    b_rightEnd: v.union(v.literal("up"), v.literal("down")),
    c_leftEnd: v.union(v.literal("up"), v.literal("down")),
    c_rightEnd: v.union(v.literal("up"), v.literal("down")),
    d_leftEnd: v.union(v.literal("up"), v.literal("down")),
    d_rightEnd: v.union(v.literal("up"), v.literal("down")),
    e_leftEnd: v.union(v.literal("up"), v.literal("down")),
    e_rightEnd: v.union(v.literal("up"), v.literal("down")),
    f_leftEnd: v.union(v.literal("up"), v.literal("down")),
    f_rightEnd: v.union(v.literal("up"), v.literal("down")),
  }),
  parts: v.array(v.union(
    v.object({
      partId: v.literal("a_leftEnd"),
      rawAnswer: v.union(v.literal("up"), v.literal("down")),
    }),
    v.object({
      partId: v.literal("a_rightEnd"),
      rawAnswer: v.union(v.literal("up"), v.literal("down")),
    }),
    v.object({
      partId: v.literal("b_leftEnd"),
      rawAnswer: v.union(v.literal("up"), v.literal("down")),
    }),
    v.object({
      partId: v.literal("b_rightEnd"),
      rawAnswer: v.union(v.literal("up"), v.literal("down")),
    }),
    v.object({
      partId: v.literal("c_leftEnd"),
      rawAnswer: v.union(v.literal("up"), v.literal("down")),
    }),
    v.object({
      partId: v.literal("c_rightEnd"),
      rawAnswer: v.union(v.literal("up"), v.literal("down")),
    }),
    v.object({
      partId: v.literal("d_leftEnd"),
      rawAnswer: v.union(v.literal("up"), v.literal("down")),
    }),
    v.object({
      partId: v.literal("d_rightEnd"),
      rawAnswer: v.union(v.literal("up"), v.literal("down")),
    }),
    v.object({
      partId: v.literal("e_leftEnd"),
      rawAnswer: v.union(v.literal("up"), v.literal("down")),
    }),
    v.object({
      partId: v.literal("e_rightEnd"),
      rawAnswer: v.union(v.literal("up"), v.literal("down")),
    }),
    v.object({
      partId: v.literal("f_leftEnd"),
      rawAnswer: v.union(v.literal("up"), v.literal("down")),
    }),
    v.object({
      partId: v.literal("f_rightEnd"),
      rawAnswer: v.union(v.literal("up"), v.literal("down")),
    }),
  )),
});

const topic16EquationEndBehaviorWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    a_leftEnd: v.union(v.literal("up"), v.literal("down")),
    a_rightEnd: v.union(v.literal("up"), v.literal("down")),
    b_leftEnd: v.union(v.literal("up"), v.literal("down")),
    b_rightEnd: v.union(v.literal("up"), v.literal("down")),
    c_leftEnd: v.union(v.literal("up"), v.literal("down")),
    c_rightEnd: v.union(v.literal("up"), v.literal("down")),
    d_leftEnd: v.union(v.literal("up"), v.literal("down")),
    d_rightEnd: v.union(v.literal("up"), v.literal("down")),
    e_leftEnd: v.union(v.literal("up"), v.literal("down")),
    e_rightEnd: v.union(v.literal("up"), v.literal("down")),
    f_leftEnd: v.union(v.literal("up"), v.literal("down")),
    f_rightEnd: v.union(v.literal("up"), v.literal("down")),
  }),
  parts: v.array(v.union(
    v.object({ partId: v.literal("a_leftEnd"), rawAnswer: v.union(v.literal("up"), v.literal("down")) }),
    v.object({ partId: v.literal("a_rightEnd"), rawAnswer: v.union(v.literal("up"), v.literal("down")) }),
    v.object({ partId: v.literal("b_leftEnd"), rawAnswer: v.union(v.literal("up"), v.literal("down")) }),
    v.object({ partId: v.literal("b_rightEnd"), rawAnswer: v.union(v.literal("up"), v.literal("down")) }),
    v.object({ partId: v.literal("c_leftEnd"), rawAnswer: v.union(v.literal("up"), v.literal("down")) }),
    v.object({ partId: v.literal("c_rightEnd"), rawAnswer: v.union(v.literal("up"), v.literal("down")) }),
    v.object({ partId: v.literal("d_leftEnd"), rawAnswer: v.union(v.literal("up"), v.literal("down")) }),
    v.object({ partId: v.literal("d_rightEnd"), rawAnswer: v.union(v.literal("up"), v.literal("down")) }),
    v.object({ partId: v.literal("e_leftEnd"), rawAnswer: v.union(v.literal("up"), v.literal("down")) }),
    v.object({ partId: v.literal("e_rightEnd"), rawAnswer: v.union(v.literal("up"), v.literal("down")) }),
    v.object({ partId: v.literal("f_leftEnd"), rawAnswer: v.union(v.literal("up"), v.literal("down")) }),
    v.object({ partId: v.literal("f_rightEnd"), rawAnswer: v.union(v.literal("up"), v.literal("down")) }),
  )),
});

const topic14PolynomialEndBehaviorWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    leftEnd: v.string(),
    rightEnd: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.union(v.literal("leftEnd"), v.literal("rightEnd")),
    rawAnswer: v.string(),
  })),
});

const topic15RealZerosAndMultiplicitiesSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.string(),
  mode: v.union(v.literal("guided_practice"), v.literal("independent_practice")),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    a: v.array(v.object({ zero: v.number(), multiplicity: v.number() })),
    b: v.array(v.object({ zero: v.number(), multiplicity: v.number() })),
  }),
  parts: v.array(v.object({
    partId: v.union(v.literal("a"), v.literal("b")),
    rawAnswer: v.array(v.object({ zero: v.number(), multiplicity: v.number() })),
  })),
});

const topic15LeastPolynomialDegreeSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.string(),
  mode: v.union(v.literal("guided_practice"), v.literal("independent_practice")),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    leastDegree: v.number(),
  }),
  parts: v.array(v.object({
    partId: v.literal("leastDegree"),
    rawAnswer: v.number(),
  })),
});

const topic15PolynomialInequalitySubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.union(
    v.literal(PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID),
    v.literal(PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID),
  ),
  mode: v.union(v.literal("guided_practice"), v.literal("independent_practice")),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    roots: v.array(v.number()),
    intervalSigns: v.array(v.union(v.literal("+"), v.literal("-"))),
    solution: v.string(),
  }),
  parts: v.array(v.union(
    v.object({ partId: v.literal("roots"), rawAnswer: v.array(v.number()) }),
    v.object({
      partId: v.literal("intervalSigns"),
      rawAnswer: v.array(v.union(v.literal("+"), v.literal("-"))),
    }),
    v.object({ partId: v.literal("solution"), rawAnswer: v.string() }),
  )),
});

const topic15PolynomialInequalityWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    roots: v.array(v.number()),
    intervalSigns: v.array(v.union(v.literal("+"), v.literal("-"))),
    solution: v.string(),
  }),
  parts: v.array(v.union(
    v.object({ partId: v.literal("roots"), rawAnswer: v.array(v.number()) }),
    v.object({
      partId: v.literal("intervalSigns"),
      rawAnswer: v.array(v.union(v.literal("+"), v.literal("-"))),
    }),
    v.object({ partId: v.literal("solution"), rawAnswer: v.string() }),
  )),
});

const topic15LeastPolynomialDegreeWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    leastDegree: v.number(),
  }),
  parts: v.array(v.object({
    partId: v.literal("leastDegree"),
    rawAnswer: v.number(),
  })),
});

const topic15RealZerosAndMultiplicitiesWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    a: v.array(v.object({ zero: v.number(), multiplicity: v.number() })),
    b: v.array(v.object({ zero: v.number(), multiplicity: v.number() })),
  }),
  parts: v.array(v.object({
    partId: v.union(v.literal("a"), v.literal("b")),
    rawAnswer: v.array(v.object({ zero: v.number(), multiplicity: v.number() })),
  })),
});

const topic14RateSignAndTrendWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    rateSign: v.string(),
    rateTrend: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.union(v.literal("rateSign"), v.literal("rateTrend")),
    rawAnswer: v.string(),
  })),
});

const topic14PolynomialExtremaWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    relative_minimum_x: v.string(),
    relative_maximum_x: v.string(),
    absolute_minimum_x: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.union(
      v.literal("relative_minimum_x"),
      v.literal("relative_maximum_x"),
      v.literal("absolute_minimum_x"),
    ),
    rawAnswer: v.string(),
  })),
});

const topic14PolynomialDegreeLeadingCoefficientWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    a_degree: v.string(),
    a_leading_coefficient: v.string(),
    b_degree: v.string(),
    b_leading_coefficient: v.string(),
    c_degree: v.string(),
    c_leading_coefficient: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.union(
      v.literal("a_degree"),
      v.literal("a_leading_coefficient"),
      v.literal("b_degree"),
      v.literal("b_leading_coefficient"),
      v.literal("c_degree"),
      v.literal("c_leading_coefficient"),
    ),
    rawAnswer: v.string(),
  })),
});

const topic13RatePatternClassificationWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    a: v.string(),
    b: v.string(),
    c: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.union(v.literal("a"), v.literal("b"), v.literal("c")),
    rawAnswer: v.string(),
  })),
});

const topic13ConcavityWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    classification: v.string(),
  }),
  parts: v.array(v.object({
    partId: v.literal("classification"),
    rawAnswer: v.string(),
  })),
});

const topic12PointwiseRateOrderingWorkedSubmissionDataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    orderedPointIds: v.array(v.string()),
  }),
  parts: v.array(v.object({
    partId: v.literal("orderedPointIds"),
    rawAnswer: v.array(v.string()),
  })),
});

export const getProfileByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    return profile;
  },
});

const precalculusPilotActivityResultValidator = v.object({
  activityId: v.id("activities"),
  stableActivityId: v.string(),
  mode: v.union(
    v.literal("worked_example"),
    v.literal("guided_practice"),
    v.literal("independent_practice"),
  ),
  componentKey: v.string(),
  props: v.any(),
});

/**
 * Gets the approved Topic 1.1 pilot activities.
 * @param {import('./_generated/server').QueryCtx} ctx - The Convex query context.
 * @param {SelectedPilotPublication} publication - The canonical graph publication.
 * @returns {Promise<Array<object>>} The safe approved activity projections.
 */
export async function getApprovedPrecalculusPilotHandler(
  ctx: QueryCtx,
  publication: SelectedPilotPublication = selectedPilotPublication,
) {
  if (!isPrecalculusPilotPublished(publication)) return [];
  const specs = [
    { mode: "worked_example", stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID, componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY, seed: 0 },
    { mode: "guided_practice", stableActivityId: PRECALCULUS_PILOT_ACTIVITY_ID, componentKey: PRECALCULUS_PILOT_COMPONENT_KEY, seed: 0 },
    { mode: "independent_practice", stableActivityId: PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID, componentKey: PRECALCULUS_PILOT_COMPONENT_KEY, seed: 2 },
  ] as const;
  const rows = await Promise.all(specs.map((spec) => ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (query) => query.eq(
      "stableActivityId",
      spec.stableActivityId,
    ))
    .unique()));
  if (rows.some((row, index) => (
    !row
    || row.approval?.status !== "approved"
    || row.componentKey !== specs[index]!.componentKey
    || !isRecord(row.props)
    || row.props.nodeId !== PRECALCULUS_PILOT_NODE_ID
    || row.props.mode !== specs[index]!.mode
  ))) return [];
  const publicProps = specs.map((spec) => {
    const variant = generateTopic11IntervalGraph(spec.seed);
    const base = {
      prompt: "Identify the intervals where the graph increases, decreases, and stays constant.",
      domain: variant.domain,
      changePoints: variant.changePoints,
      points: variant.points,
      presentationMode: spec.mode,
    };
    if (spec.mode === "independent_practice") return base;
    if (spec.mode === "guided_practice") return {
      ...base,
      guidedSteps: [
        `Mark the domain endpoints and the change points x=${variant.changePoints[0]} and x=${variant.changePoints[1]}.`,
        "Read each graph segment from left to right and decide whether it rises, falls, or stays flat.",
        "Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.",
      ],
      fieldHelp: {
        increasingIntervals: "Find every segment that rises.",
        decreasingIntervals: "Find every segment that falls.",
        constantIntervals: "Check whether any segment stays flat.",
      },
    };
    return {
      ...base,
      title: "Worked Example: Classify Graph Intervals",
      steps: [
        { description: "Read the graph from left to right.", expression: "The domain is [0, 9]." },
        { description: "Classify the first segment.", expression: "The graph rises from x=0 to x=3." },
        { description: "Classify the middle segment.", expression: "The graph falls from x=3 to x=7." },
        { description: "Classify the final segment.", expression: "The graph rises from x=7 to x=9." },
        { description: "State the interval answers.", expression: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none." },
      ],
      finalAnswer: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none.",
    };
  });
  return rows.map((row, index) => ({
    activityId: row!._id,
    stableActivityId: row!.stableActivityId!,
    mode: specs[index]!.mode,
    componentKey: row!.componentKey,
    props: publicProps[index]!,
  }));
}

export const getApprovedPrecalculusPilot = internalQuery({
  args: {},
  returns: v.array(precalculusPilotActivityResultValidator),
  handler: (ctx) => getApprovedPrecalculusPilotHandler(ctx),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalPhysicalContextAnswers(value: unknown): {
  selectedOptionId: string;
} {
  if (!isRecord(value)) {
    throw new Error("Invalid physical-context submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid physical-context submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || typeof value.activityId !== "string"
    || typeof value.mode !== "string"
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isFinite(value.attemptNumber)
    || typeof value.submittedAt !== "string"
  ) {
    throw new Error("Invalid physical-context submission envelope");
  }

  const answers = value.answers;
  if (!isRecord(answers) || Object.keys(answers).join("|") !== "selectedOptionId") {
    throw new Error("Physical-context answers must contain exactly one selected option");
  }
  const selectedOptionId = answers.selectedOptionId;
  if (typeof selectedOptionId !== "string" || selectedOptionId.trim().length === 0) {
    throw new Error("Physical-context selected option is required");
  }

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== 1) {
    throw new Error("Physical-context submissions require one raw part");
  }
  const part = parts[0];
  if (
    !isRecord(part)
    || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
    || part.partId !== "selectedOptionId"
    || typeof part.rawAnswer !== "string"
    || part.rawAnswer !== selectedOptionId
  ) {
    throw new Error("Physical-context raw part does not match the selected option");
  }

  return { selectedOptionId };
}

function canonicalPointwiseRateOrderingAnswers(value: unknown): {
  orderedPointIds: string[];
} {
  if (!isRecord(value)) {
    throw new Error("Invalid pointwise rate-ordering submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid pointwise rate-ordering submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || typeof value.activityId !== "string"
    || typeof value.mode !== "string"
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isFinite(value.attemptNumber)
    || typeof value.submittedAt !== "string"
  ) {
    throw new Error("Invalid pointwise rate-ordering submission envelope");
  }

  const answers = value.answers;
  if (!isRecord(answers) || Object.keys(answers).join("|") !== "orderedPointIds") {
    throw new Error("Pointwise rate-ordering answers must contain exactly one ordered list");
  }
  const orderedPointIds = answers.orderedPointIds;
  if (
    !Array.isArray(orderedPointIds)
    || orderedPointIds.length !== 3
    || orderedPointIds.some((pointId) => typeof pointId !== "string")
    || new Set(orderedPointIds).size !== 3
    || new Set(orderedPointIds).size !== new Set(["A", "B", "C"]).size
    || !["A", "B", "C"].every((pointId) => orderedPointIds.includes(pointId))
  ) {
    throw new Error("Pointwise rate-ordering answers must contain A, B, and C once");
  }

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== 1) {
    throw new Error("Pointwise rate-ordering submissions require one raw part");
  }
  const part = parts[0];
  if (
    !isRecord(part)
    || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
    || part.partId !== "orderedPointIds"
    || !Array.isArray(part.rawAnswer)
    || part.rawAnswer.length !== orderedPointIds.length
    || part.rawAnswer.some((pointId, index) => pointId !== orderedPointIds[index])
  ) {
    throw new Error("Pointwise rate-ordering raw part does not match the ordered list");
  }

  return { orderedPointIds: [...orderedPointIds] };
}

function canonicalRatePatternClassificationAnswers(value: unknown): {
  a: string;
  b: string;
  c: string;
} {
  if (!isRecord(value)) {
    throw new Error("Invalid rate-pattern classification submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid rate-pattern classification submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || typeof value.activityId !== "string"
    || typeof value.mode !== "string"
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isFinite(value.attemptNumber)
    || typeof value.submittedAt !== "string"
  ) {
    throw new Error("Invalid rate-pattern classification submission envelope");
  }

  const answers = value.answers;
  if (!isRecord(answers) || Object.keys(answers).sort().join("|") !== "a|b|c") {
    throw new Error("Rate-pattern classification answers must contain exactly a, b, and c");
  }
  const classificationValues = ["linear", "quadratic", "neither", "cannot_determine"];
  if (
    typeof answers.a !== "string"
    || typeof answers.b !== "string"
    || typeof answers.c !== "string"
    || !classificationValues.includes(answers.a)
    || !classificationValues.includes(answers.b)
    || !classificationValues.includes(answers.c)
  ) {
    throw new Error("Rate-pattern classification answers contain an invalid classification");
  }

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== 3) {
    throw new Error("Rate-pattern classification submissions require three raw parts");
  }
  const expectedPartIds = ["a", "b", "c"] as const;
  for (const [index, part] of parts.entries()) {
    const expectedPartId = expectedPartIds[index]!;
    if (
      !isRecord(part)
      || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
      || part.partId !== expectedPartId
      || typeof part.rawAnswer !== "string"
      || part.rawAnswer !== answers[expectedPartId]
    ) {
      throw new Error("Rate-pattern classification raw parts must match a, b, and c answers");
    }
  }

  return {
    a: answers.a,
    b: answers.b,
    c: answers.c,
  };
}

function canonicalTopic14PolynomialDegreeLeadingCoefficientAnswers(value: unknown): {
  a_degree: string;
  a_leading_coefficient: string;
  b_degree: string;
  b_leading_coefficient: string;
  c_degree: string;
  c_leading_coefficient: string;
} {
  if (!isRecord(value)) {
    throw new Error("Invalid Topic 1.4 polynomial degree submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid Topic 1.4 polynomial degree submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || typeof value.activityId !== "string"
    || typeof value.mode !== "string"
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isFinite(value.attemptNumber)
    || typeof value.submittedAt !== "string"
  ) {
    throw new Error("Invalid Topic 1.4 polynomial degree submission envelope");
  }

  const answers = value.answers;
  const expectedAnswerIds = [
    "a_degree",
    "a_leading_coefficient",
    "b_degree",
    "b_leading_coefficient",
    "c_degree",
    "c_leading_coefficient",
  ] as const;
  if (!isRecord(answers) || Object.keys(answers).sort().join("|") !== expectedAnswerIds.join("|")) {
    throw new Error("Topic 1.4 polynomial degree answers must contain exactly six fields");
  }
  const a_degree = answers.a_degree;
  const a_leading_coefficient = answers.a_leading_coefficient;
  const b_degree = answers.b_degree;
  const b_leading_coefficient = answers.b_leading_coefficient;
  const c_degree = answers.c_degree;
  const c_leading_coefficient = answers.c_leading_coefficient;
  if (
    typeof a_degree !== "string"
    || typeof a_leading_coefficient !== "string"
    || typeof b_degree !== "string"
    || typeof b_leading_coefficient !== "string"
    || typeof c_degree !== "string"
    || typeof c_leading_coefficient !== "string"
  ) {
    throw new Error("Topic 1.4 polynomial degree answers must be strings");
  }

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== expectedAnswerIds.length) {
    throw new Error("Topic 1.4 polynomial degree submissions require six raw parts");
  }
  for (const [index, part] of parts.entries()) {
    const expectedPartId = expectedAnswerIds[index]!;
    if (
      !isRecord(part)
      || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
      || part.partId !== expectedPartId
      || typeof part.rawAnswer !== "string"
      || part.rawAnswer !== answers[expectedPartId]
    ) {
      throw new Error("Topic 1.4 polynomial degree raw parts must match the six answers");
    }
  }

  return {
    a_degree,
    a_leading_coefficient,
    b_degree,
    b_leading_coefficient,
    c_degree,
    c_leading_coefficient,
  };
}

function canonicalTopic14PolynomialExtremaAnswers(value: unknown): {
  relative_minimum_x: string;
  relative_maximum_x: string;
  absolute_minimum_x: string;
} {
  if (!isRecord(value)) {
    throw new Error("Invalid Topic 1.4 polynomial extrema submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid Topic 1.4 polynomial extrema submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || typeof value.activityId !== "string"
    || typeof value.mode !== "string"
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isFinite(value.attemptNumber)
    || typeof value.submittedAt !== "string"
  ) {
    throw new Error("Invalid Topic 1.4 polynomial extrema submission envelope");
  }

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join("|") !== "absolute_minimum_x|relative_maximum_x|relative_minimum_x"
    || typeof answers.relative_minimum_x !== "string"
    || typeof answers.relative_maximum_x !== "string"
    || typeof answers.absolute_minimum_x !== "string"
  ) {
    throw new Error("Topic 1.4 polynomial extrema answers must contain exactly three string fields");
  }

  const parts = value.parts;
  const expectedPartIds = [
    "relative_minimum_x",
    "relative_maximum_x",
    "absolute_minimum_x",
  ] as const;
  if (!Array.isArray(parts) || parts.length !== expectedPartIds.length) {
    throw new Error("Topic 1.4 polynomial extrema submissions require three raw parts");
  }
  for (const [index, part] of parts.entries()) {
    const expectedPartId = expectedPartIds[index]!;
    if (
      !isRecord(part)
      || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
      || part.partId !== expectedPartId
      || typeof part.rawAnswer !== "string"
      || part.rawAnswer !== answers[expectedPartId]
    ) {
      throw new Error("Topic 1.4 polynomial extrema raw parts must match the three answers");
    }
  }

  return {
    relative_minimum_x: answers.relative_minimum_x,
    relative_maximum_x: answers.relative_maximum_x,
    absolute_minimum_x: answers.absolute_minimum_x,
  };
}

function canonicalTopic14RateSignAndTrendAnswers(value: unknown): {
  rateSign: string;
  rateTrend: string;
} {
  if (!isRecord(value)) {
    throw new Error("Invalid Topic 1.4 rate sign and trend submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid Topic 1.4 rate sign and trend submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || typeof value.activityId !== "string"
    || typeof value.mode !== "string"
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isFinite(value.attemptNumber)
    || typeof value.submittedAt !== "string"
  ) {
    throw new Error("Invalid Topic 1.4 rate sign and trend submission envelope");
  }

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join("|") !== "rateSign|rateTrend"
    || typeof answers.rateSign !== "string"
    || typeof answers.rateTrend !== "string"
  ) {
    throw new Error("Topic 1.4 rate sign and trend answers must contain exactly two string fields");
  }

  const parts = value.parts;
  const expectedPartIds = ["rateSign", "rateTrend"] as const;
  if (!Array.isArray(parts) || parts.length !== expectedPartIds.length) {
    throw new Error("Topic 1.4 rate sign and trend submissions require two raw parts");
  }
  for (const [index, part] of parts.entries()) {
    const expectedPartId = expectedPartIds[index]!;
    if (
      !isRecord(part)
      || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
      || part.partId !== expectedPartId
      || typeof part.rawAnswer !== "string"
      || part.rawAnswer !== answers[expectedPartId]
    ) {
      throw new Error("Topic 1.4 rate sign and trend raw parts must match the two answers");
    }
  }

  return {
    rateSign: answers.rateSign,
    rateTrend: answers.rateTrend,
  };
}

function canonicalTopic14PolynomialEndBehaviorAnswers(value: unknown): {
  leftEnd: string;
  rightEnd: string;
} {
  if (!isRecord(value)) {
    throw new Error("Invalid Topic 1.4 polynomial end behavior submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid Topic 1.4 polynomial end behavior submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || typeof value.activityId !== "string"
    || typeof value.mode !== "string"
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isFinite(value.attemptNumber)
    || typeof value.submittedAt !== "string"
  ) {
    throw new Error("Invalid Topic 1.4 polynomial end behavior submission envelope");
  }

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join("|") !== "leftEnd|rightEnd"
    || typeof answers.leftEnd !== "string"
    || typeof answers.rightEnd !== "string"
  ) {
    throw new Error("Topic 1.4 polynomial end behavior answers must contain exactly two string fields");
  }

  const parts = value.parts;
  const expectedPartIds = ["leftEnd", "rightEnd"] as const;
  if (!Array.isArray(parts) || parts.length !== expectedPartIds.length) {
    throw new Error("Topic 1.4 polynomial end behavior submissions require two raw parts");
  }
  for (const [index, part] of parts.entries()) {
    const expectedPartId = expectedPartIds[index]!;
    if (
      !isRecord(part)
      || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
      || part.partId !== expectedPartId
      || typeof part.rawAnswer !== "string"
      || part.rawAnswer !== answers[expectedPartId]
    ) {
      throw new Error("Topic 1.4 polynomial end behavior raw parts must match the two answers");
    }
  }

  return {
    leftEnd: answers.leftEnd,
    rightEnd: answers.rightEnd,
  };
}

const TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS = [
  "a_leftEnd",
  "a_rightEnd",
  "b_leftEnd",
  "b_rightEnd",
  "c_leftEnd",
  "c_rightEnd",
  "d_leftEnd",
  "d_rightEnd",
  "e_leftEnd",
  "e_rightEnd",
  "f_leftEnd",
  "f_rightEnd",
] as const;

type Topic16EquationEndBehaviorCanonicalAnswers = Record<
  (typeof TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS)[number],
  string
>;

function canonicalTopic16EquationEndBehaviorAnswers(
  value: unknown,
): Topic16EquationEndBehaviorCanonicalAnswers {
  if (!isRecord(value)) {
    throw new Error("Invalid Topic 1.6 equation end behavior submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid Topic 1.6 equation end behavior submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || typeof value.activityId !== "string"
    || typeof value.mode !== "string"
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isSafeInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== "string"
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) {
    throw new Error("Invalid Topic 1.6 equation end behavior submission envelope");
  }

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join("|") !== TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.join("|")
    || TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.some((partId) => (
      answers[partId] !== "up" && answers[partId] !== "down"
    ))
  ) {
    throw new Error("Topic 1.6 equation end behavior answers must contain exactly 12 up/down fields");
  }

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.length) {
    throw new Error("Topic 1.6 equation end behavior submissions require 12 raw parts");
  }
  for (const [index, part] of parts.entries()) {
    const expectedPartId = TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS[index]!;
    if (
      !isRecord(part)
      || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
      || part.partId !== expectedPartId
      || (part.rawAnswer !== "up" && part.rawAnswer !== "down")
      || part.rawAnswer !== answers[expectedPartId]
    ) {
      throw new Error("Topic 1.6 equation end behavior raw parts must match the 12 answers");
    }
  }

  const canonicalAnswers = {} as Topic16EquationEndBehaviorCanonicalAnswers;
  for (const partId of TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS) {
    canonicalAnswers[partId] = answers[partId] as string;
  }
  return canonicalAnswers;
}

function canonicalTopic14PolynomialEndBehaviorWorkedAnswers(value: unknown): {
  leftEnd: string;
  rightEnd: string;
} {
  if (!isRecord(value)) {
    throw new Error("Invalid Topic 1.4 polynomial end behavior Worked submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid Topic 1.4 polynomial end behavior Worked submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || value.activityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID
    || value.mode !== "worked_example"
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isFinite(value.attemptNumber)
    || typeof value.submittedAt !== "string"
  ) {
    throw new Error("Invalid Topic 1.4 polynomial end behavior Worked submission envelope");
  }

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join("|") !== "leftEnd|rightEnd"
    || typeof answers.leftEnd !== "string"
    || typeof answers.rightEnd !== "string"
  ) {
    throw new Error("Topic 1.4 polynomial end behavior Worked answers must contain exactly two string fields");
  }

  const parts = value.parts;
  const partIds = ["leftEnd", "rightEnd"] as const;
  if (!Array.isArray(parts) || parts.length !== partIds.length) {
    throw new Error("Topic 1.4 polynomial end behavior Worked submissions require two raw parts");
  }
  for (const [index, part] of parts.entries()) {
    const partId = partIds[index]!;
    if (
      !isRecord(part)
      || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
      || part.partId !== partId
      || typeof part.rawAnswer !== "string"
      || part.rawAnswer !== answers[partId]
    ) {
      throw new Error("Topic 1.4 polynomial end behavior Worked raw parts must match the two answers");
    }
  }

  return {
    leftEnd: answers.leftEnd,
    rightEnd: answers.rightEnd,
  };
}

function canonicalTopic15RealZerosAndMultiplicitiesAnswers(value: unknown): {
  a: Array<{ zero: number; multiplicity: number }>;
  b: Array<{ zero: number; multiplicity: number }>;
} {
  if (!isRecord(value)) {
    throw new Error("Invalid Topic 1.5 real zeros and multiplicities submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid Topic 1.5 real zeros and multiplicities submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || typeof value.activityId !== "string"
    || typeof value.mode !== "string"
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isFinite(value.attemptNumber)
    || typeof value.submittedAt !== "string"
  ) {
    throw new Error("Invalid Topic 1.5 real zeros and multiplicities submission envelope");
  }

  const readPairs = (valueToRead: unknown): Array<{ zero: number; multiplicity: number }> => {
    if (!Array.isArray(valueToRead) || valueToRead.length < 2 || valueToRead.length > 3) {
      throw new Error("Topic 1.5 real zeros and multiplicities answers require two or three pairs");
    }
    return valueToRead.map((pair) => {
      if (
        !isRecord(pair)
        || Object.keys(pair).sort().join("|") !== "multiplicity|zero"
        || typeof pair.zero !== "number"
        || !Number.isFinite(pair.zero)
        || typeof pair.multiplicity !== "number"
        || !Number.isFinite(pair.multiplicity)
      ) {
        throw new Error("Topic 1.5 real zeros and multiplicities pairs must contain two finite numbers");
      }
      return { zero: pair.zero, multiplicity: pair.multiplicity };
    });
  };

  const answers = value.answers;
  if (!isRecord(answers) || Object.keys(answers).sort().join("|") !== "a|b") {
    throw new Error("Topic 1.5 real zeros and multiplicities answers must contain exactly a and b");
  }
  const canonicalAnswers = {
    a: readPairs(answers.a),
    b: readPairs(answers.b),
  };

  const parts = value.parts;
  const expectedPartIds = ["a", "b"] as const;
  if (!Array.isArray(parts) || parts.length !== expectedPartIds.length) {
    throw new Error("Topic 1.5 real zeros and multiplicities submissions require two raw parts");
  }
  for (const [index, part] of parts.entries()) {
    const expectedPartId = expectedPartIds[index]!;
    if (!isRecord(part) || Object.keys(part).sort().join("|") !== "partId|rawAnswer" || part.partId !== expectedPartId) {
      throw new Error("Topic 1.5 real zeros and multiplicities raw parts must be ordered a then b");
    }
    const rawAnswer = readPairs(part.rawAnswer);
    const answer = canonicalAnswers[expectedPartId];
    if (
      rawAnswer.length !== answer.length
      || rawAnswer.some((pair, pairIndex) => (
        pair.zero !== answer[pairIndex]!.zero
        || pair.multiplicity !== answer[pairIndex]!.multiplicity
      ))
    ) {
      throw new Error("Topic 1.5 real zeros and multiplicities raw parts must match the answers");
    }
  }

  return canonicalAnswers;
}

function sameTopic15RealZerosAndMultiplicitiesPairs(left: unknown, right: unknown): boolean {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  return left.every((leftPair, index) => {
    const rightPair = right[index];
    return (
      isRecord(leftPair)
      && isRecord(rightPair)
      && Object.keys(leftPair).sort().join("|") === "multiplicity|zero"
      && Object.keys(rightPair).sort().join("|") === "multiplicity|zero"
      && typeof leftPair.zero === "number"
      && Number.isFinite(leftPair.zero)
      && typeof rightPair.zero === "number"
      && Number.isFinite(rightPair.zero)
      && leftPair.zero === rightPair.zero
      && typeof leftPair.multiplicity === "number"
      && Number.isFinite(leftPair.multiplicity)
      && typeof rightPair.multiplicity === "number"
      && Number.isFinite(rightPair.multiplicity)
      && leftPair.multiplicity === rightPair.multiplicity
    );
  });
}

function canonicalTopic15LeastPolynomialDegreeAnswers(value: unknown): {
  leastDegree: number;
} {
  if (!isRecord(value)) {
    throw new Error("Invalid Topic 1.5 least polynomial degree submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid Topic 1.5 least polynomial degree submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || typeof value.activityId !== "string"
    || typeof value.mode !== "string"
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isSafeInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== "string"
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) {
    throw new Error("Invalid Topic 1.5 least polynomial degree submission envelope");
  }

  const answers = value.answers;
  if (
    !isRecord(answers)
    || Object.keys(answers).sort().join("|") !== "leastDegree"
    || typeof answers.leastDegree !== "number"
    || !Number.isFinite(answers.leastDegree)
    || !Number.isSafeInteger(answers.leastDegree)
  ) {
    throw new Error("Topic 1.5 least polynomial degree answers must contain one safe integer");
  }

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== 1) {
    throw new Error("Topic 1.5 least polynomial degree submissions require one raw part");
  }
  const part = parts[0];
  if (
    !isRecord(part)
    || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
    || part.partId !== "leastDegree"
    || typeof part.rawAnswer !== "number"
    || !Number.isFinite(part.rawAnswer)
    || !Number.isSafeInteger(part.rawAnswer)
    || part.rawAnswer !== answers.leastDegree
  ) {
    throw new Error("Topic 1.5 least polynomial degree raw part must match the answer");
  }

  return { leastDegree: answers.leastDegree };
}

function canonicalTopic15PolynomialInequalityAnswers(value: unknown): {
  roots: number[];
  intervalSigns: Array<"+" | "-">;
  solution: string;
} {
  if (!isRecord(value)) {
    throw new Error("Invalid Topic 1.5 polynomial inequality submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid Topic 1.5 polynomial inequality submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || (value.activityId !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID
      && value.activityId !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID
      && value.activityId !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID)
    || (value.mode !== "worked_example"
      && value.mode !== "guided_practice"
      && value.mode !== "independent_practice")
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isSafeInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== "string"
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) {
    throw new Error("Invalid Topic 1.5 polynomial inequality submission envelope");
  }
  const expectedMode = value.activityId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID
    ? "worked_example"
    : value.activityId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : "independent_practice";
  if (value.mode !== expectedMode) {
    throw new Error("Invalid Topic 1.5 polynomial inequality submission mode");
  }

  const answers = value.answers;
  if (!isRecord(answers) || Object.keys(answers).sort().join("|") !== "intervalSigns|roots|solution") {
    throw new Error("Invalid Topic 1.5 polynomial inequality answers");
  }
  const roots = answers.roots;
  const intervalSigns = answers.intervalSigns;
  if (
    !Array.isArray(roots)
    || roots.length !== (expectedMode === "guided_practice" ? 2 : 3)
    || !roots.every((root) => typeof root === "number" && Number.isFinite(root) && Math.abs(root) <= Number.MAX_SAFE_INTEGER)
    || !Array.isArray(intervalSigns)
    || intervalSigns.length !== roots.length + 1
    || !intervalSigns.every((sign) => sign === "+" || sign === "-")
    || typeof answers.solution !== "string"
    || answers.solution.trim().length === 0
  ) {
    throw new Error("Invalid Topic 1.5 polynomial inequality answer values");
  }

  const parts = value.parts;
  const expectedPartIds = ["roots", "intervalSigns", "solution"] as const;
  if (!Array.isArray(parts) || parts.length !== expectedPartIds.length) {
    throw new Error("Topic 1.5 polynomial inequality submissions require three raw parts");
  }
  for (const [index, partId] of expectedPartIds.entries()) {
    const part = parts[index];
    if (!isRecord(part) || Object.keys(part).sort().join("|") !== "partId|rawAnswer" || part.partId !== partId) {
      throw new Error("Invalid Topic 1.5 polynomial inequality raw part");
    }
    if (partId === "roots") {
      if (
        !Array.isArray(part.rawAnswer)
        || part.rawAnswer.length !== roots.length
        || part.rawAnswer.some((root, rootIndex) => root !== roots[rootIndex])
      ) {
        throw new Error("Topic 1.5 polynomial inequality roots part must match the answer");
      }
    } else if (partId === "intervalSigns") {
      if (
        !Array.isArray(part.rawAnswer)
        || part.rawAnswer.length !== intervalSigns.length
        || part.rawAnswer.some((sign, signIndex) => sign !== intervalSigns[signIndex])
      ) {
        throw new Error("Topic 1.5 polynomial inequality signs part must match the answer");
      }
    } else if (part.rawAnswer !== answers.solution) {
      throw new Error("Topic 1.5 polynomial inequality solution part must match the answer");
    }
  }

  return {
    roots: roots as number[],
    intervalSigns: intervalSigns as Array<"+" | "-">,
    solution: answers.solution,
  };
}

function canonicalConcavityAnswers(value: unknown): {
  classification: string;
} {
  if (!isRecord(value)) {
    throw new Error("Invalid concavity submission data");
  }
  const expectedFields = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ];
  if (Object.keys(value).sort().join("|") !== expectedFields.join("|")) {
    throw new Error("Invalid concavity submission fields");
  }
  if (
    value.contractVersion !== "practice.v1"
    || typeof value.activityId !== "string"
    || typeof value.mode !== "string"
    || value.status !== "submitted"
    || typeof value.attemptNumber !== "number"
    || !Number.isFinite(value.attemptNumber)
    || typeof value.submittedAt !== "string"
  ) {
    throw new Error("Invalid concavity submission envelope");
  }

  const answers = value.answers;
  if (!isRecord(answers) || Object.keys(answers).sort().join("|") !== "classification") {
    throw new Error("Concavity answers must contain exactly classification");
  }
  const classification = answers.classification;
  if (
    typeof classification !== "string"
    || !["concave_up", "concave_down", "neither"].includes(classification)
  ) {
    throw new Error("Concavity answer contains an invalid classification");
  }

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== 1) {
    throw new Error("Concavity submissions require one raw part");
  }
  const part = parts[0];
  if (
    !isRecord(part)
    || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
    || part.partId !== "classification"
    || typeof part.rawAnswer !== "string"
    || part.rawAnswer !== classification
  ) {
    throw new Error("Concavity raw part does not match the classification");
  }

  return { classification };
}

export const createTopic12PointwiseRateOrderingWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic12PointwiseRateOrderingWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
    ) {
      throw new Error("Invalid Topic 1.2 pointwise rate-ordering Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.2 pointwise rate-ordering Worked timestamp or attempt");
    }

    const answers = canonicalPointwiseRateOrderingAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.2 pointwise rate-ordering Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GENERATOR_KEY
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.2 pointwise rate-ordering Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      const storedOrderedPointIds = existingAnswers?.orderedPointIds;
      const storedPartAnswer = existingPart?.rawAnswer;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "orderedPointIds"
        || !Array.isArray(storedOrderedPointIds)
        || storedOrderedPointIds.length !== answers.orderedPointIds.length
        || storedOrderedPointIds.some((pointId, index) => pointId !== answers.orderedPointIds[index])
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== "partId|rawAnswer"
        || existingPart.partId !== "orderedPointIds"
        || !Array.isArray(storedPartAnswer)
        || storedPartAnswer.length !== answers.orderedPointIds.length
        || storedPartAnswer.some((pointId, index) => pointId !== answers.orderedPointIds[index])
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || Object.hasOwn(existing, "masteryContractVersion")
        || Object.hasOwn(existing, "score")
        || Object.hasOwn(existing, "maxScore")
        || Object.hasOwn(existing, "feedback")
        || Object.hasOwn(existing, "gradedAt")
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers,
      parts: [{ partId: "orderedPointIds", rawAnswer: answers.orderedPointIds }],
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});


/**
 * Stores one server-owned pilot submission. The browser's
 * grade, parts, attempt number, and activity identity are never authoritative.
 */
export const createServerOwnedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    submissionData: selectedDataValidator,
    idempotencyKey: v.string(),
  },
  returns: selectedResultValidator,
  handler: async (ctx, args) => {
    const mode =
      args.activityId === PRECALCULUS_PILOT_ACTIVITY_ID
        ? "guided_practice"
        : args.activityId === PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID
          ? "independent_practice"
          : null;
    if (
      !mode ||
      !args.idempotencyKey.trim() ||
      args.idempotencyKey.length > 256
    )
      throw new Error("Invalid Precalculus pilot activity or idempotency key");
    const profile = await ctx.db.get("profiles", args.userId);
    const credential = profile
      ? await ctx.db
          .query("auth_credentials")
          .withIndex("by_username", (q) => q.eq("username", profile.username))
          .unique()
      : null;
    if (
      !profile ||
      profile.role !== "student" ||
      !credential ||
      !credential.isActive ||
      credential.profileId !== profile._id ||
      credential.username !== profile.username ||
      credential.role !== profile.role ||
      credential.organizationId !== profile.organizationId
    )
      throw new Error("Inactive student identity");
    const expected = selectedExpectedActivity(mode);
    const submitted = canonicalSelectedSubmission(args.submissionData, args.activityId, mode);
    const answers = submitted.answers;
    const graded = gradeTopic11IntervalGraph(expected.variantSeed, answers);
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (q) =>
        q
          .eq("userId", args.userId)
          .eq("createIdempotencyKey", args.idempotencyKey),
      )
      .unique();
    if (existing) {
      const originalActivity = await ctx.db.get(
        "activities",
        existing.activityId,
      );
      const stored = selectedRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const storedEnvelopeValid =
        stored !== null &&
        PracticeSubmissionEnvelopeSchema.safeParse(stored).success &&
        Object.keys(stored).every((key) => SELECTED_ENVELOPE_KEYS.has(key));
      const old = stored && selectedRecord(stored.answers) ? stored.answers : null;
      const oldParts =
        stored && Array.isArray(stored.parts) ? stored.parts : [];
      const expectedPartIds = new Set(Object.keys(answers));
      const seenPartIds = new Set<string>();
      const gradedPartMap = new Map(
        graded.parts.map((part) => [part.partId, part]),
      );
      const partsMatch =
        oldParts.length === expectedPartIds.size &&
        oldParts.every((part) => {
          if (
            !selectedRecord(part) ||
            Object.keys(part).sort().join("|") !== SELECTED_STORED_PART_KEYS ||
            typeof part.partId !== "string" ||
            !expectedPartIds.has(part.partId) ||
            seenPartIds.has(part.partId)
          )
            return false;
          seenPartIds.add(part.partId);
          const submittedPart = submitted.parts.get(part.partId);
          const expectedPart = gradedPartMap.get(part.partId);
          return (
            submittedPart !== undefined &&
            expectedPart !== undefined &&
            part.rawAnswer === answers[part.partId as keyof typeof answers] &&
            (part.hintsUsed ?? 0) === submittedPart.hintsUsed &&
            (part.revealStepsSeen ?? 0) === submittedPart.revealStepsSeen &&
            (part.changedCount ?? 0) === submittedPart.changedCount &&
            part.isCorrect === expectedPart.isCorrect &&
            part.score === expectedPart.score &&
            part.maxScore === expectedPart.maxScore
          );
        });
      if (
        typeof existing.activityId !== "string" ||
        !existing.activityId.trim() ||
        (originalActivity !== null &&
          (!selectedRecord(originalActivity) ||
            !hasSelectedExpectedActivityIdentity(originalActivity, expected))) ||
        existing.stableActivityId !== args.activityId ||
        existing.masteryContractVersion !== "learning-evidence.v1" ||
        !stored ||
        !storedEnvelopeValid ||
        stored.contractVersion !== "practice.v1" ||
        stored.activityId !== args.activityId ||
        stored.mode !== mode ||
        stored.status !== "graded" ||
        typeof existing.submittedAt !== "number" ||
        !Number.isFinite(existing.submittedAt) ||
        stored.submittedAt !== new Date(existing.submittedAt).toISOString() ||
        !old ||
        Object.keys(old).sort().join("|") !==
          "constantIntervals|decreasingIntervals|increasingIntervals" ||
        Object.entries(answers).some(
          ([key, value]) => normalizeSelectedAnswer(old[key]) !== value,
        ) ||
        !partsMatch ||
        !Number.isInteger(existing.attemptOrdinal) ||
        existing.attemptOrdinal! < 1 ||
        stored.attemptNumber !== existing.attemptOrdinal ||
        existing.score !== graded.score ||
        existing.maxScore !== graded.maxScore ||
        typeof existing.feedback !== "string"
      )
        throw new Error("idempotency_conflict");
      return {
        submissionId: existing._id,
        score: existing.score!,
        maxScore: existing.maxScore!,
        attemptOrdinal: existing.attemptOrdinal!,
        feedback: existing.feedback,
      };
    }
    if (!isPrecalculusPilotPublished())
      throw new Error("Precalculus pilot curriculum is not approved");
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (q) =>
        q.eq("stableActivityId", args.activityId),
      )
      .unique();
    if (
      !activity ||
      !hasSelectedExpectedActivityIdentity(activity, expected) ||
      activity.approval?.status !== "approved"
    )
      throw new Error(
        "Precalculus pilot activity is not approved or has invalid identity",
      );
    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (q) =>
        q.eq("userId", args.userId).eq("activityId", activity._id),
      )
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const feedback = `${graded.score}/${graded.maxScore} interval classifications matched the server rubric.`;
    const gradedParts = graded.parts.map((part) => ({
      ...submitted.parts.get(part.partId),
      ...part,
      rawAnswer: answers[part.partId as keyof typeof answers],
    }));
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: {
        contractVersion: "practice.v1",
        activityId: args.activityId,
        mode,
        status: "graded",
        attemptNumber: attemptOrdinal,
        submittedAt: new Date(now).toISOString(),
        answers,
        parts: gradedParts,
        ...submitted.optionalFields,
      },
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createPhysicalContextSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: physicalContextSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid physical-context activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }

    const answers = canonicalPhysicalContextAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => query.eq("stableActivityId", args.activityId))
      .unique();
    if (!activity || activity.componentKey !== PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY) {
      throw new Error("Physical-context activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_GRADING_CONFIG
      : PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Physical-context activity has invalid grading configuration");
    }
    const graded = gradeTopic11PhysicalContextGraphChoice(gradingConfig.variantSeed, answers);
    const expectedPart = graded.parts[0]!;

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingSubmissionData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingSubmissionData && isRecord(existingSubmissionData.answers)
        ? existingSubmissionData.answers
        : null;
      const existingParts = existingSubmissionData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || !existingSubmissionData
        || existingSubmissionData.contractVersion !== "practice.v1"
        || existingSubmissionData.mode !== expectedMode
        || existingSubmissionData.status !== "graded"
        || !existingAnswers
        || existingAnswers.selectedOptionId !== answers.selectedOptionId
        || !existingPart
        || existingPart.partId !== "selectedOptionId"
        || existingPart.rawAnswer !== answers.selectedOptionId
        || existingPart.isCorrect !== expectedPart.isCorrect
        || existingPart.score !== expectedPart.score
        || existingPart.maxScore !== expectedPart.maxScore
        || existing.masteryContractVersion !== "learning-evidence.v1"
      ) {
        throw new Error("idempotency_conflict");
      }
      const storedAttemptOrdinal = existing.attemptOrdinal;
      if (
        typeof existing.score !== "number"
        || typeof existing.maxScore !== "number"
        || !Number.isFinite(existing.score)
        || !Number.isFinite(existing.maxScore)
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || typeof storedAttemptOrdinal !== "number"
        || !Number.isInteger(storedAttemptOrdinal)
        || storedAttemptOrdinal < 1
        || typeof existing.feedback !== "string"
      ) {
        throw new Error("Stored physical-context submission is incomplete");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: storedAttemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const feedback = `${graded.score}/${graded.maxScore} graph selections matched the server rubric.`;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic12TableAverageRateSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: physicalContextSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.2 activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.2 submission timestamp or attempt");
    }

    const answers = canonicalPhysicalContextAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_12_COMPONENT_KEY
    ) {
      throw new Error("Topic 1.2 activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_12_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_12_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.2 activity has invalid grading configuration");
    }

    const graded = gradeTopic12TableAverageRateChoice(gradingConfig.variantSeed, answers);
    const expectedPart = graded.parts[0]!;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existingData.submittedAt !== "string"
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || existingData.attemptNumber !== existing.attemptOrdinal
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "selectedOptionId"
        || existingAnswers.selectedOptionId !== answers.selectedOptionId
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== Object.keys(expectedPart).sort().join("|")
        || existingPart.partId !== expectedPart.partId
        || existingPart.rawAnswer !== expectedPart.rawAnswer
        || existingPart.isCorrect !== expectedPart.isCorrect
        || existingPart.score !== expectedPart.score
        || existingPart.maxScore !== expectedPart.maxScore
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || typeof existing.feedback !== "string"
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const score = graded.score;
    const maxScore = graded.maxScore;
    const feedback = `${score}/${maxScore} table interval selections matched the server rubric.`;
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score,
      maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score,
      maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic12GraphAverageRateSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: physicalContextSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.2 graph activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.2 graph submission timestamp or attempt");
    }

    const answers = canonicalPhysicalContextAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.2 graph activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.2 graph activity has invalid grading configuration");
    }

    const graded = gradeTopic12GraphAverageRateChoice(gradingConfig.variantSeed, answers);
    const expectedPart = graded.parts[0]!;
    const feedback = `${graded.score}/${graded.maxScore} graph selections matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existingData.submittedAt !== "string"
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || existingData.attemptNumber !== existing.attemptOrdinal
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "selectedOptionId"
        || existingAnswers.selectedOptionId !== answers.selectedOptionId
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== Object.keys(expectedPart).sort().join("|")
        || existingPart.partId !== expectedPart.partId
        || existingPart.rawAnswer !== expectedPart.rawAnswer
        || existingPart.isCorrect !== expectedPart.isCorrect
        || existingPart.score !== expectedPart.score
        || existingPart.maxScore !== expectedPart.maxScore
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existing.feedback !== feedback
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic12PointwiseLeastRateSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: physicalContextSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.2 pointwise least-rate activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.2 pointwise submission timestamp or attempt");
    }

    const answers = canonicalPhysicalContextAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.2 pointwise least-rate activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.2 pointwise least-rate activity has invalid grading configuration");
    }

    const graded = gradeTopic12PointwiseLeastRateChoice(gradingConfig.variantSeed, answers);
    const expectedPart = graded.parts[0]!;
    const feedback = `${graded.score}/${graded.maxScore} pointwise selections matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existingData.submittedAt !== "string"
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || existingData.attemptNumber !== existing.attemptOrdinal
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "selectedOptionId"
        || existingAnswers.selectedOptionId !== answers.selectedOptionId
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== Object.keys(expectedPart).sort().join("|")
        || existingPart.partId !== expectedPart.partId
        || existingPart.rawAnswer !== expectedPart.rawAnswer
        || existingPart.isCorrect !== expectedPart.isCorrect
        || existingPart.score !== expectedPart.score
        || existingPart.maxScore !== expectedPart.maxScore
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || typeof existing.feedback !== "string"
        || existing.feedback !== feedback
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic12NegativeRateContextSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: physicalContextSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.2 negative-rate context activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.2 negative-rate context timestamp or attempt");
    }

    const answers = canonicalPhysicalContextAnswers(args.submissionData);
    if (!( ["A", "B", "C", "D"] as string[]).includes(answers.selectedOptionId)) {
      throw new Error("Negative-rate context selected option is invalid");
    }

    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.2 negative-rate context activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.2 negative-rate context activity has invalid grading configuration");
    }

    const graded = gradeTopic12NegativeRateContextChoice(gradingConfig.variantSeed, answers);
    const expectedPart = graded.parts[0]!;
    const feedback = `${graded.score}/${graded.maxScore} negative-rate context selections matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existingData.submittedAt !== "string"
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || existingData.attemptNumber !== existing.attemptOrdinal
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "selectedOptionId"
        || existingAnswers.selectedOptionId !== answers.selectedOptionId
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== Object.keys(expectedPart).sort().join("|")
        || existingPart.partId !== expectedPart.partId
        || existingPart.rawAnswer !== expectedPart.rawAnswer
        || existingPart.isCorrect !== expectedPart.isCorrect
        || existingPart.score !== expectedPart.score
        || existingPart.maxScore !== expectedPart.maxScore
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || typeof existing.feedback !== "string"
        || existing.feedback !== feedback
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic12QuadraticNegativeRateIntervalSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: physicalContextSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.2 quadratic negative-rate interval activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.2 quadratic negative-rate interval timestamp or attempt");
    }

    const answers = canonicalPhysicalContextAnswers(args.submissionData);
    if (!( ["A", "B", "C", "D"] as string[]).includes(answers.selectedOptionId)) {
      throw new Error("Quadratic negative-rate interval selected option is invalid");
    }

    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.2 quadratic negative-rate interval activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.2 quadratic negative-rate interval activity has invalid grading configuration");
    }

    const graded = gradeTopic12QuadraticNegativeRateIntervalChoice(gradingConfig.variantSeed, answers);
    const expectedPart = graded.parts[0]!;
    const feedback = `${graded.score}/${graded.maxScore} quadratic negative-rate interval selections matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existingData.submittedAt !== "string"
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || existingData.attemptNumber !== existing.attemptOrdinal
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "selectedOptionId"
        || existingAnswers.selectedOptionId !== answers.selectedOptionId
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== Object.keys(expectedPart).sort().join("|")
        || existingPart.partId !== expectedPart.partId
        || existingPart.rawAnswer !== expectedPart.rawAnswer
        || existingPart.isCorrect !== expectedPart.isCorrect
        || existingPart.score !== expectedPart.score
        || existingPart.maxScore !== expectedPart.maxScore
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || typeof existing.feedback !== "string"
        || existing.feedback !== feedback
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic13RatePatternClassificationSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic13RatePatternClassificationSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.3 rate-pattern classification activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.3 rate-pattern classification timestamp or attempt");
    }

    const answers = canonicalRatePatternClassificationAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.3 rate-pattern classification activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.3 rate-pattern classification activity has invalid grading configuration");
    }

    const graded = gradeTopic13RatePatternClassification(gradingConfig.variantSeed, answers);
    const feedback = `${graded.score}/${graded.maxScore} rate-pattern classifications matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPartRows = Array.isArray(existingParts)
        ? existingParts.filter(isRecord)
        : [];
      const expectedPartIds = ["a", "b", "c"] as const;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existingData.submittedAt !== "string"
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || existingData.attemptNumber !== existing.attemptOrdinal
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "a|b|c"
        || existingAnswers.a !== answers.a
        || existingAnswers.b !== answers.b
        || existingAnswers.c !== answers.c
        || !Array.isArray(existingParts)
        || existingParts.length !== expectedPartIds.length
        || existingPartRows.length !== expectedPartIds.length
        || expectedPartIds.some((partId, index) => {
          const part = existingPartRows[index];
          const expectedPart = graded.parts[index];
          return (
            !part
            || Object.keys(part).sort().join("|") !== "isCorrect|maxScore|partId|rawAnswer|score"
            || part.partId !== partId
            || part.rawAnswer !== answers[partId]
            || part.isCorrect !== expectedPart?.isCorrect
            || part.score !== expectedPart?.score
            || part.maxScore !== expectedPart?.maxScore
          );
        })
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || typeof existing.feedback !== "string"
        || existing.feedback !== feedback
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic14PolynomialDegreeLeadingCoefficientSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic14PolynomialDegreeLeadingCoefficientSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.4 polynomial degree activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || !Number.isFinite(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.4 polynomial degree timestamp or attempt");
    }

    const answers = canonicalTopic14PolynomialDegreeLeadingCoefficientAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.4 polynomial degree activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.4 polynomial degree activity has invalid grading configuration");
    }

    const graded = gradeTopic14PolynomialDegreeLeadingCoefficient(gradingConfig.variantSeed, answers);
    const feedback = `${graded.score}/${graded.maxScore} degree and leading coefficient responses matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPartRows = Array.isArray(existingParts)
        ? existingParts.filter(isRecord)
        : [];
      const expectedAnswerIds = [
        "a_degree",
        "a_leading_coefficient",
        "b_degree",
        "b_leading_coefficient",
        "c_degree",
        "c_leading_coefficient",
      ] as const;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== expectedAnswerIds.join("|")
        || expectedAnswerIds.some((answerId) => existingAnswers[answerId] !== answers[answerId])
        || !Array.isArray(existingParts)
        || existingParts.length !== expectedAnswerIds.length
        || existingPartRows.length !== expectedAnswerIds.length
        || expectedAnswerIds.some((partId, index) => {
          const part = existingPartRows[index];
          const expectedPart = graded.parts[index];
          return (
            !part
            || Object.keys(part).sort().join("|") !== "isCorrect|maxScore|partId|rawAnswer|score"
            || part.partId !== partId
            || part.rawAnswer !== expectedPart?.rawAnswer
            || part.isCorrect !== expectedPart?.isCorrect
            || part.score !== expectedPart?.score
            || part.maxScore !== expectedPart?.maxScore
          );
        })
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || typeof existing.feedback !== "string"
        || existing.feedback !== feedback
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.submittedAt !== existing.gradedAt
        || existing.submittedAt !== existing.createdAt
        || existing.submittedAt !== existing.updatedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic14PolynomialExtremaWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic14PolynomialExtremaWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
      || args.submissionData.status !== "submitted"
    ) {
      throw new Error("Invalid Topic 1.4 polynomial extrema Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || !Number.isFinite(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.4 polynomial extrema Worked timestamp or attempt");
    }

    const answers = canonicalTopic14PolynomialExtremaAnswers(args.submissionData);
    const expectedSourceAnswer = generateTopic14PolynomialExtremaFromGraphOutput(0).expectedAnswer as {
      relative_minimum_x: number;
      relative_maximum_x: number;
      absolute_minimum_x: number;
    };
    const sourceAnswers = {
      relative_minimum_x: String(expectedSourceAnswer.relative_minimum_x),
      relative_maximum_x: String(expectedSourceAnswer.relative_maximum_x),
      absolute_minimum_x: String(expectedSourceAnswer.absolute_minimum_x),
    };
    const answerIds = [
      "relative_minimum_x",
      "relative_maximum_x",
      "absolute_minimum_x",
    ] as const;

    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.4 polynomial extrema Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GENERATOR_KEY
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.4 polynomial extrema Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const forbiddenStoredFields = [
        "masteryContractVersion",
        "score",
        "maxScore",
        "feedback",
        "gradedAt",
        "correctness",
        "isCorrect",
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutions",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "absolute_minimum_x|relative_maximum_x|relative_minimum_x"
        || answerIds.some((answerId) => (
          existingAnswers[answerId] !== sourceAnswers[answerId]
          || existingAnswers[answerId] !== answers[answerId]
        ))
        || !Array.isArray(existingParts)
        || existingParts.length !== answerIds.length
        || answerIds.some((partId, index) => {
          const part = existingParts[index];
          return (
            !isRecord(part)
            || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
            || part.partId !== partId
            || part.rawAnswer !== sourceAnswers[partId]
            || part.rawAnswer !== answers[partId]
          );
        })
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    if (answerIds.some((answerId) => answers[answerId] !== sourceAnswers[answerId])) {
      throw new Error("Topic 1.4 polynomial extrema Worked answer does not match the source");
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers: sourceAnswers,
      parts: answerIds.map((partId) => ({ partId, rawAnswer: sourceAnswers[partId] })),
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic14PolynomialExtremaFromGraphSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic14PolynomialExtremaSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.4 polynomial extrema activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || !Number.isFinite(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.4 polynomial extrema timestamp or attempt");
    }

    const answers = canonicalTopic14PolynomialExtremaAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.4 polynomial extrema activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.4 polynomial extrema activity has invalid grading configuration");
    }

    const graded = gradeTopic14PolynomialExtremaFromGraph(expectedConfig.variantSeed, answers);
    const feedback = `${graded.score}/${graded.maxScore} extrema responses matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const expectedPartIds = [
        "relative_minimum_x",
        "relative_maximum_x",
        "absolute_minimum_x",
      ] as const;
      const forbiddenStoredFields = [
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
        "isCorrect",
        "correctness",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "absolute_minimum_x|relative_maximum_x|relative_minimum_x"
        || expectedPartIds.some((partId) => existingAnswers[partId] !== answers[partId])
        || !Array.isArray(existingParts)
        || existingParts.length !== expectedPartIds.length
        || expectedPartIds.some((partId, index) => {
          const part = existingParts[index];
          const expectedPart = graded.parts[index];
          return (
            !isRecord(part)
            || !isRecord(expectedPart)
            || Object.keys(part).sort().join("|") !== "isCorrect|maxScore|partId|rawAnswer|score"
            || part.partId !== partId
            || part.partId !== expectedPart.partId
            || part.rawAnswer !== expectedPart.rawAnswer
            || part.isCorrect !== expectedPart.isCorrect
            || part.score !== expectedPart.score
            || part.maxScore !== expectedPart.maxScore
          );
        })
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || existing.feedback !== feedback
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic14RateSignAndTrendWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic14RateSignAndTrendWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
      || args.submissionData.status !== "submitted"
    ) {
      throw new Error("Invalid Topic 1.4 rate sign and trend Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || !Number.isFinite(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.4 rate sign and trend Worked timestamp or attempt");
    }

    const answers = canonicalTopic14RateSignAndTrendAnswers(args.submissionData);
    const expectedSourceAnswer = generateTopic14RateSignAndTrendOutput(0).expectedAnswer as {
      rateSign: string;
      rateTrend: string;
    };
    const sourceAnswers = {
      rateSign: String(expectedSourceAnswer.rateSign),
      rateTrend: String(expectedSourceAnswer.rateTrend),
    };
    const partIds = ["rateSign", "rateTrend"] as const;

    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.4 rate sign and trend Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GENERATOR_KEY
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_GRADING_CONFIG.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.4 rate sign and trend Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const forbiddenStoredFields = [
        "masteryContractVersion",
        "score",
        "maxScore",
        "feedback",
        "gradedAt",
        "correctness",
        "isCorrect",
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutions",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "rateSign|rateTrend"
        || partIds.some((partId) => (
          existingAnswers[partId] !== sourceAnswers[partId]
          || existingAnswers[partId] !== answers[partId]
        ))
        || !Array.isArray(existingParts)
        || existingParts.length !== partIds.length
        || partIds.some((partId, index) => {
          const part = existingParts[index];
          return (
            !isRecord(part)
            || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
            || part.partId !== partId
            || part.rawAnswer !== sourceAnswers[partId]
            || part.rawAnswer !== answers[partId]
          );
        })
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    if (partIds.some((partId) => answers[partId] !== sourceAnswers[partId])) {
      throw new Error("Topic 1.4 rate sign and trend Worked answer does not match the source");
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers: sourceAnswers,
      parts: partIds.map((partId) => ({ partId, rawAnswer: sourceAnswers[partId] })),
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic14RateSignAndTrendSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic14RateSignAndTrendSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.4 rate sign and trend activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || !Number.isFinite(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.4 rate sign and trend timestamp or attempt");
    }

    const answers = canonicalTopic14RateSignAndTrendAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.4 rate sign and trend activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.4 rate sign and trend activity has invalid grading configuration");
    }

    const graded = gradeTopic14RateSignAndTrend(expectedConfig.variantSeed, answers);
    const feedback = `${graded.score}/${graded.maxScore} rate sign and trend responses matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const expectedPartIds = ["rateSign", "rateTrend"] as const;
      const forbiddenStoredFields = [
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
        "isCorrect",
        "correctness",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "rateSign|rateTrend"
        || expectedPartIds.some((partId) => existingAnswers[partId] !== answers[partId])
        || !Array.isArray(existingParts)
        || existingParts.length !== expectedPartIds.length
        || expectedPartIds.some((partId, index) => {
          const part = existingParts[index];
          const expectedPart = graded.parts[index];
          return (
            !isRecord(part)
            || !isRecord(expectedPart)
            || Object.keys(part).sort().join("|") !== "isCorrect|maxScore|partId|rawAnswer|score"
            || part.partId !== partId
            || part.partId !== expectedPart.partId
            || part.rawAnswer !== expectedPart.rawAnswer
            || part.isCorrect !== expectedPart.isCorrect
            || part.score !== expectedPart.score
            || part.maxScore !== expectedPart.maxScore
          );
        })
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || existing.feedback !== feedback
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic14PolynomialEndBehaviorWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic14PolynomialEndBehaviorWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
      || args.submissionData.status !== "submitted"
    ) {
      throw new Error("Invalid Topic 1.4 polynomial end behavior Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || !Number.isFinite(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.4 polynomial end behavior Worked timestamp or attempt");
    }

    const answers = canonicalTopic14PolynomialEndBehaviorWorkedAnswers(args.submissionData);
    const expectedSourceAnswer = generateTopic14PolynomialEndBehaviorOutput(0).expectedAnswer as {
      leftEnd: string;
      rightEnd: string;
    };
    const sourceAnswers = {
      leftEnd: String(expectedSourceAnswer.leftEnd),
      rightEnd: String(expectedSourceAnswer.rightEnd),
    };
    const partIds = ["leftEnd", "rightEnd"] as const;

    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.4 polynomial end behavior Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.4 polynomial end behavior Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const forbiddenStoredFields = [
        "masteryContractVersion",
        "score",
        "maxScore",
        "feedback",
        "gradedAt",
        "correctness",
        "isCorrect",
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutions",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "leftEnd|rightEnd"
        || existingAnswers.leftEnd !== sourceAnswers.leftEnd
        || existingAnswers.rightEnd !== sourceAnswers.rightEnd
        || existingAnswers.leftEnd !== answers.leftEnd
        || existingAnswers.rightEnd !== answers.rightEnd
        || !Array.isArray(existingParts)
        || existingParts.length !== partIds.length
        || partIds.some((partId, index) => {
          const part = existingParts[index];
          return (
            !isRecord(part)
            || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
            || part.partId !== partId
            || part.rawAnswer !== sourceAnswers[partId]
            || part.rawAnswer !== answers[partId]
          );
        })
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    if (partIds.some((partId) => answers[partId] !== sourceAnswers[partId])) {
      throw new Error("Topic 1.4 polynomial end behavior Worked answer does not match the source");
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers: sourceAnswers,
      parts: partIds.map((partId) => ({ partId, rawAnswer: sourceAnswers[partId] })),
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic14PolynomialEndBehaviorSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic14PolynomialEndBehaviorSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.4 polynomial end behavior activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || !Number.isFinite(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.4 polynomial end behavior timestamp or attempt");
    }

    const answers = canonicalTopic14PolynomialEndBehaviorAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.4 polynomial end behavior activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.4 polynomial end behavior activity has invalid grading configuration");
    }

    const graded = gradeTopic14PolynomialEndBehavior(expectedConfig.variantSeed, answers);
    const feedback = `${graded.score}/${graded.maxScore} polynomial end-behavior responses matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const expectedPartIds = ["leftEnd", "rightEnd"] as const;
      const forbiddenStoredFields = [
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
        "isCorrect",
        "correctness",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "leftEnd|rightEnd"
        || existingAnswers.leftEnd !== answers.leftEnd
        || existingAnswers.rightEnd !== answers.rightEnd
        || !Array.isArray(existingParts)
        || existingParts.length !== expectedPartIds.length
        || expectedPartIds.some((partId, index) => {
          const part = existingParts[index];
          const expectedPart = graded.parts[index];
          return (
            !isRecord(part)
            || !isRecord(expectedPart)
            || Object.keys(part).sort().join("|") !== "isCorrect|maxScore|partId|rawAnswer|score"
            || part.partId !== partId
            || part.partId !== expectedPart.partId
            || part.rawAnswer !== expectedPart.rawAnswer
            || part.isCorrect !== expectedPart.isCorrect
            || part.score !== expectedPart.score
            || part.maxScore !== expectedPart.maxScore
          );
        })
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || existing.feedback !== feedback
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic16EquationEndBehaviorWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic16EquationEndBehaviorWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
      || args.submissionData.status !== "submitted"
    ) {
      throw new Error("Invalid Topic 1.6 equation end behavior Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isSafeInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.6 equation end behavior Worked timestamp or attempt");
    }

    const expectedSourceAnswers = generateTopic16EquationEndBehaviorOutput(0).expectedAnswer as
      Topic16EquationEndBehaviorCanonicalAnswers;

    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq(
          "stableActivityId",
          PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
        )
      ))
      .unique();
    const workedOutput = generateTopic16EquationEndBehaviorOutput(0);
    const expectedWorkedProps = {
      ...(workedOutput.data as { rendererProps: Record<string, unknown> }).rendererProps,
      presentationMode: "worked_example" as const,
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: "The six polynomial end behaviors are shown above.",
    };
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY
      || !isRecord(activity.props)
      || JSON.stringify(activity.props) !== JSON.stringify(expectedWorkedProps)
    ) {
      throw new Error("Topic 1.6 equation end behavior Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.6 equation end behavior Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      let replayAnswers: Topic16EquationEndBehaviorCanonicalAnswers;
      try {
        replayAnswers = canonicalTopic16EquationEndBehaviorAnswers(args.submissionData);
      } catch {
        throw new Error("idempotency_conflict");
      }
      if (TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.some((partId) => (
        replayAnswers[partId] !== expectedSourceAnswers[partId]
      ))) {
        throw new Error("idempotency_conflict");
      }

      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const forbiddenStoredFields = [
        "masteryContractVersion",
        "score",
        "maxScore",
        "feedback",
        "gradedAt",
        "evidence",
        "kst",
        "srs",
        "correctness",
        "isCorrect",
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutions",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
      ];
      if (
        typeof existing._id !== "string"
        || Object.keys(existing).filter((field) => field !== "_creationTime").sort().join("|") !== "_id|activityId|attemptOrdinal|createIdempotencyKey|createdAt|stableActivityId|submissionData|submittedAt|updatedAt|userId"
        || (Object.hasOwn(existing, "_creationTime") && (
          typeof existing._creationTime !== "number"
          || !Number.isFinite(existing._creationTime)
        ))
        || existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isSafeInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isSafeInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.join("|")
        || TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.some((partId) => (
          existingAnswers[partId] !== expectedSourceAnswers[partId]
          || existingAnswers[partId] !== replayAnswers[partId]
        ))
        || !Array.isArray(existingParts)
        || existingParts.length !== TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.length
        || !existingParts.every((part, index) => {
          const expectedPartId = TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS[index]!;
          return isRecord(part)
            && Object.keys(part).sort().join("|") === "partId|rawAnswer"
            && part.partId === expectedPartId
            && part.rawAnswer === expectedSourceAnswers[expectedPartId]
            && part.rawAnswer === replayAnswers[expectedPartId];
        })
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    const answers = canonicalTopic16EquationEndBehaviorAnswers(args.submissionData);
    if (TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.some((partId) => (
      answers[partId] !== expectedSourceAnswers[partId]
    ))) {
      throw new Error("Topic 1.6 equation end behavior Worked answer does not match the source");
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const latestAttemptOrdinal = latest?.attemptOrdinal;
    if (
      latest
      && (
        typeof latestAttemptOrdinal !== "number"
        || !Number.isSafeInteger(latestAttemptOrdinal)
        || latestAttemptOrdinal < 1
        || latestAttemptOrdinal >= Number.MAX_SAFE_INTEGER
      )
    ) {
      throw new Error("Invalid Topic 1.6 equation end behavior Worked stored attempt ordinal");
    }
    const attemptOrdinal = (latestAttemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const sourceAnswers = { ...expectedSourceAnswers };
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers: sourceAnswers,
      parts: TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.map((partId) => ({
        partId,
        rawAnswer: sourceAnswers[partId],
      })),
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic16EquationEndBehaviorSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic16EquationEndBehaviorSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || !isRecord(args.submissionData)
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
      || args.submissionData.status !== "submitted"
    ) {
      throw new Error("Invalid Topic 1.6 equation end behavior activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isSafeInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.6 equation end behavior timestamp or attempt");
    }

    const answers = canonicalTopic16EquationEndBehaviorAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.6 equation end behavior activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isSafeInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.6 equation end behavior activity has invalid grading configuration");
    }

    const graded = gradeTopic16EquationEndBehavior(expectedConfig.variantSeed, answers);
    const feedback = `${graded.score}/${graded.maxScore} polynomial equation end-behavior responses matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const forbiddenStoredFields = [
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
        "isCorrect",
        "correctness",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || existing.createIdempotencyKey !== args.idempotencyKey
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isSafeInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isSafeInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.join("|")
        || TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.some((partId) => (
          (existingAnswers[partId] !== "up" && existingAnswers[partId] !== "down")
          || existingAnswers[partId] !== answers[partId]
        ))
        || !Array.isArray(existingParts)
        || existingParts.length !== TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.length
        || TOPIC16_EQUATION_END_BEHAVIOR_PART_IDS.some((partId, index) => {
          const part = existingParts[index];
          const expectedPart = graded.parts[index];
          return (
            !isRecord(part)
            || Object.keys(part).sort().join("|") !== "isCorrect|maxScore|partId|rawAnswer|score"
            || !isRecord(expectedPart)
            || part.partId !== partId
            || part.partId !== expectedPart.partId
            || part.rawAnswer !== expectedPart.rawAnswer
            || part.isCorrect !== expectedPart.isCorrect
            || part.score !== expectedPart.score
            || part.maxScore !== expectedPart.maxScore
          );
        })
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || existing.feedback !== feedback
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const latestAttemptOrdinal = latest?.attemptOrdinal;
    if (
      latest
      && (
        typeof latestAttemptOrdinal !== "number"
        || !Number.isSafeInteger(latestAttemptOrdinal)
        || latestAttemptOrdinal < 1
        || latestAttemptOrdinal >= Number.MAX_SAFE_INTEGER
      )
    ) {
      throw new Error("Invalid Topic 1.6 equation end behavior stored attempt ordinal");
    }
    const attemptOrdinal = (latestAttemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic15RealZerosAndMultiplicitiesWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic15RealZerosAndMultiplicitiesWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
      || args.submissionData.status !== "submitted"
    ) {
      throw new Error("Invalid Topic 1.5 real zeros and multiplicities Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || !Number.isFinite(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.5 real zeros and multiplicities Worked timestamp or attempt");
    }

    const answers = canonicalTopic15RealZerosAndMultiplicitiesAnswers(args.submissionData);
    const expectedSourceAnswer = generateTopic15RealZerosAndMultiplicitiesOutput(0).expectedAnswer as {
      a: Array<{ zero: number; multiplicity: number }>;
      b: Array<{ zero: number; multiplicity: number }>;
    };
    const sourceAnswers = {
      a: expectedSourceAnswer.a.map((pair) => ({ zero: pair.zero, multiplicity: pair.multiplicity })),
      b: expectedSourceAnswer.b.map((pair) => ({ zero: pair.zero, multiplicity: pair.multiplicity })),
    };
    const partIds = ["a", "b"] as const;

    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.5 real zeros and multiplicities Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.5 real zeros and multiplicities Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const expectedPartIds = ["a", "b"] as const;
      const forbiddenStoredFields = [
        "masteryContractVersion",
        "score",
        "maxScore",
        "feedback",
        "gradedAt",
        "correctness",
        "isCorrect",
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutions",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "a|b"
        || !sameTopic15RealZerosAndMultiplicitiesPairs(existingAnswers.a, sourceAnswers.a)
        || !sameTopic15RealZerosAndMultiplicitiesPairs(existingAnswers.a, answers.a)
        || !sameTopic15RealZerosAndMultiplicitiesPairs(existingAnswers.b, sourceAnswers.b)
        || !sameTopic15RealZerosAndMultiplicitiesPairs(existingAnswers.b, answers.b)
        || !Array.isArray(existingParts)
        || existingParts.length !== expectedPartIds.length
        || expectedPartIds.some((partId, index) => {
          const part = existingParts[index];
          return (
            !isRecord(part)
            || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
            || part.partId !== partId
            || !sameTopic15RealZerosAndMultiplicitiesPairs(part.rawAnswer, sourceAnswers[partId])
            || !sameTopic15RealZerosAndMultiplicitiesPairs(part.rawAnswer, answers[partId])
          );
        })
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    if (
      !sameTopic15RealZerosAndMultiplicitiesPairs(answers.a, sourceAnswers.a)
      || !sameTopic15RealZerosAndMultiplicitiesPairs(answers.b, sourceAnswers.b)
    ) {
      throw new Error("Topic 1.5 real zeros and multiplicities Worked answer does not match the source");
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers: sourceAnswers,
      parts: partIds.map((partId) => ({ partId, rawAnswer: sourceAnswers[partId] })),
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic15RealZerosAndMultiplicitiesSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic15RealZerosAndMultiplicitiesSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.5 real zeros and multiplicities activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || !Number.isFinite(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.5 real zeros and multiplicities timestamp or attempt");
    }

    const answers = canonicalTopic15RealZerosAndMultiplicitiesAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.5 real zeros and multiplicities activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.5 real zeros and multiplicities activity has invalid grading configuration");
    }

    const graded = gradeTopic15RealZerosAndMultiplicities(expectedConfig.variantSeed, answers);
    const feedback = `${graded.score}/${graded.maxScore} real-zero and multiplicity responses matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const expectedPartIds = ["a", "b"] as const;
      const forbiddenStoredFields = [
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
        "isCorrect",
        "correctness",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "a|b"
        || !sameTopic15RealZerosAndMultiplicitiesPairs(existingAnswers.a, answers.a)
        || !sameTopic15RealZerosAndMultiplicitiesPairs(existingAnswers.b, answers.b)
        || !Array.isArray(existingParts)
        || existingParts.length !== expectedPartIds.length
        || expectedPartIds.some((partId, index) => {
          const part = existingParts[index];
          const expectedPart = graded.parts[index];
          return (
            !isRecord(part)
            || !isRecord(expectedPart)
            || Object.keys(part).sort().join("|") !== "isCorrect|maxScore|partId|rawAnswer|score"
            || part.partId !== partId
            || part.partId !== expectedPart.partId
            || !sameTopic15RealZerosAndMultiplicitiesPairs(part.rawAnswer, expectedPart.rawAnswer)
            || part.isCorrect !== expectedPart.isCorrect
            || part.score !== expectedPart.score
            || part.maxScore !== expectedPart.maxScore
          );
        })
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || existing.feedback !== feedback
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic15LeastPolynomialDegreeWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic15LeastPolynomialDegreeWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
      || args.submissionData.status !== "submitted"
    ) {
      throw new Error("Invalid Topic 1.5 least polynomial degree Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isSafeInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.5 least polynomial degree Worked timestamp or attempt");
    }

    const answers = canonicalTopic15LeastPolynomialDegreeAnswers(args.submissionData);
    const expectedSourceAnswer = generateTopic15LeastPolynomialDegreeOutput(0).expectedAnswer;

    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.5 least polynomial degree Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.5 least polynomial degree Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const forbiddenStoredFields = [
        "masteryContractVersion",
        "score",
        "maxScore",
        "feedback",
        "gradedAt",
        "correctness",
        "isCorrect",
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutions",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isSafeInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isSafeInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "leastDegree"
        || typeof existingAnswers.leastDegree !== "number"
        || !Number.isFinite(existingAnswers.leastDegree)
        || !Number.isSafeInteger(existingAnswers.leastDegree)
        || existingAnswers.leastDegree !== expectedSourceAnswer.leastDegree
        || existingAnswers.leastDegree !== answers.leastDegree
        || !Array.isArray(existingParts)
        || existingParts.length !== 1
        || !isRecord(existingParts[0])
        || Object.keys(existingParts[0]).sort().join("|") !== "partId|rawAnswer"
        || existingParts[0].partId !== "leastDegree"
        || typeof existingParts[0].rawAnswer !== "number"
        || !Number.isFinite(existingParts[0].rawAnswer)
        || !Number.isSafeInteger(existingParts[0].rawAnswer)
        || existingParts[0].rawAnswer !== expectedSourceAnswer.leastDegree
        || existingParts[0].rawAnswer !== answers.leastDegree
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    if (answers.leastDegree !== expectedSourceAnswer.leastDegree) {
      throw new Error("Topic 1.5 least polynomial degree Worked answer does not match the source");
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const latestAttemptOrdinal = latest?.attemptOrdinal;
    if (
      latest
      && (
        typeof latestAttemptOrdinal !== "number"
        || !Number.isSafeInteger(latestAttemptOrdinal)
        || latestAttemptOrdinal < 1
        || latestAttemptOrdinal >= Number.MAX_SAFE_INTEGER
      )
    ) {
      throw new Error("Invalid Topic 1.5 least polynomial degree stored attempt ordinal");
    }
    const attemptOrdinal = (latestAttemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const sourceAnswer = { leastDegree: expectedSourceAnswer.leastDegree };
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers: sourceAnswer,
      parts: [{ partId: "leastDegree" as const, rawAnswer: sourceAnswer.leastDegree }],
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic15PolynomialInequalityWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic15PolynomialInequalityWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
      || args.submissionData.status !== "submitted"
    ) {
      throw new Error("Invalid Topic 1.5 polynomial inequality Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isSafeInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.5 polynomial inequality Worked timestamp or attempt");
    }

    const answers = canonicalTopic15PolynomialInequalityAnswers(args.submissionData);
    const expectedSourceAnswer = generateTopic15PolynomialInequalityOutput(0).expectedAnswer;
    const sourceRoots = expectedSourceAnswer.roots as number[];
    const sourceIntervalSigns = expectedSourceAnswer.intervalSigns as Array<"+" | "-">;
    const sourceSolution = expectedSourceAnswer.solution as string;
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.5 polynomial inequality Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isSafeInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.5 polynomial inequality Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingRootsPart = Array.isArray(existingParts) ? existingParts[0] : null;
      const existingIntervalSignsPart = Array.isArray(existingParts) ? existingParts[1] : null;
      const existingSolutionPart = Array.isArray(existingParts) ? existingParts[2] : null;
      const forbiddenStoredFields = [
        "masteryContractVersion",
        "score",
        "maxScore",
        "feedback",
        "gradedAt",
        "correctness",
        "isCorrect",
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutions",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isSafeInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isSafeInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "intervalSigns|roots|solution"
        || JSON.stringify(existingAnswers.roots) !== JSON.stringify(sourceRoots)
        || JSON.stringify(existingAnswers.roots) !== JSON.stringify(answers.roots)
        || JSON.stringify(existingAnswers.intervalSigns) !== JSON.stringify(sourceIntervalSigns)
        || JSON.stringify(existingAnswers.intervalSigns) !== JSON.stringify(answers.intervalSigns)
        || existingAnswers.solution !== sourceSolution
        || existingAnswers.solution !== answers.solution
        || !Array.isArray(existingParts)
        || existingParts.length !== 3
        || !isRecord(existingRootsPart)
        || Object.keys(existingRootsPart).sort().join("|") !== "partId|rawAnswer"
        || existingRootsPart.partId !== "roots"
        || JSON.stringify(existingRootsPart.rawAnswer) !== JSON.stringify(sourceRoots)
        || JSON.stringify(existingRootsPart.rawAnswer) !== JSON.stringify(answers.roots)
        || !isRecord(existingIntervalSignsPart)
        || Object.keys(existingIntervalSignsPart).sort().join("|") !== "partId|rawAnswer"
        || existingIntervalSignsPart.partId !== "intervalSigns"
        || JSON.stringify(existingIntervalSignsPart.rawAnswer) !== JSON.stringify(sourceIntervalSigns)
        || JSON.stringify(existingIntervalSignsPart.rawAnswer) !== JSON.stringify(answers.intervalSigns)
        || !isRecord(existingSolutionPart)
        || Object.keys(existingSolutionPart).sort().join("|") !== "partId|rawAnswer"
        || existingSolutionPart.partId !== "solution"
        || existingSolutionPart.rawAnswer !== sourceSolution
        || existingSolutionPart.rawAnswer !== answers.solution
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    if (
      JSON.stringify(answers.roots) !== JSON.stringify(sourceRoots)
      || JSON.stringify(answers.intervalSigns) !== JSON.stringify(sourceIntervalSigns)
      || answers.solution !== sourceSolution
    ) {
      throw new Error("Topic 1.5 polynomial inequality Worked answer does not match the source");
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const latestAttemptOrdinal = latest?.attemptOrdinal;
    if (
      latest
      && (
        typeof latestAttemptOrdinal !== "number"
        || !Number.isSafeInteger(latestAttemptOrdinal)
        || latestAttemptOrdinal < 1
        || latestAttemptOrdinal >= Number.MAX_SAFE_INTEGER
      )
    ) {
      throw new Error("Invalid Topic 1.5 polynomial inequality stored attempt ordinal");
    }
    const attemptOrdinal = (latestAttemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const sourceAnswer = {
      roots: sourceRoots,
      intervalSigns: sourceIntervalSigns,
      solution: sourceSolution,
    };
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers: sourceAnswer,
      parts: [
        { partId: "roots" as const, rawAnswer: sourceAnswer.roots },
        { partId: "intervalSigns" as const, rawAnswer: sourceAnswer.intervalSigns },
        { partId: "solution" as const, rawAnswer: sourceAnswer.solution },
      ],
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic15PolynomialInequalitySubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic15PolynomialInequalitySubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
      || args.submissionData.status !== "submitted"
    ) {
      throw new Error("Invalid Topic 1.5 polynomial inequality activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }

    const answers = canonicalTopic15PolynomialInequalityAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.5 polynomial inequality activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isSafeInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.5 polynomial inequality activity has invalid grading configuration");
    }

    const graded = gradeTopic15PolynomialInequalitySignChart(expectedConfig.variantSeed, answers);
    const feedback = `${graded.score}/${graded.maxScore} polynomial-inequality-sign-chart response matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const expectedPartIds = ["roots", "intervalSigns", "solution"] as const;
      const forbiddenStoredFields = [
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
        "correctness",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isSafeInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isSafeInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "intervalSigns|roots|solution"
        || !Array.isArray(existingAnswers.roots)
        || existingAnswers.roots.length !== answers.roots.length
        || !existingAnswers.roots.every((root) => (
          typeof root === "number"
          && Number.isFinite(root)
          && Math.abs(root) <= Number.MAX_SAFE_INTEGER
        ))
        || existingAnswers.roots.some((root, index) => root !== answers.roots[index])
        || !Array.isArray(existingAnswers.intervalSigns)
        || existingAnswers.intervalSigns.length !== answers.intervalSigns.length
        || existingAnswers.intervalSigns.some((sign, index) => sign !== answers.intervalSigns[index])
        || typeof existingAnswers.solution !== "string"
        || existingAnswers.solution !== answers.solution
        || !Array.isArray(existingParts)
        || existingParts.length !== expectedPartIds.length
        || expectedPartIds.some((partId, index) => {
          const part = existingParts[index];
          const expectedPart = graded.parts[index];
          const storedRawAnswer = isRecord(part) ? part.rawAnswer : null;
          const expectedRawAnswer = isRecord(expectedPart) ? expectedPart.rawAnswer : null;
          const rawAnswerMatches = partId === "solution"
            ? isRecord(part)
              && isRecord(expectedPart)
              && storedRawAnswer === expectedRawAnswer
            : Array.isArray(storedRawAnswer)
              && Array.isArray(expectedRawAnswer)
              && storedRawAnswer.length === expectedRawAnswer.length
              && storedRawAnswer.every((value, rawIndex) => value === expectedRawAnswer[rawIndex]);
          return (
            !isRecord(part)
            || !isRecord(expectedPart)
            || Object.keys(part).sort().join("|") !== "isCorrect|maxScore|partId|rawAnswer|score"
            || part.partId !== partId
            || part.partId !== expectedPart.partId
            || !rawAnswerMatches
            || part.isCorrect !== expectedPart.isCorrect
            || part.score !== expectedPart.score
            || part.maxScore !== expectedPart.maxScore
          );
        })
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || existing.feedback !== feedback
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const latestAttemptOrdinal = latest?.attemptOrdinal;
    if (
      latest
      && (
        typeof latestAttemptOrdinal !== "number"
        || !Number.isSafeInteger(latestAttemptOrdinal)
        || latestAttemptOrdinal < 1
        || latestAttemptOrdinal >= Number.MAX_SAFE_INTEGER
      )
    ) {
      throw new Error("Invalid Topic 1.5 polynomial inequality stored attempt ordinal");
    }
    const attemptOrdinal = (latestAttemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic15LeastPolynomialDegreeSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic15LeastPolynomialDegreeSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
      || args.submissionData.status !== "submitted"
    ) {
      throw new Error("Invalid Topic 1.5 least polynomial degree activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }

    const answers = canonicalTopic15LeastPolynomialDegreeAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.5 least polynomial degree activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.5 least polynomial degree activity has invalid grading configuration");
    }

    const graded = gradeTopic15LeastPolynomialDegree(expectedConfig.variantSeed, answers);
    const feedback = `${graded.score}/${graded.maxScore} least-polynomial-degree response matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      const expectedPart = graded.parts[0];
      const forbiddenStoredFields = [
        "answer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "expectedAnswer",
        "grading",
        "gradingMetadata",
        "normalizedAnswer",
        "solution",
        "solutionSteps",
        "steps",
        "finalAnswer",
        "authority",
        "isCorrect",
        "correctness",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isSafeInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isSafeInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "leastDegree"
        || typeof existingAnswers.leastDegree !== "number"
        || !Number.isFinite(existingAnswers.leastDegree)
        || !Number.isSafeInteger(existingAnswers.leastDegree)
        || existingAnswers.leastDegree !== answers.leastDegree
        || !existingPart
        || !expectedPart
        || Object.keys(existingPart).sort().join("|") !== "isCorrect|maxScore|partId|rawAnswer|score"
        || existingPart.partId !== "leastDegree"
        || existingPart.rawAnswer !== expectedPart.rawAnswer
        || existingPart.isCorrect !== expectedPart.isCorrect
        || existingPart.score !== expectedPart.score
        || existingPart.maxScore !== expectedPart.maxScore
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || existing.feedback !== feedback
        || forbiddenStoredFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic14PolynomialDegreeLeadingCoefficientWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    const isWorkedIdentity = (
      args.activityId === PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID
      && args.submissionData.activityId === args.activityId
      && args.submissionData.mode === "worked_example"
      && args.submissionData.status === "submitted"
    );
    if (!isWorkedIdentity) {
      const existing = await ctx.db
        .query("activity_submissions")
        .withIndex("by_user_and_create_idempotency_key", (query) => (
          query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
        ))
        .unique();
      if (existing) throw new Error("idempotency_conflict");
      throw new Error("Invalid Topic 1.4 polynomial degree Worked activity");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || !Number.isFinite(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.4 polynomial degree Worked timestamp or attempt");
    }

    const answers = canonicalTopic14PolynomialDegreeLeadingCoefficientAnswers(args.submissionData);
    const expectedSourceAnswer = generateTopic14PolynomialDegreeLeadingCoefficientOutput(0).expectedAnswer as Record<string, number>;
    const sourceAnswers = {
      a_degree: String(expectedSourceAnswer.a_degree),
      a_leading_coefficient: String(expectedSourceAnswer.a_leading_coefficient),
      b_degree: String(expectedSourceAnswer.b_degree),
      b_leading_coefficient: String(expectedSourceAnswer.b_leading_coefficient),
      c_degree: String(expectedSourceAnswer.c_degree),
      c_leading_coefficient: String(expectedSourceAnswer.c_leading_coefficient),
    };
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.4 polynomial degree Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GENERATOR_KEY
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG.variantSeed
      || !Number.isInteger(gradingConfig.variantSeed)
    ) {
      throw new Error("Topic 1.4 polynomial degree Worked activity has invalid grading configuration");
    }

    const expectedAnswerIds = [
      "a_degree",
      "a_leading_coefficient",
      "b_degree",
      "b_leading_coefficient",
      "c_degree",
      "c_leading_coefficient",
    ] as const;

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const forbiddenFields = [
        "masteryContractVersion",
        "score",
        "maxScore",
        "feedback",
        "gradedAt",
        "correctness",
        "expectedAnswer",
        "answerKey",
        "correctAnswer",
        "correctAnswers",
        "solution",
        "solutionSteps",
        "gradingMetadata",
        "finalAnswer",
      ];
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || existingData.attemptNumber !== existing.attemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || new Date(existingData.submittedAt).toISOString() !== existingData.submittedAt
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== expectedAnswerIds.join("|")
        || expectedAnswerIds.some((answerId) => (
          existingAnswers[answerId] !== sourceAnswers[answerId]
          || existingAnswers[answerId] !== answers[answerId]
        ))
        || !Array.isArray(existingParts)
        || existingParts.length !== expectedAnswerIds.length
        || expectedAnswerIds.some((partId, index) => {
          const part = existingParts[index];
          return (
            !isRecord(part)
            || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
            || part.partId !== partId
            || part.rawAnswer !== sourceAnswers[partId]
            || part.rawAnswer !== answers[partId]
          );
        })
        || forbiddenFields.some((field) => Object.hasOwn(existing, field))
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    if (Object.keys(answers).some((answerId) => answers[answerId as keyof typeof answers] !== sourceAnswers[answerId as keyof typeof sourceAnswers])) {
      throw new Error("Topic 1.4 polynomial degree Worked answer does not match the source");
    }
    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers: sourceAnswers,
      parts: expectedAnswerIds.map((partId) => ({ partId, rawAnswer: sourceAnswers[partId] })),
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic13ConcavitySubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic13ConcavitySubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.3 concavity activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.3 concavity timestamp or attempt");
    }

    const answers = canonicalConcavityAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.3 concavity activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_13_CONCAVITY_GENERATOR_KEY
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.3 concavity activity has invalid grading configuration");
    }

    const graded = gradeTopic13ConcavityFromRateChange(gradingConfig.variantSeed, answers);
    const expectedPart = graded.parts[0]!;
    const feedback = `${graded.score}/${graded.maxScore} concavity classifications matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existingData.submittedAt !== "string"
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || existingData.attemptNumber !== existing.attemptOrdinal
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "classification"
        || existingAnswers.classification !== answers.classification
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== Object.keys(expectedPart).sort().join("|")
        || existingPart.partId !== expectedPart.partId
        || existingPart.rawAnswer !== expectedPart.rawAnswer
        || existingPart.isCorrect !== expectedPart.isCorrect
        || existingPart.score !== expectedPart.score
        || existingPart.maxScore !== expectedPart.maxScore
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || typeof existing.feedback !== "string"
        || existing.feedback !== feedback
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createTopic13RatePatternClassificationWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic13RatePatternClassificationWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
    ) {
      throw new Error("Invalid Topic 1.3 rate-pattern classification Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.3 rate-pattern classification Worked timestamp or attempt");
    }

    const answers = canonicalRatePatternClassificationAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.3 rate-pattern classification Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GENERATOR_KEY
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.3 rate-pattern classification Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const expectedPartIds = ["a", "b", "c"] as const;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existingData.submittedAt !== "string"
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || existingData.attemptNumber !== existing.attemptOrdinal
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "a|b|c"
        || existingAnswers.a !== answers.a
        || existingAnswers.b !== answers.b
        || existingAnswers.c !== answers.c
        || !Array.isArray(existingParts)
        || existingParts.length !== expectedPartIds.length
        || expectedPartIds.some((partId, index) => {
          const part = existingParts[index];
          return (
            !isRecord(part)
            || Object.keys(part).sort().join("|") !== "partId|rawAnswer"
            || part.partId !== partId
            || part.rawAnswer !== answers[partId]
          );
        })
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || Object.hasOwn(existing, "masteryContractVersion")
        || Object.hasOwn(existing, "score")
        || Object.hasOwn(existing, "maxScore")
        || Object.hasOwn(existing, "feedback")
        || Object.hasOwn(existing, "gradedAt")
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: [
        { partId: "a", rawAnswer: answers.a },
        { partId: "b", rawAnswer: answers.b },
        { partId: "c", rawAnswer: answers.c },
      ],
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt: normalizedSubmissionData.submittedAt,
    };
  },
});

export const createTopic13ConcavityWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic13ConcavityWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
      || args.submissionData.status !== "submitted"
    ) {
      throw new Error("Invalid Topic 1.3 concavity Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.3 concavity Worked timestamp or attempt");
    }

    const answers = canonicalConcavityAnswers(args.submissionData);
    const expectedClassification = (generateTopic13ConcavityFromRateChangeOutput(0).expectedAnswer as {
      classification: string;
    }).classification;

    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.3 concavity Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_13_CONCAVITY_GENERATOR_KEY
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.3 concavity Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existingData.submittedAt !== "string"
        || !Number.isFinite(Date.parse(existingData.submittedAt))
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || existingData.attemptNumber !== existing.attemptOrdinal
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "classification"
        || existingAnswers.classification !== expectedClassification
        || existingAnswers.classification !== answers.classification
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== "partId|rawAnswer"
        || existingPart.partId !== "classification"
        || existingPart.rawAnswer !== expectedClassification
        || existingPart.rawAnswer !== answers.classification
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || Object.hasOwn(existing, "masteryContractVersion")
        || Object.hasOwn(existing, "score")
        || Object.hasOwn(existing, "maxScore")
        || Object.hasOwn(existing, "feedback")
        || Object.hasOwn(existing, "gradedAt")
        || Object.hasOwn(existing, "correctness")
        || Object.hasOwn(existing, "expectedAnswer")
        || Object.hasOwn(existing, "answerKey")
        || Object.hasOwn(existing, "solution")
        || Object.hasOwn(existing, "solutionSteps")
        || Object.hasOwn(existing, "gradingMetadata")
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    if (answers.classification !== expectedClassification) {
      throw new Error("Topic 1.3 concavity Worked answer does not match the source");
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: [{ partId: "classification", rawAnswer: answers.classification }],
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt: normalizedSubmissionData.submittedAt,
    };
  },
});

export const createTopic12PointwiseRateOrderingSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic12PointwiseRateOrderingSubmissionDataValidator,
  },
  returns: pilotSubmissionReturnValidator,
  handler: async (ctx, args) => {
    const expectedMode = args.activityId === PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID
      ? "guided_practice"
      : args.activityId === PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID
        ? "independent_practice"
        : null;
    if (
      expectedMode === null
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== expectedMode
    ) {
      throw new Error("Invalid Topic 1.2 pointwise rate-ordering activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.2 pointwise rate-ordering timestamp or attempt");
    }

    const answers = canonicalPointwiseRateOrderingAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", args.activityId)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== args.activityId
      || activity.componentKey !== PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== expectedMode
    ) {
      throw new Error("Topic 1.2 pointwise rate-ordering activity is not provisioned");
    }

    const expectedConfig = expectedMode === "guided_practice"
      ? PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_GRADING_CONFIG;
    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== expectedConfig.generatorKey
      || typeof gradingConfig.variantSeed !== "number"
      || !Number.isInteger(gradingConfig.variantSeed)
      || gradingConfig.variantSeed !== expectedConfig.variantSeed
    ) {
      throw new Error("Topic 1.2 pointwise rate-ordering activity has invalid grading configuration");
    }

    const graded = gradeTopic12PointwiseRateOrdering(gradingConfig.variantSeed, answers);
    const expectedPart = graded.parts[0]!;
    const feedback = `${graded.score}/${graded.maxScore} pointwise selections matched the server rubric.`;
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      const storedOrderedPointIds = existingAnswers?.orderedPointIds;
      const storedPartAnswer = existingPart?.rawAnswer;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== args.activityId
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== args.activityId
        || existingData.mode !== expectedMode
        || existingData.status !== "graded"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || typeof existingData.submittedAt !== "string"
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || existingData.attemptNumber !== existing.attemptOrdinal
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "orderedPointIds"
        || !Array.isArray(storedOrderedPointIds)
        || storedOrderedPointIds.length !== answers.orderedPointIds.length
        || storedOrderedPointIds.some((pointId, index) => pointId !== answers.orderedPointIds[index])
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== "isCorrect|maxScore|partId|rawAnswer|score"
        || existingPart.partId !== expectedPart.partId
        || !Array.isArray(storedPartAnswer)
        || storedPartAnswer.length !== expectedPart.rawAnswer.length
        || storedPartAnswer.some((pointId, index) => pointId !== expectedPart.rawAnswer[index])
        || existingPart.isCorrect !== expectedPart.isCorrect
        || existingPart.score !== expectedPart.score
        || existingPart.maxScore !== expectedPart.maxScore
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || existing.score !== graded.score
        || existing.maxScore !== graded.maxScore
        || typeof existing.attemptOrdinal !== "number"
        || !Number.isInteger(existing.attemptOrdinal)
        || existing.attemptOrdinal < 1
        || typeof existing.feedback !== "string"
        || existing.feedback !== feedback
        || typeof existing.gradedAt !== "number"
        || !Number.isFinite(existing.gradedAt)
        || existing.gradedAt !== existing.submittedAt
        || typeof existing.createdAt !== "number"
        || !Number.isFinite(existing.createdAt)
        || existing.createdAt !== existing.submittedAt
        || typeof existing.updatedAt !== "number"
        || !Number.isFinite(existing.updatedAt)
        || existing.updatedAt !== existing.submittedAt
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        score: existing.score,
        maxScore: existing.maxScore,
        attemptOrdinal: existing.attemptOrdinal,
        feedback: existing.feedback,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: args.activityId,
      mode: expectedMode,
      status: "graded" as const,
      attemptNumber: attemptOrdinal,
      submittedAt: new Date(now).toISOString(),
      answers,
      parts: graded.parts,
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: normalizedSubmissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const createPhysicalContextWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: physicalContextWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
    ) {
      throw new Error("Invalid physical-context Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }

    const answers = canonicalPhysicalContextAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Physical-context Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_PHYSICAL_CONTEXT_GENERATOR_KEY
      || gradingConfig.variantSeed !== PRECALCULUS_PHYSICAL_CONTEXT_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Physical-context Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      const storedAttemptOrdinal = existing.attemptOrdinal;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || existingData.attemptNumber !== storedAttemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "selectedOptionId"
        || existingAnswers.selectedOptionId !== answers.selectedOptionId
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== "partId|rawAnswer"
        || existingPart.partId !== "selectedOptionId"
        || existingPart.rawAnswer !== answers.selectedOptionId
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || typeof storedAttemptOrdinal !== "number"
        || !Number.isInteger(storedAttemptOrdinal)
        || storedAttemptOrdinal < 1
        || Object.hasOwn(existing, "masteryContractVersion")
        || Object.hasOwn(existing, "score")
        || Object.hasOwn(existing, "maxScore")
        || Object.hasOwn(existing, "feedback")
        || Object.hasOwn(existing, "gradedAt")
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: storedAttemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers,
      parts: [{ partId: "selectedOptionId", rawAnswer: answers.selectedOptionId }],
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic12TableAverageRateWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic12WorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
    ) {
      throw new Error("Invalid Topic 1.2 Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }

    const answers = canonicalPhysicalContextAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_12_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.2 Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_GENERATOR_KEY
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_12_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.2 Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      const storedAttemptOrdinal = existing.attemptOrdinal;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || existingData.attemptNumber !== storedAttemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "selectedOptionId"
        || existingAnswers.selectedOptionId !== answers.selectedOptionId
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== "partId|rawAnswer"
        || existingPart.partId !== "selectedOptionId"
        || existingPart.rawAnswer !== answers.selectedOptionId
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || typeof storedAttemptOrdinal !== "number"
        || !Number.isInteger(storedAttemptOrdinal)
        || storedAttemptOrdinal < 1
        || Object.hasOwn(existing, "masteryContractVersion")
        || Object.hasOwn(existing, "score")
        || Object.hasOwn(existing, "maxScore")
        || Object.hasOwn(existing, "feedback")
        || Object.hasOwn(existing, "gradedAt")
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: storedAttemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers,
      parts: [{ partId: "selectedOptionId", rawAnswer: answers.selectedOptionId }],
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic12GraphAverageRateWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic12GraphWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
    ) {
      throw new Error("Invalid Topic 1.2 graph Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.2 graph Worked timestamp or attempt");
    }

    const answers = canonicalPhysicalContextAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.2 graph Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GENERATOR_KEY
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.2 graph Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      const storedAttemptOrdinal = existing.attemptOrdinal;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || existingData.attemptNumber !== storedAttemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "selectedOptionId"
        || existingAnswers.selectedOptionId !== answers.selectedOptionId
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== "partId|rawAnswer"
        || existingPart.partId !== "selectedOptionId"
        || existingPart.rawAnswer !== answers.selectedOptionId
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || typeof storedAttemptOrdinal !== "number"
        || !Number.isInteger(storedAttemptOrdinal)
        || storedAttemptOrdinal < 1
        || Object.hasOwn(existing, "masteryContractVersion")
        || Object.hasOwn(existing, "score")
        || Object.hasOwn(existing, "maxScore")
        || Object.hasOwn(existing, "feedback")
        || Object.hasOwn(existing, "gradedAt")
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: storedAttemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers,
      parts: [{ partId: "selectedOptionId", rawAnswer: answers.selectedOptionId }],
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic12PointwiseLeastRateWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic12PointwiseLeastRateWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
    ) {
      throw new Error("Invalid Topic 1.2 pointwise least-rate Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.2 pointwise least-rate Worked timestamp or attempt");
    }

    const answers = canonicalPhysicalContextAnswers(args.submissionData);
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.2 pointwise least-rate Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.2 pointwise least-rate Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      const storedAttemptOrdinal = existing.attemptOrdinal;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || existingData.attemptNumber !== storedAttemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "selectedOptionId"
        || existingAnswers.selectedOptionId !== answers.selectedOptionId
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== "partId|rawAnswer"
        || existingPart.partId !== "selectedOptionId"
        || existingPart.rawAnswer !== answers.selectedOptionId
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || typeof storedAttemptOrdinal !== "number"
        || !Number.isInteger(storedAttemptOrdinal)
        || storedAttemptOrdinal < 1
        || Object.hasOwn(existing, "masteryContractVersion")
        || Object.hasOwn(existing, "score")
        || Object.hasOwn(existing, "maxScore")
        || Object.hasOwn(existing, "feedback")
        || Object.hasOwn(existing, "gradedAt")
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: storedAttemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers,
      parts: [{ partId: "selectedOptionId", rawAnswer: answers.selectedOptionId }],
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic12NegativeRateContextWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic12NegativeRateContextWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
    ) {
      throw new Error("Invalid Topic 1.2 negative-rate context Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.2 negative-rate context Worked timestamp or attempt");
    }

    const answers = canonicalPhysicalContextAnswers(args.submissionData);
    if (!( ["A", "B", "C", "D"] as string[]).includes(answers.selectedOptionId)) {
      throw new Error("Negative-rate context Worked selected option is invalid");
    }

    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.2 negative-rate context Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.2 negative-rate context Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      const storedAttemptOrdinal = existing.attemptOrdinal;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || existingData.attemptNumber !== storedAttemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "selectedOptionId"
        || existingAnswers.selectedOptionId !== answers.selectedOptionId
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== "partId|rawAnswer"
        || existingPart.partId !== "selectedOptionId"
        || existingPart.rawAnswer !== answers.selectedOptionId
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || typeof storedAttemptOrdinal !== "number"
        || !Number.isInteger(storedAttemptOrdinal)
        || storedAttemptOrdinal < 1
        || Object.hasOwn(existing, "masteryContractVersion")
        || Object.hasOwn(existing, "score")
        || Object.hasOwn(existing, "maxScore")
        || Object.hasOwn(existing, "feedback")
        || Object.hasOwn(existing, "gradedAt")
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: storedAttemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers,
      parts: [{ partId: "selectedOptionId", rawAnswer: answers.selectedOptionId }],
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export const createTopic12QuadraticNegativeRateIntervalWorkedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic12QuadraticNegativeRateIntervalWorkedSubmissionDataValidator,
  },
  returns: topic11SubmissionReturnValidator,
  handler: async (ctx, args) => {
    if (
      args.activityId !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID
      || args.submissionData.activityId !== args.activityId
      || args.submissionData.mode !== "worked_example"
    ) {
      throw new Error("Invalid Topic 1.2 quadratic negative-rate interval Worked activity");
    }
    if (args.idempotencyKey.trim().length === 0) {
      throw new Error("Invalid create idempotency key");
    }
    if (
      !Number.isInteger(args.submissionData.attemptNumber)
      || args.submissionData.attemptNumber < 1
      || !Number.isFinite(Date.parse(args.submissionData.submittedAt))
    ) {
      throw new Error("Invalid Topic 1.2 quadratic negative-rate interval Worked timestamp or attempt");
    }

    const answers = canonicalPhysicalContextAnswers(args.submissionData);
    if (!( ["A", "B", "C", "D"] as string[]).includes(answers.selectedOptionId)) {
      throw new Error("Quadratic negative-rate interval Worked selected option is invalid");
    }

    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (
      !activity
      || activity.stableActivityId !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID
      || activity.componentKey !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY
      || !isRecord(activity.props)
      || activity.props.presentationMode !== "worked_example"
    ) {
      throw new Error("Topic 1.2 quadratic negative-rate interval Worked activity is not provisioned");
    }

    const gradingConfig = activity.gradingConfig;
    if (
      !isRecord(gradingConfig)
      || Object.keys(gradingConfig).sort().join("|") !== "generatorKey|variantSeed"
      || gradingConfig.generatorKey !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GENERATOR_KEY
      || gradingConfig.variantSeed !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_GRADING_CONFIG.variantSeed
    ) {
      throw new Error("Topic 1.2 quadratic negative-rate interval Worked activity has invalid grading configuration");
    }

    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", args.idempotencyKey)
      ))
      .unique();
    if (existing) {
      const existingData = isRecord(existing.submissionData)
        ? existing.submissionData
        : null;
      const existingAnswers = existingData && isRecord(existingData.answers)
        ? existingData.answers
        : null;
      const existingParts = existingData?.parts;
      const existingPart = Array.isArray(existingParts) && existingParts.length === 1
        && isRecord(existingParts[0])
        ? existingParts[0]
        : null;
      const storedAttemptOrdinal = existing.attemptOrdinal;
      if (
        existing.userId !== args.userId
        || existing.activityId !== activity._id
        || existing.stableActivityId !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID
        || existing.createIdempotencyKey !== args.idempotencyKey
        || !existingData
        || Object.keys(existingData).sort().join("|") !== "activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt"
        || existingData.contractVersion !== "practice.v1"
        || existingData.activityId !== PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID
        || existingData.mode !== "worked_example"
        || existingData.status !== "submitted"
        || typeof existingData.attemptNumber !== "number"
        || !Number.isInteger(existingData.attemptNumber)
        || existingData.attemptNumber < 1
        || existingData.attemptNumber !== storedAttemptOrdinal
        || typeof existingData.submittedAt !== "string"
        || Date.parse(existingData.submittedAt) !== existing.submittedAt
        || !existingAnswers
        || Object.keys(existingAnswers).sort().join("|") !== "selectedOptionId"
        || existingAnswers.selectedOptionId !== answers.selectedOptionId
        || !existingPart
        || Object.keys(existingPart).sort().join("|") !== "partId|rawAnswer"
        || existingPart.partId !== "selectedOptionId"
        || existingPart.rawAnswer !== answers.selectedOptionId
        || typeof existing.submittedAt !== "number"
        || !Number.isFinite(existing.submittedAt)
        || typeof storedAttemptOrdinal !== "number"
        || !Number.isInteger(storedAttemptOrdinal)
        || storedAttemptOrdinal < 1
        || Object.hasOwn(existing, "masteryContractVersion")
        || Object.hasOwn(existing, "score")
        || Object.hasOwn(existing, "maxScore")
        || Object.hasOwn(existing, "feedback")
        || Object.hasOwn(existing, "gradedAt")
      ) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: storedAttemptOrdinal,
        submittedAt: existingData.submittedAt,
      };
    }

    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      ))
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const submittedAt = new Date(now).toISOString();
    const normalizedSubmissionData = {
      contractVersion: "practice.v1" as const,
      activityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
      mode: "worked_example" as const,
      status: "submitted" as const,
      attemptNumber: attemptOrdinal,
      submittedAt,
      answers,
      parts: [{ partId: "selectedOptionId", rawAnswer: answers.selectedOptionId }],
    };
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
      submissionData: normalizedSubmissionData,
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      attemptOrdinal,
      submittedAt,
    };
  },
});

export function isTopic11WorkedSourcePublished(value: SelectedPilotPublication = selectedPilotPublication): boolean {
  return isPrecalculusPilotPublished({
    nodes: value.nodes,
    blueprints: value.blueprints.filter((blueprint) =>
      blueprint.rendererModeMap?.worked === "interval-classification"
      && topic11SameJson(blueprint.workedExampleSpec, TOPIC_11_WORKED_SPEC)),
  });
}

const topic11AcknowledgementValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  answers: v.object({}),
  parts: v.array(v.object({})),
});
const topic11AcknowledgementResultValidator = v.object({
  submissionId: v.id("activity_submissions"),
  attemptOrdinal: v.number(),
  submittedAt: v.string(),
});

export function hasTopic11SourceActivityIdentity(activity: Record<string, unknown>): boolean {
  return activity.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
    && activity.componentKey === PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY
    && activity.displayName === "Topic 1.1: Identify Graph Intervals with Your Teacher"
    && activity.description === "Worked-example source activity for classifying increasing, decreasing, and constant intervals."
    && selectedSameRecord(activity.props, {
      nodeId: PRECALCULUS_PILOT_NODE_ID,
      mode: "worked_example",
      source: "teacher_led",
    })
    && selectedSameRecord(activity.gradingConfig, { variantSeed: 0 });
}

export async function hasCurrentTopic11Source(
  ctx: Pick<QueryCtx, "db">,
  lessonId: Id<"lessons">,
  activityId: Id<"activities">,
  acknowledgedAt: number,
): Promise<boolean> {
  const versions = (await ctx.db.query("lesson_versions")
    .withIndex("by_lesson", (query) => query.eq("lessonId", lessonId)).collect())
    .filter((version) => version.status === "published")
    .sort((left, right) => right.version - left.version);
  if (versions.length === 0 || versions.length > 1 && versions[0]!.version === versions[1]!.version
    || !Number.isFinite(versions[0]!.createdAt) || versions[0]!.createdAt > acknowledgedAt) return false;
  const phases = await ctx.db.query("phase_versions")
    .withIndex("by_lesson_version", (query) => query.eq("lessonVersionId", versions[0]!._id)).collect();
  const workedPhases = phases.filter((phase) => phase.phaseNumber === 4);
  if (workedPhases.length !== 1 || workedPhases[0]!.phaseType !== "worked_example"
    || !Number.isFinite(workedPhases[0]!.createdAt) || workedPhases[0]!.createdAt > acknowledgedAt) return false;
  const workedPhase = workedPhases[0]!;
  const selectedLinks: unknown[] = [];
  const workedSequence: unknown[] = [];
  for (const phase of phases) {
    const sections = await ctx.db.query("phase_sections")
      .withIndex("by_phase_version", (query) => query.eq("phaseVersionId", phase._id)).collect();
    for (const section of sections) {
      if (String(phase._id) === String(workedPhase._id) && section.sequenceOrder === 2) workedSequence.push(section);
      if (selectedRecord(section.content) && String(section.content.activityId) === String(activityId)) {
        selectedLinks.push({ phase, section });
      }
    }
  }
  if (selectedLinks.length !== 1 || workedSequence.length !== 1) return false;
  const selectedLink = selectedLinks[0] as { phase: Record<string, unknown>; section: Record<string, unknown> };
  const content = selectedRecord(selectedLink.section.content) ? selectedLink.section.content : null;
  return String(selectedLink.phase._id) === String(workedPhase._id)
    && selectedLink.section === workedSequence[0]
    && selectedLink.section.sequenceOrder === 2
    && selectedLink.section.sectionType === "activity"
    && content?.componentKey === PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY
    && Number.isFinite(selectedLink.section.createdAt)
    && Number(selectedLink.section.createdAt) <= acknowledgedAt;
}

const topic11WorkedProjectionValidator = v.union(
  v.null(),
  v.object({
    activityId: v.id("activities"),
    stableActivityId: v.string(),
    nodeId: v.string(),
    componentKey: v.string(),
    mode: v.literal("worked_example"),
    props: v.any(),
  }),
);

/** Gets the exact approved Topic 1.1 Worked source for a learner view. */
export async function getApprovedTopic11WorkedSourceHandler(
  ctx: QueryCtx,
  publication: SelectedPilotPublication = selectedPilotPublication,
) {
  if (!isTopic11WorkedSourcePublished(publication)) return null;
  const blueprints = publication.blueprints.filter(
    (blueprint) =>
      blueprint.nodeId === PRECALCULUS_PILOT_NODE_ID &&
      blueprint.rendererModeMap?.worked === "interval-classification" &&
      topic11SameJson(blueprint.workedExampleSpec, TOPIC_11_WORKED_SPEC),
  );
  if (blueprints.length !== 1) return null;
  const workedSpec = blueprints[0]!.workedExampleSpec;
  if (!selectedRecord(workedSpec) || !selectedRecord(workedSpec.rendererProps))
    return null;
  const activities = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (query) =>
      query.eq("stableActivityId", PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID),
    )
    .collect();
  if (activities.length !== 1) return null;
  const activity = activities[0]!;
  if (
    activity.approval?.status !== "approved" ||
    !hasTopic11SourceActivityIdentity(activity)
  )
    return null;
  const lessons = await ctx.db
    .query("lessons")
    .withIndex("by_unit_and_order", (query) =>
      query.eq("unitNumber", 1).eq("orderIndex", 1),
    )
    .collect();
  if (
    lessons.length !== 1 ||
    !(await hasCurrentTopic11Source(
      ctx,
      lessons[0]!._id,
      activity._id,
      Date.now(),
    ))
  )
    return null;
  return {
    activityId: activity._id,
    stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
    nodeId: PRECALCULUS_PILOT_NODE_ID,
    componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
    mode: "worked_example" as const,
    props: workedSpec.rendererProps,
  };
}

export const getApprovedTopic11WorkedSource = internalQuery({
  args: {},
  returns: topic11WorkedProjectionValidator,
  handler: (ctx) => getApprovedTopic11WorkedSourceHandler(ctx),
});

const topic11LearnerDeliveryStateValidator = v.union(
  v.null(),
  v.literal("needs_acknowledgement"),
  v.literal("awaiting_teacher_confirmation"),
  v.literal("ready_for_practice"),
);

export function isStoredTopic11Acknowledgement(
  submission: Record<string, unknown>,
  learnerId: Id<"profiles">,
  activityId: Id<"activities">,
  now: number,
): boolean {
  return String(submission.userId) === String(learnerId)
    && String(submission.activityId) === String(activityId)
    && submission.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
    && submission.masteryContractVersion === "learning-evidence.v1"
    && isCanonicalTopic11Acknowledgement(submission.submissionData)
    && Number.isInteger(submission.attemptOrdinal)
    && Number(submission.attemptOrdinal) >= 1
    && Number.isFinite(submission.submittedAt)
    && Number(submission.submittedAt) >= 0
    && Number(submission.submittedAt) <= now
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.feedback === undefined
    && submission.gradedAt === undefined;
}

export function isTopic11TeacherConfirmationForSubmission(
  evidence: Record<string, unknown>,
  submission: Record<string, unknown>,
): boolean {
  return evidence.nodeId === PRECALCULUS_PILOT_NODE_ID
    && evidence.activityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
    && evidence.origin === "teacher_led"
    && evidence.mode === "teaching"
    && evidence.attemptOrdinal === submission.attemptOrdinal
    && evidence.occurredAt === submission.submittedAt
    && evidence.gradedEvidence === undefined
    && evidence.idempotencyKey === `precalc:teacher-led:submission:${String(submission._id)}`;
}

/** Derives the selected Topic 1.1 learner sequence state from stored authority records. */
export async function getTopic11LearnerDeliveryStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<"profiles"> },
  publication: SelectedPilotPublication = selectedPilotPublication,
) {
  const learner = await ctx.db.get("profiles", args.learnerId);
  const credential = learner
    ? await ctx.db.query("auth_credentials")
      .withIndex("by_username", (query) => query.eq("username", learner.username)).unique()
    : null;
  if (!learner || learner.role !== "student" || !credential || !credential.isActive
    || credential.profileId !== learner._id || credential.username !== learner.username
    || credential.role !== learner.role || credential.organizationId !== learner.organizationId) return null;

  const source = await getApprovedTopic11WorkedSourceHandler(ctx, publication);
  if (!source) return null;
  const [sourceActivity, lessons] = await Promise.all([
    ctx.db.get("activities", source.activityId),
    ctx.db.query("lessons")
      .withIndex("by_unit_and_order", (query) => query.eq("unitNumber", 1).eq("orderIndex", 1))
      .collect(),
  ]);
  if (!sourceActivity || lessons.length !== 1) return null;
  const now = Date.now();
  const submissions = await ctx.db.query("activity_submissions")
    .withIndex("by_user_and_activity", (query) => (
      query.eq("userId", args.learnerId).eq("activityId", source.activityId)
    )).collect();
  const acknowledgements = (await Promise.all(submissions.map(async (submission) => {
    if (!isStoredTopic11Acknowledgement(submission, args.learnerId, source.activityId, now)) return null;
    const acknowledgedAt = Number(submission.submittedAt);
    if (!Number.isFinite(sourceActivity.createdAt) || sourceActivity.createdAt > acknowledgedAt
      || !selectedRecord(sourceActivity.approval)
      || !Number.isFinite(sourceActivity.approval.reviewedAt)
      || Number(sourceActivity.approval.reviewedAt) > acknowledgedAt
      || !await hasCurrentTopic11Source(ctx, lessons[0]!._id, source.activityId, acknowledgedAt)) return null;
    return submission;
  }))).filter((submission): submission is NonNullable<typeof submission> => submission !== null);
  if (acknowledgements.length === 0) return "needs_acknowledgement" as const;

  const teacherEvidence = await ctx.db.query("learning_evidence")
    .withIndex("by_learner_and_node", (query) => (
      query.eq("learnerId", args.learnerId).eq("nodeId", PRECALCULUS_PILOT_NODE_ID)
    )).collect();
  const confirmed = acknowledgements.some((submission) => teacherEvidence.some((evidence) => (
    isTopic11TeacherConfirmationForSubmission(evidence, submission)
  )));
  return confirmed ? "ready_for_practice" as const : "awaiting_teacher_confirmation" as const;
}

export const getTopic11LearnerDeliveryState = internalQuery({
  args: { learnerId: v.id("profiles") },
  returns: topic11LearnerDeliveryStateValidator,
  handler: (ctx, args) => getTopic11LearnerDeliveryStateHandler(ctx, args),
});

function isCanonicalTopic11Acknowledgement(value: unknown): boolean {
  return selectedRecord(value)
    && Object.keys(value).sort().join("|") === "activityId|answers|contractVersion|mode|parts|status"
    && value.contractVersion === "practice.v1"
    && value.activityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
    && value.mode === "worked_example"
    && value.status === "submitted"
    && selectedRecord(value.answers) && Object.keys(value.answers).length === 0
    && Array.isArray(value.parts) && value.parts.length === 0;
}

/** Stores an ungraded learner acknowledgement for the reviewed Topic 1.1 source. */
export const createTopic11DailySubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic11AcknowledgementValidator,
  },
  returns: topic11AcknowledgementResultValidator,
  handler: async (ctx, args) => {
    if (args.activityId !== PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID) {
      throw new Error("Invalid Precalculus Topic 1.1 source activity");
    }
    const key = args.idempotencyKey;
    if (!key.trim() || key.length > 256) throw new Error("Invalid create idempotency key");
    if (!isCanonicalTopic11Acknowledgement(args.submissionData)) {
      throw new Error("Invalid Precalculus Topic 1.1 acknowledgement");
    }
    const profile = await ctx.db.get("profiles", args.userId);
    const credential = profile
      ? await ctx.db.query("auth_credentials")
        .withIndex("by_username", (query) => query.eq("username", profile.username)).unique()
      : null;
    if (!profile || profile.role !== "student" || !credential || !credential.isActive
      || credential.profileId !== profile._id || credential.username !== profile.username
      || credential.role !== profile.role || credential.organizationId !== profile.organizationId) {
      throw new Error("Inactive student identity");
    }
    const existing = await ctx.db.query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", key)
      )).unique();
    if (existing) {
      const data = existing.submissionData;
      const originalActivity = await ctx.db.get("activities", existing.activityId);
      if (existing.stableActivityId !== PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || !isCanonicalTopic11Acknowledgement(data)
        || !topic11SameJson(data, args.submissionData)
        || !Number.isInteger(existing.attemptOrdinal) || (existing.attemptOrdinal ?? 0) < 1
        || !Number.isFinite(existing.submittedAt) || existing.submittedAt < 0
        || existing.submittedAt > 8_640_000_000_000_000
        || existing.score !== undefined || existing.maxScore !== undefined
        || existing.feedback !== undefined || existing.gradedAt !== undefined
        || (originalActivity && !hasTopic11SourceActivityIdentity(originalActivity))) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal!,
        submittedAt: new Date(existing.submittedAt).toISOString(),
      };
    }
    if (!isTopic11WorkedSourcePublished()) throw new Error("Precalculus pilot curriculum is not approved");
    const activity = await ctx.db.query("activities")
      .withIndex("by_stable_activity_id", (query) => query.eq("stableActivityId", PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID))
      .unique();
    if (!activity || !hasTopic11SourceActivityIdentity(activity) || activity.approval?.status !== "approved") {
      throw new Error("Precalculus Topic 1.1 source activity is not approved");
    }
    const lesson = await ctx.db.query("lessons")
      .withIndex("by_unit_and_order", (query) => query.eq("unitNumber", 1).eq("orderIndex", 1)).unique();
    const now = Date.now();
    if (!lesson || !await hasCurrentTopic11Source(ctx, lesson._id, activity._id, now)) {
      throw new Error("Precalculus Topic 1.1 source is not published");
    }
    const latest = await ctx.db.query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      )).order("desc").first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      submissionData: args.submissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: key,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return { submissionId, attemptOrdinal, submittedAt: new Date(now).toISOString() };
  },
});
