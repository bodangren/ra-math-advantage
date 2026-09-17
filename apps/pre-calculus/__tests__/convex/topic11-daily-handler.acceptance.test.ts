import { describe, expect, it, vi } from 'vitest';

import {
  createPhysicalContextWorkedSubmission,
  PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
  PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY,
  PRECALCULUS_PHYSICAL_CONTEXT_GENERATOR_KEY,
  PRECALCULUS_PHYSICAL_CONTEXT_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import {
  submitPhysicalContextWorkedSubmission,
} from '@/convex/learningEvidence';
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'profiles:precalc-topic-1-1-daily-student';
const SOURCE_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-1-daily-source';
const PHYSICAL_WORKED_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-1-physical-worked';
const SERVER_NOW = Date.parse('2026-08-19T10:00:00.000Z');
const PHYSICAL_CREATE_KEY = 'precalc-topic-1-1-physical-worked-create-key';

type StoredRow = Record<string, unknown> & { _id: string };

type InternalMutationHandler = (context: unknown, args: unknown) => Promise<unknown>;

type IndexBuilder = {
  eq(field: string, value: unknown): IndexBuilder;
  lte(field: string, value: unknown): IndexBuilder;
};

type QueryResult = {
  collect(): Promise<StoredRow[]>;
  first(): Promise<StoredRow | null>;
  order(direction: 'asc' | 'desc'): QueryResult;
  unique(): Promise<StoredRow | null>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getInternalMutationHandler(value: unknown, name: string): InternalMutationHandler {
  if (
    (typeof value !== 'object' && typeof value !== 'function')
    || value === null
  ) {
    throw new Error(`${name} must be an exported Convex mutation.`);
  }

  const handler = Reflect.get(value, '_handler');
  if (typeof handler !== 'function') {
    throw new Error(`${name} must expose its Convex mutation handler.`);
  }
  return handler;
}

function getSubmissionId(result: unknown): string {
  if (!isRecord(result) || typeof result.submissionId !== 'string') {
    throw new Error('The Topic 1.1 daily writer must return an opaque submission ID.');
  }
  return result.submissionId;
}

function createHarness() {
  const rows: Record<string, StoredRow[]> = {
    activities: [{
      _id: SOURCE_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
      displayName: 'Topic 1.1 Daily Worked Example',
      props: {
        nodeId: PRECALCULUS_PILOT_NODE_ID,
        mode: 'worked_example',
        source: 'teacher_led',
      },
      createdAt: SERVER_NOW,
      updatedAt: SERVER_NOW,
    }, {
      _id: PHYSICAL_WORKED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY,
      displayName: 'Topic 1.1 physical-context Worked example',
      props: {
        presentationMode: 'worked_example',
      },
      gradingConfig: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_GRADING_CONFIG,
      createdAt: SERVER_NOW,
      updatedAt: SERVER_NOW,
    }],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  };

  const ctx = {
    db: {
      get: async (...args: unknown[]) => {
        const id = args.length === 2 ? args[1] : args[0];
        if (typeof id !== 'string') return null;
        return Object.values(rows).flat().find((row) => row._id === id) ?? null;
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        const table = rows[tableName] ?? (rows[tableName] = []);
        const id = `${tableName}:${table.length + 1}`;
        table.push({ _id: id, ...document });
        return id;
      },
      query: (tableName: string) => {
        const conditions: Array<{ field: string; kind: 'eq' | 'lte'; value: unknown }> = [];
        const index: IndexBuilder = {
          eq(field, value) {
            conditions.push({ field, kind: 'eq', value });
            return index;
          },
          lte(field, value) {
            conditions.push({ field, kind: 'lte', value });
            return index;
          },
        };
        let direction: 'asc' | 'desc' = 'asc';
        const matchingRows = () => (rows[tableName] ?? [])
          .filter((row) => conditions.every(({ field, kind, value }) => {
            const candidate = row[field];
            return kind === 'eq'
              ? candidate === value
              : typeof candidate === 'number' && typeof value === 'number' && candidate <= value;
          }))
          .sort((left, right) => Number(left.attemptOrdinal ?? left.occurredAt ?? 0)
            - Number(right.attemptOrdinal ?? right.occurredAt ?? 0));
        const result: QueryResult = {
          collect: async () => {
            const matches = matchingRows();
            return direction === 'desc' ? [...matches].reverse() : matches;
          },
          first: async () => {
            const matches = matchingRows();
            return direction === 'desc'
              ? matches.at(-1) ?? null
              : matches[0] ?? null;
          },
          order(nextDirection) {
            direction = nextDirection;
            return result;
          },
          unique: async () => {
            const matches = matchingRows();
            if (matches.length > 1) {
              throw new Error(`Expected one ${tableName} row for the indexed lookup.`);
            }
            return matches[0] ?? null;
          },
        };
        return {
          withIndex: (_indexName: string, configure: (query: IndexBuilder) => unknown) => {
            configure(index);
            return result;
          },
        };
      },
    },
  };

  return { ctx, rows };
}

function makePhysicalWorkedSubmissionData() {
  const selectedOptionId = 'D';
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: new Date(SERVER_NOW).toISOString(),
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId }],
  };
}

describe('Precalculus physical Worked direct handlers', () => {
  it('consumes an opaque physical Worked submission as teacher-led evidence only once', async () => {
    const createHandler = getInternalMutationHandler(
      createPhysicalContextWorkedSubmission,
      'createPhysicalContextWorkedSubmission',
    );
    const consumeHandler = getInternalMutationHandler(
      submitPhysicalContextWorkedSubmission,
      'submitPhysicalContextWorkedSubmission',
    );
    const { ctx, rows } = createHarness();
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);

    try {
      const created = await createHandler(ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
        idempotencyKey: PHYSICAL_CREATE_KEY,
        submissionData: makePhysicalWorkedSubmissionData(),
      });
      const submissionId = getSubmissionId(created);

      await expect(consumeHandler(ctx, { learnerId: LEARNER_ID, submissionId })).resolves.toStrictEqual({
        persisted: true,
        masteryApplied: false,
        kstApplied: false,
        delivery: 'new',
        decision: {
          idempotency: 'new',
          exposureState: 'introduced',
          eligible: false,
          reason: 'teacher_led',
          masteryBearing: false,
        },
      });
      expect(rows.learning_evidence).toEqual([expect.objectContaining({
        learnerId: LEARNER_ID,
        nodeId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
        attemptOrdinal: 1,
        origin: 'teacher_led',
        mode: 'worked_example',
        occurredAt: SERVER_NOW,
        idempotencyKey: `precalc:physical-context:teacher-led:submission:${submissionId}`,
      })]);
      expect(rows.learning_evidence[0]?.gradedEvidence).toBeUndefined();
      expect(rows.learning_evidence_receipts).toEqual([]);
      expect(rows.srs_cards).toEqual([]);
      expect(rows.srs_review_log).toEqual([]);

      await expect(consumeHandler(ctx, { learnerId: LEARNER_ID, submissionId })).resolves.toStrictEqual({
        persisted: false,
        masteryApplied: false,
        kstApplied: false,
        delivery: 'replay',
        decision: {
          idempotency: 'replay',
          exposureState: 'introduced',
          eligible: false,
          reason: 'teacher_led',
          masteryBearing: false,
        },
      });
      expect(rows.learning_evidence).toHaveLength(1);
      expect(rows.srs_cards).toEqual([]);
      expect(rows.srs_review_log).toEqual([]);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it.each([
    ['a wrong learner', (rows: Record<string, StoredRow[]>) => {
      rows.activity_submissions[0]!.userId = 'profiles:another-student';
    }],
    ['a wrong activity document', (rows: Record<string, StoredRow[]>) => {
      rows.activity_submissions[0]!.activityId = SOURCE_ACTIVITY_DOCUMENT_ID;
    }],
    ['a wrong activity component', (rows: Record<string, StoredRow[]>) => {
      rows.activities[1]!.componentKey = 'precalculus-mastery-advantage-pilot';
    }],
    ['a wrong grading configuration', (rows: Record<string, StoredRow[]>) => {
      rows.activities[1]!.gradingConfig = {
        generatorKey: PRECALCULUS_PHYSICAL_CONTEXT_GENERATOR_KEY,
        variantSeed: 1,
      };
    }],
    ['a missing grading configuration', (rows: Record<string, StoredRow[]>) => {
      delete rows.activities[1]!.gradingConfig;
    }],
    ['a wrong presentation mode', (rows: Record<string, StoredRow[]>) => {
      (rows.activities[1]!.props as Record<string, unknown>).presentationMode = 'guided_practice';
    }],
    ['a cross-paired stable activity, data activity, and mode', (rows: Record<string, StoredRow[]>) => {
      const data = rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.activityId = `${PRECALCULUS_PILOT_NODE_ID}.guided_practice`;
      data.mode = 'guided_practice';
      rows.activity_submissions[0]!.stableActivityId = `${PRECALCULUS_PILOT_NODE_ID}.guided_practice`;
    }],
    ['a stored client grade field', (rows: Record<string, StoredRow[]>) => {
      rows.activity_submissions[0]!.score = 1;
    }],
    ['a stored envelope grade field', (rows: Record<string, StoredRow[]>) => {
      (rows.activity_submissions[0]!.submissionData as Record<string, unknown>).score = 1;
    }],
    ['an extra envelope field', (rows: Record<string, StoredRow[]>) => {
      (rows.activity_submissions[0]!.submissionData as Record<string, unknown>).extra = true;
    }],
    ['an extra answer field', (rows: Record<string, StoredRow[]>) => {
      const data = rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.answers = { ...(data.answers as Record<string, unknown>), extra: true };
    }],
    ['an extra part field', (rows: Record<string, StoredRow[]>) => {
      const data = rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.parts = [{ partId: 'selectedOptionId', rawAnswer: 'D', extra: true }];
    }],
    ['a timestamp mismatch', (rows: Record<string, StoredRow[]>) => {
      (rows.activity_submissions[0]!.submissionData as Record<string, unknown>).submittedAt = '2026-08-19T10:00:01.000Z';
    }],
    ['an invalid ordinal', (rows: Record<string, StoredRow[]>) => {
      rows.activity_submissions[0]!.attemptOrdinal = 0;
      (rows.activity_submissions[0]!.submissionData as Record<string, unknown>).attemptNumber = 0;
    }],
  ] as const)('rejects %s before physical Worked evidence persistence', async (_label, corrupt) => {
    const createHandler = getInternalMutationHandler(
      createPhysicalContextWorkedSubmission,
      'createPhysicalContextWorkedSubmission',
    );
    const consumeHandler = getInternalMutationHandler(
      submitPhysicalContextWorkedSubmission,
      'submitPhysicalContextWorkedSubmission',
    );
    const { ctx, rows } = createHarness();
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);

    try {
      const created = await createHandler(ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
        idempotencyKey: PHYSICAL_CREATE_KEY,
        submissionData: makePhysicalWorkedSubmissionData(),
      });
      const submissionId = getSubmissionId(created);
      corrupt(rows);

      await expect(consumeHandler(ctx, { learnerId: LEARNER_ID, submissionId })).resolves.toStrictEqual({
        accepted: false,
        reason: 'submission_not_found',
      });
      expect(rows.learning_evidence).toEqual([]);
      expect(rows.learning_evidence_receipts).toEqual([]);
      expect(rows.srs_cards).toEqual([]);
      expect(rows.srs_review_log).toEqual([]);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it.each([
    ['a wrong activity document', (rows: Record<string, StoredRow[]>) => {
      rows.activity_submissions[0]!.activityId = SOURCE_ACTIVITY_DOCUMENT_ID;
    }],
    ['a graded stored row', (rows: Record<string, StoredRow[]>) => {
      rows.activity_submissions[0]!.score = 1;
    }],
    ['an extra stored envelope field', (rows: Record<string, StoredRow[]>) => {
      (rows.activity_submissions[0]!.submissionData as Record<string, unknown>).extra = true;
    }],
    ['an extra stored answer field', (rows: Record<string, StoredRow[]>) => {
      const data = rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.answers = { ...(data.answers as Record<string, unknown>), extra: true };
    }],
    ['an extra stored part field', (rows: Record<string, StoredRow[]>) => {
      const data = rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.parts = [{ partId: 'selectedOptionId', rawAnswer: 'D', extra: true }];
    }],
  ] as const)('rejects replay after %s', async (_label, corrupt) => {
    const createHandler = getInternalMutationHandler(
      createPhysicalContextWorkedSubmission,
      'createPhysicalContextWorkedSubmission',
    );
    const consumeHandler = getInternalMutationHandler(
      submitPhysicalContextWorkedSubmission,
      'submitPhysicalContextWorkedSubmission',
    );
    const { ctx, rows } = createHarness();
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);

    try {
      const created = await createHandler(ctx, {
        userId: LEARNER_ID,
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
        idempotencyKey: PHYSICAL_CREATE_KEY,
        submissionData: makePhysicalWorkedSubmissionData(),
      });
      const submissionId = getSubmissionId(created);
      await expect(consumeHandler(ctx, { learnerId: LEARNER_ID, submissionId })).resolves.toMatchObject({
        persisted: true,
      });
      corrupt(rows);

      await expect(consumeHandler(ctx, { learnerId: LEARNER_ID, submissionId })).resolves.toStrictEqual({
        accepted: false,
        reason: 'submission_not_found',
      });
      expect(rows.learning_evidence).toHaveLength(1);
      expect(rows.learning_evidence_receipts).toEqual([]);
    } finally {
      nowSpy.mockRestore();
    }
  });
});
