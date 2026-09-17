import { describe, expect, it, vi } from 'vitest';

import {
  PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY,
  PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import type { MutationCtx } from '@/convex/_generated/server';
import { generateTopic13ConcavityFromRateChangeOutput } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'profiles:concavity-worked-evidence-learner';
const OTHER_LEARNER_ID = 'profiles:concavity-worked-evidence-other';
const ACTIVITY_DOCUMENT_ID = 'activities:concavity-worked-evidence';
const CLIENT_SUBMITTED_AT = '2026-08-29T10:00:00.000Z';

type Row = Record<string, unknown> & { _id: string };
type Consumer = (ctx: MutationCtx, args: { learnerId: string; submissionId: string }) => Promise<Record<string, unknown>>;
type Producer = (ctx: MutationCtx, args: {
  userId: string;
  activityId: string;
  idempotencyKey: string;
  submissionData: Record<string, unknown>;
}) => Promise<{ submissionId: string; attemptOrdinal: number; submittedAt: string }>;

async function loadConsumer(): Promise<Consumer> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/learningEvidence');
  const mutation = importedModule.submitTopic13ConcavityWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export the Topic 1.3 concavity Worked evidence consumer.');
  }
  return mutation._handler as Consumer;
}

async function loadProducer(): Promise<Producer> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic13ConcavityWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export the Topic 1.3 concavity Worked producer.');
  }
  return mutation._handler as Producer;
}

function sourceClassification() {
  return (generateTopic13ConcavityFromRateChangeOutput(0).expectedAnswer as {
    classification: string;
  }).classification;
}

function makeEnvelope(
  classification: unknown = sourceClassification(),
  overrides: Record<string, unknown> = {},
) {
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers: { classification },
    parts: [{ partId: 'classification', rawAnswer: classification }],
    ...overrides,
  } satisfies Record<string, unknown>;
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [{
      _id: ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY,
      props: { presentationMode: 'worked_example' },
      gradingConfig: { ...PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_GRADING_CONFIG },
      createdAt: 1,
      updatedAt: 1,
    }],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  };

  const query = (tableName: string) => {
    const conditions = new Map<string, unknown>();
    const upperBounds = new Map<string, unknown>();
    const index = {
      eq(field: string, value: unknown) {
        conditions.set(field, value);
        return index;
      },
      lte(field: string, value: unknown) {
        upperBounds.set(field, value);
        return index;
      },
    };
    const select = () => (rows[tableName] ?? []).filter((row) => (
      [...conditions].every(([field, value]) => row[field] === value)
      && [...upperBounds].every(([field, value]) => (
        typeof row[field] === 'number' && typeof value === 'number' && row[field] <= value
      ))
    ));
    let direction: 'asc' | 'desc' = 'asc';
    const result = {
      unique: async () => select()[0] ?? null,
      first: async () => {
        const selected = select();
        if (direction === 'desc') selected.reverse();
        return selected[0] ?? null;
      },
      order: (nextDirection: 'asc' | 'desc') => {
        direction = nextDirection;
        return result;
      },
      withIndex: (_indexName: string, configure: (query: typeof index) => unknown) => {
        configure(index);
        return result;
      },
    };
    return result;
  };

  const ctx = {
    db: {
      get: async (_tableName: string, id: string) => (
        Object.values(rows).flat().find((row) => row._id === id) ?? null
      ),
      query,
      insert: async (tableName: string, document: Record<string, unknown>) => {
        const id = `${tableName}:${(rows[tableName] ?? []).length + 1}`;
        (rows[tableName] ??= []).push({ _id: id, ...document });
        return id;
      },
    },
  } as unknown as MutationCtx;

  return { ctx, rows };
}

async function createStoredSubmission() {
  const producer = await loadProducer();
  const harness = createHarness();
  const created = await producer(harness.ctx, {
    userId: LEARNER_ID,
    activityId: PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
    idempotencyKey: 'concavity-worked-evidence-create-1',
    submissionData: makeEnvelope(),
  });
  return { ...harness, created };
}

function expectNoEffects(harness: ReturnType<typeof createHarness>) {
  expect(harness.rows.learning_evidence).toHaveLength(0);
  expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
  expect(harness.rows.srs_cards).toHaveLength(0);
  expect(harness.rows.srs_review_log).toHaveLength(0);
}

describe('Topic 1.3 concavity Worked evidence', () => {
  it('rejects a missing stored submission without effects', async () => {
    const consumer = await loadConsumer();
    const harness = createHarness();

    await expect(consumer(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: 'activity_submissions:missing',
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expectNoEffects(harness);
  });

  it('consumes the real seed-0 source review as one exact-node ungraded exposure', async () => {
    const consumer = await loadConsumer();
    const harness = await createStoredSubmission();
    const stored = harness.rows.activity_submissions[0]!;

    expect(sourceClassification()).toBe('concave_up');
    expect(stored.attemptOrdinal).toBe(1);
    expect(stored.submittedAt).not.toBe(Date.parse(CLIENT_SUBMITTED_AT));
    expect((stored.submissionData as Record<string, unknown>).answers).toEqual({ classification: 'concave_up' });
    expect(stored.masteryContractVersion).toBeUndefined();
    expect(stored.score).toBeUndefined();
    expect(stored.maxScore).toBeUndefined();
    expect(stored.feedback).toBeUndefined();
    expect(stored.gradedAt).toBeUndefined();

    await expect(consumer(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: harness.created.submissionId,
    })).resolves.toStrictEqual({
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
    expect(harness.rows.learning_evidence).toHaveLength(1);
    expect(harness.rows.learning_evidence[0]).toStrictEqual(expect.objectContaining({
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
      activityId: PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: stored.submittedAt,
      idempotencyKey: `precalc:topic-1-3-concavity:teacher-led:submission:${harness.created.submissionId}`,
    }));
    expect(harness.rows.learning_evidence[0]!.gradedEvidence).toBeUndefined();
    expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.srs_review_log).toHaveLength(0);
  });

  it('replays without another write and rejects a foreign learner', async () => {
    const consumer = await loadConsumer();
    const harness = await createStoredSubmission();
    await consumer(harness.ctx, { learnerId: LEARNER_ID, submissionId: harness.created.submissionId });
    const evidenceAfterFirst = [...harness.rows.learning_evidence];

    await expect(consumer(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: harness.created.submissionId,
    })).resolves.toStrictEqual({
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
    await expect(consumer(harness.ctx, {
      learnerId: OTHER_LEARNER_ID,
      submissionId: harness.created.submissionId,
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expect(harness.rows.learning_evidence).toEqual(evidenceAfterFirst);
    expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.srs_review_log).toHaveLength(0);
  });

  it.each([
    ['wrong activity document', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.activityId = 'activities:wrong'; }],
    ['wrong linked activity identity', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!._id = 'activities:wrong'; }],
    ['wrong provisioned stable activity ID', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.stableActivityId = 'wrong.provisioned.id'; }],
    ['wrong component', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.componentKey = 'rate-pattern-classification'; }],
    ['non-record props', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = null; }],
    ['wrong mode', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.props as Record<string, unknown>).presentationMode = 'guided_practice'; }],
    ['wrong generator', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).generatorKey = 'other-generator'; }],
    ['extra config', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).extra = true; }],
    ['wrong seed', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).variantSeed = 1; }],
    ['wrong stable submission ID', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.stableActivityId = 'wrong.stable.id'; }],
    ['wrong envelope activity ID', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).activityId = 'wrong.activity'; }],
    ['another valid classification', (harness: ReturnType<typeof createHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.answers = { classification: 'concave_down' };
      data.parts = [{ partId: 'classification', rawAnswer: 'concave_down' }];
    }],
    ['raw part mismatch', (harness: ReturnType<typeof createHarness>) => { ((harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).parts as Record<string, unknown>[])[0]!.rawAnswer = 'concave_down'; }],
    ['extra raw part field', (harness: ReturnType<typeof createHarness>) => { ((harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).parts as Record<string, unknown>[])[0]!.isCorrect = true; }],
    ['extra answer field', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).answers = { classification: 'concave_up', expectedAnswer: 'concave_up' }; }],
    ['extra envelope field', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).extra = true; }],
    ['wrong attempt', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).attemptNumber = 1.5; }],
    ['ordinal mismatch', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.attemptOrdinal = 2; }],
    ['invalid ordinal', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.attemptOrdinal = 0; }],
    ['time mismatch', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submittedAt = Date.parse('2026-08-29T11:00:00.000Z'); }],
    ['invalid stored time', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submittedAt = Number.NaN; }],
    ['mastery field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.masteryContractVersion = 'learning-evidence.v1'; }],
    ['score field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.score = 1; }],
    ['max score field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.maxScore = 1; }],
    ['feedback field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.feedback = 'forged'; }],
    ['graded-at field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.gradedAt = 1; }],
  ] as const)('rejects %s without effects', async (_label, corrupt) => {
    const consumer = await loadConsumer();
    const harness = await createStoredSubmission();
    corrupt(harness);

    await expect(consumer(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: harness.created.submissionId,
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expectNoEffects(harness);
  });
});
