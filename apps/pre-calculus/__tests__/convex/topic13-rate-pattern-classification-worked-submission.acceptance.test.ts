import { describe, expect, it, vi } from 'vitest';

import {
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GENERATOR_KEY,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import type { MutationCtx } from '@/convex/_generated/server';
import { generateTopic13RatePatternClassificationOutput } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'profiles:precalc-rate-pattern-worked-learner';
const ACTIVITY_DOCUMENT_ID = 'activities:rate-pattern-classification-worked';
const CLIENT_SUBMITTED_AT = '2026-08-19T10:00:00.000Z';
const SOURCE_ANSWERS = {
  a: 'quadratic',
  b: 'linear',
  c: 'quadratic',
} as const;

type Row = Record<string, unknown> & { _id: string };
type Handler = (ctx: MutationCtx, args: {
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
  const mutation = importedModule.createTopic13RatePatternClassificationWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export the Topic 1.3 Worked submission producer.');
  }
  return mutation._handler as Handler;
}

function makeEnvelope(
  answers: Record<string, unknown> = SOURCE_ANSWERS,
  overrides: Record<string, unknown> = {},
) {
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers,
    parts: (['a', 'b', 'c'] as const).map((partId) => ({
      partId,
      rawAnswer: answers[partId],
    })),
    ...overrides,
  } satisfies Record<string, unknown>;
}

function makeInput(overrides: Partial<{
  activityId: string;
  idempotencyKey: string;
  submissionData: Record<string, unknown>;
}> = {}) {
  return {
    userId: LEARNER_ID,
    activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
    idempotencyKey: 'rate-pattern-classification-worked-source-review',
    submissionData: makeEnvelope(),
    ...overrides,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [{
      _id: ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY,
      props: { presentationMode: 'worked_example' },
      gradingConfig: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
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
          unique: async () => select(tableName, conditions)[0] ?? null,
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
        const id = `${tableName}:${(rows[tableName] ?? []).length + 1}`;
        (rows[tableName] ??= []).push({ _id: id, ...document });
        return id;
      },
    },
  } as unknown as MutationCtx;

  return { ctx, rows };
}

describe('Topic 1.3 rate-pattern classification Worked submission', () => {
  it('stores the exact seed-0 source review as an ungraded server-owned row', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    expect(generateTopic13RatePatternClassificationOutput(0).expectedAnswer).toEqual(SOURCE_ANSWERS);

    const result = await handler(harness.ctx, makeInput());
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
      activityId: ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
      createIdempotencyKey: 'rate-pattern-classification-worked-source-review',
      attemptOrdinal: 1,
      submittedAt: expect.any(Number),
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
        mode: 'worked_example',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: SOURCE_ANSWERS,
        parts: [
          { partId: 'a', rawAnswer: 'quadratic' },
          { partId: 'b', rawAnswer: 'linear' },
          { partId: 'c', rawAnswer: 'quadratic' },
        ],
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
    expect(storedData.attemptNumber).toBe(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it.each([
    ['an extra outer field', (envelope: ReturnType<typeof makeEnvelope>) => ({ ...envelope, score: 1 })],
    ['an extra answer field', (envelope: ReturnType<typeof makeEnvelope>) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), expectedAnswer: SOURCE_ANSWERS },
    })],
    ['an extra part field', (envelope: ReturnType<typeof makeEnvelope>) => ({
      ...envelope,
      parts: [{ ...(envelope.parts as Array<Record<string, unknown>>)[0], isCorrect: true }, ...(envelope.parts as Array<Record<string, unknown>>).slice(1)],
    })],
    ['wrong part order', (envelope: ReturnType<typeof makeEnvelope>) => ({
      ...envelope,
      parts: [...(envelope.parts as Array<Record<string, unknown>>)].reverse(),
    })],
    ['a mismatched raw part', (envelope: ReturnType<typeof makeEnvelope>) => ({
      ...envelope,
      parts: [
        ...(envelope.parts as Array<Record<string, unknown>>).slice(0, 1),
        { partId: 'b', rawAnswer: 'neither' },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(2),
      ],
    })],
    ['an invalid classification', (envelope: ReturnType<typeof makeEnvelope>) => ({
      ...envelope,
      answers: { ...SOURCE_ANSWERS, a: 'Quadratic' },
      parts: [
        { partId: 'a', rawAnswer: 'Quadratic' },
        { partId: 'b', rawAnswer: SOURCE_ANSWERS.b },
        { partId: 'c', rawAnswer: SOURCE_ANSWERS.c },
      ],
    })],
    ['an invalid attempt number', (envelope: ReturnType<typeof makeEnvelope>) => ({ ...envelope, attemptNumber: 0 })],
    ['a fractional attempt number', (envelope: ReturnType<typeof makeEnvelope>) => ({ ...envelope, attemptNumber: 1.5 })],
    ['an invalid submitted timestamp', (envelope: ReturnType<typeof makeEnvelope>) => ({ ...envelope, submittedAt: 'not-a-date' })],
  ] as const)('rejects %s before persistence', async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();

    await expect(handler(harness.ctx, makeInput({ submissionData: mutate(makeEnvelope()) })))
      .rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it('rejects wrong identity, mode, status, and blank key before persistence', async () => {
    const handler = await loadHandler();
    const invalidInputs = [
      makeInput({
        activityId: 'math.precalc.other.worked_example',
        submissionData: { ...makeEnvelope(), activityId: 'math.precalc.other.worked_example' },
      }),
      makeInput({ submissionData: { ...makeEnvelope(), mode: 'guided_practice' } }),
      makeInput({ submissionData: { ...makeEnvelope(), status: 'graded' } }),
      makeInput({ idempotencyKey: '  ' }),
    ];

    for (const input of invalidInputs) {
      const harness = createHarness();
      await expect(handler(harness.ctx, input)).rejects.toThrow();
      expect(harness.rows.activity_submissions).toHaveLength(0);
    }
  });

  it.each([
    ['a missing activity', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities = []; }],
    ['a wrong component', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.componentKey = 'rate-pattern-classification-wrong';
    }],
    ['a non-record props value', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.props = null;
    }],
    ['a wrong presentation mode', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.props = { presentationMode: 'guided_practice' };
    }],
    ['a wrong generator key', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.gradingConfig = { generatorKey: 'other-generator', variantSeed: 0 };
    }],
    ['an extra grading config key', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.gradingConfig = {
        ...PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_GRADING_CONFIG,
        extra: true,
      };
    }],
    ['a wrong seed', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities[0]!.gradingConfig = {
        generatorKey: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GENERATOR_KEY,
        variantSeed: 1,
      };
    }],
  ] as const)('rejects %s before persistence', async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    mutate(harness);

    await expect(handler(harness.ctx, makeInput())).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it('replays exactly, rejects changed input, and increments the next key', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = makeInput();
    const first = await handler(harness.ctx, input);
    const replay = await handler(harness.ctx, input);

    expect(replay).toEqual(first);
    await expect(handler(harness.ctx, makeInput({
      submissionData: makeEnvelope({ ...SOURCE_ANSWERS, a: 'linear' }),
    }))).rejects.toThrow('idempotency_conflict');

    const second = await handler(harness.ctx, makeInput({
      idempotencyKey: 'rate-pattern-classification-worked-second-review',
    }));
    expect(second).toMatchObject({ attemptOrdinal: 2 });
    expect(harness.rows.activity_submissions).toHaveLength(2);
  });

  it('rejects the same key for another activity', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = makeInput();
    await handler(harness.ctx, input);

    await expect(handler(harness.ctx, makeInput({
      activityId: 'math.precalc.other.worked_example',
      submissionData: {
        ...makeEnvelope(),
        activityId: 'math.precalc.other.worked_example',
      },
    }))).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    ['a wrong activity document', (row: Row) => { row.activityId = 'activities:wrong'; }],
    ['a wrong stable activity ID', (row: Row) => { row.stableActivityId = 'math.precalc.other.worked_example'; }],
    ['a changed envelope contract', (row: Row) => {
      (row.submissionData as Record<string, unknown>).contractVersion = 'practice.legacy';
    }],
    ['a changed envelope identity', (row: Row) => {
      (row.submissionData as Record<string, unknown>).activityId = 'math.precalc.other.worked_example';
    }],
    ['a changed stored mode', (row: Row) => {
      (row.submissionData as Record<string, unknown>).mode = 'guided_practice';
    }],
    ['a changed stored status', (row: Row) => {
      (row.submissionData as Record<string, unknown>).status = 'graded';
    }],
    ['a changed stored attempt number', (row: Row) => {
      (row.submissionData as Record<string, unknown>).attemptNumber = 2;
    }],
    ['a changed stored timestamp', (row: Row) => {
      (row.submissionData as Record<string, unknown>).submittedAt = '2026-08-19T10:01:00.000Z';
    }],
    ['a changed stored answer', (row: Row) => {
      ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).a = 'linear';
    }],
    ['a changed stored raw part', (row: Row) => {
      ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.rawAnswer = 'linear';
    }],
    ['an ordinal mismatch', (row: Row) => { row.attemptOrdinal = 0; }],
    ['a timestamp mismatch', (row: Row) => { row.submittedAt = 1; }],
    ['a stored mastery field', (row: Row) => { row.masteryContractVersion = 'learning-evidence.v1'; }],
    ['a stored score field', (row: Row) => { row.score = 3; }],
    ['a stored max score field', (row: Row) => { row.maxScore = 3; }],
    ['a stored feedback field', (row: Row) => { row.feedback = 'forged feedback'; }],
    ['a stored graded time', (row: Row) => { row.gradedAt = 1; }],
  ] as const)('rejects replay with %s', async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = makeInput({ idempotencyKey: `rate-pattern-corrupt-${_label.replaceAll(' ', '-')}` });
    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);

    await expect(handler(harness.ctx, input)).rejects.toThrow('idempotency_conflict');
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });
});
