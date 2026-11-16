import { describe, expect, it, vi } from 'vitest';

import { generateTopic15LeastPolynomialDegreeOutput } from '@math-platform/math-content/knowledge-space';

import type { MutationCtx } from '@/convex/_generated/server';
import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const USER_ID = 'profiles:topic15-least-degree-worked-evidence-learner';
const OTHER_USER_ID = 'profiles:topic15-least-degree-worked-evidence-other';
const ACTIVITY_DOCUMENT_ID = 'activities:topic15-least-degree-worked-evidence';
const CLIENT_SUBMITTED_AT = '2026-08-30T00:00:00.000Z';
const SERVER_NOW = Date.parse('2026-08-30T12:00:00.000Z');
const SOURCE_ANSWER = { leastDegree: 5 };
const WORKED_ID = PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID;
type SubmissionData = Record<string, unknown>;
type Row = Record<string, unknown> & { _id: string };

function makeEnvelope(
  answers: Record<string, unknown> = SOURCE_ANSWER,
  overrides: Record<string, unknown> = {},
): SubmissionData {
  return {
    contractVersion: 'practice.v1',
    activityId: WORKED_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: CLIENT_SUBMITTED_AT,
    answers,
    parts: [{ partId: 'leastDegree', rawAnswer: answers.leastDegree }],
    ...overrides,
  };
}

function makeInput(overrides: Partial<{
  activityId: string;
  idempotencyKey: string;
  submissionData: SubmissionData;
  userId: string;
}> = {}) {
  return {
    userId: USER_ID,
    activityId: WORKED_ID,
    idempotencyKey: 'topic15-least-degree-worked-evidence-create-1',
    submissionData: makeEnvelope(),
    ...overrides,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [{
      _id: ACTIVITY_DOCUMENT_ID,
      stableActivityId: WORKED_ID,
      componentKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
      props: { presentationMode: 'worked_example' },
      gradingConfig: { ...PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG },
    }],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
    kst: [],
    mastery_effects: [],
  };

  const select = (tableName: string, conditions: ReadonlyMap<string, unknown>) => (
    (rows[tableName] ?? []).filter((row) => (
      [...conditions].every(([field, value]) => row[field] === value)
    ))
  );

  const query = (tableName: string) => {
    const conditions = new Map<string, unknown>();
    let orderDirection: 'asc' | 'desc' = 'asc';
    const index = {
      eq(field: string, value: unknown) {
        conditions.set(field, value);
        return index;
      },
      lte(field: string, value: unknown) {
        conditions.set(`${field}__lte`, value);
        return index;
      },
    };
    const selectRows = () => {
      const upperBounds = [...conditions]
        .filter(([field]) => field.endsWith('__lte'))
        .map(([field, value]) => [field.slice(0, -'__lte'.length), value] as const);
      const exact = new Map([...conditions].filter(([field]) => !field.endsWith('__lte')));
      const matches = select(tableName, exact).filter((row) => (
        upperBounds.every(([field, value]) => (
          typeof row[field] === 'number'
          && typeof value === 'number'
          && row[field] <= value
        ))
      ));
      if (orderDirection === 'desc') {
        matches.sort((left, right) => Number(right.attemptOrdinal ?? 0) - Number(left.attemptOrdinal ?? 0));
      }
      return matches;
    };
    const result = {
      unique: async () => {
        const matches = selectRows();
        if (matches.length > 1) throw new Error(`Duplicate ${tableName} rows`);
        return matches[0] ?? null;
      },
      collect: async () => selectRows(),
      first: async () => selectRows()[0] ?? null,
      order: (direction: 'asc' | 'desc') => {
        orderDirection = direction;
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

type Producer = (ctx: MutationCtx, args: ReturnType<typeof makeInput>) => Promise<{
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
}>;
type Consumer = (ctx: MutationCtx, args: { learnerId: string; submissionId: string }) => Promise<Record<string, unknown>>;

async function loadProducer(): Promise<Producer> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic15LeastPolynomialDegreeWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export the Topic 1.5 least polynomial degree Worked producer.');
  }
  return mutation._handler as Producer;
}

async function loadConsumer(): Promise<Consumer> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/learningEvidence');
  const mutation = importedModule.submitTopic15LeastPolynomialDegreeWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export the Topic 1.5 least polynomial degree Worked evidence consumer.');
  }
  return mutation._handler as Consumer;
}

async function createStoredSubmission() {
  const producer = await loadProducer();
  const harness = createHarness();
  vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);
  const created = await producer(harness.ctx, makeInput());
  return { ...harness, created };
}

function expectNoEffects(harness: ReturnType<typeof createHarness>): void {
  expect(harness.rows.learning_evidence).toHaveLength(0);
  expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
  expect(harness.rows.srs_cards).toHaveLength(0);
  expect(harness.rows.srs_review_log).toHaveLength(0);
  expect(harness.rows.kst).toHaveLength(0);
  expect(harness.rows.mastery_effects).toHaveLength(0);
}

function expectNoAuthority(value: unknown): void {
  const forbidden = new Set([
    'masteryContractVersion', 'score', 'maxScore', 'feedback', 'gradedAt',
    'correctness', 'isCorrect', 'answer', 'answerKey', 'correctAnswer',
    'correctAnswers', 'expectedAnswer', 'grading', 'gradingMetadata',
    'normalizedAnswer', 'solution', 'solutions', 'solutionSteps', 'steps',
    'finalAnswer', 'authority',
  ]);
  const seen: string[] = [];
  const visit = (current: unknown) => {
    if (Array.isArray(current)) {
      current.forEach(visit);
    } else if (current && typeof current === 'object') {
      Object.entries(current).forEach(([key, nested]) => {
        if (forbidden.has(key)) seen.push(key);
        visit(nested);
      });
    }
  };
  visit(value);
  expect(seen).toEqual([]);
}

describe('Topic 1.5 least polynomial degree Worked evidence', () => {
  it('converts the seed-0 source review into one exact ungraded teacher exposure', async () => {
    const consumer = await loadConsumer();
    const harness = await createStoredSubmission();
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as SubmissionData;

    expect(generateTopic15LeastPolynomialDegreeOutput(0).expectedAnswer).toEqual(SOURCE_ANSWER);
    expect(Object.keys(storedData).sort()).toEqual([
      'activityId', 'answers', 'attemptNumber', 'contractVersion', 'mode',
      'parts', 'status', 'submittedAt',
    ]);
    expect(storedData).toEqual({
      contractVersion: 'practice.v1',
      activityId: WORKED_ID,
      mode: 'worked_example',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-08-30T12:00:00.000Z',
      answers: SOURCE_ANSWER,
      parts: [{ partId: 'leastDegree', rawAnswer: 5 }],
    });
    expect(stored.attemptOrdinal).toBe(1);
    expect(stored.submittedAt).toBe(SERVER_NOW);
    expect(stored.createdAt).toBe(SERVER_NOW);
    expect(stored.updatedAt).toBe(SERVER_NOW);
    expectNoAuthority(stored);

    await expect(consumer(harness.ctx, {
      learnerId: USER_ID,
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
    expect(harness.rows.learning_evidence).toStrictEqual([{
      _id: 'learning_evidence:1',
      learnerId: USER_ID,
      nodeId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
      activityId: WORKED_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: SERVER_NOW,
      gradedEvidence: undefined,
      idempotencyKey: `precalc:topic-1-5-least-polynomial-degree:teacher-led:submission:${harness.created.submissionId}`,
      createdAt: SERVER_NOW,
    }]);
    expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.srs_review_log).toHaveLength(0);
    expect(harness.rows.kst).toHaveLength(0);
    expect(harness.rows.mastery_effects).toHaveLength(0);
  });

  it('replays without duplicate evidence or secondary effects', async () => {
    const consumer = await loadConsumer();
    const harness = await createStoredSubmission();
    const input = { learnerId: USER_ID, submissionId: harness.created.submissionId };

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
    expect(harness.rows.kst).toHaveLength(0);
    expect(harness.rows.mastery_effects).toHaveLength(0);
  });

  it('rejects missing and foreign submissions without effects', async () => {
    const consumer = await loadConsumer();
    const missing = createHarness();
    await expect(consumer(missing.ctx, {
      learnerId: USER_ID,
      submissionId: 'activity_submissions:missing',
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expectNoEffects(missing);

    const stored = await createStoredSubmission();
    await expect(consumer(stored.ctx, {
      learnerId: OTHER_USER_ID,
      submissionId: stored.created.submissionId,
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expectNoEffects(stored);
  });

  it.each([
    ['stored physical activity ID', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.activityId = 'activities:wrong'; }],
    ['stored stable ID', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.stableActivityId = 'wrong.stable'; }],
    ['provisioned stable ID', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.stableActivityId = 'wrong.provisioned'; }],
    ['component key', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.componentKey = 'wrong-component'; }],
    ['non-record props', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = 'wrong'; }],
    ['wrong presentation mode', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = { presentationMode: 'guided_practice' }; }],
    ['non-record grading config', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = 'wrong'; }],
    ['extra grading config key', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).extra = true; }],
    ['wrong generator', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { generatorKey: 'wrong', variantSeed: 0 }; }],
    ['wrong seed', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).variantSeed = 1; }],
    ['fractional seed', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).variantSeed = 0.5; }],
    ['unsafe seed', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).variantSeed = Number.MAX_SAFE_INTEGER + 1; }],
    ['non-record submissionData', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submissionData = null; }],
    ['extra envelope field', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submissionData = { ...(harness.rows.activity_submissions[0]!.submissionData as SubmissionData), extra: true }; }],
    ['missing envelope field', (harness: ReturnType<typeof createHarness>) => { delete (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).status; }],
    ['wrong contract', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).contractVersion = 'practice.v0'; }],
    ['wrong envelope activity', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).activityId = 'wrong'; }],
    ['wrong mode', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).mode = 'guided_practice'; }],
    ['wrong status', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).status = 'graded'; }],
    ['missing envelope attempt', (harness: ReturnType<typeof createHarness>) => { delete (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).attemptNumber; }],
    ['envelope attempt type', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).attemptNumber = '1'; }],
    ['zero envelope attempt', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).attemptNumber = 0; }],
    ['fractional envelope attempt', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).attemptNumber = 1.5; }],
    ['unsafe envelope attempt', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).attemptNumber = Number.MAX_SAFE_INTEGER + 1; }],
    ['mismatched envelope attempt', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).attemptNumber = 2; }],
    ['missing row attempt', (harness: ReturnType<typeof createHarness>) => { delete harness.rows.activity_submissions[0]!.attemptOrdinal; }],
    ['row attempt type', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.attemptOrdinal = '1'; }],
    ['zero row attempt', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.attemptOrdinal = 0; }],
    ['fractional row attempt', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.attemptOrdinal = 1.5; }],
    ['unsafe row attempt', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.attemptOrdinal = Number.MAX_SAFE_INTEGER + 1; }],
    ['wrong type envelope time', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).submittedAt = 1; }],
    ['invalid envelope time', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).submittedAt = 'not-a-time'; }],
    ['noncanonical envelope time', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).submittedAt = '2026-08-30T12:00:00Z'; }],
    ['mismatched envelope time', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).submittedAt = new Date(SERVER_NOW + 1_000).toISOString(); }],
    ['missing row time', (harness: ReturnType<typeof createHarness>) => { delete harness.rows.activity_submissions[0]!.submittedAt; }],
    ['wrong type row time', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submittedAt = '1'; }],
    ['nonfinite row time', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submittedAt = Number.NaN; }],
    ['mismatched row time', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submittedAt = SERVER_NOW + 1_000; }],
    ['missing answers', (harness: ReturnType<typeof createHarness>) => { delete (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).answers; }],
    ['non-record answers', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).answers = null; }],
    ['extra answers key', (harness: ReturnType<typeof createHarness>) => { ((harness.rows.activity_submissions[0]!.submissionData as SubmissionData).answers as Record<string, unknown>).extra = true; }],
    ['wrong answer type', (harness: ReturnType<typeof createHarness>) => { ((harness.rows.activity_submissions[0]!.submissionData as SubmissionData).answers as Record<string, unknown>).leastDegree = '5'; }],
    ['fractional answer', (harness: ReturnType<typeof createHarness>) => { ((harness.rows.activity_submissions[0]!.submissionData as SubmissionData).answers as Record<string, unknown>).leastDegree = 4.5; }],
    ['unsafe answer', (harness: ReturnType<typeof createHarness>) => { ((harness.rows.activity_submissions[0]!.submissionData as SubmissionData).answers as Record<string, unknown>).leastDegree = Number.MAX_SAFE_INTEGER + 1; }],
    ['wrong source answer', (harness: ReturnType<typeof createHarness>) => { ((harness.rows.activity_submissions[0]!.submissionData as SubmissionData).answers as Record<string, unknown>).leastDegree = 4; }],
    ['missing parts', (harness: ReturnType<typeof createHarness>) => { delete (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts; }],
    ['non-array parts', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = null; }],
    ['empty parts', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = []; }],
    ['extra part item', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'leastDegree', rawAnswer: 5 }, { partId: 'leastDegree', rawAnswer: 5 }]; }],
    ['non-record part', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [null]; }],
    ['part extra key', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'leastDegree', rawAnswer: 5, extra: true }]; }],
    ['wrong part ID', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'other', rawAnswer: 5 }]; }],
    ['wrong raw part type', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'leastDegree', rawAnswer: '5' }]; }],
    ['fractional raw part', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'leastDegree', rawAnswer: 4.5 }]; }],
    ['unsafe raw part', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'leastDegree', rawAnswer: Number.MAX_SAFE_INTEGER + 1 }]; }],
    ['mismatched raw part', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'leastDegree', rawAnswer: 4 }]; }],
    ['missing createdAt', (harness: ReturnType<typeof createHarness>) => { delete harness.rows.activity_submissions[0]!.createdAt; }],
    ['nonfinite createdAt', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.createdAt = Number.NaN; }],
    ['mismatched createdAt', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.createdAt = SERVER_NOW - 1_000; }],
    ['missing updatedAt', (harness: ReturnType<typeof createHarness>) => { delete harness.rows.activity_submissions[0]!.updatedAt; }],
    ['nonfinite updatedAt', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.updatedAt = Number.NaN; }],
    ['mismatched updatedAt', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.updatedAt = SERVER_NOW - 1_000; }],
    ['forbidden top-level score', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.score = 0; }],
    ['forbidden top-level solutions', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.solutions = []; }],
  ] as const)('rejects %s stored integrity corruption without effects', async (_label, corrupt) => {
    const harness = await createStoredSubmission();
    corrupt(harness);
    const consumer = await loadConsumer();

    await expect(consumer(harness.ctx, {
      learnerId: USER_ID,
      submissionId: harness.created.submissionId,
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expectNoEffects(harness);
  });
});
