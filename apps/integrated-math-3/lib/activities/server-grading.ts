import { parseQuadratic } from '@math-platform/graphing-core';
import { generateQuadraticFormula } from '@math-platform/math-content';
import { quadraticFormulaActivitySchema } from '@math-platform/math-content/schemas';
import {
  toConvexActivityId,
  type PracticeSubmissionEnvelope,
} from '@math-platform/practice-core/contract';
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
} from '../practice/learning-evidence-pilot';
import { gradeQuadraticFormulaResponse } from './quadratic-formula-grader';

export const IM3_QF_NODE = 'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations';
export const IM3_QF_DRAFT_MAPPINGS = {
  guided_practice: {
    stableActivityId: `${IM3_QF_NODE}.guided_practice`, seed: 1, presentationMode: 'guided',
  },
  independent_practice: {
    stableActivityId: `${IM3_QF_NODE}.independent_practice`, seed: 2, presentationMode: 'independent',
  },
} as const;

export const IM3_QF_VARIANT_SCHEDULES = {
  guided_practice: [1, 7, 12, 4],
  independent_practice: [2, 8, 14, 30],
} as const;

export function quadraticFormulaVariantKey(
  mode: keyof typeof IM3_QF_DRAFT_MAPPINGS,
  index: number,
): string {
  const mapping = IM3_QF_DRAFT_MAPPINGS[mode];
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= IM3_QF_VARIANT_SCHEDULES[mode].length
  ) {
    throw new Error("Quadratic-formula schedule is exhausted");
  }
  return index === 0
    ? mapping.stableActivityId
    : `${mapping.stableActivityId}.variant.${index}`;
}

export function quadraticFormulaPublicProps(
  mode: keyof typeof IM3_QF_DRAFT_MAPPINGS,
  seed: number,
) {
  const generated = generateQuadraticFormula({ seed });
  return quadraticFormulaActivitySchema.parse({
    prompt: "Use the Quadratic Formula to solve the equation.",
    equation: generated.quadratic,
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

export interface ServerOwnedActivity {
  readonly id: string;
  readonly stableActivityId?: string;
  readonly masteryNodeId?: string;
  readonly componentKey: string;
  readonly srsEligible?: boolean;
  readonly props: Record<string, unknown>;
  readonly gradingConfig?: {
    readonly partIds?: readonly string[];
    readonly rubric?: readonly { readonly partId?: string; readonly points: number }[];
  };
  readonly privateGenerator?: { readonly generatorKey: 'quadratic-formula'; readonly seed: number };
}

export interface ServerGradedSubmission {
  readonly submissionData: PracticeSubmissionEnvelope;
  readonly score?: number;
  readonly maxScore?: number;
  readonly masteryContractVersion?: 'learning-evidence.v1';
}

type SubmissionPart = PracticeSubmissionEnvelope['parts'][number];
type Point = { x: number; y: number };

const IM3_PILOT_PART_IDS = ['table_values', 'placed_points'] as const;
const IM3_PILOT_X_VALUES = [-2, -1, 0, 1, 2] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function preserveStudentTelemetry(
  part: SubmissionPart | undefined,
): Pick<SubmissionPart, 'hintsUsed' | 'revealStepsSeen' | 'changedCount' | 'firstInteractionAt' | 'answeredAt' | 'wallClockMs' | 'activeMs'> {
  if (!part) return {};
  return {
    ...(part.hintsUsed === undefined ? {} : { hintsUsed: part.hintsUsed }),
    ...(part.revealStepsSeen === undefined ? {} : { revealStepsSeen: part.revealStepsSeen }),
    ...(part.changedCount === undefined ? {} : { changedCount: part.changedCount }),
    ...(part.firstInteractionAt === undefined ? {} : { firstInteractionAt: part.firstInteractionAt }),
    ...(part.answeredAt === undefined ? {} : { answeredAt: part.answeredAt }),
    ...(part.wallClockMs === undefined ? {} : { wallClockMs: part.wallClockMs }),
    ...(part.activeMs === undefined ? {} : { activeMs: part.activeMs }),
  };
}

function expectedPilotPoints(activity: ServerOwnedActivity): Point[] {
  const equation = activity.props.equation;
  const coefficients = typeof equation === 'string' ? parseQuadratic(equation) : null;
  if (
    activity.props.variant !== 'plot_from_equation'
    || activity.props.responseVariant !== 'table_graph'
    || !coefficients
    || !Number.isFinite(coefficients.a)
    || !Number.isFinite(coefficients.b)
    || !Number.isFinite(coefficients.c)
    || coefficients.a === 0
  ) {
    throw new Error('IM3 pilot activity is missing canonical server grading data');
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
    !partIds
    || partIds.length !== IM3_PILOT_PART_IDS.length
    || partIds.some((partId, index) => partId !== IM3_PILOT_PART_IDS[index])
    || !rubric
    || rubric.length !== IM3_PILOT_PART_IDS.length
    || rubric.some((rule, index) => (
      rule.partId !== IM3_PILOT_PART_IDS[index]
      || rule.points !== 1
      || !Number.isFinite(rule.points)
    ))
  ) {
    throw new Error('IM3 pilot activity is missing canonical server grading data');
  }
}

function finitePointArray(value: unknown, expectedLength: number = IM3_PILOT_X_VALUES.length): Point[] | null {
  if (!Array.isArray(value) || value.length !== expectedLength) return null;
  const points: Point[] = [];
  for (const candidate of value) {
    const point = asRecord(candidate);
    if (
      !point
      || Object.keys(point).sort().join('|') !== 'x|y'
      || typeof point.x !== 'number'
      || typeof point.y !== 'number'
      || !Number.isFinite(point.x)
      || !Number.isFinite(point.y)
    ) return null;
    points.push({ x: point.x, y: point.y });
  }
  return points;
}

function matchesPilotPoints(actual: unknown, expected: readonly Point[], tolerance: number): boolean {
  const points = finitePointArray(actual, expected.length);
  if (!points) return false;
  const remaining = [...expected];
  for (const point of points) {
    const matchIndex = remaining.findIndex((candidate) => (
      Math.abs(point.x - candidate.x) <= tolerance
      && Math.abs(point.y - candidate.y) <= tolerance
    ));
    if (matchIndex < 0) return false;
    remaining.splice(matchIndex, 1);
  }
  return remaining.length === 0;
}

function regenerateQuadraticFormula(activity: ServerOwnedActivity) {
  if (activity.masteryNodeId !== IM3_QF_NODE || activity.componentKey !== 'quadratic-formula') {
    throw new Error('Invalid quadratic-formula activity');
  }
  const identity = activity.privateGenerator;
  if (!identity || identity.generatorKey !== 'quadratic-formula'
    || !Number.isSafeInteger(identity.seed) || identity.seed < 0) {
    throw new Error('Invalid private quadratic-formula generator identity');
  }
  const props = quadraticFormulaActivitySchema.parse(activity.props);
  const problem = generateQuadraticFormula({ seed: identity.seed });
  if (props.equation !== problem.quadratic) throw new Error('Quadratic-formula equation does not match its private seed');
  return problem;
}

export function checkServerOwnedQuadraticDiscriminant(activity: ServerOwnedActivity, rawAnswer: string): boolean {
  if (activity.stableActivityId !== IM3_QF_DRAFT_MAPPINGS.guided_practice.stableActivityId
    || activity.props.presentationMode !== 'guided' || rawAnswer.length > 160) {
    throw new Error('Invalid Guided discriminant check');
  }
  const problem = regenerateQuadraticFormula(activity);
  return gradeQuadraticFormulaResponse(problem, { discriminant: rawAnswer, x1: '', x2: '' }).parts[0].isCorrect;
}

/** Grade the selected IM3 quadratic graph submission from server-owned data. */
export function gradeServerOwnedSubmission(
  activity: ServerOwnedActivity,
  envelope: PracticeSubmissionEnvelope,
): ServerGradedSubmission {
  if (activity.masteryNodeId === IM3_QF_NODE && activity.componentKey === 'quadratic-formula') {
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
        status: 'graded',
        parts: grade.parts.map((part) => ({ ...part, ...preserveStudentTelemetry(partsById.get(part.partId)) })),
      },
      score: grade.score,
      maxScore: grade.maxScore,
    };
  }
  const isPilot = activity.masteryNodeId === IM3_PILOT_NODE
    && activity.componentKey === 'graphing-explorer'
    && (
      (activity.stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID
        && envelope.mode === 'independent_practice')
      || (activity.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
        && envelope.mode === 'guided_practice')
    );
  if (!isPilot) {
    return {
      submissionData: {
        ...envelope,
        activityId: toConvexActivityId(activity.id),
        status: 'submitted',
        parts: envelope.parts.map((part) => ({
          partId: part.partId,
          rawAnswer: part.rawAnswer,
          ...preserveStudentTelemetry(part),
        })),
      },
    };
  }

  validatePilotRubric(activity);
  const expectedPoints = expectedPilotPoints(activity);
  const tablePart = envelope.parts.find((part) => part.partId === IM3_PILOT_PART_IDS[0]);
  const placedPointsPart = envelope.parts.find((part) => part.partId === IM3_PILOT_PART_IDS[1]);
  const tableCorrect = matchesPilotPoints(tablePart?.rawAnswer, expectedPoints, 0);
  const placedPointsCorrect = matchesPilotPoints(placedPointsPart?.rawAnswer, expectedPoints, 0.25);
  const gradedParts = [
    { partId: 'table_values', rawAnswer: tablePart?.rawAnswer ?? null, isCorrect: tableCorrect, score: tableCorrect ? 1 : 0, maxScore: 1, ...preserveStudentTelemetry(tablePart) },
    { partId: 'placed_points', rawAnswer: placedPointsPart?.rawAnswer ?? null, isCorrect: placedPointsCorrect, score: placedPointsCorrect ? 1 : 0, maxScore: 1, ...preserveStudentTelemetry(placedPointsPart) },
  ];
  const score = (tableCorrect ? 1 : 0) + (placedPointsCorrect ? 1 : 0);
  return {
    submissionData: { ...envelope, activityId: toConvexActivityId(activity.id), status: 'graded', parts: gradedParts },
    score,
    maxScore: 2,
    ...(activity.srsEligible === true ? { masteryContractVersion: 'learning-evidence.v1' as const } : {}),
  };
}
