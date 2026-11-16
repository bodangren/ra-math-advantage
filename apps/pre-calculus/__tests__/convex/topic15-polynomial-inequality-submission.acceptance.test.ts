import { describe, expect, it } from 'vitest';

import {
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_GRADING_CONFIG,
  createTopic15PolynomialInequalitySubmission,
} from '@/convex/activities';
import {
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';
import { gradeTopic15PolynomialInequalitySignChart } from '@/lib/practice/topic15-polynomial-inequality-sign-chart';

type Row = Record<string, unknown> & { _id: string };
type Mode = 'guided_practice' | 'independent_practice';
type Answers = {
  roots: number[];
  intervalSigns: Array<'+' | '-'>;
  solution: string;
};

const USER_ID = 'profiles:learner';
const SECOND_USER_ID = 'profiles:second-learner';
const GUIDED_ACTIVITY_DOCUMENT_ID = 'activities:polynomial-inequality-guided';
const INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'activities:polynomial-inequality-independent';
const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID = PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID;
const GUIDED_ANSWERS: Answers = {
  roots: [5, -2],
  intervalSigns: ['-', '-', '+'],
  solution: '  (-∞, 5]  ',
};
const INDEPENDENT_ANSWERS: Answers = {
  roots: [2, 1, -3],
  intervalSigns: ['-', '-', '-', '+'],
  solution: ' (1.0, 2) U (-infinity, -3) ',
};
const FRACTIONAL_GUIDED_ANSWERS: Answers = {
  roots: [5, -2.5],
  intervalSigns: ['-', '-', '+'],
  solution: '  (-∞, 5]  ',
};
const AUTHORITY_KEYS = [
  'answer',
  'answerKey',
  'correctAnswer',
  'correctAnswers',
  'expectedAnswer',
  'grading',
  'gradingMetadata',
  'normalizedAnswer',
  'solutionSteps',
  'steps',
  'finalAnswer',
  'authority',
] as const;

function getHandler() {
  if (
    !createTopic15PolynomialInequalitySubmission
    || (typeof createTopic15PolynomialInequalitySubmission !== 'object'
      && typeof createTopic15PolynomialInequalitySubmission !== 'function')
  ) {
    throw new Error('createTopic15PolynomialInequalitySubmission must be exported.');
  }
  const handler = Reflect.get(createTopic15PolynomialInequalitySubmission, '_handler');
  if (typeof handler !== 'function') {
    throw new Error('createTopic15PolynomialInequalitySubmission must expose its handler.');
  }
  return handler as (
    context: { db: Record<string, unknown> },
    args: Record<string, unknown>,
  ) => Promise<unknown>;
}

function makeEnvelope(activityId: string, mode: Mode, answers: Answers): Record<string, unknown> {
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2020-01-01T00:00:00.000Z',
    answers,
    parts: [
      { partId: 'roots', rawAnswer: answers.roots },
      { partId: 'intervalSigns', rawAnswer: answers.intervalSigns },
      { partId: 'solution', rawAnswer: answers.solution },
    ],
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
    componentKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
    props: { presentationMode: mode },
    gradingConfig,
  };
}

function createHarness(existingSubmission?: Row) {
  const rows: Record<string, Row[]> = {
    activities: [
      activityRow(
        GUIDED_ACTIVITY_ID,
        GUIDED_ACTIVITY_DOCUMENT_ID,
        'guided_practice',
        { ...PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_GRADING_CONFIG },
      ),
      activityRow(
        INDEPENDENT_ACTIVITY_ID,
        INDEPENDENT_ACTIVITY_DOCUMENT_ID,
        'independent_practice',
        { ...PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_GRADING_CONFIG },
      ),
    ],
    activity_submissions: existingSubmission ? [existingSubmission] : [],
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
  idempotencyKey: string,
  userId: string = USER_ID,
): Record<string, unknown> {
  return {
    userId,
    activityId,
    idempotencyKey,
    submissionData: makeEnvelope(activityId, mode, answers),
  };
}

function expectNoAuthority(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoAuthority);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    expect(AUTHORITY_KEYS).not.toContain(key);
    expectNoAuthority(nested);
  }
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

async function expectExistingConflict(
  handler: ReturnType<typeof getHandler>,
  harness: ReturnType<typeof createHarness>,
  args: Record<string, unknown>,
): Promise<void> {
  await expect(handler(harness.context, args)).rejects.toThrow('idempotency_conflict');
  expect(harness.rows.activity_submissions).toHaveLength(1);
  expect(harness.inserts.filter(({ table }) => table === 'activity_submissions')).toHaveLength(1);
  expectNoEvidence(harness);
}

async function createValidGuidedSubmission(
  handler: ReturnType<typeof getHandler>,
  harness: ReturnType<typeof createHarness>,
  key: string,
  userId: string = USER_ID,
): Promise<{ request: Record<string, unknown>; row: Row }> {
  const request = argsFor(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS, key, userId);
  await handler(harness.context, request);
  return { request, row: harness.rows.activity_submissions[0]! };
}

describe('Topic 1.5 polynomial-inequality submission', () => {
  it('stores exact Guided full-credit grading with raw order and text', async () => {
    const handler = getHandler();
    const harness = createHarness();
    const key = 'polynomial-inequality:guided';
    const graded = gradeTopic15PolynomialInequalitySignChart(1, GUIDED_ANSWERS);
    expect(graded.score).toBe(3);
    const result = await handler(harness.context, argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      GUIDED_ANSWERS,
      key,
    ));
    expect(result).toEqual({
      submissionId: 'activity_submissions:1',
      score: 3,
      maxScore: 3,
      attemptOrdinal: 1,
      feedback: '3/3 polynomial-inequality-sign-chart response matched the server rubric.',
    });

    const row = harness.rows.activity_submissions[0]!;
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
    expect(row).toMatchObject({
      userId: USER_ID,
      activityId: GUIDED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: GUIDED_ACTIVITY_ID,
      createIdempotencyKey: key,
      attemptOrdinal: 1,
      score: 3,
      maxScore: 3,
      feedback: '3/3 polynomial-inequality-sign-chart response matched the server rubric.',
      masteryContractVersion: 'learning-evidence.v1',
    });
    expect(row.submittedAt).toBe(row.gradedAt);
    expect(row.submittedAt).toBe(row.createdAt);
    expect(row.submittedAt).toBe(row.updatedAt);
    expect(typeof row.submittedAt).toBe('number');
    expect(Number.isFinite(row.submittedAt)).toBe(true);

    const data = row.submissionData as Record<string, unknown>;
    expect(data).toEqual({
      contractVersion: 'practice.v1',
      activityId: GUIDED_ACTIVITY_ID,
      mode: 'guided_practice',
      status: 'graded',
      attemptNumber: 1,
      submittedAt: new Date(row.submittedAt as number).toISOString(),
      answers: GUIDED_ANSWERS,
      parts: [
        { partId: 'roots', rawAnswer: [5, -2], isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'intervalSigns', rawAnswer: ['-', '-', '+'], isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'solution', rawAnswer: '  (-∞, 5]  ', isCorrect: true, score: 1, maxScore: 1 },
      ],
    });
    expectNoAuthority(data);
    expectNoAuthority(row);
    expectNoEvidence(harness);
    expect(harness.indexCalls).toContain('activities:by_stable_activity_id');
    expect(harness.indexCalls).toContain('activity_submissions:by_user_and_create_idempotency_key');
    expect(harness.indexCalls).toContain('activity_submissions:by_user_and_activity_and_attempt_ordinal');
  });

  it('stores a finite fractional Guided root as wrong roots partial credit', async () => {
    const handler = getHandler();
    const harness = createHarness();
    const key = 'polynomial-inequality:guided-fractional-root';
    const graded = gradeTopic15PolynomialInequalitySignChart(1, FRACTIONAL_GUIDED_ANSWERS);
    expect(graded.score).toBe(2);

    const result = await handler(harness.context, argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      FRACTIONAL_GUIDED_ANSWERS,
      key,
    ));

    expect(result).toEqual({
      submissionId: 'activity_submissions:1',
      score: 2,
      maxScore: 3,
      attemptOrdinal: 1,
      feedback: '2/3 polynomial-inequality-sign-chart response matched the server rubric.',
    });
    const row = harness.rows.activity_submissions[0]!;
    expect(row).toMatchObject({
      userId: USER_ID,
      activityId: GUIDED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: GUIDED_ACTIVITY_ID,
      attemptOrdinal: 1,
      score: 2,
      maxScore: 3,
      feedback: '2/3 polynomial-inequality-sign-chart response matched the server rubric.',
      masteryContractVersion: 'learning-evidence.v1',
    });
    expect(row.submissionData).toEqual({
      contractVersion: 'practice.v1',
      activityId: GUIDED_ACTIVITY_ID,
      mode: 'guided_practice',
      status: 'graded',
      attemptNumber: 1,
      submittedAt: new Date(row.submittedAt as number).toISOString(),
      answers: FRACTIONAL_GUIDED_ANSWERS,
      parts: [
        { partId: 'roots', rawAnswer: [5, -2.5], isCorrect: false, score: 0, maxScore: 1 },
        { partId: 'intervalSigns', rawAnswer: ['-', '-', '+'], isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'solution', rawAnswer: '  (-∞, 5]  ', isCorrect: true, score: 1, maxScore: 1 },
      ],
    });
    expectNoAuthority(row.submissionData);
    expectNoEvidence(harness);

    const replayRequest = argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      FRACTIONAL_GUIDED_ANSWERS,
      key,
    );
    const replayData = replayRequest.submissionData as Record<string, unknown>;
    replayData.attemptNumber = 42;
    replayData.submittedAt = '2026-08-31T00:00:00.000Z';
    const replayResult = await handler(harness.context, replayRequest);

    expect(replayResult).toEqual(result);
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.inserts.filter(({ table }) => table === 'activity_submissions')).toHaveLength(1);
    expectNoEvidence(harness);
  });

  it('stores Independent partial credit and preserves raw arrays and text', async () => {
    const handler = getHandler();
    const harness = createHarness();
    const key = 'polynomial-inequality:independent';
    const graded = gradeTopic15PolynomialInequalitySignChart(2, INDEPENDENT_ANSWERS);
    expect(graded.score).toBe(2);
    const result = await handler(harness.context, argsFor(
      INDEPENDENT_ACTIVITY_ID,
      'independent_practice',
      INDEPENDENT_ANSWERS,
      key,
    ));
    expect(result).toEqual({
      submissionId: 'activity_submissions:1',
      score: 2,
      maxScore: 3,
      attemptOrdinal: 1,
      feedback: '2/3 polynomial-inequality-sign-chart response matched the server rubric.',
    });
    const row = harness.rows.activity_submissions[0]!;
    expect(row).toMatchObject({
      activityId: INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      stableActivityId: INDEPENDENT_ACTIVITY_ID,
      attemptOrdinal: 1,
      score: 2,
      maxScore: 3,
      feedback: '2/3 polynomial-inequality-sign-chart response matched the server rubric.',
    });
    expect(row.submissionData).toMatchObject({
      answers: INDEPENDENT_ANSWERS,
      parts: [
        { partId: 'roots', rawAnswer: [2, 1, -3], isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'intervalSigns', rawAnswer: ['-', '-', '-', '+'], isCorrect: false, score: 0, maxScore: 1 },
        { partId: 'solution', rawAnswer: ' (1.0, 2) U (-infinity, -3) ', isCorrect: true, score: 1, maxScore: 1 },
      ],
    });
    expectNoAuthority(row.submissionData);
    expectNoEvidence(harness);
  });

  it('rejects an existing user and idempotency key without inserting', async () => {
    const handler = getHandler();
    const key = 'polynomial-inequality:existing';
    const existing: Row = {
      _id: 'activity_submissions:existing',
      userId: USER_ID,
      createIdempotencyKey: key,
    };
    const harness = createHarness(existing);
    await expect(handler(harness.context, argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      GUIDED_ANSWERS,
      key,
    ))).rejects.toThrow('idempotency_conflict');
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.inserts.filter(({ table }) => table === 'activity_submissions')).toHaveLength(0);
    expectNoEvidence(harness);
  });

  it('replays an exact request despite advisory client attempt and time', async () => {
    const handler = getHandler();
    const harness = createHarness();
    const key = 'polynomial-inequality:replay';
    const firstRequest = argsFor(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS, key);
    const firstResult = await handler(harness.context, firstRequest);
    const replayRequest = argsFor(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS, key);
    const replayData = replayRequest.submissionData as Record<string, unknown>;
    replayData.attemptNumber = 42;
    replayData.submittedAt = '2026-08-31T00:00:00.000Z';

    const replayResult = await handler(harness.context, replayRequest);

    expect(replayResult).toEqual(firstResult);
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.inserts.filter(({ table }) => table === 'activity_submissions')).toHaveLength(1);
    expectNoEvidence(harness);
  });

  it('replays an Independent exact request despite advisory client attempt and time', async () => {
    const handler = getHandler();
    const harness = createHarness();
    const key = 'polynomial-inequality:independent-replay';
    const firstRequest = argsFor(INDEPENDENT_ACTIVITY_ID, 'independent_practice', INDEPENDENT_ANSWERS, key);
    const firstResult = await handler(harness.context, firstRequest);
    const replayRequest = argsFor(INDEPENDENT_ACTIVITY_ID, 'independent_practice', INDEPENDENT_ANSWERS, key);
    const replayData = replayRequest.submissionData as Record<string, unknown>;
    replayData.attemptNumber = 42;
    replayData.submittedAt = '2026-08-31T00:00:00.000Z';

    const replayResult = await handler(harness.context, replayRequest);

    expect(replayResult).toEqual(firstResult);
    expect(harness.rows.activity_submissions).toHaveLength(1);
    expect(harness.inserts.filter(({ table }) => table === 'activity_submissions')).toHaveLength(1);
    expectNoEvidence(harness);
  });

  it('rejects changed same-key requests without writes', async () => {
    const handler = getHandler();
    const cases: Array<[string, Record<string, unknown>]> = [
      ['raw roots', argsFor(
        GUIDED_ACTIVITY_ID,
        'guided_practice',
        { ...GUIDED_ANSWERS, roots: [-2, 5] },
        'polynomial-inequality:changed-roots',
      )],
      ['interval signs', argsFor(
        GUIDED_ACTIVITY_ID,
        'guided_practice',
        { ...GUIDED_ANSWERS, intervalSigns: ['+', '-', '+'] },
        'polynomial-inequality:changed-signs',
      )],
      ['solution text', argsFor(
        GUIDED_ACTIVITY_ID,
        'guided_practice',
        { ...GUIDED_ANSWERS, solution: '(-∞, 5]' },
        'polynomial-inequality:changed-solution',
      )],
      ['activity and mode', argsFor(
        INDEPENDENT_ACTIVITY_ID,
        'independent_practice',
        INDEPENDENT_ANSWERS,
        'polynomial-inequality:changed-activity',
      )],
    ];

    for (const [name, changedRequest] of cases) {
      const harness = createHarness();
      const key = changedRequest.idempotencyKey as string;
      await createValidGuidedSubmission(handler, harness, key);
      await expectExistingConflict(handler, harness, changedRequest);
      expect(name).toBeTruthy();
    }
  });

  it('rejects corrupt returned rows without writes', async () => {
    const corruptions: Array<[string, (row: Row) => void]> = [
      ['physical activity identity', (row) => { row.activityId = 'activities:wrong'; }],
      ['stable activity identity', (row) => { row.stableActivityId = 'wrong'; }],
      ['mastery contract', (row) => { row.masteryContractVersion = 'wrong'; }],
      ['extra envelope key', (row) => { (row.submissionData as Record<string, unknown>).extra = true; }],
      ['missing envelope key', (row) => { delete (row.submissionData as Record<string, unknown>).status; }],
      ['wrong envelope contract', (row) => { (row.submissionData as Record<string, unknown>).contractVersion = 'wrong'; }],
      ['wrong envelope activity', (row) => { (row.submissionData as Record<string, unknown>).activityId = INDEPENDENT_ACTIVITY_ID; }],
      ['wrong envelope mode', (row) => { (row.submissionData as Record<string, unknown>).mode = 'independent_practice'; }],
      ['wrong envelope status', (row) => { (row.submissionData as Record<string, unknown>).status = 'submitted'; }],
      ['zero envelope attempt', (row) => { (row.submissionData as Record<string, unknown>).attemptNumber = 0; }],
      ['fractional envelope attempt', (row) => { (row.submissionData as Record<string, unknown>).attemptNumber = 1.5; }],
      ['unsafe envelope attempt', (row) => { (row.submissionData as Record<string, unknown>).attemptNumber = Number.MAX_SAFE_INTEGER + 1; }],
      ['wrong-type envelope attempt', (row) => { (row.submissionData as Record<string, unknown>).attemptNumber = '1'; }],
      ['mismatched envelope attempt', (row) => { (row.submissionData as Record<string, unknown>).attemptNumber = 2; }],
      ['noncanonical envelope time', (row) => { (row.submissionData as Record<string, unknown>).submittedAt = '2020-01-01T00:00:00Z'; }],
      ['mismatched envelope time', (row) => { (row.submissionData as Record<string, unknown>).submittedAt = '2020-01-01T00:00:01.000Z'; }],
      ['zero row attempt', (row) => { row.attemptOrdinal = 0; }],
      ['fractional row attempt', (row) => { row.attemptOrdinal = 1.5; }],
      ['unsafe row attempt', (row) => { row.attemptOrdinal = Number.MAX_SAFE_INTEGER + 1; }],
      ['wrong-type row attempt', (row) => { row.attemptOrdinal = '1'; }],
      ['row submittedAt wrong type', (row) => { row.submittedAt = 'not-a-number'; }],
      ['row submittedAt nonfinite', (row) => { row.submittedAt = Number.NaN; }],
      ['row submittedAt mismatch', (row) => { row.submittedAt = (row.submittedAt as number) + 1000; }],
      ['gradedAt wrong type', (row) => { row.gradedAt = 'not-a-number'; }],
      ['gradedAt nonfinite', (row) => { row.gradedAt = Number.NaN; }],
      ['gradedAt mismatch', (row) => { row.gradedAt = (row.submittedAt as number) + 1000; }],
      ['createdAt wrong type', (row) => { row.createdAt = 'not-a-number'; }],
      ['createdAt nonfinite', (row) => { row.createdAt = Number.NaN; }],
      ['createdAt mismatch', (row) => { row.createdAt = (row.submittedAt as number) + 1000; }],
      ['updatedAt wrong type', (row) => { row.updatedAt = 'not-a-number'; }],
      ['updatedAt nonfinite', (row) => { row.updatedAt = Number.NaN; }],
      ['updatedAt mismatch', (row) => { row.updatedAt = (row.submittedAt as number) + 1000; }],
      ['missing roots answer', (row) => {
        const data = row.submissionData as Record<string, unknown>;
        delete (data.answers as Record<string, unknown>).roots;
      }],
      ['wrong stored roots', (row) => {
        ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).roots = [-2, 5];
      }],
      ['wrong stored signs', (row) => {
        ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).intervalSigns = ['+', '-', '+'];
      }],
      ['wrong stored solution', (row) => {
        ((row.submissionData as Record<string, unknown>).answers as Record<string, unknown>).solution = 'wrong';
      }],
      ['empty graded parts', (row) => { (row.submissionData as Record<string, unknown>).parts = []; }],
      ['extra graded part key', (row) => {
        (((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!).extra = true;
      }],
      ['wrong graded part ID', (row) => {
        (((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!).partId = 'wrong';
      }],
      ['wrong graded raw roots', (row) => {
        (((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!).rawAnswer = [-2, 5];
      }],
      ['wrong graded correctness', (row) => {
        (((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!).isCorrect = false;
      }],
      ['wrong graded score', (row) => {
        (((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!).score = 0;
      }],
      ['wrong graded max score', (row) => {
        (((row.submissionData as Record<string, unknown>).parts as Array<Record<string, unknown>>)[0]!).maxScore = 2;
      }],
      ['wrong row score', (row) => { row.score = 0; }],
      ['wrong row max score', (row) => { row.maxScore = 2; }],
      ['wrong row feedback', (row) => { row.feedback = 'wrong'; }],
      ['nested forbidden answerKey', (row) => { (row.submissionData as Record<string, unknown>).answerKey = true; }],
      ...AUTHORITY_KEYS.map((key): [string, (row: Row) => void] => [
        `forbidden ${key}`,
        (row) => { row[key] = true; },
      ]),
    ];

    for (const [name, mutate] of corruptions) {
      const handler = getHandler();
      const harness = createHarness();
      const { request, row } = await createValidGuidedSubmission(
        handler,
        harness,
        `polynomial-inequality:corrupt:${name}`,
      );
      mutate(row);
      await expectExistingConflict(handler, harness, request);
    }
  });

  it('keeps idempotency keys scoped to the user', async () => {
    const handler = getHandler();
    const harness = createHarness();
    const key = 'polynomial-inequality:user-scope';
    const first = await handler(harness.context, argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      GUIDED_ANSWERS,
      key,
      USER_ID,
    ));
    const second = await handler(harness.context, argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      GUIDED_ANSWERS,
      key,
      SECOND_USER_ID,
    ));

    expect(first).toMatchObject({ score: 3, maxScore: 3, attemptOrdinal: 1 });
    expect(second).toMatchObject({ score: 3, maxScore: 3, attemptOrdinal: 1 });
    expect(harness.rows.activity_submissions).toHaveLength(2);
    expect(harness.rows.activity_submissions[1]).toMatchObject({ userId: SECOND_USER_ID, createIdempotencyKey: key });
    expect(harness.inserts.filter(({ table }) => table === 'activity_submissions')).toHaveLength(2);
    expectNoEvidence(harness);
  });

  it('rejects malformed raw envelopes and identities without writes', async () => {
    const handler = getHandler();
    const malformedCases: Array<[string, (envelope: Record<string, unknown>) => void]> = [
      ['extra envelope field', (envelope) => { envelope.extra = true; }],
      ['missing envelope field', (envelope) => { delete envelope.status; }],
      ['wrong contract', (envelope) => { envelope.contractVersion = 'wrong'; }],
      ['wrong status', (envelope) => { envelope.status = 'graded'; }],
      ['wrong activity', (envelope) => { envelope.activityId = INDEPENDENT_ACTIVITY_ID; }],
      ['wrong mode', (envelope) => { envelope.mode = 'independent_practice'; }],
      ['zero attempt', (envelope) => { envelope.attemptNumber = 0; }],
      ['fractional attempt', (envelope) => { envelope.attemptNumber = 1.5; }],
      ['unsafe attempt', (envelope) => { envelope.attemptNumber = Number.MAX_SAFE_INTEGER + 1; }],
      ['non-number attempt', (envelope) => { envelope.attemptNumber = '1'; }],
      ['invalid time', (envelope) => { envelope.submittedAt = 'not-a-date'; }],
      ['non-string time', (envelope) => { envelope.submittedAt = 1; }],
      ['non-record answers', (envelope) => { envelope.answers = null; }],
      ['extra answer field', (envelope) => { envelope.answers = { ...GUIDED_ANSWERS, extra: 1 }; }],
      ['missing answer field', (envelope) => { envelope.answers = { roots: GUIDED_ANSWERS.roots, intervalSigns: GUIDED_ANSWERS.intervalSigns }; }],
      ['non-array roots', (envelope) => {
        envelope.answers = { ...GUIDED_ANSWERS, roots: null };
      }],
      ['wrong root count', (envelope) => {
        envelope.answers = { ...GUIDED_ANSWERS, roots: [-2] };
      }],
      ['non-number root', (envelope) => {
        envelope.answers = { ...GUIDED_ANSWERS, roots: [-2, '5'] };
      }],
      ['non-finite root', (envelope) => {
        envelope.answers = { ...GUIDED_ANSWERS, roots: [-2, Number.NaN] };
      }],
      ['unsafe root', (envelope) => {
        envelope.answers = { ...GUIDED_ANSWERS, roots: [-2, Number.MAX_SAFE_INTEGER + 1] };
      }],
      ['non-array interval signs', (envelope) => {
        envelope.answers = { ...GUIDED_ANSWERS, intervalSigns: null };
      }],
      ['wrong interval-sign count', (envelope) => {
        envelope.answers = { ...GUIDED_ANSWERS, intervalSigns: ['-', '+'] };
      }],
      ['invalid interval sign', (envelope) => {
        envelope.answers = { ...GUIDED_ANSWERS, intervalSigns: ['-', '?', '+'] };
      }],
      ['non-string solution', (envelope) => {
        envelope.answers = { ...GUIDED_ANSWERS, solution: 5 };
      }],
      ['blank solution', (envelope) => {
        envelope.answers = { ...GUIDED_ANSWERS, solution: '   ' };
      }],
      ['missing parts', (envelope) => { delete envelope.parts; }],
      ['non-array parts', (envelope) => { envelope.parts = null; }],
      ['wrong part count', (envelope) => { envelope.parts = []; }],
      ['wrong part order', (envelope) => {
        envelope.parts = [
          { partId: 'intervalSigns', rawAnswer: GUIDED_ANSWERS.intervalSigns },
          { partId: 'roots', rawAnswer: GUIDED_ANSWERS.roots },
          { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
        ];
      }],
      ['wrong part ID', (envelope) => {
        envelope.parts = [
          { partId: 'wrong', rawAnswer: GUIDED_ANSWERS.roots },
          { partId: 'intervalSigns', rawAnswer: GUIDED_ANSWERS.intervalSigns },
          { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
        ];
      }],
      ['raw root mismatch', (envelope) => {
        envelope.parts = [
          { partId: 'roots', rawAnswer: [-2, 6] },
          { partId: 'intervalSigns', rawAnswer: GUIDED_ANSWERS.intervalSigns },
          { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
        ];
      }],
      ['raw sign mismatch', (envelope) => {
        envelope.parts = [
          { partId: 'roots', rawAnswer: GUIDED_ANSWERS.roots },
          { partId: 'intervalSigns', rawAnswer: ['-', '+', '+'] },
          { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
        ];
      }],
      ['raw solution mismatch', (envelope) => {
        envelope.parts = [
          { partId: 'roots', rawAnswer: GUIDED_ANSWERS.roots },
          { partId: 'intervalSigns', rawAnswer: GUIDED_ANSWERS.intervalSigns },
          { partId: 'solution', rawAnswer: 'wrong' },
        ];
      }],
      ['extra part field', (envelope) => {
        envelope.parts = [
          { partId: 'roots', rawAnswer: GUIDED_ANSWERS.roots, extra: true },
          { partId: 'intervalSigns', rawAnswer: GUIDED_ANSWERS.intervalSigns },
          { partId: 'solution', rawAnswer: GUIDED_ANSWERS.solution },
        ];
      }],
    ];
    for (const [name, mutate] of malformedCases) {
      const harness = createHarness();
      const envelope = makeEnvelope(GUIDED_ACTIVITY_ID, 'guided_practice', GUIDED_ANSWERS);
      mutate(envelope);
      await expectRejected(handler, harness, {
        userId: USER_ID,
        activityId: GUIDED_ACTIVITY_ID,
        idempotencyKey: `malformed:${name}`,
        submissionData: envelope,
      });
    }

    await expectRejected(handler, createHarness(), argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      GUIDED_ANSWERS,
      '   ',
    ));
    await expectRejected(handler, createHarness(), argsFor(
      'math.precalc.skill.1.5.unknown.guided_practice',
      'guided_practice',
      GUIDED_ANSWERS,
      'unknown-id',
    ));
    await expectRejected(handler, createHarness(), argsFor(
      INDEPENDENT_ACTIVITY_ID,
      'guided_practice',
      GUIDED_ANSWERS,
      'cross-mode-id',
    ));
  });

  it('rejects an Independent malformed-length answer', async () => {
    const handler = getHandler();
    const answers: Answers = {
      ...INDEPENDENT_ANSWERS,
      roots: [2, 1],
      intervalSigns: ['-', '+', '-'],
    };
    const harness = createHarness();
    await expectRejected(handler, harness, argsFor(
      INDEPENDENT_ACTIVITY_ID,
      'independent_practice',
      answers,
      'independent:bad-length',
    ));
  });

  it('rejects malformed or duplicate provisioning and allocates the next attempt', async () => {
    const handler = getHandler();
    const cases: Array<[string, (harness: ReturnType<typeof createHarness>) => void]> = [
      ['missing activity', (harness) => { harness.rows.activities = []; }],
      ['duplicate activity', (harness) => { harness.rows.activities.push({ ...harness.rows.activities[0]! }); }],
      ['wrong stable ID', (harness) => { harness.rows.activities[0]!.stableActivityId = 'wrong'; }],
      ['wrong component', (harness) => { harness.rows.activities[0]!.componentKey = 'wrong'; }],
      ['non-record props', (harness) => { harness.rows.activities[0]!.props = null; }],
      ['wrong presentation mode', (harness) => { harness.rows.activities[0]!.props = { presentationMode: 'independent_practice' }; }],
      ['non-record grading config', (harness) => { harness.rows.activities[0]!.gradingConfig = null; }],
      ['extra grading config', (harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          ...PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_GRADING_CONFIG,
          extra: true,
        };
      }],
      ['wrong generator', (harness) => {
        harness.rows.activities[0]!.gradingConfig = { generatorKey: 'wrong', variantSeed: 1 };
      }],
      ['wrong seed', (harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY,
          variantSeed: 2,
        };
      }],
      ['non-integer seed', (harness) => {
        harness.rows.activities[0]!.gradingConfig = {
          generatorKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY,
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
        GUIDED_ANSWERS,
        `provisioning:${name}`,
      ));
    }

    const priorSubmission: Row = {
      _id: 'activity_submissions:prior',
      userId: USER_ID,
      activityId: GUIDED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: GUIDED_ACTIVITY_ID,
      createIdempotencyKey: 'prior-key',
      attemptOrdinal: 1,
    };
    const harness = createHarness(priorSubmission);
    const result = await handler(harness.context, argsFor(
      GUIDED_ACTIVITY_ID,
      'guided_practice',
      GUIDED_ANSWERS,
      'fresh-key',
    ));
    expect(result).toMatchObject({
      submissionId: 'activity_submissions:2',
      attemptOrdinal: 2,
    });
    expect(harness.rows.activity_submissions).toHaveLength(2);
    expectNoEvidence(harness);
  });
});
