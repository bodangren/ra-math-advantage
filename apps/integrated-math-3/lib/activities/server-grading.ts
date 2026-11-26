import { normalizeSeedProps } from "./seed-props";
import { gradeQuadraticFormulaResponse } from "./quadratic-formula-grader";
import { getPropsSchema, normalizeSolverAnswer } from "@math-platform/activity-components/schemas";
import { generateQuadraticFormula } from "@math-platform/math-content";
import { quadraticFormulaActivitySchema } from "@math-platform/math-content/schemas";
import {
  toConvexActivityId,
  type PracticeSubmissionEnvelope,
} from "@math-platform/practice-core/contract";
import { parseQuadratic } from "@math-platform/graphing-core";
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_PILOT_NODE,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
} from "../practice/learning-evidence-pilot";

/** Skill node that owns the Lesson 1.6 quadratic-formula practice. */
export const IM3_QF_NODE = "math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations";

/** Draft activity mapping for each quadratic-formula practice mode. */
export const IM3_QF_DRAFT_MAPPINGS = {
  guided_practice: {
    stableActivityId: `${IM3_QF_NODE}.guided_practice`,
    seed: 1,
    presentationMode: "guided",
  },
  independent_practice: {
    stableActivityId: `${IM3_QF_NODE}.independent_practice`,
    seed: 2,
    presentationMode: "independent",
  },
} as const;

/** Private generator seeds in allocation order for each practice mode. */
export const IM3_QF_VARIANT_SCHEDULES = {
  guided_practice: [1, 7, 12, 4],
  independent_practice: [2, 8, 14, 30],
} as const;

/** Returns the practice variant key for one allocation index. */
export function quadraticFormulaVariantKey(
  mode: keyof typeof IM3_QF_DRAFT_MAPPINGS,
  index: number,
): string {
  const mapping = IM3_QF_DRAFT_MAPPINGS[mode];
  if (!Number.isInteger(index) || index < 0 || index >= IM3_QF_VARIANT_SCHEDULES[mode].length) {
    throw new Error("Quadratic-formula schedule is exhausted");
  }
  return index === 0 ? mapping.stableActivityId : `${mapping.stableActivityId}.variant.${index}`;
}

/** Returns the public activity props for one private generator seed. */
export function quadraticFormulaPublicProps(
  mode: keyof typeof IM3_QF_DRAFT_MAPPINGS,
  seed: number,
) {
  const generated = generateQuadraticFormula({ seed });
  return quadraticFormulaActivitySchema.parse({
    prompt: "Use the Quadratic Formula to solve the equation.",
    equation: `${generated.quadratic} = 0`,
    presentationMode: IM3_QF_DRAFT_MAPPINGS[mode].presentationMode,
    ...(mode === "guided_practice"
      ? {
          fieldHelp: {
            discriminant: "Calculate b² - 4ac.",
            x1: "Enter one root.",
            x2: "Enter the other root. Leave this blank for a repeated root.",
          },
        }
      : {}),
  });
}

export interface ServerGradingRule {
  readonly partId: string;
  readonly ruleType: "numeric_tolerance" | "exact_match" | "expression_equivalence";
  readonly tolerance?: number;
  readonly maxScore: number;
}

export interface ServerOwnedActivity {
  readonly id: string;
  readonly stableActivityId?: string;
  readonly masteryNodeId?: string;
  readonly componentKey: string;
  readonly srsEligible?: boolean;
  readonly props: Record<string, unknown>;
  readonly gradingConfig?: {
    readonly partIds?: readonly string[];
    readonly rubric?: readonly {
      readonly partId?: string;
      readonly points: number;
    }[];
  };
  readonly privateGenerator?: {
    readonly generatorKey: "quadratic-formula";
    readonly seed: number;
  };
}

export interface ServerGradedSubmission {
  readonly submissionData: PracticeSubmissionEnvelope;
  readonly score?: number;
  readonly maxScore?: number;
  readonly masteryContractVersion?: "learning-evidence.v1";
}

type SubmissionPart = PracticeSubmissionEnvelope["parts"][number];

const IM3_PILOT_PART_IDS = ["table_values", "placed_points"] as const;
const IM3_ONE_REAL_SOLUTION_PART_IDS = ["table_values", "placed_points", "solution"] as const;
const IM3_TWO_REAL_SOLUTIONS_PART_IDS = ["table_values", "placed_points", "solutions"] as const;
const IM3_PILOT_X_VALUES = [-2, -1, 0, 1, 2] as const;
const IM3_EQUATION_RATE_NODE_ID =
  "math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation";
const IM3_EQUATION_RATE_PART_IDS = ["f_a", "f_b", "rate"] as const;
const IM3_EQUATION_RATE_POINTS = [2, 2, 3] as const;
const IM3_EQUATION_RATE_TOLERANCE = 0.01;
const IM3_DOMAIN_RANGE_NODE_ID =
  "math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph";
const IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID = `${IM3_DOMAIN_RANGE_NODE_ID}.guided_practice`;
const IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID = `${IM3_DOMAIN_RANGE_NODE_ID}.independent_practice`;

type Point = { x: number; y: number };

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeDirection(value: unknown): string {
  const normalized = normalizeText(value);
  if (normalized === "up") return "upward";
  if (normalized === "down") return "downward";
  return normalized;
}

function canonicalAnswersFromVariant(
  variant: Record<string, unknown>,
): Record<string, unknown> | null {
  const a = asFiniteNumber(variant.a);
  const b = asFiniteNumber(variant.b);
  const c = asFiniteNumber(variant.c);
  if (a === null || b === null || c === null || a === 0) return null;

  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;
  return {
    vertex_x: Math.round(vertexX * 100) / 100,
    vertex_y: Math.round(vertexY * 100) / 100,
    direction: a > 0 ? "upward" : "downward",
    y_intercept: c,
  };
}

function canonicalAnswersMatch(
  explicit: Record<string, unknown>,
  derived: Record<string, unknown>,
): boolean {
  const keys = ["vertex_x", "vertex_y", "direction", "y_intercept"];
  if (Object.keys(explicit).sort().join("|") !== [...keys].sort().join("|")) return false;

  return keys.every((key) => {
    if (key === "direction") {
      return normalizeDirection(explicit[key]) === normalizeDirection(derived[key]);
    }
    const explicitNumber = asFiniteNumber(explicit[key]);
    const derivedNumber = asFiniteNumber(derived[key]);
    return explicitNumber !== null && derivedNumber !== null && explicitNumber === derivedNumber;
  });
}

function getRules(activity: ServerOwnedActivity): readonly ServerGradingRule[] {
  const propsRules = activity.props.gradingRules;
  if (Array.isArray(propsRules)) {
    return propsRules.flatMap((candidate) => {
      const rule = asRecord(candidate);
      if (!rule || typeof rule.partId !== "string" || typeof rule.ruleType !== "string") {
        return [];
      }
      const maxScore = asFiniteNumber(rule.maxScore);
      if (
        maxScore === null ||
        maxScore <= 0 ||
        !["numeric_tolerance", "exact_match", "expression_equivalence"].includes(rule.ruleType)
      ) {
        return [];
      }
      const tolerance = asFiniteNumber(rule.tolerance);
      return [
        {
          partId: rule.partId,
          ruleType: rule.ruleType as ServerGradingRule["ruleType"],
          ...(tolerance === null ? {} : { tolerance }),
          maxScore,
        },
      ];
    });
  }

  const rubric = activity.gradingConfig?.rubric;
  if (!rubric) {
    if (!["comprehension-quiz", "step-by-step-solver"].includes(activity.componentKey)) return [];
    const answers = expectedAnswers(activity);
    return Object.keys(answers ?? {}).map((partId) => ({
      partId,
      ruleType:
        activity.componentKey === "step-by-step-solver"
          ? ("expression_equivalence" as const)
          : ("exact_match" as const),
      maxScore: 1,
    }));
  }
  return rubric.flatMap((item) =>
    item.partId && Number.isFinite(item.points) && item.points > 0
      ? [{ partId: item.partId, ruleType: "exact_match" as const, maxScore: item.points }]
      : [],
  );
}

function expectedAnswers(activity: ServerOwnedActivity): Record<string, unknown> | null {
  if (
    activity.componentKey === "comprehension-quiz" ||
    activity.componentKey === "step-by-step-solver"
  ) {
    const parsed = getPropsSchema(activity.componentKey)?.safeParse(activity.props);
    if (!parsed?.success) return null;
    const rows =
      activity.componentKey === "comprehension-quiz"
        ? activity.props.questions
        : activity.props.steps;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const answers: Record<string, unknown> = {};
    for (const [index, candidate] of rows.entries()) {
      const row = asRecord(candidate);
      if (!row) return null;
      const id = activity.componentKey === "comprehension-quiz" ? row.id : `step_${index}`;
      if (typeof id !== "string" || Object.hasOwn(answers, id)) return null;
      answers[id] =
        activity.componentKey === "comprehension-quiz" ? row.correctAnswer : row.expression;
    }
    return answers;
  }
  if (activity.componentKey === "fill-in-the-blank") {
    const blanks = activity.props.blanks;
    if (!Array.isArray(blanks) || blanks.length === 0) return null;

    const expected: Record<string, unknown> = {};
    for (const candidate of blanks) {
      const blank = asRecord(candidate);
      if (
        !blank ||
        typeof blank.id !== "string" ||
        blank.id.trim().length === 0 ||
        typeof blank.correctAnswer !== "string" ||
        blank.correctAnswer.trim().length === 0 ||
        Object.prototype.hasOwnProperty.call(expected, blank.id)
      ) {
        return null;
      }
      expected[blank.id] = blank.correctAnswer;
    }
    return expected;
  }

  const explicit = asRecord(activity.props.canonicalAnswers);
  const variant = asRecord(activity.props.canonicalVariant);
  if (!variant) return explicit;

  const derived = canonicalAnswersFromVariant(variant);
  if (!derived) return null;
  if (explicit && !canonicalAnswersMatch(explicit, derived)) return null;
  return explicit ?? derived;
}

function answerForPart(envelope: PracticeSubmissionEnvelope, partId: string): unknown {
  if (Object.prototype.hasOwnProperty.call(envelope.answers, partId)) {
    const answer = envelope.answers[partId];
    const wrapper = asRecord(answer);
    return wrapper && Object.prototype.hasOwnProperty.call(wrapper, "answer")
      ? wrapper.answer
      : answer;
  }
  return envelope.parts.find((part) => part.partId === partId)?.rawAnswer ?? null;
}

function isCorrectAnswer(rule: ServerGradingRule, actual: unknown, expected: unknown): boolean {
  if (actual === null || actual === undefined || expected === null || expected === undefined) {
    return false;
  }

  if (Array.isArray(expected)) {
    return (
      Array.isArray(actual) &&
      actual.length === expected.length &&
      new Set(actual).size === actual.length &&
      expected.every((value) => actual.includes(value))
    );
  }
  if (rule.ruleType === "numeric_tolerance") {
    const actualNumber = asFiniteNumber(actual);
    const expectedNumber = asFiniteNumber(expected);
    const tolerance = rule.tolerance ?? 0;
    return (
      actualNumber !== null &&
      expectedNumber !== null &&
      Number.isFinite(tolerance) &&
      Math.abs(actualNumber - expectedNumber) <= tolerance
    );
  }

  if (rule.ruleType === "expression_equivalence") {
    const normalizedActual = typeof actual === "string" ? normalizeSolverAnswer(actual) : "";
    const normalizedExpected = typeof expected === "string" ? normalizeSolverAnswer(expected) : "";
    return normalizedActual.length > 0 && normalizedActual === normalizedExpected;
  }

  if (rule.partId === "direction") {
    return normalizeDirection(actual) === normalizeDirection(expected);
  }
  const normalizedActual = normalizeText(actual);
  const normalizedExpected = normalizeText(expected);
  return normalizedActual.length > 0 && normalizedActual === normalizedExpected;
}

function preserveStudentTelemetry(
  part: SubmissionPart | undefined,
): Pick<
  SubmissionPart,
  | "hintsUsed"
  | "revealStepsSeen"
  | "changedCount"
  | "firstInteractionAt"
  | "answeredAt"
  | "wallClockMs"
  | "activeMs"
> {
  if (!part) return {};
  return {
    ...(part.hintsUsed === undefined ? {} : { hintsUsed: part.hintsUsed }),
    ...(part.revealStepsSeen === undefined ? {} : { revealStepsSeen: part.revealStepsSeen }),
    ...(part.changedCount === undefined ? {} : { changedCount: part.changedCount }),
    ...(part.firstInteractionAt === undefined
      ? {}
      : { firstInteractionAt: part.firstInteractionAt }),
    ...(part.answeredAt === undefined ? {} : { answeredAt: part.answeredAt }),
    ...(part.wallClockMs === undefined ? {} : { wallClockMs: part.wallClockMs }),
    ...(part.activeMs === undefined ? {} : { activeMs: part.activeMs }),
  };
}

function expectedPilotPoints(activity: ServerOwnedActivity): Point[] {
  const equation = activity.props.equation;
  const coefficients = typeof equation === "string" ? parseQuadratic(equation) : null;
  if (
    activity.props.variant !== "plot_from_equation" ||
    activity.props.responseVariant !== "table_graph" ||
    !coefficients ||
    !Number.isFinite(coefficients.a) ||
    !Number.isFinite(coefficients.b) ||
    !Number.isFinite(coefficients.c) ||
    coefficients.a === 0
  ) {
    throw new Error("IM3 pilot activity is missing canonical server grading data");
  }

  return IM3_PILOT_X_VALUES.map((x) => ({
    x,
    y: coefficients.a * x * x + coefficients.b * x + coefficients.c,
  }));
}

function validatePilotRubric(activity: ServerOwnedActivity): void {
  const partIds = activity.gradingConfig?.partIds;
  const rubric = activity.gradingConfig?.rubric;
  if (
    !partIds ||
    partIds.length !== IM3_PILOT_PART_IDS.length ||
    partIds.some((partId, index) => partId !== IM3_PILOT_PART_IDS[index]) ||
    !rubric ||
    rubric.length !== IM3_PILOT_PART_IDS.length ||
    rubric.some(
      (rule, index) =>
        rule.partId !== IM3_PILOT_PART_IDS[index] ||
        rule.points !== 1 ||
        !Number.isFinite(rule.points),
    )
  ) {
    throw new Error("IM3 pilot activity is missing canonical server grading data");
  }
}

function finitePointArray(
  value: unknown,
  expectedLength: number = IM3_PILOT_X_VALUES.length,
): Point[] | null {
  if (!Array.isArray(value) || value.length !== expectedLength) return null;
  const points: Point[] = [];
  for (const candidate of value) {
    const point = asRecord(candidate);
    if (
      !point ||
      Object.keys(point).sort().join("|") !== "x|y" ||
      typeof point.x !== "number" ||
      typeof point.y !== "number" ||
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y)
    ) {
      return null;
    }
    points.push({ x: point.x, y: point.y });
  }
  return points;
}

function matchesPilotPoints(
  actual: unknown,
  expected: readonly Point[],
  tolerance: number,
): boolean {
  const points = finitePointArray(actual, expected.length);
  if (!points) return false;
  const remaining = [...expected];
  for (const point of points) {
    const matchIndex = remaining.findIndex(
      (candidate) =>
        Math.abs(point.x - candidate.x) <= tolerance &&
        Math.abs(point.y - candidate.y) <= tolerance,
    );
    if (matchIndex < 0) return false;
    remaining.splice(matchIndex, 1);
  }
  return remaining.length === 0;
}

/** Rebuilds the private quadratic-formula problem from its generator seed. */
function regenerateQuadraticFormula(activity: ServerOwnedActivity) {
  if (activity.masteryNodeId !== IM3_QF_NODE || activity.componentKey !== "quadratic-formula") {
    throw new Error("Invalid quadratic-formula activity");
  }
  const identity = activity.privateGenerator;
  if (
    !identity ||
    identity.generatorKey !== "quadratic-formula" ||
    !Number.isSafeInteger(identity.seed) ||
    identity.seed < 0
  ) {
    throw new Error("Invalid private quadratic-formula generator identity");
  }
  const props = quadraticFormulaActivitySchema.parse(activity.props);
  const problem = generateQuadraticFormula({ seed: identity.seed });
  if (props.equation !== `${problem.quadratic} = 0`)
    throw new Error("Quadratic-formula equation does not match its private seed");
  return problem;
}

/** Grades one Guided discriminant answer from the private generator seed. */
export function checkServerOwnedQuadraticDiscriminant(
  activity: ServerOwnedActivity,
  rawAnswer: string,
): boolean {
  if (
    activity.stableActivityId !== IM3_QF_DRAFT_MAPPINGS.guided_practice.stableActivityId ||
    activity.props.presentationMode !== "guided" ||
    rawAnswer.length > 160
  ) {
    throw new Error("Invalid Guided discriminant check");
  }
  const problem = regenerateQuadraticFormula(activity);
  return gradeQuadraticFormulaResponse(problem, {
    discriminant: rawAnswer,
    x1: "",
    x2: "",
  }).parts[0].isCorrect;
}

/**
 * Grades from the activity document, never from client-derived score fields.
 * Activities without a canonical rubric are stored as ungraded records so
 * the ordinary lesson flow remains available without creating mastery.
 */
export function gradeServerOwnedSubmission(
  activity: ServerOwnedActivity,
  envelope: PracticeSubmissionEnvelope,
): ServerGradedSubmission {
  activity = { ...activity, props: normalizeSeedProps(activity.componentKey, activity.props) };
  if (activity.masteryNodeId === IM3_QF_NODE && activity.componentKey === "quadratic-formula") {
    const problem = regenerateQuadraticFormula(activity);
    const partsById = new Map(envelope.parts.map((part) => [part.partId, part]));
    const grade = gradeQuadraticFormulaResponse(problem, {
      discriminant: envelope.answers.discriminant,
      x1: envelope.answers.x1,
      x2: envelope.answers.x2,
    });
    return {
      submissionData: {
        ...envelope,
        activityId: toConvexActivityId(activity.id),
        status: "graded",
        parts: grade.parts.map((part) => ({
          ...part,
          ...preserveStudentTelemetry(partsById.get(part.partId)),
        })),
      },
      score: grade.score,
      maxScore: grade.maxScore,
    };
  }
  const rules = getRules(activity);
  const expected = expectedAnswers(activity);
  const isPilot =
    activity.masteryNodeId === IM3_PILOT_NODE &&
    activity.componentKey === "graphing-explorer" &&
    ((activity.stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID &&
      envelope.mode === "independent_practice") ||
      (activity.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID &&
        envelope.mode === "guided_practice") ||
      (activity.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID &&
        activity.srsEligible === true &&
        envelope.mode === "guided_practice" &&
        envelope.status === "submitted") ||
      (activity.stableActivityId === IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID &&
        activity.srsEligible === true &&
        envelope.mode === "independent_practice" &&
        envelope.status === "submitted"));
  const isProfitModel =
    activity.masteryNodeId === IM3_PROFIT_MODEL_NODE &&
    activity.componentKey === "fill-in-the-blank" &&
    ((activity.stableActivityId === IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID &&
      envelope.mode === "guided_practice") ||
      (activity.stableActivityId === IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID &&
        envelope.mode === "independent_practice"));
  const isProfitMaximumGuided =
    activity.masteryNodeId === IM3_PROFIT_MAXIMUM_NODE &&
    activity.componentKey === "fill-in-the-blank" &&
    activity.stableActivityId === IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID &&
    envelope.mode === "guided_practice" &&
    activity.srsEligible === true;
  const isProfitMaximumIndependent =
    activity.masteryNodeId === IM3_PROFIT_MAXIMUM_NODE &&
    activity.componentKey === "fill-in-the-blank" &&
    activity.stableActivityId === IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID &&
    envelope.mode === "independent_practice" &&
    activity.srsEligible === true;

  const normalizedActivityId = toConvexActivityId(activity.id);
  if (isPilot) {
    validatePilotRubric(activity);
    const expectedPoints = expectedPilotPoints(activity);
    const tablePart = envelope.parts.find((part) => part.partId === IM3_PILOT_PART_IDS[0]);
    const placedPointsPart = envelope.parts.find((part) => part.partId === IM3_PILOT_PART_IDS[1]);
    const tableCorrect = matchesPilotPoints(tablePart?.rawAnswer, expectedPoints, 0);
    const placedPointsCorrect = matchesPilotPoints(
      placedPointsPart?.rawAnswer,
      expectedPoints,
      0.25,
    );
    const gradedParts = [
      {
        partId: IM3_PILOT_PART_IDS[0],
        rawAnswer: tablePart?.rawAnswer ?? null,
        isCorrect: tableCorrect,
        score: tableCorrect ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(tablePart),
      },
      {
        partId: IM3_PILOT_PART_IDS[1],
        rawAnswer: placedPointsPart?.rawAnswer ?? null,
        isCorrect: placedPointsCorrect,
        score: placedPointsCorrect ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(placedPointsPart),
      },
    ];
    const score = (tableCorrect ? 1 : 0) + (placedPointsCorrect ? 1 : 0);
    return {
      submissionData: {
        ...envelope,
        activityId: normalizedActivityId,
        status: "graded",
        parts: gradedParts,
      },
      score,
      maxScore: 2,
      ...(activity.srsEligible === true
        ? { masteryContractVersion: "learning-evidence.v1" as const }
        : {}),
    };
  }

  const isEquationRate =
    activity.masteryNodeId === IM3_EQUATION_RATE_NODE_ID &&
    activity.componentKey === "rate-of-change-calculator" &&
    ((activity.stableActivityId === `${IM3_EQUATION_RATE_NODE_ID}.guided_practice` &&
      envelope.mode === "guided_practice") ||
      (activity.stableActivityId === `${IM3_EQUATION_RATE_NODE_ID}.independent_practice` &&
        envelope.mode === "independent_practice"));

  if (isEquationRate) {
    const props = asRecord(activity.props);
    const data = asRecord(props?.data);
    const interval = asRecord(props?.interval);
    const expression = data?.expression;
    const start = interval?.start;
    const end = interval?.end;
    const coefficients =
      props?.sourceType === "function" &&
      typeof expression === "string" &&
      expression.trim().length > 0
        ? parseQuadratic(expression)
        : null;
    const partIds = activity.gradingConfig?.partIds;
    const rubric = activity.gradingConfig?.rubric;
    const rubricIsCanonical =
      Array.isArray(partIds) &&
      partIds.length === IM3_EQUATION_RATE_PART_IDS.length &&
      partIds.every((partId, index) => partId === IM3_EQUATION_RATE_PART_IDS[index]) &&
      Array.isArray(rubric) &&
      rubric.length === IM3_EQUATION_RATE_PART_IDS.length &&
      rubric.every(
        (rule, index) =>
          rule.partId === IM3_EQUATION_RATE_PART_IDS[index] &&
          rule.points === IM3_EQUATION_RATE_POINTS[index] &&
          Number.isFinite(rule.points),
      );

    if (
      !coefficients ||
      !Number.isFinite(coefficients.a) ||
      !Number.isFinite(coefficients.b) ||
      !Number.isFinite(coefficients.c) ||
      typeof start !== "number" ||
      !Number.isFinite(start) ||
      typeof end !== "number" ||
      !Number.isFinite(end) ||
      start === end ||
      !rubricIsCanonical
    ) {
      const ungradedParts = envelope.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer,
        ...preserveStudentTelemetry(part),
      }));
      return {
        submissionData: {
          ...envelope,
          activityId: normalizedActivityId,
          status: "submitted",
          parts: ungradedParts,
        },
      };
    }

    const expectedValues = {
      f_a: coefficients.a * start ** 2 + coefficients.b * start + coefficients.c,
      f_b: coefficients.a * end ** 2 + coefficients.b * end + coefficients.c,
      rate: 0,
    };
    expectedValues.rate = (expectedValues.f_b - expectedValues.f_a) / (end - start);

    let score = 0;
    const gradedParts = IM3_EQUATION_RATE_PART_IDS.map((partId, index) => {
      const sourcePart = envelope.parts.find((part) => part.partId === partId);
      const actualNumber = asFiniteNumber(sourcePart?.rawAnswer);
      const expectedNumber = expectedValues[partId];
      const correct =
        actualNumber !== null &&
        Math.abs(actualNumber - expectedNumber) <=
          IM3_EQUATION_RATE_TOLERANCE +
            Number.EPSILON * Math.max(1, Math.abs(actualNumber), Math.abs(expectedNumber));
      const partScore = correct ? IM3_EQUATION_RATE_POINTS[index] : 0;
      score += partScore;
      return {
        partId,
        rawAnswer: sourcePart?.rawAnswer ?? null,
        isCorrect: correct,
        score: partScore,
        maxScore: IM3_EQUATION_RATE_POINTS[index],
        ...preserveStudentTelemetry(sourcePart),
      };
    });

    return {
      submissionData: {
        ...envelope,
        activityId: normalizedActivityId,
        status: "graded",
        parts: gradedParts,
      },
      score,
      maxScore: IM3_EQUATION_RATE_POINTS.reduce((total, points) => total + points, 0),
      ...(activity.srsEligible === true
        ? { masteryContractVersion: "learning-evidence.v1" as const }
        : {}),
    };
  }

  const maximumReadingProps = asRecord(activity.props);
  const isMaximumReadingCandidate =
    activity.masteryNodeId === IM3_MAXIMUM_READING_NODE ||
    activity.stableActivityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID ||
    activity.stableActivityId === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID;
  const isMaximumReading =
    isMaximumReadingCandidate &&
    activity.masteryNodeId === IM3_MAXIMUM_READING_NODE &&
    activity.componentKey === "graphing-explorer" &&
    activity.props.variant === "plot_from_equation" &&
    activity.props.responseVariant === "maximum_value" &&
    envelope.status === "submitted" &&
    ((activity.stableActivityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID &&
      envelope.mode === "guided_practice") ||
      (activity.stableActivityId === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID &&
        envelope.mode === "independent_practice"));

  if (isMaximumReadingCandidate) {
    const equation = maximumReadingProps?.equation;
    const coefficients =
      isMaximumReading && typeof equation === "string" && equation.trim().length > 0
        ? parseQuadratic(equation)
        : null;
    const partIds = activity.gradingConfig?.partIds;
    const rubric = activity.gradingConfig?.rubric;
    const rubricIsCanonical =
      Array.isArray(partIds) &&
      partIds.length === 1 &&
      partIds[0] === "maximum_value" &&
      Array.isArray(rubric) &&
      rubric.length === 1 &&
      rubric[0]?.partId === "maximum_value" &&
      rubric[0]?.points === 1 &&
      Number.isFinite(rubric[0]?.points);

    if (
      !coefficients ||
      !Number.isFinite(coefficients.a) ||
      !Number.isFinite(coefficients.b) ||
      !Number.isFinite(coefficients.c) ||
      coefficients.a >= 0 ||
      !rubricIsCanonical
    ) {
      const ungradedParts = envelope.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer,
        ...preserveStudentTelemetry(part),
      }));
      return {
        submissionData: {
          ...envelope,
          activityId: normalizedActivityId,
          status: "submitted",
          parts: ungradedParts,
        },
      };
    }

    const maximumValue = coefficients.c - coefficients.b ** 2 / (4 * coefficients.a);
    const sourcePart = envelope.parts.find((part) => part.partId === "maximum_value");
    const actualNumber = asFiniteNumber(sourcePart?.rawAnswer);
    const correct =
      actualNumber !== null &&
      Math.abs(actualNumber - maximumValue) <=
        0.001 + Number.EPSILON * Math.max(1, Math.abs(actualNumber), Math.abs(maximumValue));
    const gradedParts = [
      {
        partId: "maximum_value",
        rawAnswer: sourcePart?.rawAnswer ?? null,
        isCorrect: correct,
        score: correct ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(sourcePart),
      },
    ];

    return {
      submissionData: {
        ...envelope,
        activityId: normalizedActivityId,
        status: "graded",
        parts: gradedParts,
      },
      score: correct ? 1 : 0,
      maxScore: 1,
      ...(activity.srsEligible === true
        ? { masteryContractVersion: "learning-evidence.v1" as const }
        : {}),
    };
  }

  const comparisonProps = asRecord(activity.props);
  const isComparisonCandidate =
    activity.masteryNodeId === IM3_COMPARE_MAXIMUM_NODE ||
    activity.stableActivityId === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID ||
    activity.stableActivityId === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID;
  const isComparison =
    isComparisonCandidate &&
    activity.masteryNodeId === IM3_COMPARE_MAXIMUM_NODE &&
    activity.componentKey === "graphing-explorer" &&
    comparisonProps?.variant === "compare_functions" &&
    comparisonProps.responseVariant === "compare_maximums" &&
    envelope.status === "submitted" &&
    ((activity.stableActivityId === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID &&
      envelope.mode === "guided_practice") ||
      (activity.stableActivityId === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID &&
        envelope.mode === "independent_practice"));

  if (isComparisonCandidate) {
    const firstEquation = comparisonProps?.equation;
    const secondEquation = comparisonProps?.comparisonEquation;
    const firstCoefficients =
      isComparison && typeof firstEquation === "string" && firstEquation.trim().length > 0
        ? parseQuadratic(firstEquation)
        : null;
    const secondCoefficients =
      isComparison && typeof secondEquation === "string" && secondEquation.trim().length > 0
        ? parseQuadratic(secondEquation)
        : null;
    const firstMaximum = firstCoefficients
      ? firstCoefficients.c - firstCoefficients.b ** 2 / (4 * firstCoefficients.a)
      : null;
    const secondVertexX = secondCoefficients
      ? -secondCoefficients.b / (2 * secondCoefficients.a)
      : null;
    const secondMaximum = secondCoefficients
      ? secondCoefficients.c - secondCoefficients.b ** 2 / (4 * secondCoefficients.a)
      : null;
    const expectedChoice =
      firstMaximum !== null && secondMaximum !== null && firstMaximum > secondMaximum
        ? "first"
        : "second";
    const vertex = comparisonProps?.vertex;
    const yIntercept = comparisonProps?.yIntercept;
    const vertexIsCanonical =
      Array.isArray(vertex) &&
      vertex.length === 2 &&
      vertex.every((value) => typeof value === "number" && Number.isFinite(value));
    const yInterceptIsCanonical =
      Array.isArray(yIntercept) &&
      yIntercept.length === 2 &&
      yIntercept.every((value) => typeof value === "number" && Number.isFinite(value)) &&
      yIntercept[0] === 0;
    const comparisonAnswer = comparisonProps?.comparisonAnswer;
    const comparisonAnswerIsCanonical =
      (comparisonAnswer === "first" || comparisonAnswer === "second") &&
      comparisonAnswer === expectedChoice;
    const partIds = activity.gradingConfig?.partIds;
    const rubric = activity.gradingConfig?.rubric;
    const rubricIsCanonical =
      Array.isArray(partIds) &&
      partIds.length === 1 &&
      partIds[0] === "greater_maximum" &&
      Array.isArray(rubric) &&
      rubric.length === 1 &&
      rubric[0]?.partId === "greater_maximum" &&
      rubric[0]?.points === 1 &&
      Number.isFinite(rubric[0]?.points);
    const envelopeIsCanonical =
      envelope.contractVersion === "practice.v1" &&
      envelope.status === "submitted" &&
      Number.isInteger(envelope.attemptNumber) &&
      envelope.attemptNumber > 0 &&
      typeof envelope.submittedAt === "string" &&
      !Number.isNaN(Date.parse(envelope.submittedAt));
    const answers = asRecord(envelope.answers);
    const answersAreCanonical =
      answers !== null &&
      Object.keys(answers).length === 1 &&
      (answers.greater_maximum === "first" || answers.greater_maximum === "second");
    const sourcePart = envelope.parts.length === 1 ? envelope.parts[0] : undefined;
    const rawChoice = sourcePart?.rawAnswer;
    const partIsCanonical =
      sourcePart?.partId === "greater_maximum" && (rawChoice === "first" || rawChoice === "second");
    const valuesAreCanonical =
      firstCoefficients !== null &&
      secondCoefficients !== null &&
      Number.isFinite(firstCoefficients.a) &&
      Number.isFinite(firstCoefficients.b) &&
      Number.isFinite(firstCoefficients.c) &&
      firstCoefficients.a < 0 &&
      Number.isFinite(secondCoefficients.a) &&
      Number.isFinite(secondCoefficients.b) &&
      Number.isFinite(secondCoefficients.c) &&
      secondCoefficients.a < 0 &&
      firstMaximum !== null &&
      secondVertexX !== null &&
      secondMaximum !== null &&
      firstMaximum !== secondMaximum &&
      vertexIsCanonical &&
      yInterceptIsCanonical &&
      Math.abs(vertex[0] - secondVertexX) <= 1e-9 &&
      Math.abs(vertex[1] - secondMaximum) <= 1e-9 &&
      Math.abs(yIntercept[1] - secondCoefficients.c) <= 1e-9;

    if (
      !isComparison ||
      !envelopeIsCanonical ||
      !answersAreCanonical ||
      !partIsCanonical ||
      !valuesAreCanonical ||
      !comparisonAnswerIsCanonical ||
      !rubricIsCanonical
    ) {
      const ungradedParts = envelope.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer,
        ...preserveStudentTelemetry(part),
      }));
      return {
        submissionData: {
          ...envelope,
          activityId: normalizedActivityId,
          status: "submitted",
          parts: ungradedParts,
        },
      };
    }

    const correct = rawChoice === expectedChoice;
    const gradedParts = [
      {
        partId: "greater_maximum",
        rawAnswer: rawChoice,
        isCorrect: correct,
        score: correct ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(sourcePart),
      },
    ];

    return {
      submissionData: {
        ...envelope,
        activityId: normalizedActivityId,
        status: "graded",
        parts: gradedParts,
      },
      score: correct ? 1 : 0,
      maxScore: 1,
      ...(activity.srsEligible === true
        ? { masteryContractVersion: "learning-evidence.v1" as const }
        : {}),
    };
  }

  const symmetryProps = asRecord(activity.props);
  const isSymmetryCandidate =
    activity.masteryNodeId === IM3_SYMMETRY_NODE ||
    activity.stableActivityId === IM3_SYMMETRY_GUIDED_ACTIVITY_ID ||
    activity.stableActivityId === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID;
  const isSymmetry =
    isSymmetryCandidate &&
    activity.masteryNodeId === IM3_SYMMETRY_NODE &&
    activity.componentKey === "graphing-explorer" &&
    symmetryProps?.variant === "plot_from_equation" &&
    symmetryProps.responseVariant === "symmetry_graph" &&
    envelope.status === "submitted" &&
    ((activity.stableActivityId === IM3_SYMMETRY_GUIDED_ACTIVITY_ID &&
      envelope.mode === "guided_practice") ||
      (activity.stableActivityId === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID &&
        envelope.mode === "independent_practice"));

  if (isSymmetryCandidate) {
    const equation = symmetryProps?.equation;
    const coefficients =
      isSymmetry && typeof equation === "string" && equation.trim().length > 0
        ? parseQuadratic(equation)
        : null;
    const vertex = symmetryProps?.vertex;
    const yIntercept = symmetryProps?.yIntercept;
    const vertexIsCanonical =
      Array.isArray(vertex) &&
      vertex.length === 2 &&
      vertex.every((value) => typeof value === "number" && Number.isFinite(value));
    const yInterceptIsCanonical =
      Array.isArray(yIntercept) &&
      yIntercept.length === 2 &&
      yIntercept.every((value) => typeof value === "number" && Number.isFinite(value)) &&
      yIntercept[0] === 0;
    const partIds = activity.gradingConfig?.partIds;
    const rubric = activity.gradingConfig?.rubric;
    const rubricIsCanonical =
      Array.isArray(partIds) &&
      partIds.length === 1 &&
      partIds[0] === "placed_points" &&
      Array.isArray(rubric) &&
      rubric.length === 1 &&
      rubric[0]?.partId === "placed_points" &&
      rubric[0]?.points === 1 &&
      Number.isFinite(rubric[0]?.points);
    const envelopeIsCanonical =
      envelope.contractVersion === "practice.v1" &&
      envelope.status === "submitted" &&
      Number.isInteger(envelope.attemptNumber) &&
      envelope.attemptNumber > 0 &&
      typeof envelope.submittedAt === "string" &&
      !Number.isNaN(Date.parse(envelope.submittedAt));
    const answers = asRecord(envelope.answers);
    const answerPoints = answers?.placed_points;
    const answersAreCanonical =
      answers !== null &&
      Object.keys(answers).length === 1 &&
      finitePointArray(answerPoints, 3) !== null;
    const sourcePart = envelope.parts.length === 1 ? envelope.parts[0] : undefined;
    const rawPoints = sourcePart?.rawAnswer;
    const partIsCanonical =
      sourcePart?.partId === "placed_points" && finitePointArray(rawPoints, 3) !== null;
    const valuesAreCanonical =
      coefficients !== null &&
      Number.isFinite(coefficients.a) &&
      Number.isFinite(coefficients.b) &&
      Number.isFinite(coefficients.c) &&
      coefficients.a !== 0 &&
      vertexIsCanonical &&
      yInterceptIsCanonical &&
      Math.abs(vertex[0] - -coefficients.b / (2 * coefficients.a)) <= 1e-9 &&
      Math.abs(vertex[1] - (coefficients.c - coefficients.b ** 2 / (4 * coefficients.a))) <= 1e-9 &&
      Math.abs(yIntercept[1] - coefficients.c) <= 1e-9;

    if (
      !isSymmetry ||
      !envelopeIsCanonical ||
      !valuesAreCanonical ||
      !rubricIsCanonical ||
      !answersAreCanonical ||
      !partIsCanonical
    ) {
      const ungradedParts = envelope.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer,
        ...preserveStudentTelemetry(part),
      }));
      return {
        submissionData: {
          ...envelope,
          activityId: normalizedActivityId,
          status: "submitted",
          parts: ungradedParts,
        },
      };
    }

    const expectedPoints = [
      { x: vertex[0], y: vertex[1] },
      { x: 0, y: coefficients.c },
      { x: 2 * vertex[0], y: coefficients.c },
    ];
    const correct = matchesPilotPoints(rawPoints, expectedPoints, 0.25);
    const gradedParts = [
      {
        partId: "placed_points",
        rawAnswer: rawPoints,
        isCorrect: correct,
        score: correct ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(sourcePart),
      },
    ];

    return {
      submissionData: {
        ...envelope,
        activityId: normalizedActivityId,
        status: "graded",
        parts: gradedParts,
      },
      score: correct ? 1 : 0,
      maxScore: 1,
      ...(activity.srsEligible === true
        ? { masteryContractVersion: "learning-evidence.v1" as const }
        : {}),
    };
  }

  const oneRealSolutionProps = asRecord(activity.props);
  const isOneRealSolutionCandidate =
    activity.masteryNodeId === IM3_ONE_REAL_SOLUTION_NODE ||
    activity.stableActivityId === IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID ||
    activity.stableActivityId === IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID;
  const isOneRealSolution =
    isOneRealSolutionCandidate &&
    activity.masteryNodeId === IM3_ONE_REAL_SOLUTION_NODE &&
    activity.componentKey === "graphing-explorer" &&
    oneRealSolutionProps?.variant === "plot_from_equation" &&
    oneRealSolutionProps.responseVariant === "one_real_solution" &&
    typeof oneRealSolutionProps.originalEquation === "string" &&
    oneRealSolutionProps.originalEquation.trim().length > 0 &&
    typeof oneRealSolutionProps.equation === "string" &&
    oneRealSolutionProps.equation.trim().length > 0 &&
    oneRealSolutionProps.equation.split("=").length > 1 &&
    oneRealSolutionProps.equation.split("=").slice(1).join("=").trim().length > 0 &&
    envelope.contractVersion === "practice.v1" &&
    envelope.status === "submitted" &&
    Number.isInteger(envelope.attemptNumber) &&
    envelope.attemptNumber > 0 &&
    typeof envelope.submittedAt === "string" &&
    !Number.isNaN(Date.parse(envelope.submittedAt)) &&
    ((activity.stableActivityId === IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID &&
      envelope.mode === "guided_practice") ||
      (activity.stableActivityId === IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID &&
        envelope.mode === "independent_practice"));

  if (isOneRealSolutionCandidate) {
    const equation = oneRealSolutionProps?.equation;
    const coefficients =
      isOneRealSolution && typeof equation === "string" && equation.trim().length > 0
        ? parseQuadratic(equation)
        : null;
    const discriminant = coefficients
      ? coefficients.b ** 2 - 4 * coefficients.a * coefficients.c
      : null;
    const repeatedRoot =
      coefficients && coefficients.a !== 0 ? -coefficients.b / (2 * coefficients.a) : null;
    const normalizedRepeatedRoot = repeatedRoot === 0 ? 0 : repeatedRoot;
    const partIds = activity.gradingConfig?.partIds;
    const rubric = activity.gradingConfig?.rubric;
    const rubricIsCanonical =
      Array.isArray(partIds) &&
      partIds.length === IM3_ONE_REAL_SOLUTION_PART_IDS.length &&
      partIds.every((partId, index) => partId === IM3_ONE_REAL_SOLUTION_PART_IDS[index]) &&
      Array.isArray(rubric) &&
      rubric.length === IM3_ONE_REAL_SOLUTION_PART_IDS.length &&
      rubric.every(
        (rule, index) =>
          rule.partId === IM3_ONE_REAL_SOLUTION_PART_IDS[index] &&
          rule.points === 1 &&
          Number.isFinite(rule.points),
      );
    const envelopeIsCanonical =
      envelope.contractVersion === "practice.v1" &&
      envelope.status === "submitted" &&
      Number.isInteger(envelope.attemptNumber) &&
      envelope.attemptNumber > 0 &&
      typeof envelope.submittedAt === "string" &&
      !Number.isNaN(Date.parse(envelope.submittedAt));
    const answers = asRecord(envelope.answers);
    const answerTableValues = answers?.table_values;
    const answerPlacedPoints = answers?.placed_points;
    const answerSolution = asFiniteNumber(answers?.solution);
    const answerTablePoints = finitePointArray(answerTableValues, 5);
    const answerPlacedPointValues = finitePointArray(answerPlacedPoints, 5);
    const answersAreCanonical =
      answers !== null &&
      Object.keys(answers).join("|") === IM3_ONE_REAL_SOLUTION_PART_IDS.join("|") &&
      answerTablePoints !== null &&
      answerPlacedPointValues !== null &&
      answerSolution !== null;
    const tablePart = envelope.parts[0];
    const placedPointsPart = envelope.parts[1];
    const solutionPart = envelope.parts[2];
    const rawTablePoints = finitePointArray(tablePart?.rawAnswer, 5);
    const rawPlacedPoints = finitePointArray(placedPointsPart?.rawAnswer, 5);
    const rawSolution = asFiniteNumber(solutionPart?.rawAnswer);
    const partsAreCanonical =
      envelope.parts.length === IM3_ONE_REAL_SOLUTION_PART_IDS.length &&
      envelope.parts.every(
        (part, index) => part.partId === IM3_ONE_REAL_SOLUTION_PART_IDS[index],
      ) &&
      rawTablePoints !== null &&
      rawPlacedPoints !== null &&
      rawSolution !== null;
    const valuesAreCanonical =
      coefficients !== null &&
      Number.isFinite(coefficients.a) &&
      Number.isFinite(coefficients.b) &&
      Number.isFinite(coefficients.c) &&
      coefficients.a > 0 &&
      discriminant !== null &&
      Number.isFinite(discriminant) &&
      Math.abs(discriminant) <= 1e-9 &&
      normalizedRepeatedRoot !== null &&
      Number.isFinite(normalizedRepeatedRoot) &&
      Number.isInteger(normalizedRepeatedRoot);

    if (
      !isOneRealSolution ||
      !envelopeIsCanonical ||
      !rubricIsCanonical ||
      !answersAreCanonical ||
      !partsAreCanonical ||
      !valuesAreCanonical ||
      normalizedRepeatedRoot === null ||
      coefficients === null ||
      rawTablePoints === null ||
      rawPlacedPoints === null ||
      rawSolution === null
    ) {
      const ungradedParts = envelope.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer,
        ...preserveStudentTelemetry(part),
      }));
      return {
        submissionData: {
          ...envelope,
          activityId: normalizedActivityId,
          status: "submitted",
          parts: ungradedParts,
        },
      };
    }

    const expectedTablePoints = [-2, -1, 0, 1, 2].map((offset) => {
      const x = normalizedRepeatedRoot + offset;
      return {
        x,
        y: coefficients.a * x ** 2 + coefficients.b * x + coefficients.c,
      };
    });
    const tableCorrect = rawTablePoints.every((point, index) => {
      const expected = expectedTablePoints[index];
      return expected !== undefined && point.x === expected.x && point.y === expected.y;
    });
    const placedPointsCorrect = matchesPilotPoints(rawPlacedPoints, expectedTablePoints, 0.25);
    const solutionCorrect =
      Math.abs(rawSolution - normalizedRepeatedRoot) <=
      0.01 + Number.EPSILON * Math.max(1, Math.abs(rawSolution), Math.abs(normalizedRepeatedRoot));
    const gradedParts = [
      {
        partId: IM3_ONE_REAL_SOLUTION_PART_IDS[0],
        rawAnswer: tablePart?.rawAnswer ?? null,
        isCorrect: tableCorrect,
        score: tableCorrect ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(tablePart),
      },
      {
        partId: IM3_ONE_REAL_SOLUTION_PART_IDS[1],
        rawAnswer: placedPointsPart?.rawAnswer ?? null,
        isCorrect: placedPointsCorrect,
        score: placedPointsCorrect ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(placedPointsPart),
      },
      {
        partId: IM3_ONE_REAL_SOLUTION_PART_IDS[2],
        rawAnswer: solutionPart?.rawAnswer ?? null,
        isCorrect: solutionCorrect,
        score: solutionCorrect ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(solutionPart),
      },
    ];
    const score = gradedParts.reduce((total, part) => total + part.score, 0);

    return {
      submissionData: {
        ...envelope,
        activityId: normalizedActivityId,
        status: "graded",
        parts: gradedParts,
      },
      score,
      maxScore: 3,
      ...(activity.srsEligible === true
        ? { masteryContractVersion: "learning-evidence.v1" as const }
        : {}),
    };
  }

  const twoRealSolutionsProps = asRecord(activity.props);
  const isTwoRealSolutionsCandidate =
    activity.masteryNodeId === IM3_TWO_REAL_SOLUTIONS_NODE ||
    activity.stableActivityId === IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID ||
    activity.stableActivityId === IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID;
  const isTwoRealSolutions =
    isTwoRealSolutionsCandidate &&
    activity.masteryNodeId === IM3_TWO_REAL_SOLUTIONS_NODE &&
    activity.componentKey === "graphing-explorer" &&
    twoRealSolutionsProps?.variant === "plot_from_equation" &&
    twoRealSolutionsProps.responseVariant === "two_real_solutions" &&
    typeof twoRealSolutionsProps.originalEquation === "string" &&
    twoRealSolutionsProps.originalEquation.trim().length > 0 &&
    typeof twoRealSolutionsProps.equation === "string" &&
    twoRealSolutionsProps.equation.trim().length > 0 &&
    twoRealSolutionsProps.equation.split("=").length > 1 &&
    twoRealSolutionsProps.equation.split("=").slice(1).join("=").trim().length > 0 &&
    envelope.contractVersion === "practice.v1" &&
    envelope.status === "submitted" &&
    Number.isInteger(envelope.attemptNumber) &&
    envelope.attemptNumber > 0 &&
    typeof envelope.submittedAt === "string" &&
    !Number.isNaN(Date.parse(envelope.submittedAt)) &&
    ((activity.stableActivityId === IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID &&
      envelope.mode === "guided_practice") ||
      (activity.stableActivityId === IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID &&
        envelope.mode === "independent_practice"));

  if (isTwoRealSolutionsCandidate) {
    const equation = twoRealSolutionsProps?.equation;
    const coefficients =
      isTwoRealSolutions && typeof equation === "string" && equation.trim().length > 0
        ? parseQuadratic(equation)
        : null;
    const discriminant = coefficients
      ? coefficients.b ** 2 - 4 * coefficients.a * coefficients.c
      : null;
    const axis =
      coefficients && coefficients.a !== 0 ? -coefficients.b / (2 * coefficients.a) : null;
    const roots =
      coefficients && discriminant !== null && discriminant > 0
        ? [
            (-coefficients.b - Math.sqrt(discriminant)) / (2 * coefficients.a),
            (-coefficients.b + Math.sqrt(discriminant)) / (2 * coefficients.a),
          ]
        : [];
    const serverSum = twoRealSolutionsProps?.sum;
    const serverProduct = twoRealSolutionsProps?.product;
    const rootsAreCanonical =
      roots.length === 2 &&
      roots.every((root) => Number.isFinite(root) && Number.isInteger(root)) &&
      roots[0] !== roots[1] &&
      axis !== null &&
      Number.isFinite(axis) &&
      Number.isInteger(axis);
    const serverValuesAreCanonical =
      coefficients !== null &&
      coefficients.a > 0 &&
      rootsAreCanonical &&
      typeof serverSum === "number" &&
      Number.isFinite(serverSum) &&
      typeof serverProduct === "number" &&
      Number.isFinite(serverProduct) &&
      serverSum === roots[0] + roots[1] &&
      serverProduct === roots[0] * roots[1];
    const partIds = activity.gradingConfig?.partIds;
    const rubric = activity.gradingConfig?.rubric;
    const rubricIsCanonical =
      Array.isArray(partIds) &&
      partIds.length === IM3_TWO_REAL_SOLUTIONS_PART_IDS.length &&
      partIds.every((partId, index) => partId === IM3_TWO_REAL_SOLUTIONS_PART_IDS[index]) &&
      Array.isArray(rubric) &&
      rubric.length === IM3_TWO_REAL_SOLUTIONS_PART_IDS.length &&
      rubric.every(
        (rule, index) =>
          rule.partId === IM3_TWO_REAL_SOLUTIONS_PART_IDS[index] &&
          rule.points === 1 &&
          Number.isFinite(rule.points),
      );
    const answers = asRecord(envelope.answers);
    const answerTablePoints = finitePointArray(answers?.table_values, 5);
    const answerPlacedPoints = finitePointArray(answers?.placed_points, 5);
    const answerSolutions = answers?.solutions;
    const answersHaveFiniteSolutions =
      Array.isArray(answerSolutions) &&
      answerSolutions.length === 2 &&
      answerSolutions.every((value) => typeof value === "number" && Number.isFinite(value));
    const answersAreCanonical =
      answers !== null &&
      Object.keys(answers).join("|") === IM3_TWO_REAL_SOLUTIONS_PART_IDS.join("|") &&
      answerTablePoints !== null &&
      answerPlacedPoints !== null &&
      answersHaveFiniteSolutions;
    const tablePart = envelope.parts[0];
    const placedPointsPart = envelope.parts[1];
    const solutionsPart = envelope.parts[2];
    const rawTablePoints = finitePointArray(tablePart?.rawAnswer, 5);
    const rawPlacedPoints = finitePointArray(placedPointsPart?.rawAnswer, 5);
    const rawSolutions = solutionsPart?.rawAnswer;
    const rawSolutionsAreFinite =
      Array.isArray(rawSolutions) &&
      rawSolutions.length === 2 &&
      rawSolutions.every((value) => typeof value === "number" && Number.isFinite(value));
    const partsAreCanonical =
      envelope.parts.length === IM3_TWO_REAL_SOLUTIONS_PART_IDS.length &&
      envelope.parts.every(
        (part, index) => part.partId === IM3_TWO_REAL_SOLUTIONS_PART_IDS[index],
      ) &&
      rawTablePoints !== null &&
      rawPlacedPoints !== null &&
      rawSolutionsAreFinite;

    if (
      !isTwoRealSolutions ||
      !rubricIsCanonical ||
      !answersAreCanonical ||
      !partsAreCanonical ||
      !serverValuesAreCanonical ||
      coefficients === null ||
      axis === null ||
      roots.length !== 2 ||
      rawTablePoints === null ||
      rawPlacedPoints === null ||
      !rawSolutionsAreFinite
    ) {
      const ungradedParts = envelope.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer,
        ...preserveStudentTelemetry(part),
      }));
      return {
        submissionData: {
          ...envelope,
          activityId: normalizedActivityId,
          status: "submitted",
          parts: ungradedParts,
        },
      };
    }

    const expectedTablePoints = [-2, -1, 0, 1, 2].map((offset) => {
      const x = axis + offset;
      return {
        x,
        y: coefficients.a * x ** 2 + coefficients.b * x + coefficients.c,
      };
    });
    const tableCorrect = rawTablePoints.every((point, index) => {
      const expected = expectedTablePoints[index];
      return expected !== undefined && point.x === expected.x && point.y === expected.y;
    });
    const placedPointsCorrect = matchesPilotPoints(rawPlacedPoints, expectedTablePoints, 0.25);
    const solutionCorrect =
      (rawSolutions[0] === roots[0] && rawSolutions[1] === roots[1]) ||
      (rawSolutions[0] === roots[1] && rawSolutions[1] === roots[0]);
    const gradedParts = [
      {
        partId: IM3_TWO_REAL_SOLUTIONS_PART_IDS[0],
        rawAnswer: tablePart?.rawAnswer ?? null,
        isCorrect: tableCorrect,
        score: tableCorrect ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(tablePart),
      },
      {
        partId: IM3_TWO_REAL_SOLUTIONS_PART_IDS[1],
        rawAnswer: placedPointsPart?.rawAnswer ?? null,
        isCorrect: placedPointsCorrect,
        score: placedPointsCorrect ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(placedPointsPart),
      },
      {
        partId: IM3_TWO_REAL_SOLUTIONS_PART_IDS[2],
        rawAnswer: solutionsPart?.rawAnswer ?? null,
        isCorrect: solutionCorrect,
        score: solutionCorrect ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(solutionsPart),
      },
    ];
    const score = gradedParts.reduce((total, part) => total + part.score, 0);

    return {
      submissionData: {
        ...envelope,
        activityId: normalizedActivityId,
        status: "graded",
        parts: gradedParts,
      },
      score,
      maxScore: 3,
      ...(activity.srsEligible === true
        ? { masteryContractVersion: "learning-evidence.v1" as const }
        : {}),
    };
  }

  const domainRangeProps = asRecord(activity.props);
  const isDomainRangeCandidate =
    activity.masteryNodeId === IM3_DOMAIN_RANGE_NODE_ID ||
    activity.stableActivityId === IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID ||
    activity.stableActivityId === IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID ||
    activity.stableActivityId === IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID ||
    activity.stableActivityId === IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID;
  const isDomainRange =
    isDomainRangeCandidate &&
    activity.masteryNodeId === IM3_DOMAIN_RANGE_NODE_ID &&
    activity.componentKey === "graphing-explorer" &&
    ((activity.stableActivityId === IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID &&
      envelope.mode === "guided_practice") ||
      (activity.stableActivityId === IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID &&
        activity.srsEligible === true &&
        envelope.mode === "guided_practice" &&
        envelope.status === "submitted") ||
      (activity.stableActivityId === IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID &&
        envelope.mode === "independent_practice") ||
      (activity.stableActivityId === IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID &&
        activity.srsEligible === true &&
        envelope.mode === "independent_practice" &&
        envelope.status === "submitted"));

  if (isDomainRangeCandidate) {
    const equation = domainRangeProps?.equation;
    const coefficients =
      isDomainRange &&
      domainRangeProps?.variant === "plot_from_equation" &&
      domainRangeProps?.responseVariant === "domain_range" &&
      typeof equation === "string" &&
      equation.trim().length > 0
        ? parseQuadratic(equation)
        : null;
    const partIds = activity.gradingConfig?.partIds;
    const rubric = activity.gradingConfig?.rubric;
    const rubricIsCanonical =
      Array.isArray(partIds) &&
      partIds.length === 2 &&
      partIds[0] === "domain" &&
      partIds[1] === "range" &&
      Array.isArray(rubric) &&
      rubric.length === 2 &&
      rubric[0]?.partId === "domain" &&
      rubric[0]?.points === 1 &&
      Number.isFinite(rubric[0]?.points) &&
      rubric[1]?.partId === "range" &&
      rubric[1]?.points === 1 &&
      Number.isFinite(rubric[1]?.points);
    const rangePart = envelope.parts.find((part) => part.partId === "range");
    const rangeAnswer = asRecord(rangePart?.rawAnswer);
    const rangeBoundary = typeof rangeAnswer?.boundary === "number" ? rangeAnswer.boundary : null;
    const rangeShapeIsCanonical =
      rangeAnswer !== null &&
      Object.keys(rangeAnswer).sort().join("|") === "boundary|relation" &&
      (rangeAnswer.relation === "gte" || rangeAnswer.relation === "lte") &&
      rangeBoundary !== null &&
      Number.isFinite(rangeBoundary);

    if (
      !isDomainRange ||
      !coefficients ||
      !Number.isFinite(coefficients.a) ||
      !Number.isFinite(coefficients.b) ||
      !Number.isFinite(coefficients.c) ||
      coefficients.a === 0 ||
      !rubricIsCanonical ||
      !rangeShapeIsCanonical
    ) {
      const ungradedParts = envelope.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer,
        ...preserveStudentTelemetry(part),
      }));
      return {
        submissionData: {
          ...envelope,
          activityId: normalizedActivityId,
          status: "submitted",
          parts: ungradedParts,
        },
      };
    }

    const vertexBoundary = coefficients.c - coefficients.b ** 2 / (4 * coefficients.a);
    const expectedRelation = coefficients.a > 0 ? "gte" : "lte";
    const domainPart = envelope.parts.find((part) => part.partId === "domain");
    const domainCorrect = domainPart?.rawAnswer === "all_real_numbers";
    const rangeCorrect =
      rangeAnswer.relation === expectedRelation &&
      rangeBoundary !== null &&
      Math.abs(rangeBoundary - vertexBoundary) <= 0.001;
    const gradedParts = [
      {
        partId: "domain",
        rawAnswer: domainPart?.rawAnswer ?? null,
        isCorrect: domainCorrect,
        score: domainCorrect ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(domainPart),
      },
      {
        partId: "range",
        rawAnswer: rangePart?.rawAnswer ?? null,
        isCorrect: rangeCorrect,
        score: rangeCorrect ? 1 : 0,
        maxScore: 1,
        ...preserveStudentTelemetry(rangePart),
      },
    ];

    return {
      submissionData: {
        ...envelope,
        activityId: normalizedActivityId,
        status: "graded",
        parts: gradedParts,
      },
      score: (domainCorrect ? 1 : 0) + (rangeCorrect ? 1 : 0),
      maxScore: 2,
      ...(activity.srsEligible === true
        ? { masteryContractVersion: "learning-evidence.v1" as const }
        : {}),
    };
  }

  if (rules.length === 0 || expected === null) {
    const ungradedParts = envelope.parts.map((part) => ({
      partId: part.partId,
      rawAnswer: part.rawAnswer,
      ...preserveStudentTelemetry(part),
    }));
    return {
      submissionData: {
        ...envelope,
        activityId: normalizedActivityId,
        status: "submitted",
        parts: ungradedParts,
      },
    };
  }

  let score = 0;
  let maxScore = 0;
  const gradedParts = rules.map((rule) => {
    const rawAnswer = answerForPart(envelope, rule.partId);
    const correct = isCorrectAnswer(rule, rawAnswer, expected[rule.partId]);
    maxScore += rule.maxScore;
    if (correct) score += rule.maxScore;
    const sourcePart = envelope.parts.find((part) => part.partId === rule.partId);
    return {
      partId: rule.partId,
      rawAnswer,
      isCorrect: correct,
      score: correct ? rule.maxScore : 0,
      maxScore: rule.maxScore,
      ...preserveStudentTelemetry(sourcePart),
    };
  });

  return {
    submissionData: {
      ...envelope,
      activityId: normalizedActivityId,
      mode: isPilot ? "independent_practice" : envelope.mode,
      status: "graded",
      parts: gradedParts,
    },
    score,
    maxScore,
    ...(isPilot ||
    (isProfitModel && activity.srsEligible === true) ||
    isProfitMaximumGuided ||
    isProfitMaximumIndependent
      ? { masteryContractVersion: "learning-evidence.v1" as const }
      : {}),
  };
}
