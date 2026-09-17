import { describe, expect, it, vi } from 'vitest';

import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import type { MutationCtx } from '@/convex/_generated/server';
import { generateTopic14PolynomialDegreeLeadingCoefficientOutput } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'profiles:polynomial-worked-evidence-learner';
const OTHER_LEARNER_ID = 'profiles:polynomial-worked-evidence-other';
const ACTIVITY_DOCUMENT_ID = 'activities:polynomial-worked-evidence';
const CLIENT_SUBMITTED_AT = '2026-08-29T10:00:00.000Z';
const SOURCE_ANSWERS = {
  a_degree: '4',
  a_leading_coefficient: '3',
  b_degree: '3',
  b_leading_coefficient: '-7',
  c_degree: '0',
  c_leading_coefficient: '4',
} as const;
const ANSWER_IDS = [
  'a_degree',
  'a_leading_coefficient',
  'b_degree',
  'b_leading_coefficient',
  'c_degree',
  'c_leading_coefficient',
] as const;

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
  const mutation = importedModule.submitTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export the Topic 1.4 Worked evidence consumer.');
  }
  return mutation._handler as Consumer;
}

async function loadProducer(): Promise<Producer> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export the Topic 1.4 Worked producer.');
  }
  return mutation._handler as Producer;
}

function makeEnvelope(
  answers: Record<string, unknown> = SOURCE_ANSWERS,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers,
    parts: ANSWER_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    ...overrides,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [{
      _id: ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
      props: { presentationMode: 'worked_example' },
      gradingConfig: { ...PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG },
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
      unique: async () => {
        const matches = select();
        if (matches.length > 1) throw new Error(`Duplicate ${tableName} rows`);
        return matches[0] ?? null;
      },
      first: async () => {
        const matches = select();
        if (direction === 'desc') matches.reverse();
        return matches[0] ?? null;
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
        const tableRows = rows[tableName] ?? (rows[tableName] = []);
        const id = `${tableName}:${tableRows.length + 1}`;
        tableRows.push({ _id: id, ...document });
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
    activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
    idempotencyKey: 'polynomial-worked-evidence-create-1',
    submissionData: makeEnvelope(),
  });
  return { ...harness, created };
}

function expectNoEffects(harness: ReturnType<typeof createHarness>): void {
  expect(harness.rows.learning_evidence).toHaveLength(0);
  expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
  expect(harness.rows.srs_cards).toHaveLength(0);
  expect(harness.rows.srs_review_log).toHaveLength(0);
}

describe('Topic 1.4 polynomial degree and leading coefficient Worked evidence', () => {
  it('rejects missing and foreign submissions without effects', async () => {
    const consumer = await loadConsumer();
    const harness = createHarness();
    await expect(consumer(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: 'activity_submissions:missing',
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expectNoEffects(harness);

    const stored = await createStoredSubmission();
    await expect(consumer(stored.ctx, {
      learnerId: OTHER_LEARNER_ID,
      submissionId: stored.created.submissionId,
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expectNoEffects(stored);
  });

  it('consumes the real seed-0 source review as one exact-node ungraded exposure', async () => {
    const consumer = await loadConsumer();
    const harness = await createStoredSubmission();
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as Record<string, unknown>;

    expect(generateTopic14PolynomialDegreeLeadingCoefficientOutput(0).expectedAnswer).toEqual({
      a_degree: 4,
      a_leading_coefficient: 3,
      b_degree: 3,
      b_leading_coefficient: -7,
      c_degree: 0,
      c_leading_coefficient: 4,
    });
    expect(storedData.answers).toEqual(SOURCE_ANSWERS);
    expect(stored.attemptOrdinal).toBe(1);
    expect(stored.submittedAt).not.toBe(Date.parse(CLIENT_SUBMITTED_AT));
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
      nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: stored.submittedAt,
      idempotencyKey: `precalc:topic-1-4-polynomial-degree-leading-coefficient:teacher-led:submission:${harness.created.submissionId}`,
    }));
    expect(harness.rows.learning_evidence[0]!.gradedEvidence).toBeUndefined();
    expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.srs_review_log).toHaveLength(0);
  });

  it('replays without another write', async () => {
    const consumer = await loadConsumer();
    const harness = await createStoredSubmission();
    const input = { learnerId: LEARNER_ID, submissionId: harness.created.submissionId };
    await consumer(harness.ctx, input);
    const evidenceAfterFirst = [...harness.rows.learning_evidence];

    await expect(consumer(harness.ctx, input)).resolves.toStrictEqual({
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
    expect(harness.rows.learning_evidence).toEqual(evidenceAfterFirst);
    expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.srs_review_log).toHaveLength(0);
  });

  it.each([
    ['wrong activity document', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.activityId = 'activities:wrong'; }],
    ['wrong stable activity ID', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.stableActivityId = 'wrong.stable.id'; }],
    ['wrong provisioned activity', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.stableActivityId = 'wrong.provisioned.id'; }],
    ['wrong component', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.componentKey = 'concavity-from-rate-change'; }],
    ['wrong Worked mode', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.props as Record<string, unknown>).presentationMode = 'guided_practice'; }],
    ['wrong generator', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).generatorKey = 'topic14-other'; }],
    ['extra config', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).extra = true; }],
    ['wrong seed', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).variantSeed = 1; }],
    ['extra envelope', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).extra = true; }],
    ['wrong contract', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).contractVersion = 'wrong.v1'; }],
    ['wrong envelope activity', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).activityId = 'wrong.activity'; }],
    ['wrong mode in envelope', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).mode = 'guided_practice'; }],
    ['wrong status', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).status = 'graded'; }],
    ['extra answer', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).answers = { ...SOURCE_ANSWERS, score: 1 }; }],
    ['extra part', (harness: ReturnType<typeof createHarness>) => { ((harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).parts as Record<string, unknown>[])[0]!.isCorrect = true; }],
    ['wrong part order', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).parts = [...((harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).parts as unknown[])].reverse(); }],
    ['answer part mismatch', (harness: ReturnType<typeof createHarness>) => { ((harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).parts as Record<string, unknown>[])[0]!.rawAnswer = '5'; }],
    ['another valid source answer', (harness: ReturnType<typeof createHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.answers = { ...SOURCE_ANSWERS, a_degree: '6' };
      data.parts = [{ partId: 'a_degree', rawAnswer: '6' }, ...(data.parts as unknown[]).slice(1)];
    }],
    ['invalid attempt', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).attemptNumber = 1.5; }],
    ['invalid envelope time', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).submittedAt = 'not-a-date'; }],
    ['ordinal mismatch', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.attemptOrdinal = 2; }],
    ['invalid ordinal', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.attemptOrdinal = 0; }],
    ['time mismatch', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submittedAt = Date.parse('2026-08-29T11:00:00.000Z'); }],
    ['invalid time', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submittedAt = Number.NaN; }],
    ['mastery field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.masteryContractVersion = 'learning-evidence.v1'; }],
    ['score field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.score = 1; }],
    ['max score field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.maxScore = 1; }],
    ['feedback field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.feedback = 'forged'; }],
    ['graded-at field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.gradedAt = 1; }],
    ['correctness field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.correctness = true; }],
    ['expected answer field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.expectedAnswer = SOURCE_ANSWERS; }],
    ['solution field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.solution = 'forged'; }],
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
