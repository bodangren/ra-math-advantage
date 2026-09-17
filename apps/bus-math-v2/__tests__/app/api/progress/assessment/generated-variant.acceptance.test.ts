import { beforeEach, describe, expect, it, vi } from 'vitest';

import { accountingEquationFamily } from '@/lib/practice/engine/families/accounting-equation';

const mocks = vi.hoisted(() => ({
  calculateScore: vi.fn(),
  fetchInternalMutation: vi.fn(),
  fetchInternalQuery: vi.fn(),
  requireActiveStudentRequestClaims: vi.fn(),
}));

vi.mock('@/lib/auth/server', () => ({
  requireActiveStudentRequestClaims: mocks.requireActiveStudentRequestClaims,
}));

vi.mock('@/lib/assessments/scoring', () => ({
  calculateScore: mocks.calculateScore,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mocks.fetchInternalMutation,
  fetchInternalQuery: mocks.fetchInternalQuery,
  internal: {
    apiRateLimits: {
      checkAndIncrementApiRateLimit: 'internal.apiRateLimits.checkAndIncrementApiRateLimit',
    },
    activities: {
      getActivityById: 'internal.activities.getActivityById',
      createServerOwnedSubmission: 'internal.activities.createServerOwnedSubmission',
    },
  },
}));

const { POST } = await import('@/app/api/progress/assessment/route');

const LEARNER_ID = 'profiles:bm2-generated-variant-student';
const SERVER_RESULT = {
  submissionId: 'activity_submissions:bm2-generated-variant',
  score: 1,
  maxScore: 1,
  feedback: 'Correct equation balance.',
  attemptOrdinal: 3,
} as const;
const LONG_OPAQUE_KEY = `opaque-key-${'x'.repeat(257)}`;

function request(body: unknown, idempotencyKey = 'bm2-generated-variant-create-key'): Request {
  return new Request('http://localhost/api/progress/assessment', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(body),
  });
}

function makeGeneratedEnvelope() {
  const definition = accountingEquationFamily.generate(7, { mode: 'independent_practice' });
  const hiddenTermId = definition.equation.hiddenTermId;
  return {
    definition,
    rawEnvelope: {
      contractVersion: 'practice.v1' as const,
      activityId: definition.activityId,
      mode: 'independent_practice' as const,
      status: 'submitted' as const,
      attemptNumber: 99,
      submittedAt: '2026-08-19T10:00:00.000Z',
      answers: { [hiddenTermId]: definition.equation[hiddenTermId] },
      parts: [{
        partId: hiddenTermId,
        rawAnswer: definition.equation[hiddenTermId],
        isCorrect: true,
        score: 99,
        maxScore: 99,
      }],
    },
  };
}

describe('BM2 generated accounting-equation supplementary producer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireActiveStudentRequestClaims.mockResolvedValue({
      sub: LEARNER_ID,
      role: 'student',
    });
    mocks.calculateScore.mockImplementation(() => {
      throw new Error('The legacy static activity grader must not grade generated variants.');
    });
    mocks.fetchInternalMutation.mockImplementation(async (operation: string) => {
      if (operation === 'internal.apiRateLimits.checkAndIncrementApiRateLimit') {
        return { allowed: true, remaining: 59, windowExpiresAt: Date.now() + 60_000 };
      }

      if (operation === 'internal.activities.createServerOwnedSubmission') {
        return SERVER_RESULT;
      }

      throw new Error(`Unexpected mutation: ${operation}`);
    });
  });

  it('accepts a long opaque key while it reconstructs and grades the real generated variant', async () => {
    const definition = accountingEquationFamily.generate(7, { mode: 'independent_practice' });
    const hiddenTermId = definition.equation.hiddenTermId;
    const rawEnvelope = {
      contractVersion: 'practice.v1' as const,
      activityId: definition.activityId,
      mode: 'independent_practice' as const,
      status: 'submitted' as const,
      // The server must assign its own progression ordinal.
      attemptNumber: 99,
      submittedAt: '2026-08-19T10:00:00.000Z',
      answers: { [hiddenTermId]: definition.equation[hiddenTermId] },
      parts: [{
        partId: hiddenTermId,
        rawAnswer: definition.equation[hiddenTermId],
        isCorrect: true,
        score: 99,
        maxScore: 99,
      }],
    };

    const response = await POST(request(rawEnvelope, LONG_OPAQUE_KEY));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(SERVER_RESULT);
    expect(definition.mode).toBe('independent_practice');
    expect(definition.activityId).toMatch(/^accounting-equation-7-(assets|liabilities|equity)$/);
    expect(definition.activityId).not.toBe('accounting-equation');
    expect(mocks.calculateScore).not.toHaveBeenCalled();
    expect(mocks.fetchInternalQuery).not.toHaveBeenCalledWith(
      'internal.activities.getActivityById',
      { activityId: definition.activityId },
    );

    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      {
      userId: LEARNER_ID,
      activityId: definition.activityId,
      submissionData: rawEnvelope,
      idempotencyKey: LONG_OPAQUE_KEY,
      },
    );
    const writerInput = mocks.fetchInternalMutation.mock.calls.find(([operation]) => (
      operation === 'internal.activities.createServerOwnedSubmission'
    ))?.[1];
    expect(writerInput).not.toHaveProperty('score');
    expect(writerInput).not.toHaveProperty('maxScore');
    expect(writerInput).not.toHaveProperty('feedback');
    expect(writerInput).not.toHaveProperty('attemptOrdinal');
  });

  it('maps an exact server-owned idempotency_conflict to HTTP 409', async () => {
    const { rawEnvelope } = makeGeneratedEnvelope();
    mocks.fetchInternalMutation.mockImplementation(async (operation: string) => {
      if (operation === 'internal.apiRateLimits.checkAndIncrementApiRateLimit') {
        return { allowed: true, remaining: 59, windowExpiresAt: Date.now() + 60_000 };
      }
      if (operation === 'internal.activities.createServerOwnedSubmission') {
        throw new Error('idempotency_conflict');
      }
      throw new Error(`Unexpected mutation: ${operation}`);
    });

    const response = await POST(request(rawEnvelope));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      error: expect.stringMatching(/idempotency|conflict/i),
    }));
  });

  it('maps a server error that only contains idempotency_conflict to safe HTTP 500', async () => {
    const { rawEnvelope } = makeGeneratedEnvelope();
    mocks.fetchInternalMutation.mockImplementation(async (operation: string) => {
      if (operation === 'internal.apiRateLimits.checkAndIncrementApiRateLimit') {
        return { allowed: true, remaining: 59, windowExpiresAt: Date.now() + 60_000 };
      }
      if (operation === 'internal.activities.createServerOwnedSubmission') {
        throw new Error('upstream idempotency_conflict diagnostic');
      }
      throw new Error(`Unexpected mutation: ${operation}`);
    });

    const response = await POST(request(rawEnvelope));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Internal server error' });
  });

  it.each(['worked_example', 'guided_practice', 'assessment', 'teaching'] as const)(
    'rejects the noncanonical generated mode %s before it calls the server-owned writer',
    async (mode) => {
      const { rawEnvelope } = makeGeneratedEnvelope();

      const response = await POST(request({ ...rawEnvelope, mode }));

      expect(response.status).toBe(400);
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalledWith(
        'internal.activities.createServerOwnedSubmission',
        expect.anything(),
      );
    },
  );

  it.each(['draft', 'graded', 'returned'] as const)(
    'rejects the generated status %s before it calls the server-owned writer',
    async (status) => {
      const { rawEnvelope } = makeGeneratedEnvelope();

      const response = await POST(request({ ...rawEnvelope, status }));

      expect(response.status).toBe(400);
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalledWith(
        'internal.activities.createServerOwnedSubmission',
        expect.anything(),
      );
    },
  );

  it.each([
    ['no submitted parts', () => []],
    ['two submitted parts', (hiddenTermId: string, correctAnswer: number) => [{
      partId: hiddenTermId,
      rawAnswer: correctAnswer,
    }, {
      partId: hiddenTermId,
      rawAnswer: correctAnswer,
    }]],
    ['an unknown submitted part ID', (...[, correctAnswer]: [string, number]) => [{
      partId: 'unknown-hidden-term',
      rawAnswer: correctAnswer,
    }]],
    ['a raw part value that disagrees with answers', (hiddenTermId: string, correctAnswer: number) => [{
      partId: hiddenTermId,
      rawAnswer: correctAnswer + 1,
    }]],
  ] as const)(
    'rejects %s at the public generated-practice boundary before it calls the writer',
    async (_label, makeParts) => {
      const { definition, rawEnvelope } = makeGeneratedEnvelope();
      const hiddenTermId = definition.equation.hiddenTermId;
      const correctAnswer = definition.equation[hiddenTermId];

      const response = await POST(request({
        ...rawEnvelope,
        parts: makeParts(hiddenTermId, correctAnswer),
      }));

      expect(response.status).toBe(400);
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalledWith(
        'internal.activities.createServerOwnedSubmission',
        expect.anything(),
      );
    },
  );

  it('rejects separate structurally equal object values before it calls the server-owned writer', async () => {
    const { definition, rawEnvelope } = makeGeneratedEnvelope();
    const hiddenTermId = definition.equation.hiddenTermId;
    const answerValue = { amount: definition.equation[hiddenTermId] };
    const rawAnswerValue = { amount: definition.equation[hiddenTermId] };

    expect(rawAnswerValue).not.toBe(answerValue);
    expect(rawAnswerValue).toStrictEqual(answerValue);

    const response = await POST(request({
      ...rawEnvelope,
      answers: { [hiddenTermId]: answerValue },
      parts: [{
        partId: hiddenTermId,
        rawAnswer: rawAnswerValue,
      }],
    }));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      expect.anything(),
    );
  });
});
