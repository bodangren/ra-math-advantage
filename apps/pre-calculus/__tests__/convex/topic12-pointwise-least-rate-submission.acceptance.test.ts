import { describe, expect, it, vi } from 'vitest';

import {
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_GRADING_CONFIG,
} from '@/convex/activities';
import { generateTopic12PointwiseLeastRateChoice } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'profiles:precalc-pointwise-submission-learner';

type Row = Record<string, unknown> & { _id: string };
type Mode = 'guided_practice' | 'independent_practice';
type Handler = (ctx: unknown, args: {
  userId: string;
  activityId: string;
  idempotencyKey: string;
  submissionData: Record<string, unknown>;
}) => Promise<{
  submissionId: string;
  score: number;
  maxScore: number;
  attemptOrdinal: number;
  feedback: string;
}>;

async function loadHandler(): Promise<Handler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12PointwiseLeastRateSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export createTopic12PointwiseLeastRateSubmission.');
  }
  return mutation._handler as Handler;
}

function createHarness(mode: Mode = 'guided_practice') {
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID;
  const gradingConfig = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_GRADING_CONFIG
    : PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_GRADING_CONFIG;
  const rows: Record<string, Row[]> = {
    activities: [{
      _id: `activities:pointwise-${mode}`,
      stableActivityId: activityId,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
      props: { presentationMode: mode },
      gradingConfig,
      createdAt: 1,
      updatedAt: 1,
    }],
    activity_submissions: [],
  };

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
        const result = {
          unique: async () => selectedRows(tableName, conditions)[0] ?? null,
          first: async () => selectedRows(tableName, conditions)[0] ?? null,
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
        const id = `${tableName}:${(rows[tableName] ?? []).length + 1}`;
        (rows[tableName] ??= []).push({ _id: id, ...document });
        return id;
      },
    },
  };

  return { ctx, rows, activityId, gradingConfig };
}

function makeEnvelope(mode: Mode, selectedOptionId: string, overrides: Record<string, unknown> = {}) {
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID;
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T10:00:00.000Z',
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId }],
    ...overrides,
  };
}

describe('Topic 1.2 pointwise least-rate server submission', () => {
  it('grades Guided and Independent from their provisioned seeds and stores no evidence', async () => {
    const handler = await loadHandler();
    const guided = createHarness('guided_practice');
    const guidedAnswer = generateTopic12PointwiseLeastRateChoice(1).correctOptionId;
    const guidedResult = await handler(guided.ctx, {
      userId: LEARNER_ID,
      activityId: guided.activityId,
      idempotencyKey: 'pointwise-guided-correct',
      submissionData: makeEnvelope('guided_practice', guidedAnswer),
    });
    const guidedStored = guided.rows.activity_submissions[0]!;
    expect(guidedResult).toMatchObject({
      submissionId: guidedStored._id,
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      feedback: '1/1 pointwise selections matched the server rubric.',
    });
    expect(guidedStored).toMatchObject({
      userId: LEARNER_ID,
      activityId: 'activities:pointwise-guided_practice',
      stableActivityId: guided.activityId,
      createIdempotencyKey: 'pointwise-guided-correct',
      attemptOrdinal: 1,
      score: 1,
      maxScore: 1,
      masteryContractVersion: 'learning-evidence.v1',
      submittedAt: expect.any(Number),
      gradedAt: expect.any(Number),
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: guided.activityId,
        mode: 'guided_practice',
        status: 'graded',
        attemptNumber: 1,
        answers: { selectedOptionId: guidedAnswer },
        parts: [{ partId: 'selectedOptionId', rawAnswer: guidedAnswer, isCorrect: true, score: 1, maxScore: 1 }],
      },
    });
    const guidedData = guidedStored.submissionData as Record<string, unknown>;
    expect(Date.parse(guidedData.submittedAt as string)).toBe(guidedStored.submittedAt);
    expect(guidedData.attemptNumber).toBe(1);
    expect(guidedData.submittedAt).not.toBe('2026-08-19T10:00:00.000Z');
    expect(guided.rows.learning_evidence ?? []).toHaveLength(0);

    const guidedWrong = createHarness('guided_practice');
    const wrongResult = await handler(guidedWrong.ctx, {
      userId: LEARNER_ID,
      activityId: guidedWrong.activityId,
      idempotencyKey: 'pointwise-guided-wrong',
      submissionData: makeEnvelope('guided_practice', guidedAnswer === 'A' ? 'B' : 'A'),
    });
    expect(wrongResult).toMatchObject({ score: 0, maxScore: 1 });
    expect(guidedWrong.rows.activity_submissions).toHaveLength(1);

    const independent = createHarness('independent_practice');
    const independentAnswer = generateTopic12PointwiseLeastRateChoice(2).correctOptionId;
    const independentResult = await handler(independent.ctx, {
      userId: LEARNER_ID,
      activityId: independent.activityId,
      idempotencyKey: 'pointwise-independent-correct',
      submissionData: makeEnvelope('independent_practice', independentAnswer),
    });
    expect(independentResult).toMatchObject({ score: 1, maxScore: 1, attemptOrdinal: 1 });
    expect(independent.rows.activity_submissions).toHaveLength(1);
    expect(independent.rows.learning_evidence ?? []).toHaveLength(0);
  });

  it.each([
    ['an extra outer field', (envelope: ReturnType<typeof makeEnvelope>) => ({ ...envelope, score: 1 })],
    ['an extra answer field', (envelope: ReturnType<typeof makeEnvelope>) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), score: 1 },
    })],
    ['a forged graded part field', (envelope: ReturnType<typeof makeEnvelope>) => ({
      ...envelope,
      parts: [{ ...(envelope.parts as Array<Record<string, unknown>>)[0], isCorrect: true }],
    })],
    ['a mismatched raw part', (envelope: ReturnType<typeof makeEnvelope>) => ({
      ...envelope,
      parts: [{ partId: 'selectedOptionId', rawAnswer: 'A' }],
    })],
  ] as const)('rejects %s before persistence', async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness('guided_practice');
    const answer = generateTopic12PointwiseLeastRateChoice(1).correctOptionId;

    await expect(handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `pointwise-raw-${_label.replaceAll(' ', '-')}`,
      submissionData: mutate(makeEnvelope('guided_practice', answer)),
    })).rejects.toThrow(/invalid|submission|answer|part/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    ['a missing activity', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities = []; }],
    ['a wrong component', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.componentKey = 'graph-average-rate-choice'; }],
    ['a wrong presentation mode', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = { presentationMode: 'independent_practice' }; }],
    ['a wrong generator key', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { generatorKey: 'topic12-graph-average-rate-choice', variantSeed: 1 }; }],
    ['an extra grading config key', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { ...harness.gradingConfig, extra: true }; }],
    ['a wrong stored seed', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { generatorKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY, variantSeed: 2 }; }],
  ] as const)('rejects %s before persistence', async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness('guided_practice');
    mutate(harness);
    const answer = generateTopic12PointwiseLeastRateChoice(1).correctOptionId;

    await expect(handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `pointwise-provisioning-${_label.replaceAll(' ', '-')}`,
      submissionData: makeEnvelope('guided_practice', answer),
    })).rejects.toThrow(/invalid|provisioned|configuration|activity/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it.each([
    ['an unknown activity ID', 'math.precalc.skill.1.2.unknown.guided_practice', makeEnvelope('guided_practice', 'A')],
    ['a mode mismatch', PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID, makeEnvelope('independent_practice', 'A')],
    ['a blank idempotency key', PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID, makeEnvelope('guided_practice', 'A')],
    ['an invalid attempt number', PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID, makeEnvelope('guided_practice', 'A', { attemptNumber: 1.5 })],
    ['an invalid submitted timestamp', PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID, makeEnvelope('guided_practice', 'A', { submittedAt: 'not-a-date' })],
  ] as const)('rejects %s', async (_label, activityId, submissionData) => {
    const handler = await loadHandler();
    const harness = createHarness('guided_practice');
    const idempotencyKey = _label === 'a blank idempotency key' ? '   ' : `pointwise-invalid-${_label.replaceAll(' ', '-')}`;

    await expect(handler(harness.ctx, {
      userId: LEARNER_ID,
      activityId,
      idempotencyKey,
      submissionData,
    })).rejects.toThrow(/invalid|activity|timestamp|attempt|key/i);
    expect(harness.rows.activity_submissions).toHaveLength(0);
  });

  it('replays exactly, increments the server ordinal, and rejects changed or cross-mode keys', async () => {
    const handler = await loadHandler();
    const harness = createHarness('guided_practice');
    const answer = generateTopic12PointwiseLeastRateChoice(1).correctOptionId;
    const input = {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: 'pointwise-replay',
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
      idempotencyKey: 'pointwise-second-attempt',
    });
    expect(second).toMatchObject({ attemptOrdinal: 2, score: 1 });
    expect(harness.rows.activity_submissions).toHaveLength(2);

    const crossMode = createHarness('guided_practice');
    crossMode.rows.activities.push({
      ...crossMode.rows.activities[0]!,
      _id: 'activities:pointwise-independent',
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
      props: { presentationMode: 'independent_practice' },
      gradingConfig: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_GRADING_CONFIG,
    });
    await handler(crossMode.ctx, input);
    await expect(handler(crossMode.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
      idempotencyKey: input.idempotencyKey,
      submissionData: makeEnvelope(
        'independent_practice',
        generateTopic12PointwiseLeastRateChoice(2).correctOptionId,
      ),
    })).rejects.toThrow('idempotency_conflict');
    expect(crossMode.rows.activity_submissions).toHaveLength(1);
  });

  it.each([
    ['stored envelope identity', (row: Row) => { (row.submissionData as Record<string, unknown>).activityId = 'wrong'; }],
    ['stored answer', (row: Row) => { ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).selectedOptionId = 'A'; }],
    ['stored part', (row: Row) => { ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.rawAnswer = 'A'; }],
    ['stored score', (row: Row) => { row.score = 0; }],
    ['stored feedback', (row: Row) => { row.feedback = 'forged feedback'; }],
    ['stored timestamp', (row: Row) => { row.submittedAt = 1; }],
    ['stored ordinal', (row: Row) => { row.attemptOrdinal = 0; }],
  ] as const)('fails closed on %s replay corruption', async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness('guided_practice');
    const answer = generateTopic12PointwiseLeastRateChoice(1).correctOptionId;
    const input = {
      userId: LEARNER_ID,
      activityId: harness.activityId,
      idempotencyKey: `pointwise-corrupt-${_label.replaceAll(' ', '-')}`,
      submissionData: makeEnvelope('guided_practice', answer),
    };
    await handler(harness.ctx, input);
    corrupt(harness.rows.activity_submissions[0]!);

    await expect(handler(harness.ctx, input)).rejects.toThrow('idempotency_conflict');
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence ?? []).toHaveLength(0);
  });
});
