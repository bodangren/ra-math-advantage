import { parseQuadratic } from '@math-platform/graphing-core';
import {
  toConvexActivityId,
  type PracticeSubmissionEnvelope,
} from '@math-platform/practice-core/contract';
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
} from '../practice/learning-evidence-pilot';

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

/** Grade the selected IM3 quadratic graph submission from server-owned data. */
export function gradeServerOwnedSubmission(
  activity: ServerOwnedActivity,
  envelope: PracticeSubmissionEnvelope,
): ServerGradedSubmission {
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
