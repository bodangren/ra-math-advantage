import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateTopic16EquationEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const mocks = vi.hoisted(() => ({
  fetchInternalMutation: vi.fn(),
  requireStudentRequestClaims: vi.fn(),
}));

vi.mock('@/lib/auth/server', () => ({
  requireStudentRequestClaims: mocks.requireStudentRequestClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mocks.fetchInternalMutation,
  internal: {
    activities: {
      createTopic16EquationEndBehaviorWorkedSubmission:
        'internal.activities.createTopic16EquationEndBehaviorWorkedSubmission',
    },
    learningEvidence: {
      submitTopic16EquationEndBehaviorWorkedSubmission:
        'internal.learningEvidence.submitTopic16EquationEndBehaviorWorkedSubmission',
    },
  },
}));

const ROUTE_URL =
  'http://localhost/api/activities/precalculus-topic-1-6-equation-end-behavior-worked/submissions';
const ROUTE_MODULE =
  '@/app/api/activities/precalculus-topic-1-6-equation-end-behavior-worked/submissions/route';
const CREATE_REF = 'internal.activities.createTopic16EquationEndBehaviorWorkedSubmission';
const EXPOSURE_REF = 'internal.learningEvidence.submitTopic16EquationEndBehaviorWorkedSubmission';
const LEARNER_ID = 'profiles:topic16-equation-end-behavior-worked-route';
const IDEMPOTENCY_KEY = 'topic16-equation-end-behavior-worked-route-key';
const WORKED_ACTIVITY_ID = PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID;
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
type PartId = typeof PART_IDS[number];
type Answers = Record<PartId, unknown>;

const SOURCE_ANSWERS = generateTopic16EquationEndBehaviorOutput(0).expectedAnswer as Answers;
const SERVER_RESULT = {
  submissionId: 'activity_submissions:topic16-equation-end-behavior-worked-route',
  attemptOrdinal: 1,
  submittedAt: '2026-08-30T12:00:00.000Z',
} as const;
const MAX_SAFE_SERVER_RESULT = {
  ...SERVER_RESULT,
  attemptOrdinal: Number.MAX_SAFE_INTEGER,
} as const;
const EXPOSURE_NEW = {
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
} as const;
const EXPOSURE_REPLAY = {
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
} as const;

function makeEnvelope(
  answers: Answers = SOURCE_ANSWERS,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    contractVersion: 'practice.v1',
    activityId: WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 7,
    submittedAt: '2026-08-30T00:00:00.000Z',
    answers,
    parts: PART_IDS.map((partId) => ({
      partId,
      rawAnswer: answers[partId],
    })),
    ...overrides,
  };
}

function makeRequest(body: unknown, key: string | null = IDEMPOTENCY_KEY): Request {
  const headers = new Headers();
  if (key !== null) headers.set('Idempotency-Key', key);
  return new Request(ROUTE_URL, {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function getPost(): Promise<(request: Request) => Promise<Response>> {
  const route = await vi.importActual<{ POST: (request: Request) => Promise<Response> }>(ROUTE_MODULE);
  return route.POST;
}

async function expectSafeError(response: Response, status: number): Promise<void> {
  expect(response.status).toBe(status);
  const text = await response.text();
  expect(text).not.toContain('private');
  expect(text).not.toContain('activity_submissions');
  expect(text).not.toContain('correctAnswer');
  expect(text).not.toContain('expectedAnswer');
  expect(text).not.toContain('answerKey');
  expect(text).not.toContain('teacher_led');
  expect(text).not.toContain('masteryApplied');
  expect(text).not.toContain('introduced');
}

function expectExactEnvelope(body: Record<string, unknown>): void {
  expect(Object.keys(body).sort()).toStrictEqual([
    'activityId',
    'answers',
    'attemptNumber',
    'contractVersion',
    'mode',
    'parts',
    'status',
    'submittedAt',
  ]);
  expect(Object.keys(body.answers as object).sort()).toStrictEqual([...PART_IDS].sort());
  const parts = body.parts as Array<Record<string, unknown>>;
  expect(parts.map((part) => part.partId)).toStrictEqual(PART_IDS);
  expect(parts.every((part) => Object.keys(part).sort().join('|') === 'partId|rawAnswer')).toBe(true);
  expect(parts.every((part, index) => part.rawAnswer === (body.answers as Answers)[PART_IDS[index]!])).toBe(true);
}

describe('POST /api/activities/precalculus-topic-1-6-equation-end-behavior-worked/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchInternalMutation.mockReset();
    mocks.requireStudentRequestClaims.mockReset();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: 'student' });
    mocks.fetchInternalMutation.mockImplementation((ref: unknown) => (
      ref === CREATE_REF ? SERVER_RESULT : EXPOSURE_NEW
    ));
  });

  it('authenticates with the actual Request before reading headers or body', async () => {
    const POST = await getPost();
    const json = vi.fn(() => Promise.reject(new Error('body must not be read')));
    const getHeader = vi.fn(() => { throw new Error('headers must not be read'); });
    const request = { headers: { get: getHeader }, json } as unknown as Request;
    const authResponse = new Response('Signed out', { status: 401 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);

    await expect(POST(request)).resolves.toBe(authResponse);
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledWith(request);
    expect(getHeader).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('passes through auth Responses and rejects invalid claims or auth failure safely', async () => {
    const POST = await getPost();
    const body = makeEnvelope();
    const authResponse = new Response('Forbidden', { status: 403 });

    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);
    await expect(POST(makeRequest(body))).resolves.toBe(authResponse);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ role: 'student' });
    await expect(POST(makeRequest(body))).resolves.toHaveProperty('status', 401);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: '  ', role: 'student' });
    await expect(POST(makeRequest(body))).resolves.toHaveProperty('status', 401);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: LEARNER_ID, role: 'teacher' });
    await expect(POST(makeRequest(body))).resolves.toHaveProperty('status', 403);
    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error('private auth detail'));
    await expectSafeError(await POST(makeRequest(body)), 500);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('requires a trimmed nonblank Idempotency-Key before reading the body', async () => {
    const POST = await getPost();
    for (const key of [null, '   ', ` ${IDEMPOTENCY_KEY} `] as const) {
      const request = makeRequest(makeEnvelope(), key);
      const json = vi.spyOn(request, 'json');
      const response = await POST(request);
      if (key === null || key.trim().length === 0) {
        expect(response.status).toBe(400);
        expect(json).not.toHaveBeenCalled();
      } else {
        expect(response.status).toBe(200);
      }
    }
  });

  it('rejects invalid JSON safely before the mutation', async () => {
    const POST = await getPost();
    const request = new Request(ROUTE_URL, {
      method: 'POST',
      headers: { 'Idempotency-Key': IDEMPOTENCY_KEY },
      body: '{',
    });

    await expectSafeError(await POST(request), 400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('creates then exposes the exact seed-0 Worked envelope and returns only the create result', async () => {
    const POST = await getPost();
    const submissionData = makeEnvelope();
    const response = await POST(makeRequest(submissionData, ` ${IDEMPOTENCY_KEY} `));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(SERVER_RESULT);
    expectExactEnvelope(submissionData);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(1, CREATE_REF, {
      userId: LEARNER_ID,
      activityId: WORKED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(2, EXPOSURE_REF, {
      learnerId: LEARNER_ID,
      submissionId: SERVER_RESULT.submissionId,
    });
  });

  it('forwards structurally valid source-wrong answers and maps backend rejection safely', async () => {
    const POST = await getPost();
    const wrongAnswers = {
      ...SOURCE_ANSWERS,
      a_leftEnd: SOURCE_ANSWERS.a_leftEnd === 'up' ? 'down' : 'up',
    } as Answers;
    const submissionData = makeEnvelope(wrongAnswers);
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('source answer rejected'));

    await expectSafeError(await POST(makeRequest(submissionData)), 500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(CREATE_REF, {
      userId: LEARNER_ID,
      activityId: WORKED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData,
    });
    expect((submissionData.answers as Answers).a_leftEnd).toBe(wrongAnswers.a_leftEnd);
  });

  it('accepts a positive safe max-safe attempt ordinal in the three-field result', async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockResolvedValueOnce(MAX_SAFE_SERVER_RESULT);

    const response = await POST(makeRequest(makeEnvelope()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(MAX_SAFE_SERVER_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(2, EXPOSURE_REF, {
      learnerId: LEARNER_ID,
      submissionId: MAX_SAFE_SERVER_RESULT.submissionId,
    });
  });

  it.each([
    ['extra outer field', (body: Record<string, unknown>) => { body.extra = true; }],
    ['missing outer field', (body: Record<string, unknown>) => { delete body.parts; }],
    ['wrong contract', (body: Record<string, unknown>) => { body.contractVersion = 'practice.v0'; }],
    ['wrong activity', (body: Record<string, unknown>) => { body.activityId = 'activity:wrong'; }],
    ['wrong mode', (body: Record<string, unknown>) => { body.mode = 'guided_practice'; }],
    ['wrong status', (body: Record<string, unknown>) => { body.status = 'graded'; }],
    ['nonpositive attempt', (body: Record<string, unknown>) => { body.attemptNumber = 0; }],
    ['fractional attempt', (body: Record<string, unknown>) => { body.attemptNumber = 1.5; }],
    ['unsafe attempt', (body: Record<string, unknown>) => { body.attemptNumber = Number.MAX_SAFE_INTEGER + 1; }],
    ['non-string attempt', (body: Record<string, unknown>) => { body.attemptNumber = '7'; }],
    ['invalid time', (body: Record<string, unknown>) => { body.submittedAt = 'not-a-date'; }],
    ['noncanonical time', (body: Record<string, unknown>) => { body.submittedAt = '2026-08-30T00:00:00Z'; }],
    ['non-string time', (body: Record<string, unknown>) => { body.submittedAt = 1; }],
  ] as const)('rejects malformed exact Worked envelope: %s', async (_label, mutate) => {
    const POST = await getPost();
    const body = makeEnvelope();
    mutate(body);

    await expectSafeError(await POST(makeRequest(body)), 400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing answers', undefined],
    ['non-record answers', null],
    ['missing answer key', (() => { const answers = { ...SOURCE_ANSWERS } as Record<string, unknown>; delete answers.a_leftEnd; return answers; })()],
    ['extra answer key', { ...SOURCE_ANSWERS, extra: 'up' }],
    ['wrong answer key', (() => { const answers = { ...SOURCE_ANSWERS } as Record<string, unknown>; delete answers.a_leftEnd; answers.a_left = 'down'; return answers; })()],
    ['noncanonical answer', { ...SOURCE_ANSWERS, a_leftEnd: 'UP' }],
  ] as const)('rejects malformed exact Worked answers: %s', async (_label, answers) => {
    const POST = await getPost();
    const body = makeEnvelope();
    body.answers = answers;

    await expectSafeError(await POST(makeRequest(body)), 400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['missing parts', undefined],
    ['non-array parts', {}],
    ['wrong part count', [{ partId: PART_IDS[0], rawAnswer: SOURCE_ANSWERS[PART_IDS[0]] }]],
    ['wrong part order', [
      { partId: PART_IDS[1], rawAnswer: SOURCE_ANSWERS[PART_IDS[1]] },
      { partId: PART_IDS[0], rawAnswer: SOURCE_ANSWERS[PART_IDS[0]] },
      ...PART_IDS.slice(2).map((partId) => ({ partId, rawAnswer: SOURCE_ANSWERS[partId] })),
    ]],
    ['wrong part ID', PART_IDS.map((partId, index) => ({
      partId: index === 0 ? 'wrong_part' : partId,
      rawAnswer: SOURCE_ANSWERS[partId],
    }))],
    ['raw answer mismatch', PART_IDS.map((partId, index) => ({
      partId,
      rawAnswer: index === 0
        ? (SOURCE_ANSWERS[partId] === 'up' ? 'down' : 'up')
        : SOURCE_ANSWERS[partId],
    }))],
    ['extra part field', PART_IDS.map((partId, index) => ({
      partId,
      rawAnswer: SOURCE_ANSWERS[partId],
      ...(index === 0 ? { score: 1 } : {}),
    }))],
    ['non-record part', [null, ...PART_IDS.slice(1).map((partId) => ({
      partId,
      rawAnswer: SOURCE_ANSWERS[partId],
    }))]],
  ] as const)('rejects malformed exact Worked parts: %s', async (_label, parts) => {
    const POST = await getPost();
    const body = makeEnvelope(SOURCE_ANSWERS, { parts });

    await expectSafeError(await POST(makeRequest(body)), 400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['non-object result', null],
    ['extra result field', { ...SERVER_RESULT, hidden: true }],
    ['missing result field', (() => { const result = { ...SERVER_RESULT } as Record<string, unknown>; delete result.submittedAt; return result; })()],
    ['blank submission ID', { ...SERVER_RESULT, submissionId: ' ' }],
    ['non-string submission ID', { ...SERVER_RESULT, submissionId: 1 }],
    ['zero ordinal', { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ['negative ordinal', { ...SERVER_RESULT, attemptOrdinal: -1 }],
    ['fractional ordinal', { ...SERVER_RESULT, attemptOrdinal: 1.5 }],
    ['unsafe ordinal', { ...SERVER_RESULT, attemptOrdinal: Number.MAX_SAFE_INTEGER + 1 }],
    ['non-string ordinal', { ...SERVER_RESULT, attemptOrdinal: '1' }],
    ['invalid time', { ...SERVER_RESULT, submittedAt: 'not-a-date' }],
    ['noncanonical time', { ...SERVER_RESULT, submittedAt: '2026-08-30T12:00:00Z' }],
    ['non-string time', { ...SERVER_RESULT, submittedAt: 1 }],
  ] as const)('rejects an unsafe or malformed three-field result: %s', async (_label, result) => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockResolvedValueOnce(result);

    await expectSafeError(await POST(makeRequest(makeEnvelope())), 500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['non-object exposure', null],
    ['extra outer field', { ...EXPOSURE_NEW, hidden: true }],
    ['missing outer field', (() => {
      const result = { ...EXPOSURE_NEW } as Record<string, unknown>;
      delete result.kstApplied;
      return result;
    })()],
    ['non-boolean persisted', { ...EXPOSURE_NEW, persisted: 'true' }],
    ['non-boolean mastery', { ...EXPOSURE_NEW, masteryApplied: 'false' }],
    ['non-boolean KST', { ...EXPOSURE_NEW, kstApplied: 0 }],
    ['invalid delivery', { ...EXPOSURE_NEW, delivery: 'queued' }],
    ['non-record decision', { ...EXPOSURE_NEW, decision: null }],
    ['extra decision field', {
      ...EXPOSURE_NEW,
      decision: { ...EXPOSURE_NEW.decision, hidden: true },
    }],
    ['missing decision field', (() => {
      const decision = { ...EXPOSURE_NEW.decision } as Record<string, unknown>;
      delete decision.reason;
      return { ...EXPOSURE_NEW, decision };
    })()],
    ['invalid idempotency', {
      ...EXPOSURE_NEW,
      decision: { ...EXPOSURE_NEW.decision, idempotency: 'old' },
    }],
    ['invalid exposure state', {
      ...EXPOSURE_NEW,
      decision: { ...EXPOSURE_NEW.decision, exposureState: 'mastered' },
    }],
    ['awaiting exposure state', {
      ...EXPOSURE_NEW,
      decision: { ...EXPOSURE_NEW.decision, exposureState: 'awaiting_teacher_exposure' },
    }],
    ['invalid reason', {
      ...EXPOSURE_NEW,
      decision: { ...EXPOSURE_NEW.decision, reason: 'private' },
    }],
    ['node not enabled reason', {
      ...EXPOSURE_NEW,
      decision: { ...EXPOSURE_NEW.decision, reason: 'node_not_enabled' },
    }],
    ['non-boolean eligible', {
      ...EXPOSURE_NEW,
      decision: { ...EXPOSURE_NEW.decision, eligible: 0 },
    }],
    ['eligible true', {
      ...EXPOSURE_NEW,
      decision: { ...EXPOSURE_NEW.decision, eligible: true },
    }],
    ['non-boolean mastery bearing', {
      ...EXPOSURE_NEW,
      decision: { ...EXPOSURE_NEW.decision, masteryBearing: 'false' },
    }],
    ['mastery bearing true', {
      ...EXPOSURE_NEW,
      decision: { ...EXPOSURE_NEW.decision, masteryBearing: true },
    }],
    ['new delivery with replay idempotency', {
      ...EXPOSURE_NEW,
      decision: { ...EXPOSURE_NEW.decision, idempotency: 'replay' },
    }],
    ['replay delivery with new idempotency', {
      ...EXPOSURE_REPLAY,
      decision: { ...EXPOSURE_REPLAY.decision, idempotency: 'new' },
    }],
    ['persisted false with new delivery', { ...EXPOSURE_NEW, persisted: false }],
    ['persisted true with replay delivery', { ...EXPOSURE_REPLAY, persisted: true }],
    ['mastery applied', { ...EXPOSURE_NEW, masteryApplied: true }],
    ['KST applied', { ...EXPOSURE_NEW, kstApplied: true }],
  ] as const)('rejects exposure result corruption safely: %s', async (_label, result) => {
    const POST = await getPost();
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(SERVER_RESULT)
      .mockResolvedValueOnce(result);

    await expectSafeError(await POST(makeRequest(makeEnvelope())), 500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
    expect(mocks.fetchInternalMutation.mock.calls.map(([ref]) => ref)).toStrictEqual([
      CREATE_REF,
      EXPOSURE_REF,
    ]);
  });

  it('maps an exposure rejection safely after create', async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(SERVER_RESULT)
      .mockRejectedValueOnce(new Error('private exposure detail'));

    await expectSafeError(await POST(makeRequest(makeEnvelope())), 500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
    expect(mocks.fetchInternalMutation.mock.calls.map(([ref]) => ref)).toStrictEqual([
      CREATE_REF,
      EXPOSURE_REF,
    ]);
  });

  it('retries create and exposure with the same request and key after exposure failure', async () => {
    const POST = await getPost();
    const body = makeEnvelope();
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(SERVER_RESULT)
      .mockRejectedValueOnce(new Error('private exposure detail'))
      .mockResolvedValueOnce(SERVER_RESULT)
      .mockResolvedValueOnce(EXPOSURE_REPLAY);

    await expectSafeError(await POST(makeRequest(body)), 500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
    const retryResponse = await POST(makeRequest(body));
    expect(retryResponse.status).toBe(200);
    await expect(retryResponse.json()).resolves.toStrictEqual(SERVER_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(4);
    expect(mocks.fetchInternalMutation.mock.calls[0]).toStrictEqual(
      mocks.fetchInternalMutation.mock.calls[2],
    );
    expect(mocks.fetchInternalMutation.mock.calls[1]).toStrictEqual(
      mocks.fetchInternalMutation.mock.calls[3],
    );
    expect(mocks.fetchInternalMutation.mock.calls[1]).toStrictEqual([
      EXPOSURE_REF,
      { learnerId: LEARNER_ID, submissionId: SERVER_RESULT.submissionId },
    ]);
  });

  it('maps only idempotency_conflict to 409 and other mutation errors to safe 500', async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('idempotency_conflict'));
    await expectSafeError(await POST(makeRequest(makeEnvelope())), 409);

    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('private mutation detail'));
    await expectSafeError(await POST(makeRequest(makeEnvelope())), 500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
    expect(mocks.fetchInternalMutation.mock.calls.map(([ref]) => ref)).toStrictEqual([CREATE_REF, CREATE_REF]);
  });
});
