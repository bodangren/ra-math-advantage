import { describe, expect, it } from 'vitest';

import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_GRADING_CONFIG,
  createTopic15LeastPolynomialDegreeSubmission,
} from '@/convex/activities';
import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type Row = Record<string, unknown> & { _id: string };
type Mode = 'guided_practice' | 'independent_practice';
type Answers = { leastDegree: number };

const USER_ID = 'profiles:learner';
const GUIDED_ACTIVITY_DOCUMENT_ID = 'activities:least-degree-guided';
const INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'activities:least-degree-independent';
const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID = PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID;
const FEEDBACK = '1/1 least-polynomial-degree response matched the server rubric.';

const AUTHORITY_KEYS = [
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
  'correctness',
] as const;

function getHandler() {
  if (
    !createTopic15LeastPolynomialDegreeSubmission
    || (typeof createTopic15LeastPolynomialDegreeSubmission !== 'object'
      && typeof createTopic15LeastPolynomialDegreeSubmission !== 'function')
  ) {
    throw new Error('createTopic15LeastPolynomialDegreeSubmission must be exported.');
  }
  const handler = Reflect.get(createTopic15LeastPolynomialDegreeSubmission, '_handler');
  if (typeof handler !== 'function') {
    throw new Error('createTopic15LeastPolynomialDegreeSubmission must expose its handler.');
  }
  return handler as (
    context: { db: Record<string, unknown> },
    args: Record<string, unknown>,
  ) => Promise<unknown>;
}

function makeEnvelope(
  activityId: string,
  mode: Mode,
  answers: Answers,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2020-01-01T00:00:00.000Z',
    answers,
    parts: [{ partId: 'leastDegree', rawAnswer: answers.leastDegree }],
    ...overrides,
  };
}

function activityRow(
  activityId: string,
  documentId: string,
  mode: Mode,
  gradingConfig: Record<string, unknown>,
): Row {
  return {
    _id: documentId,
    stableActivityId: activityId,
    componentKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
    props: { presentationMode: mode },
    gradingConfig,
  };
}

function createHarness() {
  const rows: Record<string, Row[]> = {
    activities: [
      activityRow(
        GUIDED_ACTIVITY_ID,
        GUIDED_ACTIVITY_DOCUMENT_ID,
        'guided_practice',
        { ...PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_GRADING_CONFIG },
      ),
      activityRow(
        INDEPENDENT_ACTIVITY_ID,
        INDEPENDENT_ACTIVITY_DOCUMENT_ID,
        'independent_practice',
        { ...PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_GRADING_CONFIG },
      ),
    ],
    activity_submissions: [],
    learning_evidence: [],
  };
  const inserts: Array<{ table: string; document: Row }> = [];
  const indexCalls: string[] = [];

  const db = {
    query: (table: string) => ({
      withIndex: (
        indexName: string,
        configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
      ) => {
        const conditions = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
        };
        configure(index);
        indexCalls.push(`${table}:${indexName}`);
        const select = () => (rows[table] ?? []).filter((row) => (
          [...conditions].every(([field, value]) => row[field] === value)
        ));
        return {
          first: async () => select()[0] ?? null,
          unique: async () => {
            const matches = select();
            if (matches.length > 1) throw new Error(`Duplicate ${table} rows`);
            return matches[0] ?? null;
          },
          order: (_direction: string) => ({
            first: async () => select()
              .sort((left, right) => Number(right.attemptOrdinal ?? 0) - Number(left.attemptOrdinal ?? 0))[0] ?? null,
          }),
        };
      },
    }),
    insert: async (table: string, document: Record<string, unknown>) => {
      const tableRows = rows[table] ?? (rows[table] = []);
      const row = { _id: `${table}:${tableRows.length + 1}`, ...document } as Row;
      tableRows.push(row);
      inserts.push({ table, document: row });
      return row._id;
    },
  };

  return { context: { db }, indexCalls, inserts, rows };
}

function argsFor(
  activityId: string,
  mode: Mode,
  answers: Answers,
  idempotencyKey = `least-degree:${mode}`,
  envelopeOverrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    userId: USER_ID,
    activityId,
    idempotencyKey,
    submissionData: makeEnvelope(activityId, mode, answers, envelopeOverrides),
  };
}

function expectNoEvidence(harness: ReturnType<typeof createHarness>): void {
  expect(harness.rows.learning_evidence).toHaveLength(0);
  expect(harness.inserts.filter(({ table }) => table === 'learning_evidence')).toHaveLength(0);
}

async function expectRejected(
  handler: ReturnType<typeof getHandler>,
  harness: ReturnType<typeof createHarness>,
  args: Record<string, unknown>,
): Promise<void> {
  await expect(handler(harness.context, args)).rejects.toThrow();
  expect(harness.rows.activity_submissions).toHaveLength(0);
  expect(harness.inserts.filter(({ table }) => table === 'activity_submissions')).toHaveLength(0);
  expectNoEvidence(harness);
}

function expectStoredGrade(
  row: Row,
  activityId: string,
  activityDocumentId: string,
  mode: Mode,
  idempotencyKey: string,
  rawAnswer: number,
  isCorrect: boolean,
): void {
  expect(row).toMatchObject({
    userId: USER_ID,
    activityId: activityDocumentId,
    stableActivityId: activityId,
    createIdempotencyKey: idempotencyKey,
    attemptOrdinal: 1,
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    feedback: isCorrect
      ? FEEDBACK
      : '0/1 least-polynomial-degree response matched the server rubric.',
    masteryContractVersion: 'learning-evidence.v1',
  });
  expect(Object.keys(row).sort()).toEqual([
    '_id',
    'activityId',
    'attemptOrdinal',
    'createdAt',
    'createIdempotencyKey',
    'feedback',
    'gradedAt',
    'masteryContractVersion',
    'maxScore',
    'score',
    'stableActivityId',
    'submittedAt',
    'submissionData',
    'updatedAt',
    'userId',
  ].sort());
  expect(row.submittedAt).toBe(row.createdAt);
  expect(row.submittedAt).toBe(row.updatedAt);
  expect(row.submittedAt).toBe(row.gradedAt);
  expect(typeof row.submittedAt).toBe('number');
  expect(Number.isFinite(row.submittedAt)).toBe(true);
  for (const key of AUTHORITY_KEYS) expect(row).not.toHaveProperty(key);

  const data = row.submissionData as Record<string, unknown>;
  expect(Object.keys(data).sort()).toEqual([
    'activityId',
    'answers',
    'attemptNumber',
    'contractVersion',
    'mode',
    'parts',
    'status',
    'submittedAt',
  ].sort());
  expect(data).toEqual({
    activityId,
    answers: { leastDegree: rawAnswer },
    attemptNumber: 1,
    contractVersion: 'practice.v1',
    mode,
    parts: [{
      partId: 'leastDegree',
      rawAnswer,
      isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1,
    }],
    status: 'graded',
    submittedAt: new Date(row.submittedAt as number).toISOString(),
  });
  expect(Date.parse(data.submittedAt as string)).toBe(row.submittedAt);
  expectNoEvidenceFields(data);
}

function expectNoEvidenceFields(value: Record<string, unknown>): void {
  for (const key of AUTHORITY_KEYS) expect(value).not.toHaveProperty(key);
}

describe('Topic 1.5 least polynomial degree submission', () => {
  it('stores exact Guided and Independent grades with server normalization', async () => {
    const handler = getHandler();
    for (const [activityId, mode, answers, documentId] of [
      [GUIDED_ACTIVITY_ID, 'guided_practice', { leastDegree: 5 }, GUIDED_ACTIVITY_DOCUMENT_ID],
      [INDEPENDENT_ACTIVITY_ID, 'independent_practice', { leastDegree: 4 }, INDEPENDENT_ACTIVITY_DOCUMENT_ID],
    ] as const) {
      const harness = createHarness();
      const key = `${mode}:source`;
      const result = await handler(harness.context, argsFor(
        activityId,
        mode,
        answers,
        key,
        { attemptNumber: 99, submittedAt: '2020-01-01T00:00:00.000Z' },
      ));
      expect(result).toEqual({
        submissionId: 'activity_submissions:1',
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: FEEDBACK,
      });
      expectStoredGrade(harness.rows.activity_submissions[0]!, activityId, documentId, mode, key, answers.leastDegree, true);
      expectNoEvidence(harness);
    }
  });

  it('preserves a finite wrong scalar and awards zero credit', async () => {
    const handler = getHandler();
    const harness = createHarness();
    const key = 'wrong-answer';
    const result = await handler(harness.context, argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      { leastDegree: 6 },
      key,
    ));
    expect(result).toEqual({
      submissionId: 'activity_submissions:1',
      score: 0,
      maxScore: 1,
      attemptOrdinal: 1,
      feedback: '0/1 least-polynomial-degree response matched the server rubric.',
    });
    expectStoredGrade(harness.rows.activity_submissions[0]!, GUIDED_ACTIVITY_ID, GUIDED_ACTIVITY_DOCUMENT_ID, 'guided_practice', key, 6, false);
    expectNoEvidence(harness);
  });

  it('rejects strict envelope, scalar, identity, key, and authority failures', async () => {
    const handler = getHandler();
    const malformedCases: Array<[string, (envelope: Record<string, unknown>) => void]> = [
      ['extra outer field', (envelope) => { envelope.extra = true; }],
      ['missing outer field', (envelope) => { delete envelope.status; }],
      ['wrong contract', (envelope) => { envelope.contractVersion = 'wrong'; }],
      ['wrong status', (envelope) => { envelope.status = 'graded'; }],
      ['wrong mode', (envelope) => { envelope.mode = 'independent_practice'; }],
      ['wrong activity', (envelope) => { envelope.activityId = INDEPENDENT_ACTIVITY_ID; }],
      ['extra answer field', (envelope) => { envelope.answers = { leastDegree: 5, extra: 1 }; }],
      ['missing answer field', (envelope) => { envelope.answers = {}; }],
      ['non-record answers', (envelope) => { envelope.answers = null; }],
      ['non-number answer', (envelope) => { envelope.answers = { leastDegree: '5' }; }],
      ['non-finite answer', (envelope) => { envelope.answers = { leastDegree: Number.NaN }; }],
      ['fractional answer', (envelope) => { envelope.answers = { leastDegree: 4.5 }; }],
      ['unsafe answer', (envelope) => { envelope.answers = { leastDegree: Number.MAX_SAFE_INTEGER + 1 }; }],
      ['missing parts', (envelope) => { delete envelope.parts; }],
      ['non-array parts', (envelope) => { envelope.parts = null; }],
      ['extra part', (envelope) => { envelope.parts = [
        { partId: 'leastDegree', rawAnswer: 5 },
        { partId: 'leastDegree', rawAnswer: 5 },
      ]; }],
      ['reordered part', (envelope) => { envelope.parts = [{ partId: 'wrong', rawAnswer: 5 }]; }],
      ['duplicate part', (envelope) => { envelope.parts = [
        { partId: 'leastDegree', rawAnswer: 5 },
        { partId: 'leastDegree', rawAnswer: 5 },
      ]; }],
      ['part answer mismatch', (envelope) => { envelope.parts = [{ partId: 'leastDegree', rawAnswer: 6 }]; }],
      ['extra part field', (envelope) => { envelope.parts = [{ partId: 'leastDegree', rawAnswer: 5, score: 1 }]; }],
      ['zero attempt', (envelope) => { envelope.attemptNumber = 0; }],
      ['fractional attempt', (envelope) => { envelope.attemptNumber = 1.5; }],
      ['unsafe attempt', (envelope) => { envelope.attemptNumber = Number.MAX_SAFE_INTEGER + 1; }],
      ['non-number attempt', (envelope) => { envelope.attemptNumber = '1'; }],
      ['invalid time', (envelope) => { envelope.submittedAt = 'not-a-date'; }],
      ['non-string time', (envelope) => { envelope.submittedAt = 1; }],
    ];
    for (const [name, mutate] of malformedCases) {
      const harness = createHarness();
      const envelope = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', { leastDegree: 5 });
      mutate(envelope);
      await expectRejected(handler, harness, {
        userId: USER_ID,
        activityId: GUIDED_ACTIVITY_ID,
        idempotencyKey: `malformed:${name}`,
        submissionData: envelope,
      });
    }

    for (const authorityKey of AUTHORITY_KEYS) {
      const harness = createHarness();
      const envelope = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', { leastDegree: 5 });
      envelope[authorityKey] = 'blocked';
      await expectRejected(handler, harness, {
        userId: USER_ID,
        activityId: GUIDED_ACTIVITY_ID,
        idempotencyKey: `authority:${authorityKey}`,
        submissionData: envelope,
      });
    }

    await expectRejected(handler, createHarness(), argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      { leastDegree: 5 },
      '   ',
    ));
    await expectRejected(handler, createHarness(), argsFor(
      'math.precalc.skill.1.5.unknown.guided_practice',
      'guided_practice',
      { leastDegree: 5 },
      'unknown-activity',
    ));
    await expectRejected(handler, createHarness(), argsFor(
      GUIDED_ACTIVITY_ID,
      'independent_practice',
      { leastDegree: 5 },
      'cross-mode',
    ));
  });

  it('rejects missing, duplicate, and malformed activity provisioning', async () => {
    const handler = getHandler();
    const cases: Array<[string, (harness: ReturnType<typeof createHarness>) => void]> = [
      ['missing activity', (harness) => { harness.rows.activities = []; }],
      ['duplicate activity', (harness) => { harness.rows.activities.push({ ...harness.rows.activities[0]! }); }],
      ['wrong stable ID', (harness) => { harness.rows.activities[0]!.stableActivityId = 'wrong'; }],
      ['wrong component', (harness) => { harness.rows.activities[0]!.componentKey = 'wrong'; }],
      ['wrong presentation mode', (harness) => { harness.rows.activities[0]!.props = { presentationMode: 'independent_practice' }; }],
      ['non-record props', (harness) => { harness.rows.activities[0]!.props = null; }],
      ['non-record config', (harness) => { harness.rows.activities[0]!.gradingConfig = null; }],
      ['extra config key', (harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          ...PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_GRADING_CONFIG,
          extra: true,
        };
      }],
      ['wrong generator', (harness) => { harness.rows.activities[0]!.gradingConfig = { generatorKey: 'wrong', variantSeed: 1 }; }],
      ['wrong seed', (harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
          variantSeed: 2,
        };
      }],
      ['non-integer seed', (harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
          variantSeed: 1.5,
        };
      }],
    ];
    for (const [name, mutate] of cases) {
      const harness = createHarness();
      mutate(harness);
      await expectRejected(handler, harness, argsFor(
        GUIDED_ACTIVITY_ID,
        'guided_practice',
        { leastDegree: 5 },
        `provisioning:${name}`,
      ));
    }
  });

  it('replays exact semantics and rejects observable stored corruption', async () => {
    const handler = getHandler();
    for (const [activityId, mode, answers] of [
      [GUIDED_ACTIVITY_ID, 'guided_practice', { leastDegree: 5 }],
      [INDEPENDENT_ACTIVITY_ID, 'independent_practice', { leastDegree: 4 }],
    ] as const) {
      const harness = createHarness();
      const key = `replay:${mode}`;
      const first = await handler(harness.context, argsFor(activityId, mode, answers, key));
      const replay = await handler(harness.context, argsFor(
        activityId,
        mode,
        answers,
        key,
        { attemptNumber: 123, submittedAt: '2035-01-01T00:00:00.000Z' },
      ));
      expect(replay).toEqual(first);
      expect(harness.rows.activity_submissions).toHaveLength(1);
      expect(harness.inserts.filter(({ table }) => table === 'activity_submissions')).toHaveLength(1);
      expectNoEvidence(harness);
    }

    const wrongReplayHarness = createHarness();
    const wrongKey = 'replay:wrong-answer';
    const wrongFirst = await handler(wrongReplayHarness.context, argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      { leastDegree: 6 },
      wrongKey,
    ));
    const wrongReplay = await handler(wrongReplayHarness.context, argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      { leastDegree: 6 },
      wrongKey,
      { attemptNumber: 124, submittedAt: '2035-01-02T00:00:00.000Z' },
    ));
    expect(wrongReplay).toEqual(wrongFirst);
    expect(wrongReplay).toMatchObject({ score: 0, maxScore: 1 });
    expect(wrongReplayHarness.rows.activity_submissions).toHaveLength(1);
    expect((wrongReplayHarness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).answers)
      .toEqual({ leastDegree: 6 });
    expect((wrongReplayHarness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>).parts)
      .toEqual([{ partId: 'leastDegree', rawAnswer: 6, isCorrect: false, score: 0, maxScore: 1 }]);
    expect(wrongReplayHarness.inserts.filter(({ table }) => table === 'activity_submissions')).toHaveLength(1);
    expectNoEvidence(wrongReplayHarness);

    const changedRequestHarness = createHarness();
    await handler(changedRequestHarness.context, argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      { leastDegree: 5 },
      'changed-request',
    ));
    for (const changedArgs of [
      argsFor(GUIDED_ACTIVITY_ID, 'guided_practice', { leastDegree: 6 }, 'changed-request'),
      argsFor(INDEPENDENT_ACTIVITY_ID, 'independent_practice', { leastDegree: 4 }, 'changed-request'),
    ]) {
      await expect(handler(changedRequestHarness.context, changedArgs)).rejects.toThrow('idempotency_conflict');
      expect(changedRequestHarness.rows.activity_submissions).toHaveLength(1);
      expectNoEvidence(changedRequestHarness);
    }
    const second = await handler(changedRequestHarness.context, argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      { leastDegree: 5 },
      'fresh-key',
    ));
    expect(second).toMatchObject({ submissionId: 'activity_submissions:2', attemptOrdinal: 2 });
    expect(changedRequestHarness.rows.activity_submissions).toHaveLength(2);
    expectNoEvidence(changedRequestHarness);
    expect(changedRequestHarness.indexCalls).toContain('activity_submissions:by_user_and_create_idempotency_key');
    expect(changedRequestHarness.indexCalls).toContain('activity_submissions:by_user_and_activity_and_attempt_ordinal');

    const corruptions: Array<[string, (row: Row) => void]> = [
      ['physical activity ID', (row) => { row.activityId = 'activities:other'; }],
      ['stable activity ID', (row) => { row.stableActivityId = 'wrong-stable-id'; }],
      ['non-record envelope', (row) => { row.submissionData = null; }],
      ['missing envelope field', (row) => { delete (row.submissionData as Record<string, unknown>).status; }],
      ['extra envelope field', (row) => { (row.submissionData as Record<string, unknown>).extra = true; }],
      ['wrong envelope activity', (row) => { (row.submissionData as Record<string, unknown>).activityId = INDEPENDENT_ACTIVITY_ID; }],
      ['wrong envelope mode', (row) => { (row.submissionData as Record<string, unknown>).mode = 'independent_practice'; }],
      ['wrong envelope status', (row) => { (row.submissionData as Record<string, unknown>).status = 'submitted'; }],
      ['wrong envelope contract', (row) => { (row.submissionData as Record<string, unknown>).contractVersion = 'wrong'; }],
      ['envelope attempt type', (row) => { (row.submissionData as Record<string, unknown>).attemptNumber = '1'; }],
      ['envelope attempt zero', (row) => { (row.submissionData as Record<string, unknown>).attemptNumber = 0; }],
      ['envelope attempt fractional', (row) => { (row.submissionData as Record<string, unknown>).attemptNumber = 1.5; }],
      ['envelope attempt mismatch', (row) => { (row.submissionData as Record<string, unknown>).attemptNumber = 2; }],
      ['row ordinal type', (row) => { row.attemptOrdinal = '1'; }],
      ['row ordinal zero', (row) => { row.attemptOrdinal = 0; }],
      ['row ordinal fractional', (row) => { row.attemptOrdinal = 1.5; }],
      ['envelope submitted time type', (row) => { (row.submissionData as Record<string, unknown>).submittedAt = 1; }],
      ['envelope submitted time invalid', (row) => { (row.submissionData as Record<string, unknown>).submittedAt = 'not-a-date'; }],
      ['envelope submitted time noncanonical', (row) => { (row.submissionData as Record<string, unknown>).submittedAt = '2020-01-01T00:00:00Z'; }],
      ['envelope submitted time mismatch', (row) => { (row.submissionData as Record<string, unknown>).submittedAt = '2035-01-01T00:00:00.000Z'; }],
      ['row submitted time type', (row) => { row.submittedAt = '1'; }],
      ['row submitted time nonfinite', (row) => { row.submittedAt = Number.NaN; }],
      ['row submitted time mismatch', (row) => { row.submittedAt = (row.submittedAt as number) + 1; }],
      ['non-record answers', (row) => { (row.submissionData as Record<string, unknown>).answers = null; }],
      ['missing answer field', (row) => { delete ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).leastDegree; }],
      ['extra answer field', (row) => { ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).extra = 1; }],
      ['answer non-number', (row) => { ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).leastDegree = '5'; }],
      ['answer non-finite', (row) => { ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).leastDegree = Number.NaN; }],
      ['answer fractional', (row) => { ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).leastDegree = 4.5; }],
      ['answer unsafe', (row) => { ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).leastDegree = Number.MAX_SAFE_INTEGER + 1; }],
      ['answer changed', (row) => { ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).leastDegree = 6; }],
      ['missing parts', (row) => { delete (row.submissionData as Record<string, unknown>).parts; }],
      ['non-array parts', (row) => { (row.submissionData as Record<string, unknown>).parts = null; }],
      ['extra part', (row) => { (row.submissionData as Record<string, unknown>).parts = [
        { partId: 'leastDegree', rawAnswer: 5, isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'leastDegree', rawAnswer: 5, isCorrect: true, score: 1, maxScore: 1 },
      ]; }],
      ['non-record part', (row) => { (row.submissionData as Record<string, unknown>).parts = [null]; }],
      ['extra part field', (row) => { (row.submissionData as Record<string, unknown>).parts = [{
        partId: 'leastDegree', rawAnswer: 5, isCorrect: true, score: 1, maxScore: 1, extra: true,
      }]; }],
      ['wrong part ID', (row) => { ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.partId = 'wrong'; }],
      ['part raw scalar mismatch', (row) => { ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.rawAnswer = 6; }],
      ['part raw scalar type', (row) => { ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.rawAnswer = '5'; }],
      ['part correctness missing', (row) => { delete ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.isCorrect; }],
      ['part correctness wrong', (row) => { ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.isCorrect = false; }],
      ['part score missing', (row) => { delete ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.score; }],
      ['part score wrong', (row) => { ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.score = 0; }],
      ['part max score missing', (row) => { delete ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.maxScore; }],
      ['part max score wrong', (row) => { ((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!.maxScore = 2; }],
      ['mastery contract missing', (row) => { delete row.masteryContractVersion; }],
      ['mastery contract wrong', (row) => { row.masteryContractVersion = 'wrong'; }],
      ['row score missing', (row) => { delete row.score; }],
      ['row score wrong', (row) => { row.score = 0; }],
      ['row max score missing', (row) => { delete row.maxScore; }],
      ['row max score wrong', (row) => { row.maxScore = 2; }],
      ['row feedback missing', (row) => { delete row.feedback; }],
      ['row feedback wrong', (row) => { row.feedback = 'changed'; }],
      ['gradedAt type', (row) => { row.gradedAt = '1'; }],
      ['gradedAt nonfinite', (row) => { row.gradedAt = Number.NaN; }],
      ['gradedAt mismatch', (row) => { row.gradedAt = (row.submittedAt as number) + 1; }],
      ['createdAt type', (row) => { row.createdAt = '1'; }],
      ['createdAt nonfinite', (row) => { row.createdAt = Number.NaN; }],
      ['createdAt mismatch', (row) => { row.createdAt = (row.submittedAt as number) + 1; }],
      ['updatedAt type', (row) => { row.updatedAt = '1'; }],
      ['updatedAt nonfinite', (row) => { row.updatedAt = Number.NaN; }],
      ['updatedAt mismatch', (row) => { row.updatedAt = (row.submittedAt as number) + 1; }],
      ...[...AUTHORITY_KEYS, 'isCorrect'].map((field) => [
        `forbidden row authority ${field}`,
        (row: Row) => { row[field] = true; },
      ] as [string, (row: Row) => void]),
    ];

    for (const [name, corrupt] of corruptions) {
      const harness = createHarness();
      const key = `corruption:${name}`;
      await handler(harness.context, argsFor(
        GUIDED_ACTIVITY_ID,
        'guided_practice',
        { leastDegree: 5 },
        key,
      ));
      corrupt(harness.rows.activity_submissions[0]!);
      await expect(handler(harness.context, argsFor(
        GUIDED_ACTIVITY_ID,
        'guided_practice',
        { leastDegree: 5 },
        key,
      ))).rejects.toThrow('idempotency_conflict');
      expect(harness.rows.activity_submissions).toHaveLength(1);
      expect(harness.inserts.filter(({ table }) => table === 'activity_submissions')).toHaveLength(1);
      expectNoEvidence(harness);
    }
  });
});
