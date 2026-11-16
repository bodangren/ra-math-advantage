import { afterEach, describe, expect, it, vi } from 'vitest';

import { generateTopic16EquationEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';
import { polynomialEquationEndBehaviorSchema } from '@math-platform/math-content/schemas';
import type { MutationCtx } from '@/convex/_generated/server';
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const USER_ID = 'profiles:topic16-equation-end-behavior-worked-learner';
const OTHER_USER_ID = `${USER_ID}-other`;
const ACTIVITY_DOCUMENT_ID = 'activities:topic16-equation-end-behavior-worked';
const CLIENT_SUBMITTED_AT = '2026-08-30T00:00:00.000Z';
const SERVER_NOW = Date.parse('2026-08-30T12:00:00.000Z');
const SERVER_SUBMITTED_AT = '2026-08-30T12:00:00.000Z';
const WORKED_ID = PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID;
const PART_IDS = [
  'a_leftEnd',
  'a_rightEnd',
  'b_leftEnd',
  'b_rightEnd',
  'c_leftEnd',
  'c_rightEnd',
  'd_leftEnd',
  'd_rightEnd',
  'e_leftEnd',
  'e_rightEnd',
  'f_leftEnd',
  'f_rightEnd',
] as const;
const SOURCE_OUTPUT = generateTopic16EquationEndBehaviorOutput(0);
const SOURCE_ANSWERS = SOURCE_OUTPUT.expectedAnswer as Record<string, unknown>;
const SOURCE_PARTS = PART_IDS.map((partId) => ({
  partId,
  rawAnswer: SOURCE_ANSWERS[partId],
}));
const SOURCE_PUBLIC_PROPS = SOURCE_OUTPUT.data.rendererProps as Record<string, unknown>;
const WORKED_PROPS = {
  ...SOURCE_PUBLIC_PROPS,
  presentationMode: 'worked_example',
  correctAnswers: SOURCE_OUTPUT.expectedAnswer,
  steps: SOURCE_OUTPUT.solutionSteps.map((step) => step.description),
  finalAnswer: 'The six polynomial end behaviors are shown above.',
};

type SubmissionData = Record<string, unknown>;
type StoredPart = Record<string, unknown>;
type Row = Record<string, unknown> & { _id: string };
type Input = {
  userId: string;
  activityId: string;
  idempotencyKey: string;
  submissionData: SubmissionData;
};

function makeEnvelope(
  answers: Record<string, unknown> = SOURCE_ANSWERS,
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
    parts: PART_IDS.map((partId) => ({
      partId,
      rawAnswer: answers[partId],
    })),
    ...overrides,
  };
}

function makeInput(overrides: Partial<Input> = {}): Input {
  return {
    userId: USER_ID,
    activityId: WORKED_ID,
    idempotencyKey: 'topic16-equation-end-behavior-worked-source-review',
    submissionData: makeEnvelope(),
    ...overrides,
  };
}

function withEnvelope(input: Input, mutate: (data: SubmissionData) => void): Input {
  const submissionData = { ...input.submissionData };
  mutate(submissionData);
  return { ...input, submissionData };
}

function withAnswers(input: Input, mutate: (answers: Record<string, unknown>) => void): Input {
  return withEnvelope(input, (data) => {
    const answers = { ...(data.answers as Record<string, unknown>) };
    mutate(answers);
    data.answers = answers;
    data.parts = PART_IDS.map((partId) => ({
      partId,
      rawAnswer: answers[partId],
    }));
  });
}

function withParts(input: Input, mutate: (parts: StoredPart[]) => void): Input {
  return withEnvelope(input, (data) => {
    const parts = [...(data.parts as StoredPart[])];
    mutate(parts);
    data.parts = parts;
  });
}

function makePriorRow(
  attemptOrdinal: unknown,
  createIdempotencyKey = 'prior-key',
): Row {
  const row: Row = {
    _id: `activity_submissions:prior-${String(attemptOrdinal)}`,
    userId: USER_ID,
    activityId: ACTIVITY_DOCUMENT_ID,
    stableActivityId: WORKED_ID,
    createIdempotencyKey,
    submissionData: makeEnvelope(),
    submittedAt: SERVER_NOW - 1_000,
    createdAt: SERVER_NOW - 1_000,
    updatedAt: SERVER_NOW - 1_000,
  };
  if (attemptOrdinal !== undefined) row.attemptOrdinal = attemptOrdinal;
  return row;
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [{
      _id: ACTIVITY_DOCUMENT_ID,
      stableActivityId: WORKED_ID,
      componentKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
      props: WORKED_PROPS,
      gradingConfig: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG,
    }],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    kst_states: [],
    srs_cards: [],
  };
  const indexCalls: Array<{
    tableName: string;
    indexName: string;
    conditions: ReadonlyMap<string, unknown>;
  }> = [];

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
          withIndex: (indexName: string, configure: (query: typeof index) => unknown) => {
            configure(index);
            indexCalls.push({ tableName, indexName, conditions: new Map(conditions) });
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

  return { ctx, indexCalls, rows };
}

type Harness = ReturnType<typeof createHarness>;

async function loadHandler() {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic16EquationEndBehaviorWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('AP Precalculus must export the Topic 1.6 equation end behavior Worked producer.');
  }
  return mutation._handler as (ctx: MutationCtx, args: Input) => Promise<{
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
  'score',
  'maxScore',
  'feedback',
  'gradedAt',
  'masteryContractVersion',
  'evidence',
  'kst',
  'srs',
  'answer',
  'answerKey',
  'correctAnswer',
  'correctAnswers',
  'expectedAnswer',
  'grading',
  'gradingMetadata',
  'normalizedAnswer',
  'solution',
  'solutionSteps',
  'steps',
  'finalAnswer',
  'authority',
]);

function expectNoForbiddenFields(value: unknown): void {
  expect(collectKeys(value).filter((key) => FORBIDDEN_KEYS.has(key))).toEqual([]);
}

function expectNoWrites(harness: Harness, submissionCount: number): void {
  expect(harness.rows.activity_submissions).toHaveLength(submissionCount);
  expect(harness.rows.learning_evidence).toHaveLength(0);
  expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
  expect(harness.rows.kst_states).toHaveLength(0);
  expect(harness.rows.srs_cards).toHaveLength(0);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Topic 1.6 equation-end-behavior Worked submission', () => {
  it('stores the exact seed-0 source review as an ungraded first write', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);

    expect(SOURCE_OUTPUT.expectedAnswer).toEqual({
      a_leftEnd: 'down',
      a_rightEnd: 'up',
      b_leftEnd: 'up',
      b_rightEnd: 'up',
      c_leftEnd: 'down',
      c_rightEnd: 'down',
      d_leftEnd: 'up',
      d_rightEnd: 'down',
      e_leftEnd: 'up',
      e_rightEnd: 'down',
      f_leftEnd: 'up',
      f_rightEnd: 'down',
    });
    expect(polynomialEquationEndBehaviorSchema.safeParse(WORKED_PROPS).success).toBe(true);

    const result = await handler(harness.ctx, makeInput());
    const stored = harness.rows.activity_submissions[0]!;
    const storedData = stored.submissionData as SubmissionData;
    expect(result).toEqual({
      submissionId: stored._id,
      attemptOrdinal: 1,
      submittedAt: SERVER_SUBMITTED_AT,
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
    expect(Object.keys(storedData).sort()).toEqual([
      'activityId',
      'answers',
      'attemptNumber',
      'contractVersion',
      'mode',
      'parts',
      'status',
      'submittedAt',
    ]);
    expect(Object.keys(storedData.answers as Record<string, unknown>).sort()).toEqual([...PART_IDS].sort());
    expect((storedData.parts as StoredPart[]).map((part) => Object.keys(part).sort())).toEqual(
      PART_IDS.map(() => ['partId', 'rawAnswer']),
    );
    expect(stored.userId).toBe(USER_ID);
    expect(stored.activityId).toBe(ACTIVITY_DOCUMENT_ID);
    expect(stored.stableActivityId).toBe(WORKED_ID);
    expect(stored.createIdempotencyKey).toBe(makeInput().idempotencyKey);
    expect(storedData).toEqual({
      contractVersion: 'practice.v1',
      activityId: WORKED_ID,
      mode: 'worked_example',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: SERVER_SUBMITTED_AT,
      answers: SOURCE_ANSWERS,
      parts: SOURCE_PARTS,
    });
    expect(stored.submittedAt).toBe(SERVER_NOW);
    expect(stored.createdAt).toBe(SERVER_NOW);
    expect(stored.updatedAt).toBe(SERVER_NOW);
    expect(storedData.submittedAt).not.toBe(CLIENT_SUBMITTED_AT);
    expectNoForbiddenFields(stored);
    expectNoForbiddenFields(result);
    expectNoWrites(harness, 1);
    expect(harness.indexCalls.map(({ tableName, indexName }) => `${tableName}:${indexName}`)).toEqual([
      'activities:by_stable_activity_id',
      'activity_submissions:by_user_and_create_idempotency_key',
      'activity_submissions:by_user_and_activity_and_attempt_ordinal',
    ]);
  });

  it('uses the latest ordinal for a different create key', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    harness.rows.activity_submissions.push(makePriorRow(4));
    vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);

    const result = await handler(harness.ctx, makeInput({ idempotencyKey: 'new-key' }));
    expect(result).toEqual({
      submissionId: 'activity_submissions:2',
      attemptOrdinal: 5,
      submittedAt: SERVER_SUBMITTED_AT,
    });
    expectNoWrites(harness, 2);
  });

  it('replays an exact stored source row without a latest lookup or write', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);
    const first = await handler(harness.ctx, makeInput());
    const replayStart = harness.indexCalls.length;
    let replayResult: unknown;
    try {
      replayResult = await handler(harness.ctx, makeInput());
    } catch (error) {
      replayResult = error;
    }

    expect(replayResult).toEqual(first);
    expect(harness.indexCalls.slice(replayStart).map(({ tableName, indexName }) => `${tableName}:${indexName}`)).toEqual([
      'activities:by_stable_activity_id',
      'activity_submissions:by_user_and_create_idempotency_key',
    ]);
    expectNoWrites(harness, 1);

    const advisoryReplay = await handler(harness.ctx, withEnvelope(makeInput(), (data) => {
      data.attemptNumber = 42;
      data.submittedAt = '2026-08-31T00:00:00.000Z';
    }));
    expect(advisoryReplay).toEqual(first);
    expectNoWrites(harness, 1);
  });

  it('replays a stored max-safe ordinal without incrementing or writing', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);
    const first = await handler(harness.ctx, makeInput());
    const stored = harness.rows.activity_submissions[0]!;
    stored.attemptOrdinal = Number.MAX_SAFE_INTEGER;
    (stored.submissionData as SubmissionData).attemptNumber = Number.MAX_SAFE_INTEGER;
    const replayStart = harness.indexCalls.length;

    const replay = await handler(harness.ctx, makeInput());

    expect(replay).toEqual({
      submissionId: first.submissionId,
      attemptOrdinal: Number.MAX_SAFE_INTEGER,
      submittedAt: first.submittedAt,
    });
    expect(harness.indexCalls.slice(replayStart).map(({ tableName, indexName }) => `${tableName}:${indexName}`)).toEqual([
      'activities:by_stable_activity_id',
      'activity_submissions:by_user_and_create_idempotency_key',
    ]);
    expectNoWrites(harness, 1);
  });

  it.each(PART_IDS)('rejects a changed incoming answer for %s as an idempotency conflict', async (partId) => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);
    await handler(harness.ctx, makeInput());
    const input = withAnswers(makeInput(), (answers) => {
      answers[partId] = answers[partId] === 'up' ? 'down' : 'up';
    });

    await expect(handler(harness.ctx, input)).rejects.toThrow('idempotency_conflict');
    expectNoWrites(harness, 1);
  });

  it.each(PART_IDS)('rejects a changed incoming raw part for %s as an idempotency conflict', async (partId) => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);
    await handler(harness.ctx, makeInput());
    const input = withParts(makeInput(), (parts) => {
      const part = parts.find((candidate) => candidate.partId === partId)!;
      part.rawAnswer = part.rawAnswer === 'up' ? 'down' : 'up';
    });

    await expect(handler(harness.ctx, input)).rejects.toThrow('idempotency_conflict');
    expectNoWrites(harness, 1);
  });

  const storedCorruptionCases = [
    ['missing stored activityId', (row: Row) => { delete row.activityId; }],
    ['physical activityId wrong', (row: Row) => { row.activityId = 'activities:other'; }],
    ['missing stored stableActivityId', (row: Row) => { delete row.stableActivityId; }],
    ['stableActivityId wrong', (row: Row) => { row.stableActivityId = 'other-worked-activity'; }],
    ['extra stored row field', (row: Row) => { row.extra = true; }],
    ['submissionData null', (row: Row) => { row.submissionData = null; }],
    ['missing envelope contractVersion', (row: Row) => { delete (row.submissionData as SubmissionData).contractVersion; }],
    ['extra envelope key', (row: Row) => { row.submissionData = { ...(row.submissionData as SubmissionData), extra: true }; }],
    ['wrong contractVersion', (row: Row) => { (row.submissionData as SubmissionData).contractVersion = 'other.v1'; }],
    ['missing envelope activityId', (row: Row) => { delete (row.submissionData as SubmissionData).activityId; }],
    ['wrong envelope activityId', (row: Row) => { (row.submissionData as SubmissionData).activityId = 'other-worked-activity'; }],
    ['missing envelope mode', (row: Row) => { delete (row.submissionData as SubmissionData).mode; }],
    ['wrong mode', (row: Row) => { (row.submissionData as SubmissionData).mode = 'guided_practice'; }],
    ['missing envelope status', (row: Row) => { delete (row.submissionData as SubmissionData).status; }],
    ['wrong status', (row: Row) => { (row.submissionData as SubmissionData).status = 'graded'; }],
    ['missing envelope attemptNumber', (row: Row) => { delete (row.submissionData as SubmissionData).attemptNumber; }],
    ['envelope attempt 0', (row: Row) => { (row.submissionData as SubmissionData).attemptNumber = 0; }],
    ['envelope attempt mismatches row', (row: Row) => { (row.submissionData as SubmissionData).attemptNumber = 2; }],
    ['missing envelope submittedAt', (row: Row) => { delete (row.submissionData as SubmissionData).submittedAt; }],
    ['row attempt missing', (row: Row) => { delete row.attemptOrdinal; }],
    ['row attempt 0', (row: Row) => { row.attemptOrdinal = 0; }],
    ['row attempt negative', (row: Row) => { row.attemptOrdinal = -1; }],
    ['row attempt fractional', (row: Row) => { row.attemptOrdinal = 1.5; }],
    ['row attempt nonfinite', (row: Row) => { row.attemptOrdinal = Number.NaN; }],
    ['row attempt unsafe', (row: Row) => { row.attemptOrdinal = Number.MAX_SAFE_INTEGER + 1; }],
    ['row attempt max-safe', (row: Row) => { row.attemptOrdinal = Number.MAX_SAFE_INTEGER; }],
    ['row submittedAt wrong type', (row: Row) => { row.submittedAt = SERVER_SUBMITTED_AT; }],
    ['row submittedAt nonfinite', (row: Row) => { row.submittedAt = Number.NaN; }],
    ['row submittedAt mismatches envelope', (row: Row) => { row.submittedAt = SERVER_NOW + 1_000; }],
    ['inner submittedAt invalid', (row: Row) => { (row.submissionData as SubmissionData).submittedAt = 'not-a-time'; }],
    ['inner submittedAt noncanonical', (row: Row) => {
      (row.submissionData as SubmissionData).submittedAt = '2026-08-30T12:00:00Z';
      row.submittedAt = Date.parse('2026-08-30T12:00:00Z');
    }],
    ['createdAt missing', (row: Row) => { delete row.createdAt; }],
    ['createdAt wrong type', (row: Row) => { row.createdAt = SERVER_SUBMITTED_AT; }],
    ['createdAt nonfinite', (row: Row) => { row.createdAt = Number.NaN; }],
    ['createdAt mismatches submittedAt', (row: Row) => { row.createdAt = SERVER_NOW - 1_000; }],
    ['updatedAt missing', (row: Row) => { delete row.updatedAt; }],
    ['updatedAt wrong type', (row: Row) => { row.updatedAt = SERVER_SUBMITTED_AT; }],
    ['updatedAt nonfinite', (row: Row) => { row.updatedAt = Number.POSITIVE_INFINITY; }],
    ['updatedAt mismatches submittedAt', (row: Row) => { row.updatedAt = SERVER_NOW - 1_000; }],
    ['answers missing', (row: Row) => { delete (row.submissionData as SubmissionData).answers; }],
    ['answers extra key', (row: Row) => { (row.submissionData as SubmissionData).answers = { ...((row.submissionData as SubmissionData).answers as SubmissionData), extra: 'up' }; }],
    ['answers wrong key', (row: Row) => {
      const answers = { ...((row.submissionData as SubmissionData).answers as SubmissionData) };
      delete answers.a_leftEnd;
      answers.a_left = 'down';
      (row.submissionData as SubmissionData).answers = answers;
    }],
    ['stored answer noncanonical', (row: Row) => { ((row.submissionData as SubmissionData).answers as Record<string, unknown>).a_leftEnd = 'UP'; }],
    ['parts missing', (row: Row) => { delete (row.submissionData as SubmissionData).parts; }],
    ['parts empty', (row: Row) => { (row.submissionData as SubmissionData).parts = []; }],
    ['parts reordered', (row: Row) => {
      const parts = (row.submissionData as SubmissionData).parts as StoredPart[];
      [parts[0], parts[1]] = [parts[1]!, parts[0]!];
    }],
    ['parts duplicate', (row: Row) => {
      const parts = (row.submissionData as SubmissionData).parts as StoredPart[];
      parts[1] = { ...parts[0]! };
    }],
    ['part wrong ID', (row: Row) => { ((row.submissionData as SubmissionData).parts as StoredPart[])[0]!.partId = 'wrong_part'; }],
    ['part missing rawAnswer', (row: Row) => { delete ((row.submissionData as SubmissionData).parts as StoredPart[])[0]!.rawAnswer; }],
    ['part extra field', (row: Row) => { ((row.submissionData as SubmissionData).parts as StoredPart[])[0]!.extra = true; }],
    ['part raw answer wrong', (row: Row) => { ((row.submissionData as SubmissionData).parts as StoredPart[])[0]!.rawAnswer = 'up'; }],
    ['part raw answer noncanonical', (row: Row) => { ((row.submissionData as SubmissionData).parts as StoredPart[])[0]!.rawAnswer = 'UP'; }],
  ] as const;

  it.each(storedCorruptionCases)('rejects %s stored corruption before replay effects', async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);
    await handler(harness.ctx, makeInput());
    corrupt(harness.rows.activity_submissions[0]!);
    const replayStart = harness.indexCalls.length;

    await expect(handler(harness.ctx, makeInput())).rejects.toThrow('idempotency_conflict');
    expect(harness.indexCalls.slice(replayStart).map(({ tableName, indexName }) => `${tableName}:${indexName}`)).toEqual([
      'activities:by_stable_activity_id',
      'activity_submissions:by_user_and_create_idempotency_key',
    ]);
    expectNoWrites(harness, 1);
  });

  const storedSourceAnswerCases = PART_IDS.map((partId) => [partId, (row: Row) => {
    const data = row.submissionData as SubmissionData;
    const answers = data.answers as Record<string, unknown>;
    const nextAnswer = answers[partId] === 'up' ? 'down' : 'up';
    answers[partId] = nextAnswer;
    const parts = data.parts as StoredPart[];
    parts.find((part) => part.partId === partId)!.rawAnswer = nextAnswer;
  }] as const);

  it.each(storedSourceAnswerCases)('rejects stored source answer and raw part changes for %s', async (_partId, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);
    await handler(harness.ctx, makeInput());
    corrupt(harness.rows.activity_submissions[0]!);
    const replayStart = harness.indexCalls.length;

    await expect(handler(harness.ctx, makeInput())).rejects.toThrow('idempotency_conflict');
    expect(harness.indexCalls.slice(replayStart).map(({ tableName, indexName }) => `${tableName}:${indexName}`)).toEqual([
      'activities:by_stable_activity_id',
      'activity_submissions:by_user_and_create_idempotency_key',
    ]);
    expectNoWrites(harness, 1);
  });

  it.each([...FORBIDDEN_KEYS])('rejects stored forbidden field %s before replay effects', async (field) => {
    const handler = await loadHandler();
    const harness = createHarness();
    vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);
    await handler(harness.ctx, makeInput());
    harness.rows.activity_submissions[0]![field] = true;
    const replayStart = harness.indexCalls.length;

    await expect(handler(harness.ctx, makeInput())).rejects.toThrow('idempotency_conflict');
    expect(harness.indexCalls.slice(replayStart).map(({ tableName, indexName }) => `${tableName}:${indexName}`)).toEqual([
      'activities:by_stable_activity_id',
      'activity_submissions:by_user_and_create_idempotency_key',
    ]);
    expectNoWrites(harness, 1);
  });

  it('allows another user to reuse the same create key', async () => {
    const handler = await loadHandler();
    const harness = createHarness();
    harness.rows.activity_submissions.push(makePriorRow(1, makeInput().idempotencyKey));
    vi.spyOn(Date, 'now').mockReturnValue(SERVER_NOW);

    const result = await handler(harness.ctx, makeInput({ userId: OTHER_USER_ID }));
    expect(result).toEqual({
      submissionId: 'activity_submissions:2',
      attemptOrdinal: 1,
      submittedAt: SERVER_SUBMITTED_AT,
    });
    expect(harness.rows.activity_submissions[1]?.userId).toBe(OTHER_USER_ID);
    expectNoWrites(harness, 2);
  });

  const malformedCases = [
    ['extra outer field', (input: Input) => withEnvelope(input, (data) => { data.extra = true; })],
    ['missing contractVersion', (input: Input) => withEnvelope(input, (data) => { delete data.contractVersion; })],
    ['missing activityId', (input: Input) => withEnvelope(input, (data) => { delete data.activityId; })],
    ['missing mode', (input: Input) => withEnvelope(input, (data) => { delete data.mode; })],
    ['missing status', (input: Input) => withEnvelope(input, (data) => { delete data.status; })],
    ['missing attemptNumber', (input: Input) => withEnvelope(input, (data) => { delete data.attemptNumber; })],
    ['missing submittedAt', (input: Input) => withEnvelope(input, (data) => { delete data.submittedAt; })],
    ['missing answers', (input: Input) => withEnvelope(input, (data) => { delete data.answers; })],
    ['missing parts', (input: Input) => withEnvelope(input, (data) => { delete data.parts; })],
    ['wrong outer activity', (input: Input) => ({ ...input, activityId: 'other-worked-activity' })],
    ['wrong envelope activity', (input: Input) => withEnvelope(input, (data) => { data.activityId = 'other-worked-activity'; })],
    ['wrong mode', (input: Input) => withEnvelope(input, (data) => { data.mode = 'guided_practice'; })],
    ['wrong status', (input: Input) => withEnvelope(input, (data) => { data.status = 'graded'; })],
    ['nonpositive client attempt', (input: Input) => withEnvelope(input, (data) => { data.attemptNumber = 0; })],
    ['fractional client attempt', (input: Input) => withEnvelope(input, (data) => { data.attemptNumber = 1.5; })],
    ['unsafe client attempt', (input: Input) => withEnvelope(input, (data) => { data.attemptNumber = Number.MAX_SAFE_INTEGER + 1; })],
    ['nonfinite client attempt', (input: Input) => withEnvelope(input, (data) => { data.attemptNumber = Number.NaN; })],
    ['invalid client time', (input: Input) => withEnvelope(input, (data) => { data.submittedAt = 'not-a-time'; })],
    ['blank idempotency key', (input: Input) => ({ ...input, idempotencyKey: '   ' })],
    ['blank trimmed idempotency key', (input: Input) => ({ ...input, idempotencyKey: '\t\n' })],
    ['extra answer field', (input: Input) => withAnswers(input, (answers) => { answers.extra = 'up'; })],
    ['missing answer field', (input: Input) => withAnswers(input, (answers) => { delete answers.a_leftEnd; })],
    ['wrong answer key', (input: Input) => withAnswers(input, (answers) => {
      delete answers.a_leftEnd;
      answers.a_left = 'down';
    })],
    ['noncanonical answer value', (input: Input) => withAnswers(input, (answers) => { answers.a_leftEnd = 'UP'; })],
  ] as const;

  it.each(malformedCases)('rejects %s without writes', async (_label, buildInput) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = buildInput(makeInput());

    await expect(handler(harness.ctx, input)).rejects.toThrow();
    expectNoWrites(harness, 0);
  });

  it.each(PART_IDS)('rejects a changed source answer for %s without writes', async (partId) => {
    const handler = await loadHandler();
    const harness = createHarness();
    const input = withAnswers(makeInput(), (answers) => {
      answers[partId] = answers[partId] === 'up' ? 'down' : 'up';
    });

    await expect(handler(harness.ctx, input)).rejects.toThrow();
    expectNoWrites(harness, 0);
  });

  const rawPartCases = [
    ['reordered raw parts', (input: Input) => withParts(input, (parts) => {
      [parts[0], parts[1]] = [parts[1]!, parts[0]!];
    })],
    ['duplicate raw part', (input: Input) => withParts(input, (parts) => {
      parts[1] = { ...parts[0]! };
    })],
    ['wrong raw part ID', (input: Input) => withParts(input, (parts) => {
      parts[0]!.partId = 'wrong_part';
    })],
    ['extra raw part field', (input: Input) => withParts(input, (parts) => {
      parts[0]!.extra = true;
    })],
    ['mismatched raw part', (input: Input) => withParts(input, (parts) => {
      parts[0]!.rawAnswer = parts[0]!.rawAnswer === 'up' ? 'down' : 'up';
    })],
    ['noncanonical raw part', (input: Input) => withParts(input, (parts) => {
      parts[0]!.rawAnswer = 'UP';
    })],
    ['missing raw part', (input: Input) => withParts(input, (parts) => {
      parts.splice(0, 1);
    })],
    ['extra raw part item', (input: Input) => withParts(input, (parts) => {
      parts.push({ partId: 'a_leftEnd', rawAnswer: SOURCE_ANSWERS.a_leftEnd });
    })],
  ] as const;

  it.each(rawPartCases)('rejects %s without writes', async (_label, buildInput) => {
    const handler = await loadHandler();
    const harness = createHarness();

    await expect(handler(harness.ctx, buildInput(makeInput()))).rejects.toThrow();
    expectNoWrites(harness, 0);
  });

  const activityCases = [
    ['missing activity', (harness: Harness) => { harness.rows.activities = []; }],
    ['wrong stable activity ID', (harness: Harness) => { harness.rows.activities[0]!.stableActivityId = 'other-worked-activity'; }],
    ['wrong component', (harness: Harness) => { harness.rows.activities[0]!.componentKey = 'other-component'; }],
    ['non-record props', (harness: Harness) => { harness.rows.activities[0]!.props = null; }],
    ['wrong presentation mode', (harness: Harness) => { harness.rows.activities[0]!.props = { presentationMode: 'guided_practice' }; }],
    ['non-record grading config', (harness: Harness) => { harness.rows.activities[0]!.gradingConfig = null; }],
    ['extra grading config field', (harness: Harness) => {
      harness.rows.activities[0]!.gradingConfig = {
        ...PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG,
        extra: true,
      };
    }],
    ['wrong generator key', (harness: Harness) => {
      harness.rows.activities[0]!.gradingConfig = { generatorKey: 'other-generator', variantSeed: 0 };
    }],
    ['wrong seed', (harness: Harness) => {
      harness.rows.activities[0]!.gradingConfig = {
        generatorKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
        variantSeed: 1,
      };
    }],
    ['fractional seed', (harness: Harness) => {
      harness.rows.activities[0]!.gradingConfig = {
        generatorKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
        variantSeed: 0.5,
      };
    }],
    ['duplicate activity', (harness: Harness) => {
      harness.rows.activities.push({ ...harness.rows.activities[0]!, _id: 'activities:duplicate' });
    }],
  ] as const;

  it.each(activityCases)('rejects %s activity state without writes', async (_label, corrupt) => {
    const handler = await loadHandler();
    const harness = createHarness();
    corrupt(harness);

    await expect(handler(harness.ctx, makeInput())).rejects.toThrow();
    expectNoWrites(harness, 0);
  });

  it.each([
    ['missing', undefined],
    ['zero', 0],
    ['negative', -1],
    ['fractional', 1.5],
    ['nonfinite', Number.NaN],
    ['infinite', Number.POSITIVE_INFINITY],
    ['unsafe', Number.MAX_SAFE_INTEGER + 1],
    ['max-safe', Number.MAX_SAFE_INTEGER],
  ] as const)('rejects a %s prior ordinal without inserting', async (_label, ordinal) => {
    const handler = await loadHandler();
    const harness = createHarness();
    harness.rows.activity_submissions.push(makePriorRow(ordinal, 'prior-key'));

    const input = makeInput({ idempotencyKey: 'new-key' });
    await expect(handler(harness.ctx, input)).rejects.toThrow();
    expectNoWrites(harness, 1);
  });
});
