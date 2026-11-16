import { describe, expect, it, vi } from 'vitest';

import {
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GENERATOR_KEY,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_GRADING_CONFIG,
} from '@/convex/activities';
import { generateTopic13RatePatternClassificationOutput } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'profiles:precalc-rate-pattern-submission-learner';
const CASE_IDS = ['a', 'b', 'c'] as const;
type CaseId = (typeof CASE_IDS)[number];
type Mode = 'guided_practice' | 'independent_practice';
type Answers = Record<CaseId, unknown>;
type SubmissionData = Record<string, unknown>;
type Row = Record<string, unknown> & { _id: string };
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
  const mutation = importedModule.createTopic13RatePatternClassificationSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export createTopic13RatePatternClassificationSubmission.');
  }
  return mutation._handler as Handler;
}

function activityIdForMode(mode: Mode): string {
  return mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID;
}

function gradingConfigForMode(mode: Mode) {
  return mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_GRADING_CONFIG
    : PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_GRADING_CONFIG;
}

function expectedAnswers(seed: number): Record<CaseId, string> {
  return generateTopic13RatePatternClassificationOutput(seed).expectedAnswer as Record<CaseId, string>;
}

function makeAnswers(values: Record<CaseId, unknown>): Answers {
  return values;
}

function makeEnvelope(
  mode: Mode,
  answers: Answers,
  overrides: Record<string, unknown> = {},
): SubmissionData {
  return {
    contractVersion: 'practice.v1',
    activityId: activityIdForMode(mode),
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T10:00:00.000Z',
    answers,
    parts: CASE_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    ...overrides,
  };
}

function createHarness(mode: Mode = 'guided_practice', includeOtherMode = false) {
  const makeActivity = (activityMode: Mode): Row => ({
    _id: `activities:rate-pattern-${activityMode}`,
    stableActivityId: activityIdForMode(activityMode),
    componentKey: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY,
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

  return {
    ctx,
    rows,
    activityId: activityIdForMode(mode),
    gradingConfig: gradingConfigForMode(mode),
  };
}

describe('Topic 1.3 rate-pattern classification server submission', () => {
  it.each([
    ['guided_practice', 1],
    ['independent_practice', 2],
  ] as const)('grades generated %s answers with server-owned data', async (mode, seed) => {
    const handler = await loadHandler();
    const harness = createHarness(mode);
    const expected = expectedAnswers(seed);
    const result = await handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `rate-pattern-${mode}-correct`,
      submissionData: makeEnvelope(mode, makeAnswers(expected)),
    });
    const stored = harness.rows.activity_submissions[0]!;
    expect(result).toEqual({
      submissionId: stored._id,
      score: 3,
      maxScore: 3,
      attemptOrdinal: 1,
      feedback: '3/3 rate-pattern classifications matched the server rubric.',
    });
    expect(stored).toMatchObject({
      userId: LEARNER_ID,
      activityId: `activities:rate-pattern-${mode}`,
      stableActivityId: harness.activityId,
      createIdempotencyKey: `rate-pattern-${mode}-correct`,
      attemptOrdinal: 1,
      score: 3,
      maxScore: 3,
      feedback: '3/3 rate-pattern classifications matched the server rubric.',
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
        answers: expected,
        parts: CASE_IDS.map((partId) => ({
          partId,
          rawAnswer: expected[partId],
          isCorrect: true,
          score: 1,
          maxScore: 1,
        })),
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
    expect(JSON.stringify(stored)).not.toMatch(/expectedAnswer|solutionSteps|correctAnswer|correctClassifications/);

    const wrongHarness = createHarness(mode);
    const wrong = { ...expected, b: expected.b === 'linear' ? 'quadratic' : 'linear' };
    const wrongResult = await handler(wrongHarness.ctx, {
      userId: LEARNER_ID,
      activityId: wrongHarness.activityId,
      idempotencyKey: `rate-pattern-${mode}-wrong`,
      submissionData: makeEnvelope(mode, makeAnswers(wrong)),
    });
    expect(wrongResult.score).toBe(2);
    expect(wrongResult.maxScore).toBe(3);
    expect(wrongResult.feedback).toBe('2/3 rate-pattern classifications matched the server rubric.');
    expect(wrongResult).not.toHaveProperty('expectedAnswer');
    expect(wrongHarness.rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    ['missing answer field', makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1)), { answers: { a: 'quadratic', b: 'linear' } })],
    ['extra answer field', makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1)), { answers: { ...expectedAnswers(1), score: 1 } })],
    ['invalid classification', makeEnvelope('guided_practice', makeAnswers({ ...expectedAnswers(1), a: 'Quadratic' }))],
    ['blank classification', makeEnvelope('guided_practice', makeAnswers({ ...expectedAnswers(1), a: ' ' }))],
    ['parts out of order', makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1)), { parts: [{ partId: 'b', rawAnswer: expectedAnswers(1).b }, { partId: 'a', rawAnswer: expectedAnswers(1).a }, { partId: 'c', rawAnswer: expectedAnswers(1).c }] })],
    ['duplicate part', makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1)), { parts: [{ partId: 'a', rawAnswer: expectedAnswers(1).a }, { partId: 'a', rawAnswer: expectedAnswers(1).a }, { partId: 'c', rawAnswer: expectedAnswers(1).c }] })],
    ['mismatched raw part', makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1)), { parts: [{ partId: 'a', rawAnswer: 'linear' }, { partId: 'b', rawAnswer: expectedAnswers(1).b }, { partId: 'c', rawAnswer: expectedAnswers(1).c }] })],
    ['extra part field', makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1)), { parts: [{ partId: 'a', rawAnswer: expectedAnswers(1).a, score: 1 }, { partId: 'b', rawAnswer: expectedAnswers(1).b }, { partId: 'c', rawAnswer: expectedAnswers(1).c }] })],
    ['extra outer field', makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1)), { score: 1 })],
  ] as const)('rejects %s before persistence', async (_label, submissionData) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `rate-pattern-raw-${_label.replaceAll(' ', '-')}`,
      submissionData,
    })).rejects.toThrow(/invalid|classification|part|answer/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    ['missing activity', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities = []; }],
    ['wrong stable ID', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.stableActivityId = 'wrong'; }],
    ['wrong component', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.componentKey = 'negative-rate-context-choice'; }],
    ['non-record props', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = null; }],
    ['wrong presentation mode', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = { presentationMode: 'worked_example' }; }],
    ['non-record grading config', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = null; }],
    ['wrong generator', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { generatorKey: 'topic13-other', variantSeed: 1 }; }],
    ['wrong seed', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { generatorKey: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GENERATOR_KEY, variantSeed: 2 }; }],
    ['non-integer seed', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { ...harness.gradingConfig, variantSeed: 1.5 }; }],
    ['extra grading key', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { ...harness.gradingConfig, extra: true }; }],
  ] as const)('rejects %s before persistence', async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    mutate(harness);
    await expect(handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `rate-pattern-provisioning-${_label.replaceAll(' ', '-')}`,
      submissionData: makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1))),
    })).rejects.toThrow(/invalid|provisioned|configuration|activity/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    ['unknown activity ID', 'math.precalc.skill.1.3.unknown.guided_practice', makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1)))],
    ['mode mismatch', PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID, makeEnvelope('independent_practice', makeAnswers(expectedAnswers(2)))],
    ['blank idempotency key', PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID, makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1)))],
    ['zero attempt', PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID, makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1)), { attemptNumber: 0 })],
    ['fractional attempt', PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID, makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1)), { attemptNumber: 1.5 })],
    ['invalid timestamp', PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID, makeEnvelope('guided_practice', makeAnswers(expectedAnswers(1)), { submittedAt: 'not-a-date' })],
  ] as const)('rejects %s', async (_label, activityId, submissionData) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const idempotencyKey = _label === 'blank idempotency key' ? ' ' : `rate-pattern-invalid-${_label.replaceAll(' ', '-')}`;
    await expect(handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId,
      idempotencyKey,
      submissionData,
    })).rejects.toThrow(/invalid|activity|timestamp|attempt|key/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it('replays exactly, increments the ordinal, and rejects changed or cross-mode keys', async () => {
    const handler = await loadHandler();
    const harness = createHarness('guided_practice', true);
    const expected = expectedAnswers(1);
    const input = {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
      idempotencyKey: 'rate-pattern-replay',
      submissionData: makeEnvelope('guided_practice', makeAnswers(expected)),
    };
    const first = await handler(harness.ctx, input);
    const replay = await handler(harness.ctx, input);
    expect(replay).toStrictEqual(first);
    expect(harness.rows.activity_submissions).toHaveLength(1);

    await expect(handler(harness.ctx, {
      ...input,
      submissionData: makeEnvelope('guided_practice', makeAnswers({ ...expected, a: expected.a === 'linear' ? 'quadratic' : 'linear' })),
    })).rejects.toThrow('idempotency_conflict');
    expect(harness.rows.activity_submissions).toHaveLength(1);

    const second = await handler(harness.ctx, {
      ...input,
      idempotencyKey: 'rate-pattern-second',
    });
    expect(second).toMatchObject({ attemptOrdinal: 2, score: 3 });
    expect(harness.rows.activity_submissions).toHaveLength(2);

    await expect(handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
      idempotencyKey: input.idempotencyKey,
      submissionData: makeEnvelope('independent_practice', makeAnswers(expectedAnswers(2))),
    })).rejects.toThrow('idempotency_conflict');
    expect(harness.rows.activity_submissions).toHaveLength(2);
  });

  it.each([
    ['stored activity identity', (row: Row) => { row.activityId = 'activities:wrong'; }],
    ['stored stable identity', (row: Row) => { row.stableActivityId = 'wrong'; }],
    ['stored contract version', (row: Row) => { (row.submissionData as Record<string, unknown>).contractVersion = 'other'; }],
    ['stored envelope activity', (row: Row) => { (row.submissionData as Record<string, unknown>).activityId = 'wrong'; }],
    ['stored envelope mode', (row: Row) => { (row.submissionData as Record<string, unknown>).mode = 'independent_practice'; }],
    ['stored status', (row: Row) => { (row.submissionData as Record<string, unknown>).status = 'submitted'; }],
    ['stored answer a', (row: Row) => { ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).a = 'linear'; }],
    ['stored answer b', (row: Row) => { ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).b = 'quadratic'; }],
    ['stored answer c', (row: Row) => { ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).c = 'linear'; }],
    ['stored part a', (row: Row) => { ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.rawAnswer = 'linear'; }],
    ['stored part b', (row: Row) => { ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[1]!.rawAnswer = 'quadratic'; }],
    ['stored part c', (row: Row) => { ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[2]!.rawAnswer = 'linear'; }],
    ['stored part score', (row: Row) => { ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.score = 0; }],
    ['stored score', (row: Row) => { row.score = 0; }],
    ['stored max score', (row: Row) => { row.maxScore = 0; }],
    ['stored feedback', (row: Row) => { row.feedback = 'forged'; }],
    ['stored ordinal', (row: Row) => { row.attemptOrdinal = 0; }],
    ['stored attempt', (row: Row) => { (row.submissionData as Record<string, unknown>).attemptNumber = 0; }],
    ['stored submission time', (row: Row) => { row.submittedAt = 0; }],
    ['stored envelope time', (row: Row) => { (row.submissionData as Record<string, unknown>).submittedAt = 'not-a-date'; }],
    ['stored graded time', (row: Row) => { row.gradedAt = 0; }],
    ['stored created time', (row: Row) => { row.createdAt = 0; }],
    ['stored updated time', (row: Row) => { row.updatedAt = 0; }],
  ] as const)('fails closed on %s replay corruption', async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const expected = expectedAnswers(1);
    const input = {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `rate-pattern-corrupt-${_label.replaceAll(' ', '-')}`,
      submissionData: makeEnvelope('guided_practice', makeAnswers(expected)),
    };
    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);
    await expect(handler(harness.ctx, input)).rejects.toThrow('idempotency_conflict');
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });
});
