import { describe, expect, it, vi } from 'vitest';

import { generateTopic15RealZerosAndMultiplicitiesOutput } from '@math-platform/math-content/knowledge-space';

import type { MutationCtx } from '@/convex/_generated/server';
import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const USER_ID = 'profiles:topic15-real-zeros-worked-evidence-learner';
const OTHER_USER_ID = 'profiles:topic15-real-zeros-worked-evidence-other';
const ACTIVITY_DOCUMENT_ID = 'activities:topic15-real-zeros-worked-evidence';
const CLIENT_SUBMITTED_AT = '2026-08-30T00:00:00.000Z';
const PART_IDS = ['a', 'b'] as const;
type PartId = (typeof PART_IDS)[number];
type Pair = { zero: number; multiplicity: number };
type SubmissionData = Record<string, unknown>;
type Row = Record<string, unknown> & { _id: string };

function sourceAnswers(): Record<PartId, Pair[]> {
  return {
    a: [
      { zero: -1, multiplicity: 1 },
      { zero: 0, multiplicity: 3 },
      { zero: 4, multiplicity: 2 },
    ],
    b: [
      { zero: -2, multiplicity: 1 },
      { zero: 2, multiplicity: 5 },
    ],
  };
}

function makeEnvelope(
  answers: Record<string, unknown> = sourceAnswers(),
  overrides: Record<string, unknown> = {},
): SubmissionData {
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
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
  userId: string;
}> = {}) {
  return {
    userId: USER_ID,
    activityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
    idempotencyKey: 'topic15-real-zeros-worked-evidence-create-1',
    submissionData: makeEnvelope(),
    ...overrides,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [{
      _id: ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
      props: { presentationMode: 'worked_example' },
      gradingConfig: { ...PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG },
    }],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
    kst: [],
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
  const mutation = importedModule.createTopic15RealZerosAndMultiplicitiesWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export the Topic 1.5 real zeros and multiplicities Worked producer.');
  }
  return mutation._handler as Producer;
}

async function loadConsumer(): Promise<Consumer> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/learningEvidence');
  const mutation = importedModule.submitTopic15RealZerosAndMultiplicitiesWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export the Topic 1.5 real zeros and multiplicities Worked evidence consumer.');
  }
  return mutation._handler as Consumer;
}

async function createStoredSubmission() {
  const producer = await loadProducer();
  const harness = createHarness();
  const created = await producer(harness.ctx, makeInput());
  return { ...harness, created };
}

function expectNoEffects(harness: ReturnType<typeof createHarness>): void {
  expect(harness.rows.learning_evidence).toHaveLength(0);
  expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
  expect(harness.rows.srs_cards).toHaveLength(0);
  expect(harness.rows.srs_review_log).toHaveLength(0);
  expect(harness.rows.kst).toHaveLength(0);
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

describe('Topic 1.5 real zeros and multiplicities Worked evidence', () => {
  it('converts the real seed-0 source review into one exact ungraded teacher exposure', async () => {
    const consumer = await loadConsumer();
    const harness = await createStoredSubmission();
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as SubmissionData;

    expect(generateTopic15RealZerosAndMultiplicitiesOutput(0).expectedAnswer).toEqual(sourceAnswers());
    expect(Object.keys(storedData).sort()).toEqual([
      'activityId', 'answers', 'attemptNumber', 'contractVersion', 'mode',
      'parts', 'status', 'submittedAt',
    ]);
    expect(storedData.answers).toEqual(sourceAnswers());
    expect(storedData.parts).toEqual(PART_IDS.map((partId) => ({
      partId,
      rawAnswer: sourceAnswers()[partId],
    })));
    expect(stored.attemptOrdinal).toBe(1);
    expect(stored.submittedAt).toBe(Date.parse(storedData.submittedAt as string));
    expect(stored.submittedAt).not.toBe(Date.parse(CLIENT_SUBMITTED_AT));
    expect(stored.createdAt).toBe(stored.submittedAt);
    expect(stored.updatedAt).toBe(stored.submittedAt);
    expect(Object.keys(stored).sort()).toEqual([
      '_id', 'activityId', 'attemptOrdinal', 'createIdempotencyKey', 'createdAt',
      'stableActivityId', 'submissionData', 'submittedAt', 'updatedAt', 'userId',
    ]);
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
    expect(harness.rows.learning_evidence).toHaveLength(1);
    expect(harness.rows.learning_evidence).toStrictEqual([{
      _id: 'learning_evidence:1',
      learnerId: USER_ID,
      nodeId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
      activityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: stored.submittedAt,
      gradedEvidence: undefined,
      idempotencyKey: `precalc:topic-1-5-real-zeros-and-multiplicities:teacher-led:submission:${harness.created.submissionId}`,
      createdAt: expect.any(Number),
    }]);
    expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.srs_review_log).toHaveLength(0);
    expect(harness.rows.kst).toHaveLength(0);
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
    ['stored user', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.userId = OTHER_USER_ID; }],
    ['wrong activity document', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.activityId = 'activities:wrong'; }],
    ['wrong row stable ID', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.stableActivityId = 'wrong.stable'; }],
    ['wrong provisioned stable ID', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.stableActivityId = 'wrong.provisioned'; }],
    ['wrong component', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.componentKey = 'wrong-component'; }],
    ['non-record props', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = 'wrong'; }],
    ['wrong props mode', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = { presentationMode: 'guided_practice' }; }],
    ['non-record grading config', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = 'wrong'; }],
    ['wrong generator', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { generatorKey: 'wrong', variantSeed: 0 }; }],
    ['extra grading config', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).extra = true; }],
    ['wrong seed', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).variantSeed = 1; }],
    ['non-integer seed', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activities[0]!.gradingConfig as Record<string, unknown>).variantSeed = 0.5; }],
    ['non-record submission data', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submissionData = null; }],
    ['extra envelope field', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).extra = true; }],
    ['missing envelope field', (harness: ReturnType<typeof createHarness>) => { delete (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).status; }],
    ['wrong contract', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).contractVersion = 'practice.v0'; }],
    ['wrong envelope activity', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).activityId = 'wrong'; }],
    ['wrong mode', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).mode = 'guided_practice'; }],
    ['wrong status', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).status = 'graded'; }],
    ['missing envelope attempt', (harness: ReturnType<typeof createHarness>) => { delete (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).attemptNumber; }],
    ['envelope attempt type', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).attemptNumber = '1'; }],
    ['zero envelope attempt', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).attemptNumber = 0; }],
    ['fractional envelope attempt', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).attemptNumber = 1.5; }],
    ['mismatched envelope attempt', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).attemptNumber = 2; }],
    ['missing stored ordinal', (harness: ReturnType<typeof createHarness>) => { delete harness.rows.activity_submissions[0]!.attemptOrdinal; }],
    ['stored ordinal type', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.attemptOrdinal = '1'; }],
    ['zero stored ordinal', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.attemptOrdinal = 0; }],
    ['fractional stored ordinal', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.attemptOrdinal = 1.5; }],
    ['non-string envelope time', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).submittedAt = 1; }],
    ['invalid envelope time', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).submittedAt = 'not-a-time'; }],
    ['non-canonical envelope time', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).submittedAt = '2026-08-30'; }],
    ['mismatched envelope time', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).submittedAt = '2026-08-30T00:00:00.001Z'; }],
    ['missing stored time', (harness: ReturnType<typeof createHarness>) => { delete harness.rows.activity_submissions[0]!.submittedAt; }],
    ['stored time type', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submittedAt = '1'; }],
    ['non-finite stored time', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submittedAt = Number.NaN; }],
    ['mismatched stored time', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.submittedAt = Number(harness.rows.activity_submissions[0]!.submittedAt) + 1; }],
    ['missing answers', (harness: ReturnType<typeof createHarness>) => { delete (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).answers; }],
    ['extra answers', (harness: ReturnType<typeof createHarness>) => { ((harness.rows.activity_submissions[0]!.submissionData as SubmissionData).answers as Record<string, unknown>).extra = []; }],
    ['non-record answers', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).answers = null; }],
    ['missing answer a', (harness: ReturnType<typeof createHarness>) => { ((harness.rows.activity_submissions[0]!.submissionData as SubmissionData).answers as Record<string, unknown>).a = undefined; }],
    ['non-array answer', (harness: ReturnType<typeof createHarness>) => { ((harness.rows.activity_submissions[0]!.submissionData as SubmissionData).answers as Record<string, unknown>).a = null; }],
    ['wrong source answer', (harness: ReturnType<typeof createHarness>) => { const data = harness.rows.activity_submissions[0]!.submissionData as SubmissionData; const answers = { ...sourceAnswers(), b: [{ zero: -2, multiplicity: 2 }, { zero: 2, multiplicity: 5 }] }; data.answers = answers; data.parts = PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })); }],
    ['reordered source pairs', (harness: ReturnType<typeof createHarness>) => { const data = harness.rows.activity_submissions[0]!.submissionData as SubmissionData; const answers = { ...sourceAnswers(), a: [...sourceAnswers().a].reverse() }; data.answers = answers; data.parts = PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })); }],
    ['changed pair', (harness: ReturnType<typeof createHarness>) => { const answers = { ...sourceAnswers(), a: [{ zero: -1, multiplicity: 2 }, ...sourceAnswers().a.slice(1)] }; const data = harness.rows.activity_submissions[0]!.submissionData as SubmissionData; data.answers = answers; data.parts = PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })); }],
    ['non-record pair', (harness: ReturnType<typeof createHarness>) => { const data = harness.rows.activity_submissions[0]!.submissionData as SubmissionData; const answers = { ...sourceAnswers(), a: [null, ...sourceAnswers().a.slice(1)] }; data.answers = answers; data.parts = PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })); }],
    ['missing pair field', (harness: ReturnType<typeof createHarness>) => { const data = harness.rows.activity_submissions[0]!.submissionData as SubmissionData; const answers = { ...sourceAnswers(), a: [{ zero: -1 }, ...sourceAnswers().a.slice(1)] }; data.answers = answers; data.parts = PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })); }],
    ['extra pair field', (harness: ReturnType<typeof createHarness>) => { const data = harness.rows.activity_submissions[0]!.submissionData as SubmissionData; const answers = { ...sourceAnswers(), a: [{ ...sourceAnswers().a[0], extra: true }, ...sourceAnswers().a.slice(1)] }; data.answers = answers; data.parts = PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })); }],
    ['non-finite pair value', (harness: ReturnType<typeof createHarness>) => { const data = harness.rows.activity_submissions[0]!.submissionData as SubmissionData; const answers = { ...sourceAnswers(), a: [{ zero: Number.NaN, multiplicity: 1 }, ...sourceAnswers().a.slice(1)] }; data.answers = answers; data.parts = PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })); }],
    ['non-array parts', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = null; }],
    ['missing part', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'a', rawAnswer: sourceAnswers().a }]; }],
    ['extra part', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [...(makeEnvelope().parts as unknown[]), { partId: 'other', rawAnswer: [] }]; }],
    ['non-record part', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [null, { partId: 'b', rawAnswer: sourceAnswers().b }]; }],
    ['missing part field', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ rawAnswer: sourceAnswers().a }, { partId: 'b', rawAnswer: sourceAnswers().b }]; }],
    ['extra part field', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'a', rawAnswer: sourceAnswers().a, extra: true }, { partId: 'b', rawAnswer: sourceAnswers().b }]; }],
    ['reordered parts', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'b', rawAnswer: sourceAnswers().b }, { partId: 'a', rawAnswer: sourceAnswers().a }]; }],
    ['duplicate parts', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'a', rawAnswer: sourceAnswers().a }, { partId: 'a', rawAnswer: sourceAnswers().a }]; }],
    ['mismatched part ID', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'other', rawAnswer: sourceAnswers().a }, { partId: 'b', rawAnswer: sourceAnswers().b }]; }],
    ['mismatched raw part', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'a', rawAnswer: sourceAnswers().b }, { partId: 'b', rawAnswer: sourceAnswers().b }]; }],
    ['malformed raw pair', (harness: ReturnType<typeof createHarness>) => { (harness.rows.activity_submissions[0]!.submissionData as SubmissionData).parts = [{ partId: 'a', rawAnswer: [null, ...sourceAnswers().a.slice(1)] }, { partId: 'b', rawAnswer: sourceAnswers().b }]; }],
    ['created time type', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.createdAt = '1'; }],
    ['missing created time', (harness: ReturnType<typeof createHarness>) => { delete harness.rows.activity_submissions[0]!.createdAt; }],
    ['non-finite created time', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.createdAt = Number.POSITIVE_INFINITY; }],
    ['mismatched created time', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.createdAt = Number(harness.rows.activity_submissions[0]!.submittedAt) + 1; }],
    ['updated time type', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.updatedAt = '1'; }],
    ['missing updated time', (harness: ReturnType<typeof createHarness>) => { delete harness.rows.activity_submissions[0]!.updatedAt; }],
    ['non-finite updated time', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.updatedAt = Number.POSITIVE_INFINITY; }],
    ['mismatched updated time', (harness: ReturnType<typeof createHarness>) => { harness.rows.activity_submissions[0]!.updatedAt = Number(harness.rows.activity_submissions[0]!.submittedAt) + 1; }],
    ...[
      'masteryContractVersion', 'score', 'maxScore', 'feedback', 'gradedAt',
      'correctness', 'isCorrect', 'answer', 'answerKey', 'correctAnswer',
      'correctAnswers', 'expectedAnswer', 'grading', 'gradingMetadata',
      'normalizedAnswer', 'solution', 'solutions', 'solutionSteps', 'steps',
      'finalAnswer', 'authority',
    ].map((field) => [field, (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activity_submissions[0]![field] = 'forged';
    }] as const),
  ] as const)('rejects observable corruption: %s without effects', async (_label, corrupt) => {
    const consumer = await loadConsumer();
    const harness = await createStoredSubmission();
    corrupt(harness);
    await expect(consumer(harness.ctx, {
      learnerId: USER_ID,
      submissionId: harness.created.submissionId,
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expectNoEffects(harness);
  });
});
