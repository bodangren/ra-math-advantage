import { describe, expect, it, vi } from 'vitest';

import { generateTopic14PolynomialEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';
import type { MutationCtx } from '@/convex/_generated/server';
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const USER_ID = 'profiles:polynomial-end-behavior-worked-learner';
const ACTIVITY_DOCUMENT_ID = 'activities:polynomial-end-behavior-worked';
const CLIENT_SUBMITTED_AT = '2026-08-30T00:00:00.000Z';
const PART_IDS = ['leftEnd', 'rightEnd'] as const;
type PartId = (typeof PART_IDS)[number];
type SubmissionData = Record<string, unknown>;
type Row = Record<string, unknown> & { _id: string };

function sourceAnswers(): Record<PartId, string> {
  const expected = generateTopic14PolynomialEndBehaviorOutput(0).expectedAnswer as Record<PartId, string>;
  return {
    leftEnd: String(expected.leftEnd),
    rightEnd: String(expected.rightEnd),
  };
}

function makeEnvelope(
  answers: Record<string, unknown> = sourceAnswers(),
  overrides: Record<string, unknown> = {},
): SubmissionData {
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers,
    parts: PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    ...overrides,
  };
}

function makeInput(overrides: Partial<{
  activityId: string;
  idempotencyKey: string;
  submissionData: SubmissionData;
}> = {}) {
  return {
    userId: USER_ID,
    activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
    idempotencyKey: 'polynomial-end-behavior-worked-source-review',
    submissionData: makeEnvelope(),
    ...overrides,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [{
      _id: ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY,
      props: { presentationMode: 'worked_example' },
      gradingConfig: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG,
    }],
    activity_submissions: [],
    learning_evidence: [],
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
        let orderDirection: 'asc' | 'desc' = 'asc';
        const result = {
          unique: async () => {
            const matches = select(tableName, conditions);
            if (matches.length > 1) throw new Error(`Duplicate ${tableName} rows`);
            return matches[0] ?? null;
          },
          first: async () => {
            const matches = select(tableName, conditions);
            if (orderDirection === 'desc') matches.reverse();
            return matches[0] ?? null;
          },
          order: (direction: 'asc' | 'desc') => {
            orderDirection = direction;
            return result;
          },
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
        const tableRows = rows[tableName] ?? (rows[tableName] = []);
        const id = `${tableName}:${tableRows.length + 1}`;
        tableRows.push({ _id: id, ...document });
        return id;
      },
    },
  } as unknown as MutationCtx;

  return { ctx, rows };
}

async function loadHandler() {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic14PolynomialEndBehaviorWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export the Topic 1.4 polynomial end behavior Worked producer.');
  }
  return mutation._handler as (ctx: MutationCtx, args: ReturnType<typeof makeInput>) => Promise<{
    submissionId: string;
    attemptOrdinal: number;
    submittedAt: string;
  }>;
}

function collectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectKeys(item, keys));
  else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nestedValue]) => {
      keys.push(key);
      collectKeys(nestedValue, keys);
    });
  }
  return keys;
}

const FORBIDDEN_KEYS = new Set([
  'masteryContractVersion',
  'score',
  'maxScore',
  'feedback',
  'gradedAt',
  'correctness',
  'isCorrect',
  'answer',
  'answerKey',
  'correctAnswer',
  'correctAnswers',
  'expectedAnswer',
  'grading',
  'gradingMetadata',
  'normalizedAnswer',
  'solution',
  'solutions',
  'solutionSteps',
  'steps',
  'finalAnswer',
  'authority',
]);

function expectNoAuthority(value: unknown): void {
  expect(collectKeys(value).filter((key) => FORBIDDEN_KEYS.has(key))).toEqual([]);
}

describe('Topic 1.4 polynomial end behavior Worked submission', () => {
  it('stores the exact live seed-0 source review as an ungraded row', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    expect(sourceAnswers()).toEqual({ leftEnd: 'negative_infinity', rightEnd: 'negative_infinity' });

    const result = await handler(harness.ctx, makeInput());
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as SubmissionData;
    const expectedSourceAnswers = sourceAnswers();
    expect(result).toEqual({
      submissionId: stored._id,
      attemptOrdinal: 1,
      submittedAt: expect.any(String),
    });
    expect(Object.keys(result).sort()).toEqual(['attemptOrdinal', 'submissionId', 'submittedAt']);
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
    expect(storedData).toEqual({
      contractVersion: 'practice.v1',
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
      mode: 'worked_example',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: expectedSourceAnswers,
      parts: PART_IDS.map((partId) => ({ partId, rawAnswer: expectedSourceAnswers[partId] })),
    });
    expect(Date.parse(storedData.submittedAt as string)).toBe(stored.submittedAt);
    expect(storedData.submittedAt).not.toBe(CLIENT_SUBMITTED_AT);
    expect(stored.submittedAt).toBe(stored.createdAt);
    expect(stored.submittedAt).toBe(stored.updatedAt);
    expect(stored.attemptNumber).toBeUndefined();
    expect(harness.rows.learning_evidence).toHaveLength(0);
    expectNoAuthority(stored);
  });

  it.each([
    ['extra outer field', (envelope: SubmissionData) => ({ ...envelope, score: 1 })],
    ['missing outer field', (envelope: SubmissionData) => {
      const { status: _status, ...withoutStatus } = envelope;
      return withoutStatus;
    }],
    ['extra answer field', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), expectedAnswer: 'negative_infinity' },
    })],
    ['missing answers', (envelope: SubmissionData) => ({ ...envelope, answers: undefined })],
    ['non-record answers', (envelope: SubmissionData) => ({ ...envelope, answers: null })],
    ['missing answer field', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { rightEnd: (envelope.answers as Record<string, unknown>).rightEnd },
    })],
    ['non-string answer', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), leftEnd: 1 },
    })],
    ['extra part field', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [
        { ...(envelope.parts as Array<Record<string, unknown>>)[0], isCorrect: true },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['non-array parts', (envelope: SubmissionData) => ({ ...envelope, parts: null })],
    ['non-record part', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [null, ...(envelope.parts as Array<Record<string, unknown>>).slice(1)],
    })],
    ['missing part', (envelope: SubmissionData) => ({
      ...envelope,
      parts: (envelope.parts as Array<Record<string, unknown>>).slice(0, 1),
    })],
    ['duplicate part', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [
        ...(envelope.parts as Array<Record<string, unknown>>).slice(0, 1),
        (envelope.parts as Array<Record<string, unknown>>)[0],
      ],
    })],
    ['reordered parts', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [...(envelope.parts as Array<Record<string, unknown>>)].reverse(),
    })],
    ['mismatched raw part', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [
        { partId: 'leftEnd', rawAnswer: 'positive_infinity' },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['unknown part', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [
        { partId: 'other', rawAnswer: 'negative_infinity' },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['missing part field', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [
        { rawAnswer: 'negative_infinity' },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['non-string part answer', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [
        { partId: 'leftEnd', rawAnswer: 1 },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['wrong activity', (envelope: SubmissionData) => ({
      ...envelope,
      activityId: 'math.precalc.other.worked_example',
    })],
    ['wrong mode', (envelope: SubmissionData) => ({ ...envelope, mode: 'guided_practice' })],
    ['wrong status', (envelope: SubmissionData) => ({ ...envelope, status: 'graded' })],
    ['wrong source answer', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { ...sourceAnswers(), rightEnd: 'positive_infinity' },
      parts: [
        { partId: 'leftEnd', rawAnswer: 'negative_infinity' },
        { partId: 'rightEnd', rawAnswer: 'positive_infinity' },
      ],
    })],
    ['zero attempt', (envelope: SubmissionData) => ({ ...envelope, attemptNumber: 0 })],
    ['fractional attempt', (envelope: SubmissionData) => ({ ...envelope, attemptNumber: 1.5 })],
    ['invalid submitted time', (envelope: SubmissionData) => ({ ...envelope, submittedAt: 'not-a-time' })],
  ] as const)('rejects %s before persistence', async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(handler(harness.ctx, makeInput({ submissionData: mutate(makeEnvelope()) }))).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it('rejects a blank idempotency key before persistence', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(handler(harness.ctx, makeInput({ idempotencyKey: '   ' }))).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    ['missing activity', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities = []; }],
    ['wrong stable activity', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.stableActivityId = 'math.precalc.other.worked_example';
    }],
    ['wrong component', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.componentKey = 'rate-sign-and-trend-from-graph';
    }],
    ['non-record props', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = null; }],
    ['wrong presentation mode', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.props = { presentationMode: 'independent_practice' };
    }],
    ['non-record grading config', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = null; }],
    ['wrong generator', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.gradingConfig = { generatorKey: 'topic14-other', variantSeed: 0 };
    }],
    ['wrong seed', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.gradingConfig = {
        generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
        variantSeed: 1,
      };
    }],
    ['non-integer seed', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.gradingConfig = {
        ...PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG,
        variantSeed: 0.5,
      };
    }],
    ['extra grading config', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.gradingConfig = {
        ...PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG,
        extra: true,
      };
    }],
  ] as const)('rejects %s provisioning before persistence', async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    mutate(harness);
    await expect(handler(harness.ctx, makeInput({
      idempotencyKey: `polynomial-end-behavior-provisioning-${_label.replaceAll(' ', '-')}`,
    }))).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it('replays exact semantics with advisory client hints and increments for a new key', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = makeInput();
    const first = await handler(harness.ctx, input);
    const replay = await handler(harness.ctx, {
      ...input,
      submissionData: makeEnvelope(sourceAnswers(), {
        attemptNumber: 42,
        submittedAt: '2026-08-31T00:00:00.000Z',
      }),
    });
    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(handler(harness.ctx, {
      ...input,
      submissionData: makeEnvelope({ ...sourceAnswers(), leftEnd: 'positive_infinity' }),
    })).rejects.toThrow('idempotency_conflict');
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const second = await handler(harness.ctx, {
      ...input,
      idempotencyKey: 'polynomial-end-behavior-worked-source-review-second',
      submissionData: makeEnvelope(sourceAnswers(), { attemptNumber: 1 }),
    });
    expect(second.attemptOrdinal).toBe(2);
    expect(harness.rows.activity_submissions).toHaveLength(2);
    expect(first.attemptOrdinal).toBe(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it.each([
    ['stored activity document identity', (row: Row) => { row.activityId = 'activities:other'; }],
    ['stored stable activity identity', (row: Row) => { row.stableActivityId = 'math.precalc.other'; }],
    ['non-record envelope', (row: Row) => { row.submissionData = null; }],
    ['extra envelope field', (row: Row) => { (row.submissionData as SubmissionData).extra = true; }],
    ['wrong envelope contract', (row: Row) => { (row.submissionData as SubmissionData).contractVersion = 'practice.v0'; }],
    ['wrong envelope activity', (row: Row) => { (row.submissionData as SubmissionData).activityId = 'math.precalc.other'; }],
    ['wrong envelope mode', (row: Row) => { (row.submissionData as SubmissionData).mode = 'guided_practice'; }],
    ['wrong envelope status', (row: Row) => { (row.submissionData as SubmissionData).status = 'graded'; }],
    ['envelope attempt type', (row: Row) => { (row.submissionData as SubmissionData).attemptNumber = '1'; }],
    ['zero envelope attempt', (row: Row) => { (row.submissionData as SubmissionData).attemptNumber = 0; }],
    ['fractional envelope attempt', (row: Row) => { (row.submissionData as SubmissionData).attemptNumber = 1.5; }],
    ['mismatched envelope attempt', (row: Row) => { (row.submissionData as SubmissionData).attemptNumber = 2; }],
    ['stored ordinal type', (row: Row) => { row.attemptOrdinal = '1'; }],
    ['zero stored ordinal', (row: Row) => { row.attemptOrdinal = 0; }],
    ['fractional stored ordinal', (row: Row) => { row.attemptOrdinal = 1.5; }],
    ['envelope time type', (row: Row) => { (row.submissionData as SubmissionData).submittedAt = 1; }],
    ['invalid envelope time', (row: Row) => { (row.submissionData as SubmissionData).submittedAt = 'not-a-time'; }],
    ['non-canonical envelope time', (row: Row) => { (row.submissionData as SubmissionData).submittedAt = '2026-08-30'; }],
    ['mismatched envelope time', (row: Row) => { (row.submissionData as SubmissionData).submittedAt = '2026-08-30T00:00:00.001Z'; }],
    ['stored time type', (row: Row) => { row.submittedAt = '1'; }],
    ['non-finite stored time', (row: Row) => { row.submittedAt = Number.NaN; }],
    ['mismatched stored time', (row: Row) => { row.submittedAt = Number(row.submittedAt) + 1; }],
    ['missing answers', (row: Row) => { delete (row.submissionData as SubmissionData).answers; }],
    ['extra answers', (row: Row) => {
      ((row.submissionData as SubmissionData).answers as Record<string, unknown>).extra = 'negative_infinity';
    }],
    ['changed answer', (row: Row) => {
      ((row.submissionData as SubmissionData).answers as Record<string, unknown>).leftEnd = 'positive_infinity';
    }],
    ['non-record answers', (row: Row) => { (row.submissionData as SubmissionData).answers = null; }],
    ['missing part', (row: Row) => {
      (row.submissionData as SubmissionData).parts = [
        ((row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>)[0],
      ];
    }],
    ['extra part field', (row: Row) => {
      ((row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>)[0]!.extra = true;
    }],
    ['reordered parts', (row: Row) => {
      (row.submissionData as SubmissionData).parts = [
        ...((row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>),
      ].reverse();
    }],
    ['duplicate parts', (row: Row) => {
      const parts = (row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>;
      (row.submissionData as SubmissionData).parts = [parts[0], parts[0]];
    }],
    ['non-record part', (row: Row) => {
      (row.submissionData as SubmissionData).parts = [null, ...(row.submissionData as SubmissionData).parts as Array<unknown>];
    }],
    ['malformed part', (row: Row) => {
      (row.submissionData as SubmissionData).parts = [{ partId: 'leftEnd' }, { partId: 'rightEnd' }];
    }],
    ['mismatched part id', (row: Row) => {
      ((row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>)[0]!.partId = 'other';
    }],
    ['mismatched part raw answer', (row: Row) => {
      ((row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>)[0]!.rawAnswer = 'positive_infinity';
    }],
    ['non-array parts', (row: Row) => { (row.submissionData as SubmissionData).parts = null; }],
    ['created time type', (row: Row) => { row.createdAt = '1'; }],
    ['non-finite created time', (row: Row) => { row.createdAt = Number.POSITIVE_INFINITY; }],
    ['mismatched created time', (row: Row) => { row.createdAt = Number(row.submittedAt) + 1; }],
    ['updated time type', (row: Row) => { row.updatedAt = '1'; }],
    ['non-finite updated time', (row: Row) => { row.updatedAt = Number.POSITIVE_INFINITY; }],
    ['mismatched updated time', (row: Row) => { row.updatedAt = Number(row.submittedAt) + 1; }],
    ...[
      'masteryContractVersion',
      'score',
      'maxScore',
      'feedback',
      'gradedAt',
      'correctness',
      'isCorrect',
      'answer',
      'answerKey',
      'correctAnswer',
      'correctAnswers',
      'expectedAnswer',
      'grading',
      'gradingMetadata',
      'normalizedAnswer',
      'solution',
      'solutions',
      'solutionSteps',
      'steps',
      'finalAnswer',
      'authority',
    ].map((field) => [
      `forbidden top-level ${field}`,
      (row: Row) => { row[field] = true; },
    ] as const),
  ] as const)('rejects observable replay corruption: %s', async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await handler(harness.ctx, makeInput());
    mutate(harness.rows.activity_submissions[0]!);
    await expect(handler(harness.ctx, makeInput())).rejects.toThrow('idempotency_conflict');
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });
});
