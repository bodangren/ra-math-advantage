import { describe, expect, it, vi } from 'vitest';

import {
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_GRADING_CONFIG,
} from '@/convex/activities';
import { generateTopic12NegativeRateContextChoiceOutput } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'profiles:precalc-negative-rate-submission-learner';

type Row = Record<string, unknown> & { _id: string };
type Mode = 'guided_practice' | 'independent_practice';
type SubmissionData = Record<string, unknown>;
type Handler = (ctx: unknown, args: {
  userId: string;
  activityId: string;
  idempotencyKey: string;
  submissionData: SubmissionData;
}) => Promise<{
  submissionId: string;
  score: number;
  maxScore: number;
  attemptOrdinal: number;
  feedback: string;
}>;

async function loadHandler(): Promise<Handler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12NegativeRateContextSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export createTopic12NegativeRateContextSubmission.');
  }
  return mutation._handler as Handler;
}

function activityIdForMode(mode: Mode) {
  return mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID;
}

function gradingConfigForMode(mode: Mode) {
  return mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_GRADING_CONFIG
    : PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_GRADING_CONFIG;
}

function expectedAnswer(seed: number) {
  return (generateTopic12NegativeRateContextChoiceOutput(seed).expectedAnswer as {
    selectedOptionId: string;
  }).selectedOptionId;
}

function createHarness(mode: Mode = 'guided_practice', includeOtherMode = false) {
  const makeActivity = (activityMode: Mode): Row => ({
    _id: `activities:negative-${activityMode}`,
    stableActivityId: activityIdForMode(activityMode),
    componentKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY,
    props: { presentationMode: activityMode },
    gradingConfig: gradingConfigForMode(activityMode),
    createdAt: 1,
    updatedAt: 1,
  });
  const rows: Record<string, Row[]> = {
    activities: [makeActivity(mode)],
    activity_submissions: [],
    learning_evidence: [],
  };
  if (includeOtherMode) {
    rows.activities.push(makeActivity(mode === 'guided_practice' ? 'independent_practice' : 'guided_practice'));
  }

  function selectedRows(tableName: string, conditions: ReadonlyMap<string, unknown>) {
    return (rows[tableName] ?? []).filter((row) => (
      [...conditions].every(([field, value]) => row[field] === value)
    ));
  }

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
          unique: async () => selectedRows(tableName, conditions)[0] ?? null,
          first: async () => {
            const matches = selectedRows(tableName, conditions);
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
  };

  return { ctx, rows, activityId: activityIdForMode(mode), gradingConfig: gradingConfigForMode(mode) };
}

function makeEnvelope(mode: Mode, selectedOptionId: unknown, overrides: Record<string, unknown> = {}): SubmissionData {
  return {
    contractVersion: 'practice.v1',
    activityId: activityIdForMode(mode),
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T10:00:00.000Z',
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId }],
    ...overrides,
  };
}

describe('Topic 1.2 negative-rate context server submission', () => {
  it.each([
    ['guided_practice', 1],
    ['independent_practice', 2],
  ] as const)('grades the generated %s answer and stores server-owned data', async (mode, seed) => {
    const handler = await loadHandler();
    const harness = createHarness(mode);
    const answer = expectedAnswer(seed);
    const result = await handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `negative-${mode}-correct`,
      submissionData: makeEnvelope(mode, answer),
    });
    const stored = harness.rows.activity_submissions[0]!;
    expect(result).toMatchObject({
      submissionId: stored._id,
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      feedback: '1/1 negative-rate context selections matched the server rubric.',
    });
    expect(stored).toMatchObject({
      userId: LEARNER_ID,
      activityId: `activities:negative-${mode}`,
      stableActivityId: harness.activityId,
      createIdempotencyKey: `negative-${mode}-correct`,
      attemptOrdinal: 1,
      score: 1,
      maxScore: 1,
      feedback: '1/1 negative-rate context selections matched the server rubric.',
      masteryContractVersion: 'learning-evidence.v1',
      submittedAt: expect.any(Number),
      gradedAt: expect.any(Number),
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: harness.activityId,
        mode,
        status: 'graded',
        attemptNumber: 1,
        answers: { selectedOptionId: answer },
        parts: [{ partId: 'selectedOptionId', rawAnswer: answer, isCorrect: true, score: 1, maxScore: 1 }],
      },
    });
    const storedData = stored.submissionData as Record<string, unknown>;
    expect(Date.parse(storedData.submittedAt as string)).toBe(stored.submittedAt);
    expect(storedData.attemptNumber).toBe(1);
    expect(storedData.submittedAt).not.toBe('2026-08-19T10:00:00.000Z');
    expect(stored.submittedAt).toBe(stored.gradedAt);
    expect(stored.submittedAt).toBe(stored.createdAt);
    expect(stored.submittedAt).toBe(stored.updatedAt);
    expect(harness.rows.learning_evidence).toHaveLength(0);

    const wrongHarness = createHarness(mode);
    const wrongAnswer = answer === 'A' ? 'B' : 'A';
    const wrongResult = await handler(wrongHarness.ctx, {
      userId: LEARNER_ID,
      activityId: wrongHarness.activityId,
      idempotencyKey: `negative-${mode}-wrong`,
      submissionData: makeEnvelope(mode, wrongAnswer),
    });
    expect(wrongResult).toMatchObject({ score: 0, maxScore: 1 });
    expect(wrongHarness.rows.activity_submissions).toHaveLength(1);
    expect((wrongHarness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).answers)
      .toEqual({ selectedOptionId: wrongAnswer });
  });

  it.each([
    ['missing selected option', makeEnvelope('guided_practice', 'A', { answers: {} })],
    ['blank selected option', makeEnvelope('guided_practice', '   ')],
    ['unknown selected option', makeEnvelope('guided_practice', 'E')],
    ['mismatched raw part', makeEnvelope('guided_practice', 'A', { parts: [{ partId: 'selectedOptionId', rawAnswer: 'B' }] })],
    ['extra answer field', makeEnvelope('guided_practice', 'A', { answers: { selectedOptionId: 'A', score: 1 } })],
    ['extra part field', makeEnvelope('guided_practice', 'A', { parts: [{ partId: 'selectedOptionId', rawAnswer: 'A', isCorrect: true }] })],
    ['extra outer field', makeEnvelope('guided_practice', 'A', { score: 1 })],
  ] as const)('rejects %s before persistence', async (_label, submissionData) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `negative-raw-${_label.replaceAll(' ', '-')}`,
      submissionData,
    })).rejects.toThrow(/invalid|selected|answer|part/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    ['missing activity', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities = []; }],
    ['wrong stored stable ID', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.stableActivityId = 'wrong'; }],
    ['wrong component', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.componentKey = 'graph-average-rate-choice'; }],
    ['non-record props', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = null; }],
    ['wrong presentation mode', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = { presentationMode: 'worked_example' }; }],
    ['non-record grading config', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = null; }],
    ['wrong generator', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { generatorKey: 'topic12-graph-average-rate-choice', variantSeed: 1 }; }],
    ['wrong stored seed', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { generatorKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY, variantSeed: 0 }; }],
    ['non-integer stored seed', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { generatorKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GENERATOR_KEY, variantSeed: 1.5 }; }],
    ['extra grading config key', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { ...harness.gradingConfig, extra: true }; }],
  ] as const)('rejects %s before persistence', async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    mutate(harness);
    await expect(handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `negative-provisioning-${_label.replaceAll(' ', '-')}`,
      submissionData: makeEnvelope('guided_practice', expectedAnswer(1)),
    })).rejects.toThrow(/invalid|provisioned|configuration|activity/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    ['unknown activity ID', 'math.precalc.skill.1.2.unknown.guided_practice', makeEnvelope('guided_practice', 'A')],
    ['mode mismatch', PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID, makeEnvelope('independent_practice', 'A')],
    ['blank idempotency key', PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID, makeEnvelope('guided_practice', 'A')],
    ['invalid attempt', PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID, makeEnvelope('guided_practice', 'A', { attemptNumber: 1.5 })],
    ['invalid timestamp', PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID, makeEnvelope('guided_practice', 'A', { submittedAt: 'not-a-date' })],
  ] as const)('rejects %s', async (_label, activityId, submissionData) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const idempotencyKey = _label === 'blank idempotency key' ? '   ' : `negative-invalid-${_label.replaceAll(' ', '-')}`;
    await expect(handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId,
      idempotencyKey,
      submissionData,
    })).rejects.toThrow(/invalid|activity|timestamp|attempt|key/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it('replays exactly, increments the server ordinal, and rejects changed and cross-mode keys', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const answer = expectedAnswer(1);
    const input = {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: 'negative-replay',
      submissionData: makeEnvelope('guided_practice', answer),
    };
    const first = await handler(harness.ctx, input);
    const replay = await handler(harness.ctx, input);
    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(handler(harness.ctx, {
      ...input,
      submissionData: makeEnvelope('guided_practice', answer === 'A' ? 'B' : 'A'),
    })).rejects.toThrow('idempotency_conflict');
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const second = await handler(harness.ctx, {
      ...input,
      idempotencyKey: 'negative-second-attempt',
    });
    expect(second).toMatchObject({ attemptOrdinal: 2, score: 1 });
    expect(harness.rows.activity_submissions).toHaveLength(2);

    const crossMode = createHarness('guided_practice', true);
    await handler(crossMode.ctx, input);
    await expect(handler(crossMode.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
      idempotencyKey: input.idempotencyKey,
      submissionData: makeEnvelope('independent_practice', expectedAnswer(2)),
    })).rejects.toThrow('idempotency_conflict');
    expect(crossMode.rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    ['stored activity identity', (row: Row) => { row.activityId = 'activities:wrong'; }],
    ['stored stable identity', (row: Row) => { row.stableActivityId = 'wrong'; }],
    ['stored envelope identity', (row: Row) => { (row.submissionData as Record<string, unknown>).activityId = 'wrong'; }],
    ['stored answer', (row: Row) => { ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).selectedOptionId = 'B'; }],
    ['stored part', (row: Row) => { ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.rawAnswer = 'B'; }],
    ['stored score', (row: Row) => { row.score = 0; }],
    ['stored max score', (row: Row) => { row.maxScore = 0; }],
    ['stored feedback', (row: Row) => { row.feedback = 'forged feedback'; }],
    ['stored ordinal', (row: Row) => { row.attemptOrdinal = 0; }],
    ['stored submission time', (row: Row) => { row.submittedAt = 0; }],
    ['stored graded time', (row: Row) => { row.gradedAt = 0; }],
    ['stored created time', (row: Row) => { row.createdAt = 0; }],
    ['stored updated time', (row: Row) => { row.updatedAt = 0; }],
  ] as const)('fails closed on %s replay corruption', async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const answer = expectedAnswer(1);
    const input = {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `negative-corrupt-${_label.replaceAll(' ', '-')}`,
      submissionData: makeEnvelope('guided_practice', answer),
    };
    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);
    await expect(handler(harness.ctx, input)).rejects.toThrow('idempotency_conflict');
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });
});
