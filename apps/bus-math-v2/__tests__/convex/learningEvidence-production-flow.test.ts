import { beforeEach, describe, expect, it, vi } from 'vitest';

const routeMocks = vi.hoisted(() => ({
  requireActiveStudentRequestClaims: vi.fn(),
  fetchInternalMutation: vi.fn(),
}));

vi.mock('@/lib/auth/server', () => ({
  requireActiveStudentRequestClaims: routeMocks.requireActiveStudentRequestClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: routeMocks.fetchInternalMutation,
  internal: {
    learningEvidence: {
      submit: 'internal.learningEvidence.submit',
    },
  },
}));

vi.mock('@/lib/learning-evidence/bm2-pilot', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/learning-evidence/bm2-pilot')>(),
  isBm2PilotPublished: () => true,
  isBm2PilotSourcePublished: () => true,
}));

import type { MutationCtx } from '@/convex/_generated/server';
import { createServerOwnedSubmission } from '@/convex/activities';
import { accountingEquationFamily } from '@/lib/practice/engine/families/accounting-equation';
import { submit as submitLearningEvidence } from '@/convex/learningEvidence';
import { POST } from '@/app/api/learning-evidence/bm2-pilot/route';
import {
  BM2_LEARNING_EVIDENCE_PILOT,
  BM2_PILOT_NODE,
} from '@/lib/learning-evidence/bm2-pilot';

const LEARNER_ID = 'profiles:bm2-production-flow-learner';
const OTHER_LEARNER_ID = 'profiles:bm2-production-flow-other-learner';
const ACTIVITY_ID = 'activities:bm2-production-flow-pilot';
const PILOT_MAPPING = BM2_LEARNING_EVIDENCE_PILOT.mappings[0]!;

type Row = Record<string, unknown> & { _id: string };
type InternalHandler<Args, Result> = (ctx: MutationCtx, args: Args) => Promise<Result>;
type IndexedQueryResult = {
  unique: () => Promise<Row | null>;
  first: () => Promise<Row | null>;
  collect: () => Promise<Row[]>;
  take: (limit: number) => Promise<Row[]>;
  order: (direction: 'asc' | 'desc') => IndexedQueryResult;
};

const producerHandler = (createServerOwnedSubmission as unknown as {
  _handler: InternalHandler<{
    userId: string;
    activityId: string;
    submissionData: Record<string, unknown>;
    idempotencyKey: string;
  }, {
    submissionId: string;
    score: number;
    maxScore: number;
    feedback: string;
    attemptOrdinal: number;
  }>;
})._handler;
const submitHandler = (submitLearningEvidence as unknown as {
  _handler: InternalHandler<{ learnerId: string; submissionId: string }, Record<string, unknown>>;
})._handler;

function createConvexHarness() {
  const rows: Record<string, Row[]> = {
    activities: [{
      _id: ACTIVITY_ID,
      stableActivityId: PILOT_MAPPING.source.activityId,
      componentKey: 'notebook-organizer',
      displayName: 'Unit 1 Lesson 1 daily source',
      props: {},
      gradingConfig: {},
      createdAt: 1,
      updatedAt: 1,
    }],
    activity_submissions: [],
    learning_evidence: [{
      _id: 'learning_evidence:bm2-production-flow-teacher-exposure',
      studentId: LEARNER_ID,
      contractVersion: 'learning-evidence.v1',
      nodeId: BM2_PILOT_NODE,
      activityId: PILOT_MAPPING.source.activityId,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: PILOT_MAPPING.source.mode,
      occurredAt: Date.parse('2026-08-19T09:00:00.000Z'),
      idempotencyKey: 'bm2-production-flow-teacher-exposure',
      createdAt: 1,
    }],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  };
  const trace: string[] = [];
  const operationTrace: string[] = [];

  const query = (tableName: string) => {
    operationTrace.push(`${tableName}:query`);
    return {
      withIndex: (
        indexName: string,
        configure: (query: {
          eq(field: string, value: unknown): unknown;
          lte(field: string, value: unknown): unknown;
        }) => unknown,
      ) => {
        const conditions = new Map<string, unknown>();
        const lteConditions = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
          lte(field: string, value: unknown) {
            lteConditions.set(field, value);
            return index;
          },
        };
        configure(index);
        const selected = () => (rows[tableName] ?? []).filter((row) => (
          [...conditions].every(([field, value]) => row[field] === value)
          && [...lteConditions].every(([field, value]) => (
            typeof row[field] === 'number'
            && typeof value === 'number'
            && row[field] <= value
          ))
        ));
        const result: IndexedQueryResult = {
          unique: async () => selected()[0] ?? null,
          first: async () => selected()[0] ?? null,
          collect: async () => selected(),
          take: async (limit: number) => selected().slice(0, limit),
          order: () => result,
        };
        return result;
      },
    };
  };
  const get = async (...args: string[]) => {
    const id = args.at(-1);
    return Object.values(rows).flat().find((row) => row._id === id) ?? null;
  };
  const insert = async (tableName: string, document: Record<string, unknown>) => {
    const id = `${tableName}:${(rows[tableName] ?? []).length + 1}`;
    (rows[tableName] ??= []).push({ _id: id, ...document });
    trace.push(`${tableName}:insert`);
    operationTrace.push(`${tableName}:insert`);
    return id;
  };
  const patch = async (id: string, document: Record<string, unknown>) => {
    const row = Object.values(rows).flat().find((candidate) => candidate._id === id);
    if (!row) throw new Error(`Unknown patch target: ${id}`);
    Object.assign(row, document);
    trace.push('srs_cards:patch');
    operationTrace.push('srs_cards:patch');
  };

  return {
    ctx: { db: { query, get, insert, patch } } as unknown as MutationCtx,
    rows,
    trace,
    operationTrace,
  };
}

const GENERATED_DEFINITION = accountingEquationFamily.generate(7, {
  mode: 'independent_practice',
});

function makeSubmission() {
  const hiddenTermId = GENERATED_DEFINITION.equation.hiddenTermId;
  const rawAnswer = GENERATED_DEFINITION.equation[hiddenTermId];
  return {
    contractVersion: 'practice.v1',
    activityId: GENERATED_DEFINITION.activityId,
    mode: 'independent_practice',
    status: 'submitted',
    attemptNumber: 2,
    submittedAt: '2026-08-19T10:00:00.000Z',
    answers: { [hiddenTermId]: rawAnswer },
    parts: [{
      partId: hiddenTermId,
      rawAnswer,
      isCorrect: true,
      score: 2,
      maxScore: 2,
    }],
  };
}

function request(body: unknown) {
  return new Request('http://localhost/api/learning-evidence/bm2-pilot', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('BM2 producer to opaque evidence transaction', () => {
  beforeEach(() => {
    routeMocks.requireActiveStudentRequestClaims.mockReset();
    routeMocks.fetchInternalMutation.mockReset();
    routeMocks.requireActiveStudentRequestClaims.mockResolvedValue({
      sub: LEARNER_ID,
      role: 'student',
    });
  });

  it('uses the authenticated opaque route with a server-owned grade and one mastery → evidence → receipt transaction', async () => {
    const { ctx, operationTrace, rows, trace } = createConvexHarness();
    routeMocks.fetchInternalMutation.mockImplementation((functionReference, args) => {
      expect(functionReference).toBe('internal.learningEvidence.submit');
      return submitHandler(ctx, args as { learnerId: string; submissionId: string });
    });
    const { submissionId } = await producerHandler(ctx, {
      userId: LEARNER_ID,
      activityId: GENERATED_DEFINITION.activityId,
      submissionData: makeSubmission(),
      idempotencyKey: 'bm2-production-flow-generated-submission',
    });
    const storedSubmission = rows.activity_submissions[0];
    expect(storedSubmission).toMatchObject({
      _id: submissionId,
      userId: LEARNER_ID,
      masteryContractVersion: 'learning-evidence.v1',
      score: 1,
      maxScore: 1,
      submissionData: expect.objectContaining({
        status: 'graded',
        activityId: PILOT_MAPPING.masteryAdvantage.activityId,
        answers: expect.objectContaining({
          [GENERATED_DEFINITION.equation.hiddenTermId]: GENERATED_DEFINITION.equation[
            GENERATED_DEFINITION.equation.hiddenTermId
          ],
        }),
      }),
    });

    const forged = await POST(request({ submissionId, score: 2 }));
    expect(forged.status).toBe(400);
    expect(routeMocks.fetchInternalMutation).not.toHaveBeenCalled();
    expect(trace).toEqual(['activity_submissions:insert']);

    routeMocks.requireActiveStudentRequestClaims.mockResolvedValueOnce({
      sub: OTHER_LEARNER_ID,
      role: 'student',
    });
    const foreign = await POST(request({ submissionId }));
    expect(foreign.status).toBe(404);
    expect(trace).toEqual(['activity_submissions:insert']);

    const first = await POST(request({ submissionId }));
    expect(first.status).toBe(200);
    const firstResult = await first.json();
    expect(firstResult).toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({ reason: 'eligible' }),
    }));
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence[1]).toMatchObject({
      submissionId,
      origin: 'mastery_advantage',
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    // SubmissionSrsAdapter returns the card after it writes this review.
    // The handler must not query cards after this review write.
    const reviewWrite = operationTrace.indexOf('srs_review_log:insert');
    expect(reviewWrite).toBeGreaterThanOrEqual(0);
    expect(operationTrace.slice(reviewWrite + 1)).not.toContain('srs_cards:query');
    expect(rows.learning_evidence_receipts).toEqual([expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
    })]);
    expect(trace).toEqual([
      'activity_submissions:insert',
      'srs_cards:insert',
      'srs_review_log:insert',
      'learning_evidence:insert',
      'learning_evidence_receipts:insert',
    ]);

    const traceAfterFirstDelivery = [...trace];
    Object.assign(storedSubmission, {
      score: 0,
      maxScore: 1,
      submissionData: { ...makeSubmission(), status: 'graded' },
    });
    const replay = await POST(request({ submissionId }));
    expect(replay.status).toBe(200);
    const replayResult = await replay.json();
    expect(replayResult).toEqual({ ...firstResult, delivery: 'replay' });
    expect(trace).toEqual(traceAfterFirstDelivery);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
  });
});
