import { describe, expect, it, vi } from 'vitest';

import {
  PRECALCULUS_TOPIC_12_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import { generateTopic12PointwiseRateOrderingOutput } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'profiles:precalc-pointwise-ordering-worked-learner';
const OTHER_ACTIVITY_DOCUMENT_ID = 'activities:topic-1-2-table-worked';
const WORKED_ACTIVITY_DOCUMENT_ID = 'activities:pointwise-ordering-worked';
const CLIENT_SUBMITTED_AT = '2026-08-19T15:00:00.000Z';

type Row = Record<string, unknown> & { _id: string };
type Handler = (ctx: unknown, args: {
  userId: string;
  activityId: string;
  idempotencyKey: string;
  submissionData: Record<string, unknown>;
}) => Promise<{
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
}>;

async function loadHandler(): Promise<Handler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12PointwiseRateOrderingWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export createTopic12PointwiseRateOrderingWorkedSubmission.');
  }
  return mutation._handler as Handler;
}

async function loadTableWorkedHandler(): Promise<Handler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12TableAverageRateWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export createTopic12TableAverageRateWorkedSubmission.');
  }
  return mutation._handler as Handler;
}

function sourceOrder(): string[] {
  return [...(generateTopic12PointwiseRateOrderingOutput(0).expectedAnswer as {
    orderedPointIds: readonly string[];
  }).orderedPointIds];
}

function makeEnvelope(
  orderedPointIds = sourceOrder(),
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers: { orderedPointIds },
    parts: [{ partId: 'orderedPointIds', rawAnswer: orderedPointIds }],
    ...overrides,
  };
}

function makeTableWorkedEnvelope(): Record<string, unknown> {
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers: { selectedOptionId: 'C' },
    parts: [{ partId: 'selectedOptionId', rawAnswer: 'C' }],
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [{
      _id: WORKED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY,
      props: { presentationMode: 'worked_example' },
      gradingConfig: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: OTHER_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_COMPONENT_KEY,
      props: { presentationMode: 'worked_example' },
      gradingConfig: PRECALCULUS_TOPIC_12_WORKED_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    }],
    activity_submissions: [],
    learning_evidence: [],
    srs_cards: [],
    srs_review_log: [],
  };

  const select = (tableName: string, conditions: ReadonlyMap<string, unknown>) => (
    (rows[tableName] ?? []).filter((row) => (
      [...conditions].every(([field, value]) => row[field] === value)
    ))
  );

  const ctx = {
    db: {
      query: (tableName: string) => {
        const conditions = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
        };
        const result = {
          unique: async () => select(tableName, conditions)[0] ?? null,
          first: async () => select(tableName, conditions)[0] ?? null,
          order: () => result,
        };
        return {
          withIndex: (_indexName: string, configure: (query: typeof index) => unknown) => {
            configure(index);
            return result;
          },
          ...result,
        };
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        const id = `activity_submissions:${(rows[tableName] ?? []).length + 1}`;
        (rows[tableName] ??= []).push({ _id: id, ...document });
        return id;
      },
    },
  };

  return { ctx, rows };
}

function makeInput(overrides: Partial<{
  activityId: string;
  idempotencyKey: string;
  submissionData: Record<string, unknown>;
}> = {}) {
  return {
    userId: LEARNER_ID,
    activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
    idempotencyKey: 'pointwise-ordering-worked-source-review',
    submissionData: makeEnvelope(),
    ...overrides,
  };
}

describe('Topic 1.2 pointwise rate-ordering Worked submission', () => {
  it('stores the source Worked B, C, A order as an ungraded server-owned submission', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const expectedOrder = sourceOrder();
    expect(expectedOrder).toEqual(['B', 'C', 'A']);

    const result = await handler(harness.ctx, makeInput({
      submissionData: makeEnvelope(expectedOrder),
    }));
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as Record<string, unknown>;

    expect(result).toMatchObject({
      submissionId: stored._id,
      attemptOrdinal: 1,
      submittedAt: expect.any(String),
    });
    expect(stored).toMatchObject({
      _id: result.submissionId,
      userId: LEARNER_ID,
      activityId: WORKED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
      createIdempotencyKey: 'pointwise-ordering-worked-source-review',
      attemptOrdinal: 1,
      submittedAt: expect.any(Number),
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
        mode: 'worked_example',
        status: 'submitted',
        attemptNumber: 1,
        answers: { orderedPointIds: expectedOrder },
        parts: [{ partId: 'orderedPointIds', rawAnswer: expectedOrder }],
      },
    });
    expect(Object.keys(stored).sort()).toEqual([
      '_id',
      'activityId',
      'attemptOrdinal',
      'createIdempotencyKey',
      'createdAt',
      'stableActivityId',
      'submissionData',
      'submittedAt',
      'updatedAt',
      'userId',
    ]);
    expect(Date.parse(storedData.submittedAt as string)).toBe(stored.submittedAt);
    expect(storedData.submittedAt).not.toBe(CLIENT_SUBMITTED_AT);
    expect(harness.rows.learning_evidence).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.srs_review_log).toHaveLength(0);
  });

  it.each([
    ['a duplicate label', (envelope: Record<string, unknown>) => makeEnvelope(['B', 'B', 'A'], envelope)],
    ['an unknown label', (envelope: Record<string, unknown>) => makeEnvelope(['B', 'C', 'D'], envelope)],
    ['a short answer', (envelope: Record<string, unknown>) => makeEnvelope(['B', 'C'], envelope)],
    ['a non-array answer', (envelope: Record<string, unknown>) => ({
      ...makeEnvelope(),
      ...envelope,
      answers: { orderedPointIds: 'B,C,A' },
    })],
    ['a mismatched raw part', (envelope: Record<string, unknown>) => ({
      ...makeEnvelope(),
      ...envelope,
      parts: [{ partId: 'orderedPointIds', rawAnswer: ['B', 'A', 'C'] }],
    })],
    ['an extra outer field', (envelope: Record<string, unknown>) => makeEnvelope(undefined, { ...envelope, score: 1 })],
    ['an extra answer field', (envelope: Record<string, unknown>) => ({
      ...makeEnvelope(),
      ...envelope,
      answers: { orderedPointIds: sourceOrder(), correctAnswer: ['B', 'C', 'A'] },
    })],
    ['an extra part field', (envelope: Record<string, unknown>) => ({
      ...makeEnvelope(),
      ...envelope,
      parts: [{ partId: 'orderedPointIds', rawAnswer: sourceOrder(), isCorrect: true }],
    })],
    ['a wrong activity identity', (envelope: Record<string, unknown>) => ({
      ...makeEnvelope(),
      ...envelope,
      activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
    })],
    ['a wrong mode', (envelope: Record<string, unknown>) => ({
      ...makeEnvelope(),
      ...envelope,
      mode: 'guided_practice',
    })],
  ] as const)('rejects %s before persistence', async (_label, makeInvalid) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(handler(harness.ctx, makeInput({ submissionData: makeInvalid({}) }))).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    ['a blank key', (input: ReturnType<typeof makeInput>) => ({ ...input, idempotencyKey: '  ' })],
    ['an invalid attempt number', (input: ReturnType<typeof makeInput>) => ({
      ...input,
      submissionData: makeEnvelope(undefined, { attemptNumber: 0 }),
    })],
    ['an invalid submitted timestamp', (input: ReturnType<typeof makeInput>) => ({
      ...input,
      submissionData: makeEnvelope(undefined, { submittedAt: 'not-a-date' }),
    })],
  ] as const)('rejects %s before persistence', async (_label, makeInvalid) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(handler(harness.ctx, makeInvalid(makeInput()))).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    ['a missing activity', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities = []; }],
    ['a wrong component', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.componentKey = 'graph-average-rate-choice';
    }],
    ['a wrong presentation mode', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.props = { presentationMode: 'guided_practice' };
    }],
    ['a wrong generator key', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.gradingConfig = {
        generatorKey: 'wrong-generator',
        variantSeed: 0,
      };
    }],
    ['an extra grading config key', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.gradingConfig = {
        generatorKey: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GENERATOR_KEY,
        variantSeed: 0,
        extra: true,
      };
    }],
    ['a wrong seed', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.gradingConfig = {
        generatorKey: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GENERATOR_KEY,
        variantSeed: 1,
      };
    }],
  ] as const)('rejects %s before persistence', async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    corrupt(harness);
    await expect(handler(harness.ctx, makeInput())).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it('replays exactly, increments a new key, rejects changed order, and rejects cross-activity key reuse', async () => {
    const handler = await loadHandler();
    const tableHandler = await loadTableWorkedHandler();
    const harness = createHarness();
    const input = makeInput();
    const first = await handler(harness.ctx, input);
    const replay = await handler(harness.ctx, input);

    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);
    await expect(handler(harness.ctx, makeInput({
      submissionData: makeEnvelope(['C', 'B', 'A']),
    }))).rejects.toThrow(/idempotency_conflict/i);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(handler(harness.ctx, makeInput({
      idempotencyKey: 'pointwise-ordering-worked-second',
    }))).resolves.toMatchObject({ attemptOrdinal: 2 });
    expect(harness.rows.activity_submissions).toHaveLength(2);

    const crossActivityHarness = createHarness();
    await handler(crossActivityHarness.ctx, input);
    await expect(tableHandler(crossActivityHarness.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      idempotencyKey: input.idempotencyKey,
      submissionData: makeTableWorkedEnvelope(),
    })).rejects.toThrow(/idempotency_conflict/i);
    expect(crossActivityHarness.rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    ['a wrong activity document', (row: Row) => { row.activityId = 'activities:wrong'; }],
    ['a wrong stable activity ID', (row: Row) => { row.stableActivityId = 'wrong-activity'; }],
    ['a wrong answer', (row: Row) => {
      (row.submissionData as Record<string, unknown>).answers = { orderedPointIds: ['C', 'B', 'A'] };
    }],
    ['a wrong raw part', (row: Row) => {
      (row.submissionData as Record<string, unknown>).parts = [{
        partId: 'orderedPointIds',
        rawAnswer: ['C', 'B', 'A'],
      }];
    }],
    ['a wrong timestamp', (row: Row) => {
      (row.submissionData as Record<string, unknown>).submittedAt = '2026-08-19T16:00:00.000Z';
    }],
    ['a wrong ordinal', (row: Row) => { row.attemptOrdinal = 2; }],
    ['a mastery contract field', (row: Row) => { row.masteryContractVersion = 'learning-evidence.v1'; }],
    ['a score field', (row: Row) => { row.score = 1; }],
    ['a max score field', (row: Row) => { row.maxScore = 1; }],
    ['a feedback field', (row: Row) => { row.feedback = '1/1'; }],
    ['a graded-at field', (row: Row) => { row.gradedAt = 1; }],
  ] as const)('fails closed on corrupt stored replay with %s', async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = makeInput();
    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);
    await expect(handler(harness.ctx, input)).rejects.toThrow(/idempotency_conflict/i);
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });
});
