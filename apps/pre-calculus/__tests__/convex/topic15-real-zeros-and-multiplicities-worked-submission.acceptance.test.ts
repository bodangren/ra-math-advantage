import { describe, expect, it, vi } from 'vitest';

import { generateTopic15RealZerosAndMultiplicitiesOutput } from '@math-platform/math-content/knowledge-space';
import type { MutationCtx } from '@/convex/_generated/server';
import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const USER_ID = 'profiles:topic15-real-zeros-worked-learner';
const ACTIVITY_DOCUMENT_ID = 'activities:topic15-real-zeros-worked';
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
}> = {}) {
  return {
    userId: USER_ID,
    activityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
    idempotencyKey: 'topic15-real-zeros-worked-source-review',
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
      gradingConfig: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG,
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
  const mutation = importedModule.createTopic15RealZerosAndMultiplicitiesWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export the Topic 1.5 real zeros and multiplicities Worked producer.');
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

describe('Topic 1.5 real zeros and multiplicities Worked submission', () => {
  it('stores the exact live seed-0 source review as an ungraded row', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const liveExpected = generateTopic15RealZerosAndMultiplicitiesOutput(0).expectedAnswer;
    expect(liveExpected).toEqual(sourceAnswers());

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
      activityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
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
    expectNoAuthority(result);
  });

  it('increments the server ordinal for a new idempotency key', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const first = await handler(harness.ctx, makeInput());
    const second = await handler(harness.ctx, makeInput({
      idempotencyKey: 'topic15-real-zeros-worked-source-review-second',
    }));
    expect(first.attemptOrdinal).toBe(1);
    expect(second.attemptOrdinal).toBe(2);
    expect(harness.rows.activity_submissions).toHaveLength(2);
    expect(harness.rows.activity_submissions.map((row) => row.attemptOrdinal)).toEqual([1, 2]);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it('replays exact source requests and rejects changed same-key answers', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    const first = await handler(harness.ctx, makeInput());
    const identicalReplay = await handler(harness.ctx, makeInput());
    const advisoryReplay = await handler(harness.ctx, makeInput({
      submissionData: makeEnvelope(sourceAnswers(), {
        attemptNumber: 42,
        submittedAt: '2026-08-31T00:00:00.000Z',
      }),
    }));
    expect(identicalReplay).toStrictEqual(first);
    expect(advisoryReplay).toStrictEqual(first);
    const changedAnswers = sourceAnswers();
    changedAnswers.b = [{ zero: -2, multiplicity: 1 }, { zero: 3, multiplicity: 5 }];
    await expect(handler(harness.ctx, makeInput({
      submissionData: makeEnvelope(changedAnswers),
    }))).rejects.toThrow('idempotency_conflict');
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it.each([
    ['extra outer field', (envelope: SubmissionData) => ({ ...envelope, score: 1 })],
    ['missing outer field', (envelope: SubmissionData) => {
      const { status: _status, ...withoutStatus } = envelope;
      return withoutStatus;
    }],
    ['wrong activity', (envelope: SubmissionData) => ({ ...envelope, activityId: 'math.precalc.other.worked_example' })],
    ['wrong mode', (envelope: SubmissionData) => ({ ...envelope, mode: 'guided_practice' })],
    ['wrong status', (envelope: SubmissionData) => ({ ...envelope, status: 'graded' })],
    ['zero attempt', (envelope: SubmissionData) => ({ ...envelope, attemptNumber: 0 })],
    ['fractional attempt', (envelope: SubmissionData) => ({ ...envelope, attemptNumber: 1.5 })],
    ['non-number attempt', (envelope: SubmissionData) => ({ ...envelope, attemptNumber: '1' })],
    ['non-finite attempt', (envelope: SubmissionData) => ({ ...envelope, attemptNumber: Number.NaN })],
    ['invalid submitted time', (envelope: SubmissionData) => ({ ...envelope, submittedAt: 'not-a-time' })],
    ['non-string submitted time', (envelope: SubmissionData) => ({ ...envelope, submittedAt: 1 })],
    ['non-record answers', (envelope: SubmissionData) => ({ ...envelope, answers: null })],
    ['missing answer field', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { a: (envelope.answers as Record<string, unknown>).a },
    })],
    ['extra answer field', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), extra: [] },
    })],
    ['answer array too short', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), a: [{ zero: -1, multiplicity: 1 }] },
      parts: [
        { partId: 'a', rawAnswer: [{ zero: -1, multiplicity: 1 }] },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['answer array too long', (envelope: SubmissionData) => ({
      ...envelope,
      answers: {
        ...(envelope.answers as Record<string, unknown>),
        a: [...((envelope.answers as Record<string, unknown>).a as unknown[]), { zero: 7, multiplicity: 1 }],
      },
      parts: [
        {
          partId: 'a',
          rawAnswer: [...((envelope.answers as Record<string, unknown>).a as unknown[]), { zero: 7, multiplicity: 1 }],
        },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['duplicate answer pair', (envelope: SubmissionData) => ({
      ...envelope,
      answers: {
        ...(envelope.answers as Record<string, unknown>),
        a: [{ zero: -1, multiplicity: 1 }, { zero: -1, multiplicity: 1 }, { zero: 4, multiplicity: 2 }],
      },
      parts: [
        { partId: 'a', rawAnswer: [{ zero: -1, multiplicity: 1 }, { zero: -1, multiplicity: 1 }, { zero: 4, multiplicity: 2 }] },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['reordered answer pairs', (envelope: SubmissionData) => ({
      ...envelope,
      answers: {
        ...(envelope.answers as Record<string, unknown>),
        a: [{ zero: 0, multiplicity: 3 }, { zero: -1, multiplicity: 1 }, { zero: 4, multiplicity: 2 }],
      },
      parts: [
        { partId: 'a', rawAnswer: [{ zero: 0, multiplicity: 3 }, { zero: -1, multiplicity: 1 }, { zero: 4, multiplicity: 2 }] },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['non-record pair', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), a: [null, { zero: 0, multiplicity: 3 }] },
      parts: [
        { partId: 'a', rawAnswer: [null, { zero: 0, multiplicity: 3 }] },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['missing pair field', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), a: [{ zero: -1 }, { zero: 0, multiplicity: 3 }] },
      parts: [
        { partId: 'a', rawAnswer: [{ zero: -1 }, { zero: 0, multiplicity: 3 }] },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['extra pair field', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), a: [{ zero: -1, multiplicity: 1, answer: true }, { zero: 0, multiplicity: 3 }] },
      parts: [
        { partId: 'a', rawAnswer: [{ zero: -1, multiplicity: 1, answer: true }, { zero: 0, multiplicity: 3 }] },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['non-number zero', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), a: [{ zero: '-1', multiplicity: 1 }, { zero: 0, multiplicity: 3 }] },
      parts: [
        { partId: 'a', rawAnswer: [{ zero: '-1', multiplicity: 1 }, { zero: 0, multiplicity: 3 }] },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['non-finite zero', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), a: [{ zero: Number.POSITIVE_INFINITY, multiplicity: 1 }, { zero: 0, multiplicity: 3 }] },
      parts: [
        { partId: 'a', rawAnswer: [{ zero: Number.POSITIVE_INFINITY, multiplicity: 1 }, { zero: 0, multiplicity: 3 }] },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['non-number multiplicity', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), a: [{ zero: -1, multiplicity: '1' }, { zero: 0, multiplicity: 3 }] },
      parts: [
        { partId: 'a', rawAnswer: [{ zero: -1, multiplicity: '1' }, { zero: 0, multiplicity: 3 }] },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['non-finite multiplicity', (envelope: SubmissionData) => ({
      ...envelope,
      answers: { ...(envelope.answers as Record<string, unknown>), a: [{ zero: -1, multiplicity: Number.NaN }, { zero: 0, multiplicity: 3 }] },
      parts: [
        { partId: 'a', rawAnswer: [{ zero: -1, multiplicity: Number.NaN }, { zero: 0, multiplicity: 3 }] },
        ...(envelope.parts as Array<Record<string, unknown>>).slice(1),
      ],
    })],
    ['non-array parts', (envelope: SubmissionData) => ({ ...envelope, parts: null })],
    ['missing part', (envelope: SubmissionData) => ({ ...envelope, parts: (envelope.parts as Array<Record<string, unknown>>).slice(0, 1) })],
    ['extra part', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [...(envelope.parts as Array<Record<string, unknown>>), { partId: 'other', rawAnswer: [] }],
    })],
    ['non-record part', (envelope: SubmissionData) => ({ ...envelope, parts: [null, ...(envelope.parts as Array<Record<string, unknown>>).slice(1)] })],
    ['missing part field', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [{ rawAnswer: (envelope.parts as Array<Record<string, unknown>>)[0]!.rawAnswer }, ...(envelope.parts as Array<Record<string, unknown>>).slice(1)],
    })],
    ['extra part field', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [{ ...(envelope.parts as Array<Record<string, unknown>>)[0], extra: true }, ...(envelope.parts as Array<Record<string, unknown>>).slice(1)],
    })],
    ['duplicate parts', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [(envelope.parts as Array<Record<string, unknown>>)[0], (envelope.parts as Array<Record<string, unknown>>)[0]],
    })],
    ['reordered parts', (envelope: SubmissionData) => ({ ...envelope, parts: [...(envelope.parts as Array<Record<string, unknown>>)].reverse() })],
    ['mismatched part id', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [{ partId: 'other', rawAnswer: (envelope.parts as Array<Record<string, unknown>>)[0]!.rawAnswer }, ...(envelope.parts as Array<Record<string, unknown>>).slice(1)],
    })],
    ['mismatched raw part', (envelope: SubmissionData) => ({
      ...envelope,
      parts: [{ partId: 'a', rawAnswer: (envelope.answers as Record<string, unknown>).b }, ...(envelope.parts as Array<Record<string, unknown>>).slice(1)],
    })],
    ['wrong source values', (_envelope: SubmissionData) => {
      const answers = sourceAnswers();
      answers.a = [{ zero: -1, multiplicity: 1 }, { zero: 0, multiplicity: 4 }, { zero: 4, multiplicity: 2 }];
      return makeEnvelope(answers);
    }],
  ] as const)('rejects %s before persistence', async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(handler(harness.ctx, makeInput({
      idempotencyKey: `topic15-invalid-${_label.replaceAll(' ', '-')}`,
      submissionData: mutate(makeEnvelope()),
    }))).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it('rejects a blank idempotency key before persistence', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    await expect(handler(harness.ctx, makeInput({ idempotencyKey: '   ' }))).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it.each([
    ['missing activity', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities = []; }],
    ['duplicate activity', (harness: ReturnType<typeof createHarness>) => {
      harness.rows.activities.push({ ...harness.rows.activities[0]! });
    }],
    ['wrong stable activity', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.stableActivityId = 'math.precalc.other.worked_example'; }],
    ['wrong component', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.componentKey = 'real-zeros-other'; }],
    ['non-record props', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = null; }],
    ['wrong presentation mode', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.props = { presentationMode: 'independent_practice' }; }],
    ['non-record grading config', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = null; }],
    ['wrong generator', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { generatorKey: 'topic15-other', variantSeed: 0 }; }],
    ['wrong seed', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { generatorKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY, variantSeed: 1 }; }],
    ['non-integer seed', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { ...PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG, variantSeed: 0.5 }; }],
    ['extra grading config', (harness: ReturnType<typeof createHarness>) => { harness.rows.activities[0]!.gradingConfig = { ...PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG, extra: true }; }],
  ] as const)('rejects %s provisioning before persistence', async (_label, mutate) => {
    const handler = await loadHandler();
    const harness = createHarness();
    mutate(harness);
    await expect(handler(harness.ctx, makeInput({
      idempotencyKey: `topic15-provisioning-${_label.replaceAll(' ', '-')}`,
    }))).rejects.toThrow();
    expect(harness.rows.activity_submissions).toHaveLength(0);
    expect(harness.rows.learning_evidence).toHaveLength(0);
  });

  it.each([
    ['stored activity document', (row: Row) => { row.activityId = 'activities:other'; }],
    ['stored stable activity', (row: Row) => { row.stableActivityId = 'math.precalc.other.worked_example'; }],
    ['non-record submission data', (row: Row) => { row.submissionData = null; }],
    ['missing envelope field', (row: Row) => { delete (row.submissionData as SubmissionData).status; }],
    ['extra envelope field', (row: Row) => { (row.submissionData as SubmissionData).extra = true; }],
    ['wrong envelope contract', (row: Row) => { (row.submissionData as SubmissionData).contractVersion = 'practice.v0'; }],
    ['wrong envelope activity', (row: Row) => { (row.submissionData as SubmissionData).activityId = 'math.precalc.other.worked_example'; }],
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
    ['extra answers', (row: Row) => { ((row.submissionData as SubmissionData).answers as Record<string, unknown>).extra = []; }],
    ['changed answer', (row: Row) => { ((row.submissionData as SubmissionData).answers as Record<string, unknown>).a = sourceAnswers().b; }],
    ['non-record answers', (row: Row) => { (row.submissionData as SubmissionData).answers = null; }],
    ['non-array answer', (row: Row) => { ((row.submissionData as SubmissionData).answers as Record<string, unknown>).a = null; }],
    ['non-record stored pair', (row: Row) => {
      ((row.submissionData as SubmissionData).answers as Record<string, unknown>).a = [null, { zero: 0, multiplicity: 3 }];
    }],
    ['missing stored pair field', (row: Row) => {
      ((row.submissionData as SubmissionData).answers as Record<string, unknown>).a = [{ zero: -1 }, { zero: 0, multiplicity: 3 }, { zero: 4, multiplicity: 2 }];
    }],
    ['extra stored pair field', (row: Row) => {
      ((row.submissionData as SubmissionData).answers as Record<string, unknown>).a = [{ zero: -1, multiplicity: 1, extra: true }, { zero: 0, multiplicity: 3 }, { zero: 4, multiplicity: 2 }];
    }],
    ['reordered stored answer pairs', (row: Row) => {
      ((row.submissionData as SubmissionData).answers as Record<string, unknown>).a = [{ zero: 0, multiplicity: 3 }, { zero: -1, multiplicity: 1 }, { zero: 4, multiplicity: 2 }];
    }],
    ['changed stored pair', (row: Row) => {
      ((row.submissionData as SubmissionData).answers as Record<string, unknown>).a = [{ zero: -1, multiplicity: 1 }, { zero: 0, multiplicity: 4 }, { zero: 4, multiplicity: 2 }];
    }],
    ['non-array parts', (row: Row) => { (row.submissionData as SubmissionData).parts = null; }],
    ['missing part', (row: Row) => {
      (row.submissionData as SubmissionData).parts = [((row.submissionData as SubmissionData).parts as Array<unknown>)[0]];
    }],
    ['extra part', (row: Row) => {
      (row.submissionData as SubmissionData).parts = [
        ...((row.submissionData as SubmissionData).parts as Array<unknown>),
        { partId: 'other', rawAnswer: sourceAnswers().a },
      ];
    }],
    ['non-record part', (row: Row) => {
      (row.submissionData as SubmissionData).parts = [null, ...((row.submissionData as SubmissionData).parts as Array<unknown>).slice(1)];
    }],
    ['missing part field', (row: Row) => {
      const parts = (row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>;
      parts[0] = { rawAnswer: parts[0]!.rawAnswer };
    }],
    ['extra part field', (row: Row) => {
      const parts = (row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>;
      parts[0] = { ...parts[0], extra: true };
    }],
    ['reordered parts', (row: Row) => {
      (row.submissionData as SubmissionData).parts = [...((row.submissionData as SubmissionData).parts as Array<unknown>)].reverse();
    }],
    ['duplicate parts', (row: Row) => {
      const parts = (row.submissionData as SubmissionData).parts as Array<unknown>;
      (row.submissionData as SubmissionData).parts = [parts[0], parts[0]];
    }],
    ['mismatched part id', (row: Row) => {
      const parts = (row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>;
      parts[0] = { ...parts[0], partId: 'other' };
    }],
    ['mismatched raw part', (row: Row) => {
      const parts = (row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>;
      parts[0] = { ...parts[0], rawAnswer: sourceAnswers().b };
    }],
    ['malformed raw pair', (row: Row) => {
      const parts = (row.submissionData as SubmissionData).parts as Array<Record<string, unknown>>;
      parts[0] = { ...parts[0], rawAnswer: [null, { zero: 0, multiplicity: 3 }] };
    }],
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
