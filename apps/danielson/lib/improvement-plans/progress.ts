import type { PriorityProjection } from '../proficiency/processor';

const DAY_MS = 86_400_000;

type PipEvidence = {
  skillId: string;
  kind: 'rated' | 'not_enough_evidence';
  rating?: 1 | 2 | 3 | 4;
  occurredAt: number;
  sourceRecordId?: string | null;
  evidenceIdempotencyKey?: string | null;
};

type PipTarget = {
  componentId: string;
  skillId: string;
  expectedRating: 3 | 4;
};

function compareEvidence(left: PipEvidence, right: PipEvidence) {
  const time = left.occurredAt - right.occurredAt;
  if (time !== 0) return time;
  const source = (left.sourceRecordId ?? '').localeCompare(right.sourceRecordId ?? '');
  if (source !== 0) return source;
  return (left.evidenceIdempotencyKey ?? '').localeCompare(right.evidenceIdempotencyKey ?? '');
}

/** Apply the active-plan cadence without changing the shared SRS projection. */
export function applyPipPriorityOverlay(input: {
  priority: PriorityProjection;
  approvedAt: number;
  planEndAt: number;
  latestRatedEvidenceAt: number | null;
  now: number;
}) {
  const baseTime = input.latestRatedEvidenceAt ?? input.approvedAt;
  const dueTimestamp = Math.min(baseTime + 7 * DAY_MS, input.planEndAt);
  const due = input.now >= dueTimestamp;
  return {
    ...structuredClone(input.priority),
    due,
    dueAt: new Date(dueTimestamp).toISOString(),
    overdueDays: input.now > dueTimestamp
      ? Math.floor((input.now - dueTimestamp) / DAY_MS)
      : 0,
    approvedPriorityInputs: [
      ...new Set([...input.priority.approvedPriorityInputs, 'approved_plan_priority']),
    ],
  };
}

/** Project active or closed PIP progress from effective rated evidence only. */
export function projectImprovementPlanProgress(input: {
  planId: string;
  version: number;
  approvedAt: number;
  planEndAt: number;
  reviewMeetingAt: number;
  now: number;
  targets: PipTarget[];
  evidence: PipEvidence[];
  closure?: {
    outcome: 'successful' | 'insufficient_improvement';
    closedAt: number;
  };
  comments?: unknown;
  responses?: unknown;
  evidenceNotes?: unknown;
}) {
  const targets = input.targets.map((target) => {
    const rated = input.evidence
      .filter((event) =>
        event.skillId === target.skillId
        && event.kind === 'rated'
        && event.occurredAt >= input.approvedAt
        && event.occurredAt <= input.planEndAt
        && event.rating !== undefined,
      )
      .sort((left, right) => compareEvidence(right, left))[0];
    const currentRating = rated?.rating ?? null;
    const cadenceDueAt = Math.min((rated?.occurredAt ?? input.approvedAt) + 7 * DAY_MS, input.planEndAt);
    return {
      componentId: target.componentId,
      skillId: target.skillId,
      expectedRating: target.expectedRating,
      currentRating,
      state: currentRating === null
        ? 'no_plan_evidence' as const
        : currentRating >= target.expectedRating
          ? 'meets_expected' as const
          : 'below_expected' as const,
      evidenceDueAt: cadenceDueAt,
      evidenceDue: input.now >= cadenceDueAt,
      evidenceOverdue: input.now > cadenceDueAt,
      sourceRecordId: rated?.sourceRecordId ?? null,
      evidenceIdempotencyKey: rated?.evidenceIdempotencyKey ?? null,
    };
  });
  const base = {
    contractVersion: 'danielson.ip-progress.v1' as const,
    planId: input.planId,
    version: input.version,
    daysRemaining: Math.max(0, Math.ceil((input.planEndAt - input.now) / DAY_MS)),
    targets,
  };
  if (input.closure) {
    return {
      ...base,
      state: 'closed' as const,
      outcome: input.closure.outcome,
      closedAt: input.closure.closedAt,
    };
  }
  const overdue = targets.some((target) => target.evidenceOverdue);
  const belowAtReview = input.now >= input.reviewMeetingAt
    && targets.some((target) => target.state !== 'meets_expected');
  return {
    ...base,
    state: 'active' as const,
    trackState: overdue || belowAtReview ? 'off_track' as const : 'on_track' as const,
  };
}
