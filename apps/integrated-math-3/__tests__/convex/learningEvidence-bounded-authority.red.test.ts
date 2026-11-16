import { describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core';

import type { MutationCtx } from '@/convex/_generated/server';
import {
  createIm3ConvexLearningEvidenceHandler,
  createIm3ServerOwnedSubmissionHandler,
} from '@/convex/learningEvidence';
import {
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from '@/lib/practice/learning-evidence-pilot';

const LEARNER_ID = 'profiles:im3-indexed-authority';
const OTHER_LEARNER_ID = 'profiles:im3-indexed-authority-other';
const ACTIVITY_DOCUMENT_ID = 'activities:im3-indexed-authority';
const SUBMISSION_ID = 'activity_submissions:im3-indexed-authority';
const CANDIDATE_OCCURRED_AT = '2026-08-19T10:00:00.000Z';
const MASTERY_ACTIVITY_ID = IM3_MASTERY_ADVANTAGE_ACTIVITY_ID;

type Row = Record<string, unknown> & { _id: string };
type Predicate = {
  kind: 'eq' | 'lte';
  field: string;
  value: unknown;
};
type IndexRead = {
  tableName: string;
  indexName: string;
  predicates: Predicate[];
  operations: string[];
  firstId: string | null;
};
type Range = {
  eq(field: string, value: unknown): Range;
  lte(field: string, value: unknown): Range;
};

function evidenceRow(
  id: string,
  overrides: Partial<LearningEvidenceV1> & { learnerId?: string } = {},
): Row {
  const occurredAt = overrides.occurredAt ?? CANDIDATE_OCCURRED_AT;
  return {
    _id: id,
    learnerId: overrides.learnerId ?? LEARNER_ID,
    contractVersion: 'learning-evidence.v1',
    nodeId: overrides.nodeId ?? IM3_PILOT_NODE,
    activityId: overrides.activityId ?? IM3_TEACHER_LED_ACTIVITY_ID,
    attemptOrdinal: overrides.attemptOrdinal ?? 1,
    origin: overrides.origin ?? 'teacher_led',
    mode: overrides.mode ?? 'worked_example',
    occurredAt: Date.parse(occurredAt),
    ...(overrides.gradedEvidence === undefined ? {} : { gradedEvidence: overrides.gradedEvidence }),
    idempotencyKey: overrides.idempotencyKey ?? id,
    createdAt: Date.parse(occurredAt),
  };
}

function masteryEvidenceRows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => {
    const attemptOrdinal = index + 1;
    return evidenceRow(`learning_evidence:matching-mastery-${attemptOrdinal}`, {
      activityId: MASTERY_ACTIVITY_ID,
      attemptOrdinal,
      origin: 'mastery_advantage',
      mode: 'independent_practice',
      occurredAt: `2026-08-19T09:${String(index % 60).padStart(2, '0')}:00.000Z`,
      gradedEvidence: { isCorrect: false, score: 0, maxScore: 6 },
    });
  });
}

function masteryCandidate(overrides: Partial<LearningEvidenceV1> = {}): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: IM3_PILOT_NODE,
    activityId: MASTERY_ACTIVITY_ID,
    attemptOrdinal: 1002,
    origin: 'mastery_advantage',
    mode: 'independent_practice',
    occurredAt: CANDIDATE_OCCURRED_AT,
    gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
    idempotencyKey: 'im3-indexed-authority-candidate',
    ...overrides,
  };
}

function storedMasterySubmission(attemptOrdinal: number): Row {
  return {
    _id: SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: ACTIVITY_DOCUMENT_ID,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: MASTERY_ACTIVITY_ID,
      mode: 'independent_practice',
      status: 'graded',
      attemptNumber: attemptOrdinal,
      submittedAt: CANDIDATE_OCCURRED_AT,
      answers: {},
      parts: [],
    },
    score: 6,
    maxScore: 6,
    submittedAt: Date.parse(CANDIDATE_OCCURRED_AT),
    gradedAt: Date.parse(CANDIDATE_OCCURRED_AT),
  };
}

function createContext({
  evidence = [],
  submission,
}: {
  evidence?: readonly Row[];
  submission?: Row;
} = {}) {
  const rows: Record<string, Row[]> = {
    learning_evidence: [...evidence],
    learning_evidence_receipts: [],
    activity_submissions: submission ? [submission] : [],
    activities: [{
      _id: ACTIVITY_DOCUMENT_ID,
      stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      componentKey: 'graphing-explorer',
      srsEligible: true,
      learningEvidenceMode: 'independent_practice',
    }],
  };
  const reads: IndexRead[] = [];
  const writes: Array<{ tableName: string; document: Record<string, unknown> }> = [];

  const query = (tableName: string) => ({
    withIndex: (
      indexName: string,
      configure: (range: Range) => unknown,
    ) => {
      const read: IndexRead = {
        tableName,
        indexName,
        predicates: [],
        operations: [],
        firstId: null,
      };
      const range: Range = {
        eq(field, value) {
          read.predicates.push({ kind: 'eq', field, value });
          return range;
        },
        lte(field, value) {
          read.predicates.push({ kind: 'lte', field, value });
          return range;
        },
      };
      configure(range);
      reads.push(read);

      let direction: 'asc' | 'desc' = 'asc';
      const selected = () => (rows[tableName] ?? []).filter((row) => (
        read.predicates.every((predicate) => {
          const value = row[predicate.field];
          return predicate.kind === 'eq'
            ? value === predicate.value
            : typeof value === 'number'
              && typeof predicate.value === 'number'
              && value <= predicate.value;
        })
      ));
      const sorted = () => [...selected()].sort((left, right) => {
        const field = indexName.includes('occurred_at')
          ? 'occurredAt'
          : indexName.includes('attempt')
            ? 'attemptOrdinal'
            : '_id';
        return String(left[field]).localeCompare(String(right[field]), undefined, { numeric: true });
      });
      const result = {
        unique: async () => {
          read.operations.push('unique');
          return selected()[0] ?? null;
        },
        order(nextDirection: 'asc' | 'desc') {
          read.operations.push(`order:${nextDirection}`);
          direction = nextDirection;
          return result;
        },
        first: async () => {
          read.operations.push('first');
          const values = sorted();
          const row = direction === 'desc' ? values.at(-1) ?? null : values[0] ?? null;
          read.firstId = row?._id ?? null;
          return row;
        },
        collect: async () => {
          read.operations.push('collect');
          if (tableName === 'learning_evidence') {
            throw new Error('Authority reads must not call collect().');
          }
          return selected();
        },
        take: async (_limit: number) => {
          read.operations.push('take');
          if (tableName === 'learning_evidence') {
            throw new Error('Authority reads must not call take().');
          }
          return selected();
        },
      };
      return result;
    },
  });
  const get = async (...args: unknown[]) => {
    const id = String(args.at(-1));
    return Object.values(rows).flat().find((row) => row._id === id) ?? null;
  };
  const insert = async (tableName: string, document: Record<string, unknown>) => {
    const id = `${tableName}:${(rows[tableName] ?? []).length + 1}`;
    (rows[tableName] ??= []).push({ _id: id, ...document });
    writes.push({ tableName, document });
    return id;
  };

  return {
    ctx: { db: { query, get, insert } } as unknown as MutationCtx,
    reads,
    writes,
  };
}

function authorityRead(
  reads: readonly IndexRead[],
  indexName: string,
): IndexRead {
  const read = reads.find((candidate) => (
    candidate.tableName === 'learning_evidence' && candidate.indexName === indexName
  ));
  expect(read, `missing ${indexName} authority read`).toBeDefined();
  return read!;
}

function expectBoundedAuthorityReads(
  reads: readonly IndexRead[],
  candidate: LearningEvidenceV1,
  expectedTeacherId: string | null,
  expectedAttemptId: string | null,
) {
  const exposure = authorityRead(reads, 'by_learner_node_origin_occurred_at');
  expect(exposure).toMatchObject({
    predicates: [
      { kind: 'eq', field: 'learnerId', value: LEARNER_ID },
      { kind: 'eq', field: 'nodeId', value: IM3_PILOT_NODE },
      { kind: 'eq', field: 'origin', value: 'teacher_led' },
      { kind: 'lte', field: 'occurredAt', value: Date.parse(candidate.occurredAt) },
    ],
    operations: ['order:desc', 'first'],
    firstId: expectedTeacherId,
  });
  const attempt = authorityRead(reads, 'by_learner_node_activity_origin_attempt');
  expect(attempt).toMatchObject({
    predicates: [
      { kind: 'eq', field: 'learnerId', value: LEARNER_ID },
      { kind: 'eq', field: 'nodeId', value: IM3_PILOT_NODE },
      { kind: 'eq', field: 'activityId', value: candidate.activityId },
      { kind: 'eq', field: 'origin', value: candidate.origin },
    ],
    operations: ['order:desc', 'first'],
    firstId: expectedAttemptId,
  });
  expect(reads.flatMap((read) => read.operations)).not.toContain('collect');
  expect(reads.flatMap((read) => read.operations)).not.toContain('take');
}

describe('IM3 bounded indexed learning-evidence authority', () => {
  it('does not let a future teacher exposure authorize a past mastery candidate in the Convex-bound store', async () => {
    const candidate = masteryCandidate();
    const { ctx, reads, writes } = createContext({
      evidence: [
        evidenceRow('learning_evidence:future-teacher', {
          occurredAt: '2026-08-19T10:01:00.000Z',
        }),
        evidenceRow('learning_evidence:wrong-learner-prior', {
          learnerId: OTHER_LEARNER_ID,
          occurredAt: '2026-08-19T09:59:00.000Z',
        }),
        evidenceRow('learning_evidence:wrong-node-prior', {
          nodeId: 'math.im3.skill.1.2.non-pilot',
          occurredAt: '2026-08-19T09:59:00.000Z',
        }),
      ],
    });
    const masteryBridge = vi.fn(async () => undefined);
    const handler = createIm3ConvexLearningEvidenceHandler({ ctx, masteryBridge });

    const result = await handler.process({ learnerId: LEARNER_ID, evidence: candidate });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: { reason: 'awaiting_teacher_exposure', masteryBearing: false },
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(writes).toEqual([]);
    expectBoundedAuthorityReads(reads, candidate, null, null);
  });

  it('uses the nearest prior teacher exposure and excludes foreign and wrong-node rows in the Convex-bound store', async () => {
    const candidate = masteryCandidate({ idempotencyKey: 'im3-indexed-authority-nearest' });
    const { ctx, reads } = createContext({
      evidence: [
        evidenceRow('learning_evidence:teacher-old', {
          occurredAt: '2026-08-19T08:00:00.000Z',
        }),
        evidenceRow('learning_evidence:teacher-nearest', {
          occurredAt: '2026-08-19T09:59:00.000Z',
        }),
        evidenceRow('learning_evidence:teacher-future', {
          occurredAt: '2026-08-19T10:01:00.000Z',
        }),
        evidenceRow('learning_evidence:teacher-other-learner', {
          learnerId: OTHER_LEARNER_ID,
          occurredAt: '2026-08-19T09:59:30.000Z',
        }),
        evidenceRow('learning_evidence:teacher-other-node', {
          nodeId: 'math.im3.skill.1.2.non-pilot',
          occurredAt: '2026-08-19T09:59:30.000Z',
        }),
      ],
    });
    const masteryBridge = vi.fn(async () => undefined);
    const handler = createIm3ConvexLearningEvidenceHandler({ ctx, masteryBridge });

    const result = await handler.process({ learnerId: LEARNER_ID, evidence: candidate });

    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: { reason: 'eligible', masteryBearing: true },
    });
    expect(masteryBridge).toHaveBeenCalledOnce();
    expectBoundedAuthorityReads(reads, candidate, 'learning_evidence:teacher-nearest', null);
  });

  it('uses the separate opaque-submission store, keeps ordinal authority in the exact scope, and rejects a duplicate ordinal after 1,001 rows', async () => {
    const candidate = masteryCandidate({ attemptOrdinal: 1001 });
    const matchingAttempts = masteryEvidenceRows(1001);
    const { ctx, reads, writes } = createContext({
      evidence: [
        evidenceRow('learning_evidence:teacher-nearest', {
          occurredAt: '2026-08-19T09:59:00.000Z',
        }),
        evidenceRow('learning_evidence:teacher-future', {
          occurredAt: '2026-08-19T10:01:00.000Z',
        }),
        ...matchingAttempts,
        evidenceRow('learning_evidence:other-learner-high-ordinal', {
          learnerId: OTHER_LEARNER_ID,
          activityId: MASTERY_ACTIVITY_ID,
          origin: 'mastery_advantage',
          mode: 'independent_practice',
          attemptOrdinal: 5000,
          gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
        }),
        evidenceRow('learning_evidence:other-node-high-ordinal', {
          nodeId: 'math.im3.skill.1.2.non-pilot',
          activityId: MASTERY_ACTIVITY_ID,
          origin: 'mastery_advantage',
          mode: 'independent_practice',
          attemptOrdinal: 5000,
          gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
        }),
        evidenceRow('learning_evidence:other-activity-high-ordinal', {
          activityId: `${IM3_PILOT_NODE}.another-activity`,
          origin: 'mastery_advantage',
          mode: 'independent_practice',
          attemptOrdinal: 5000,
          gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
        }),
      ],
      submission: storedMasterySubmission(candidate.attemptOrdinal),
    });
    const masteryBridge = vi.fn(async () => undefined);
    const handler = createIm3ServerOwnedSubmissionHandler({
      ctx,
      learnerId: LEARNER_ID,
      masteryBridge,
    });

    const result = await handler.process({ submissionId: SUBMISSION_ID });

    expect(result).toEqual({
      accepted: false,
      reason: 'attempt_ordinal_conflict',
      latestAttemptOrdinal: 1001,
      receivedAttemptOrdinal: 1001,
    });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(writes).toEqual([]);
    expectBoundedAuthorityReads(
      reads,
      candidate,
      'learning_evidence:teacher-nearest',
      'learning_evidence:matching-mastery-1001',
    );
  });
});
