import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getGenerator } from '@math-platform/math-content/knowledge-space';
import {
  buildIm3ProfitModelGuidedSeedDocuments,
  buildIm3ProfitModelIndependentSeedDocuments,
  buildIm3ProfitMaximumGuidedSeedDocuments,
  buildIm3ProfitMaximumIndependentSeedDocuments,
} from '@/convex/seed/seed_lesson_1_1';
import { IM3_PILOT_NODE } from '@/lib/practice/learning-evidence-pilot';

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
      createServerOwnedSubmission: 'internal.activities.createServerOwnedSubmission',
    },
  },
}));

const SERVER_LEARNER_ID = 'authenticated-im3-learner';
const SERVER_SUBMISSION_ID = 'server-owned-im3-submission';
const PILOT_POINTS = getGenerator('quadratic-graph-analysis').generate({
  nodeId: IM3_PILOT_NODE,
  seed: 0,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;

const ENVELOPE = {
  contractVersion: 'practice.v1' as const,
  activityId: 'im3-pilot-activity-document',
  mode: 'independent_practice' as const,
  status: 'submitted' as const,
  attemptNumber: 2,
  submittedAt: '2026-08-19T10:00:00.000Z',
  answers: {
    tableValues: PILOT_POINTS,
    placedPoints: PILOT_POINTS,
  },
  parts: [
    { partId: 'table_values', rawAnswer: PILOT_POINTS },
    { partId: 'placed_points', rawAnswer: PILOT_POINTS },
  ],
};

const GUIDED_ENVELOPE = {
  ...ENVELOPE,
  mode: 'guided_practice' as const,
};

const EQUATION_GUIDED_ENVELOPE = {
  ...ENVELOPE,
  activityId: 'im3-equation-rate-guided-activity-document',
  mode: 'guided_practice' as const,
  answers: {
    fA: 24,
    fB: 0,
    rate: -8,
  },
  parts: [
    { partId: 'f_a', rawAnswer: 24 },
    { partId: 'f_b', rawAnswer: 0 },
    { partId: 'rate', rawAnswer: -8 },
  ],
};

const EQUATION_INDEPENDENT_ENVELOPE = {
  ...EQUATION_GUIDED_ENVELOPE,
  activityId: 'im3-equation-rate-independent-activity-document',
  mode: 'independent_practice' as const,
  answers: {
    fA: -2,
    fB: -26,
    rate: -6,
  },
  parts: [
    { partId: 'f_a', rawAnswer: -2 },
    { partId: 'f_b', rawAnswer: -26 },
    { partId: 'rate', rawAnswer: -6 },
  ],
};

const DOMAIN_RANGE_GUIDED_ENVELOPE = {
  ...ENVELOPE,
  activityId: 'im3-domain-range-guided-activity-document',
  mode: 'guided_practice' as const,
  answers: {
    domain: 'all_real_numbers',
    range: { relation: 'gte' as const, boundary: -2.25 },
  },
  parts: [
    { partId: 'domain', rawAnswer: 'all_real_numbers' },
    { partId: 'range', rawAnswer: { relation: 'gte' as const, boundary: -2.25 } },
  ],
};

const DOMAIN_RANGE_INDEPENDENT_ENVELOPE = {
  ...DOMAIN_RANGE_GUIDED_ENVELOPE,
  activityId: 'im3-domain-range-independent-activity-document',
  mode: 'independent_practice' as const,
  answers: {
    domain: 'all_real_numbers',
    range: { relation: 'lte' as const, boundary: -1 },
  },
  parts: [
    { partId: 'domain', rawAnswer: 'all_real_numbers' },
    { partId: 'range', rawAnswer: { relation: 'lte' as const, boundary: -1 } },
  ],
};

const MAXIMUM_READING_GUIDED_PHYSICAL_ID = 'activities:maximum-reading-guided-route';
const MAXIMUM_READING_INDEPENDENT_PHYSICAL_ID = 'activities:maximum-reading-independent-route';

const MAXIMUM_READING_GUIDED_ENVELOPE = {
  ...ENVELOPE,
  activityId: MAXIMUM_READING_GUIDED_PHYSICAL_ID,
  mode: 'guided_practice' as const,
  answers: { maximum_value: -1 },
  parts: [{ partId: 'maximum_value', rawAnswer: -1 }],
};

const MAXIMUM_READING_INDEPENDENT_ENVELOPE = {
  ...ENVELOPE,
  activityId: MAXIMUM_READING_INDEPENDENT_PHYSICAL_ID,
  mode: 'independent_practice' as const,
  answers: { maximum_value: 2 },
  parts: [{ partId: 'maximum_value', rawAnswer: 2 }],
};

const PROFIT_MODEL_GUIDED_DOCUMENTS = buildIm3ProfitModelGuidedSeedDocuments(
  'activities:profit-model-guided-route' as never,
  123,
);
const PROFIT_MODEL_INDEPENDENT_DOCUMENTS = buildIm3ProfitModelIndependentSeedDocuments(
  'activities:profit-model-independent-route' as never,
  123,
);

const PROFIT_MAXIMUM_GUIDED_DOCUMENTS = buildIm3ProfitMaximumGuidedSeedDocuments(
  'activities:profit-maximum-guided-route' as never,
  123,
);
const PROFIT_MAXIMUM_INDEPENDENT_DOCUMENTS = buildIm3ProfitMaximumIndependentSeedDocuments(
  'activities:profit-maximum-independent-route' as never,
  123,
);

function buildProfitModelAnswers(
  documents: typeof PROFIT_MODEL_GUIDED_DOCUMENTS | typeof PROFIT_MODEL_INDEPENDENT_DOCUMENTS,
  wrongFirstAnswer = false,
) {
  return Object.fromEntries(documents.activity.props.blanks.map((blank, index) => [
    blank.id,
    {
      answer: wrongFirstAnswer && index === 0 ? '231' : blank.correctAnswer,
      isCorrect: false,
      usedWordBank: true,
    },
  ]));
}

const PROFIT_MODEL_GUIDED_ENVELOPE = {
  ...ENVELOPE,
  activityId: 'im3-profit-model-guided-route-activity',
  mode: 'guided_practice' as const,
  answers: buildProfitModelAnswers(PROFIT_MODEL_GUIDED_DOCUMENTS),
  parts: PROFIT_MODEL_GUIDED_DOCUMENTS.activity.props.blanks.map((blank) => ({
    partId: blank.id,
    rawAnswer: blank.correctAnswer,
  })),
};

const PROFIT_MODEL_INDEPENDENT_ENVELOPE = {
  ...ENVELOPE,
  activityId: 'im3-profit-model-independent-route-activity',
  mode: 'independent_practice' as const,
  answers: buildProfitModelAnswers(PROFIT_MODEL_INDEPENDENT_DOCUMENTS),
  parts: PROFIT_MODEL_INDEPENDENT_DOCUMENTS.activity.props.blanks.map((blank) => ({
    partId: blank.id,
    rawAnswer: blank.correctAnswer,
  })),
};

const PROFIT_MODEL_GUIDED_INCORRECT_ENVELOPE = {
  ...PROFIT_MODEL_GUIDED_ENVELOPE,
  answers: buildProfitModelAnswers(PROFIT_MODEL_GUIDED_DOCUMENTS, true),
  parts: PROFIT_MODEL_GUIDED_DOCUMENTS.activity.props.blanks.map((blank, index) => ({
    partId: blank.id,
    rawAnswer: index === 0 ? '231' : blank.correctAnswer,
  })),
};

function buildProfitMaximumEnvelope(
  documents: typeof PROFIT_MAXIMUM_GUIDED_DOCUMENTS | typeof PROFIT_MAXIMUM_INDEPENDENT_DOCUMENTS,
  activityId: string,
  mode: 'guided_practice' | 'independent_practice',
) {
  const answers = Object.fromEntries(documents.activity.props.blanks.map((blank) => [
    blank.id,
    { answer: blank.correctAnswer, isCorrect: false, usedWordBank: true },
  ]));
  return {
    ...ENVELOPE,
    activityId,
    mode,
    answers,
    parts: documents.activity.props.blanks.map((blank) => ({
      partId: blank.id,
      rawAnswer: blank.correctAnswer,
    })),
  };
}

const PROFIT_MAXIMUM_GUIDED_ENVELOPE = buildProfitMaximumEnvelope(
  PROFIT_MAXIMUM_GUIDED_DOCUMENTS,
  'activities:profit-maximum-guided-route',
  'guided_practice',
);
const PROFIT_MAXIMUM_INDEPENDENT_ENVELOPE = buildProfitMaximumEnvelope(
  PROFIT_MAXIMUM_INDEPENDENT_DOCUMENTS,
  'activities:profit-maximum-independent-route',
  'independent_practice',
);

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/activities/submissions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

async function loadPost(): Promise<(request: Request) => Promise<Response>> {
  try {
    const route = await vi.importActual<Record<string, unknown>>(
      '@/app/api/activities/submissions/route',
    );
    if (typeof route.POST !== 'function') {
      throw new Error('POST is not exported');
    }
    return route.POST as (request: Request) => Promise<Response>;
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : '';
    throw new Error(
      'Missing IM3 server-owned create-and-grade route. Export POST from '
        + `apps/integrated-math-3/app/api/activities/submissions/route.ts.${detail}`,
    );
  }
}

describe('POST /api/activities/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({
      sub: SERVER_LEARNER_ID,
      role: 'student',
    });
    mocks.fetchInternalMutation.mockResolvedValue({
      submissionId: SERVER_SUBMISSION_ID,
      score: 2,
      maxScore: 2,
    });
  });

  it('creates and grades an immutable server-owned submission from authenticated raw answers', async () => {
    const POST = await loadPost();
    const idempotencyKey = 'im3-create-route-valid-key';
    const response = await POST(makeRequest(ENVELOPE, {
      'Idempotency-Key': idempotencyKey,
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      submissionId: SERVER_SUBMISSION_ID,
      score: 2,
      maxScore: 2,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      {
        userId: SERVER_LEARNER_ID,
        activityId: ENVELOPE.activityId,
        submissionData: ENVELOPE,
        idempotencyKey,
      },
    );
  });

  it('accepts the exact Guided raw envelope through the existing internal mutation', async () => {
    const POST = await loadPost();
    const response = await POST(makeRequest(GUIDED_ENVELOPE, {
      'Idempotency-Key': 'im3-guided-route-valid-key',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      submissionId: SERVER_SUBMISSION_ID,
      score: 2,
      maxScore: 2,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      {
        userId: SERVER_LEARNER_ID,
        activityId: GUIDED_ENVELOPE.activityId,
        submissionData: GUIDED_ENVELOPE,
        idempotencyKey: 'im3-guided-route-valid-key',
      },
    );
  });

  it('accepts the exact equation-rate Guided raw envelope through the existing internal mutation', async () => {
    const POST = await loadPost();
    const response = await POST(makeRequest(EQUATION_GUIDED_ENVELOPE, {
      'Idempotency-Key': 'im3-equation-rate-guided-valid-key',
    }));

    expect(response.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      {
        userId: SERVER_LEARNER_ID,
        activityId: EQUATION_GUIDED_ENVELOPE.activityId,
        submissionData: EQUATION_GUIDED_ENVELOPE,
        idempotencyKey: 'im3-equation-rate-guided-valid-key',
      },
    );
  });

  it('accepts the exact equation-rate Independent raw envelope through the existing internal mutation', async () => {
    const POST = await loadPost();
    const response = await POST(makeRequest(EQUATION_INDEPENDENT_ENVELOPE, {
      'Idempotency-Key': 'im3-equation-rate-independent-valid-key',
    }));

    expect(response.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      {
        userId: SERVER_LEARNER_ID,
        activityId: EQUATION_INDEPENDENT_ENVELOPE.activityId,
        submissionData: EQUATION_INDEPENDENT_ENVELOPE,
        idempotencyKey: 'im3-equation-rate-independent-valid-key',
      },
    );
  });

  it.each([
    ['Guided', DOMAIN_RANGE_GUIDED_ENVELOPE, 'im3-domain-range-guided-valid-key'],
    ['Independent', DOMAIN_RANGE_INDEPENDENT_ENVELOPE, 'im3-domain-range-independent-valid-key'],
  ] as const)(
    'accepts the exact domain-range %s raw envelope through the existing internal mutation',
    async (_label, envelope, idempotencyKey) => {
      const POST = await loadPost();
      const response = await POST(makeRequest(envelope, {
        'Idempotency-Key': idempotencyKey,
      }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        submissionId: SERVER_SUBMISSION_ID,
        score: 2,
        maxScore: 2,
      });
      expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
        'internal.activities.createServerOwnedSubmission',
        {
          userId: SERVER_LEARNER_ID,
          activityId: envelope.activityId,
          submissionData: envelope,
          idempotencyKey,
        },
      );
    },
  );

  it.each([
    ['Guided', MAXIMUM_READING_GUIDED_ENVELOPE, 'im3-maximum-reading-guided-valid-key'],
    ['Independent', MAXIMUM_READING_INDEPENDENT_ENVELOPE, 'im3-maximum-reading-independent-valid-key'],
  ] as const)(
    'accepts the exact maximum-reading %s renderer envelope through the existing internal mutation',
    async (_label, envelope, idempotencyKey) => {
      const POST = await loadPost();
      const response = await POST(makeRequest(envelope, {
        'Idempotency-Key': idempotencyKey,
      }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        submissionId: SERVER_SUBMISSION_ID,
        score: 2,
        maxScore: 2,
      });
      expect(envelope).not.toHaveProperty('score');
      expect(envelope).not.toHaveProperty('maxScore');
      expect(envelope).not.toHaveProperty('isCorrect');
      expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
        'internal.activities.createServerOwnedSubmission',
        {
          userId: SERVER_LEARNER_ID,
          activityId: envelope.activityId,
          submissionData: envelope,
          idempotencyKey,
        },
      );
    },
  );

  it('rejects a maximum-reading answer and raw part mismatch before the internal mutation', async () => {
    const POST = await loadPost();
    const response = await POST(makeRequest({
      ...MAXIMUM_READING_GUIDED_ENVELOPE,
      parts: [{ partId: 'maximum_value', rawAnswer: 2 }],
    }, {
      'Idempotency-Key': 'im3-maximum-reading-mismatch-key',
    }));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['Guided', PROFIT_MODEL_GUIDED_ENVELOPE, 'im3-profit-model-guided-route-key'],
    ['Independent', PROFIT_MODEL_INDEPENDENT_ENVELOPE, 'im3-profit-model-independent-route-key'],
  ] as const)(
    'accepts the exact profit-model %s renderer envelope through the existing internal mutation',
    async (_label, envelope, idempotencyKey) => {
      const POST = await loadPost();
      mocks.fetchInternalMutation.mockResolvedValueOnce({
        submissionId: SERVER_SUBMISSION_ID,
        score: 7,
        maxScore: 7,
      });
      const response = await POST(makeRequest(envelope, {
        'Idempotency-Key': idempotencyKey,
      }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        submissionId: SERVER_SUBMISSION_ID,
        score: 7,
        maxScore: 7,
      });
      expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
        'internal.activities.createServerOwnedSubmission',
        {
          userId: SERVER_LEARNER_ID,
          activityId: envelope.activityId,
          submissionData: envelope,
          idempotencyKey,
        },
      );
    },
  );

  it.each([
    ['Guided', PROFIT_MAXIMUM_GUIDED_ENVELOPE, 'im3-profit-maximum-guided-route-key'],
    ['Independent', PROFIT_MAXIMUM_INDEPENDENT_ENVELOPE, 'im3-profit-maximum-independent-route-key'],
  ] as const)(
    'accepts the exact maximum-profit %s renderer envelope through the existing internal mutation',
    async (_label, envelope, idempotencyKey) => {
      const POST = await loadPost();
      mocks.fetchInternalMutation.mockResolvedValueOnce({
        submissionId: SERVER_SUBMISSION_ID,
        score: 3,
        maxScore: 3,
      });
      const response = await POST(makeRequest(envelope, {
        'Idempotency-Key': idempotencyKey,
      }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        submissionId: SERVER_SUBMISSION_ID,
        score: 3,
        maxScore: 3,
      });
      expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
        'internal.activities.createServerOwnedSubmission',
        {
          userId: SERVER_LEARNER_ID,
          activityId: envelope.activityId,
          submissionData: envelope,
          idempotencyKey,
        },
      );
    },
  );

  it('rejects an exact maximum-profit nested answer and raw part mismatch before the internal mutation', async () => {
    const POST = await loadPost();
    const response = await POST(makeRequest({
      ...PROFIT_MAXIMUM_GUIDED_ENVELOPE,
      answers: {
        ...PROFIT_MAXIMUM_GUIDED_ENVELOPE.answers,
        optimalIncreases: {
          ...PROFIT_MAXIMUM_GUIDED_ENVELOPE.answers.optimalIncreases,
          answer: '999',
        },
      },
    }, {
      'Idempotency-Key': 'im3-profit-maximum-mismatch-route-key',
    }));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('rejects a mixed maximum-profit and profit-model answer shape before the internal mutation', async () => {
    const POST = await loadPost();
    const response = await POST(makeRequest({
      ...PROFIT_MAXIMUM_GUIDED_ENVELOPE,
      answers: {
        ...PROFIT_MAXIMUM_GUIDED_ENVELOPE.answers,
        priceBase: { answer: '230', isCorrect: false, usedWordBank: true },
      },
      parts: [
        ...PROFIT_MAXIMUM_GUIDED_ENVELOPE.parts,
        { partId: 'priceBase', rawAnswer: '230' },
      ],
    }, {
      'Idempotency-Key': 'im3-profit-maximum-mixed-shape-route-key',
    }));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('accepts an incorrect Guided renderer answer when its matching raw part is also incorrect', async () => {
    const POST = await loadPost();
    mocks.fetchInternalMutation.mockResolvedValueOnce({
      submissionId: SERVER_SUBMISSION_ID,
      score: 6,
      maxScore: 7,
    });
    const response = await POST(makeRequest(PROFIT_MODEL_GUIDED_INCORRECT_ENVELOPE, {
      'Idempotency-Key': 'im3-profit-model-guided-incorrect-route-key',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      submissionId: SERVER_SUBMISSION_ID,
      score: 6,
      maxScore: 7,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      expect.objectContaining({
        submissionData: PROFIT_MODEL_GUIDED_INCORRECT_ENVELOPE,
      }),
    );
  });

  it('rejects a profit-model nested answer and raw part mismatch before the internal mutation', async () => {
    const POST = await loadPost();
    const answers = {
      ...PROFIT_MODEL_GUIDED_ENVELOPE.answers,
      priceBase: {
        ...PROFIT_MODEL_GUIDED_ENVELOPE.answers.priceBase,
        answer: '231',
      },
    };
    const parts = PROFIT_MODEL_GUIDED_ENVELOPE.parts.map((part) => (
      part.partId === 'priceBase' ? { ...part, rawAnswer: '230' } : part
    ));
    const response = await POST(makeRequest({
      ...PROFIT_MODEL_GUIDED_ENVELOPE,
      answers,
      parts,
    }, {
      'Idempotency-Key': 'im3-profit-model-mismatch-route-key',
    }));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('passes the opaque create idempotency key to the server-owned mutation', async () => {
    const POST = await loadPost();
    const response = await POST(makeRequest(ENVELOPE, {
      'Idempotency-Key': 'im3-create-retry-key',
    }));

    expect(response.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      expect.objectContaining({
        userId: SERVER_LEARNER_ID,
        activityId: ENVELOPE.activityId,
        submissionData: ENVELOPE,
        idempotencyKey: 'im3-create-retry-key',
      }),
    );
  });

  it('does not accept a client-provided submission identity or grade', async () => {
    const POST = await loadPost();
    const response = await POST(makeRequest({
      ...ENVELOPE,
      submissionId: 'client-chosen-submission-id',
      score: 6,
      maxScore: 6,
      isCorrect: true,
    }, {
      'Idempotency-Key': 'im3-client-authority-rejection-key',
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      error: expect.stringContaining('submissionId'),
    }));
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('rejects an invalid practice envelope before the internal create-and-grade mutation', async () => {
    const POST = await loadPost();
    const response = await POST(makeRequest({ activityId: ENVELOPE.activityId }, {
      'Idempotency-Key': 'im3-invalid-envelope-key',
    }));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ['a different valid practice mode', () => ({ ...ENVELOPE, mode: 'worked_example' })],
    ['an invalid pilot status', () => ({ ...ENVELOPE, status: 'graded' })],
    ['a non-object JSON body', () => []],
    ['a missing required answer key', () => {
      const answers = { ...ENVELOPE.answers };
      Reflect.deleteProperty(answers, 'placedPoints');
      return { ...ENVELOPE, answers };
    }],
    ['an unknown extra answer key', () => ({
      ...ENVELOPE,
      answers: { ...ENVELOPE.answers, unknownAnswer: 'not-an-im3-pilot-answer' },
    })],
    ['a missing required part key', () => ({
      ...ENVELOPE,
      parts: ENVELOPE.parts.slice(0, -1),
    })],
    ['an unknown extra part key', () => ({
      ...ENVELOPE,
      parts: [...ENVELOPE.parts, {
        partId: 'unknown_part',
        rawAnswer: 'not-an-im3-pilot-answer',
      }],
    })],
    ['a duplicate submitted part key', () => ({
      ...ENVELOPE,
      parts: [...ENVELOPE.parts, { ...ENVELOPE.parts[0]! }],
    })],
    ['an unknown replacement part key', () => ({
      ...ENVELOPE,
      parts: [
        ...ENVELOPE.parts.slice(0, -1),
        { partId: 'unknown_part', rawAnswer: 'not-an-im3-pilot-answer' },
      ],
    })],
    ['an old graph-feature part ID', () => ({
      ...ENVELOPE,
      parts: [
        { partId: 'vertex_x', rawAnswer: 0 },
        ENVELOPE.parts[1],
      ],
    })],
    ['a part raw value that does not match its answer value', () => ({
      ...ENVELOPE,
      parts: ENVELOPE.parts.map((part) => (
        part.partId === 'table_values'
          ? { ...part, rawAnswer: [] }
          : part
      )),
    })],
  ] as const)(
    'rejects %s before the public server-owned writer',
    async (_label, makeBody) => {
      const POST = await loadPost();
      const response = await POST(makeRequest(makeBody(), {
        'Idempotency-Key': `im3-malformed-route-${_label.replaceAll(' ', '-')}`,
      }));

      expect(response.status).toBe(400);
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['a missing domain-range answer', () => {
      const answers = { ...DOMAIN_RANGE_GUIDED_ENVELOPE.answers };
      Reflect.deleteProperty(answers, 'domain');
      return { ...DOMAIN_RANGE_GUIDED_ENVELOPE, answers };
    }],
    ['an extra domain-range answer', () => ({
      ...DOMAIN_RANGE_GUIDED_ENVELOPE,
      answers: { ...DOMAIN_RANGE_GUIDED_ENVELOPE.answers, extra: 'unexpected' },
    })],
    ['a missing domain-range part', () => ({
      ...DOMAIN_RANGE_GUIDED_ENVELOPE,
      parts: DOMAIN_RANGE_GUIDED_ENVELOPE.parts.slice(0, 1),
    })],
    ['a duplicate domain-range part', () => ({
      ...DOMAIN_RANGE_GUIDED_ENVELOPE,
      parts: [...DOMAIN_RANGE_GUIDED_ENVELOPE.parts, { ...DOMAIN_RANGE_GUIDED_ENVELOPE.parts[0]! }],
    })],
    ['a mixed domain-range and graph answer shape', () => ({
      ...DOMAIN_RANGE_GUIDED_ENVELOPE,
      answers: { ...DOMAIN_RANGE_GUIDED_ENVELOPE.answers, tableValues: PILOT_POINTS },
    })],
    ['a mismatched structured range raw answer', () => ({
      ...DOMAIN_RANGE_GUIDED_ENVELOPE,
      parts: DOMAIN_RANGE_GUIDED_ENVELOPE.parts.map((part) => (
        part.partId === 'range'
          ? { ...part, rawAnswer: { relation: 'gte' as const, boundary: -2 } }
          : part
      )),
    })],
  ] as const)(
    'rejects %s before the public server-owned writer',
    async (_label, makeBody) => {
      const POST = await loadPost();
      const response = await POST(makeRequest(makeBody(), {
        'Idempotency-Key': `im3-malformed-domain-range-${_label.replaceAll(' ', '-')}`,
      }));

      expect(response.status).toBe(400);
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['a missing Guided answer key', () => {
      const answers = { ...GUIDED_ENVELOPE.answers };
      Reflect.deleteProperty(answers, 'placedPoints');
      return { ...GUIDED_ENVELOPE, answers };
    }],
    ['an extra Guided answer key', () => ({
      ...GUIDED_ENVELOPE,
      answers: { ...GUIDED_ENVELOPE.answers, extra: PILOT_POINTS },
    })],
    ['a missing Guided part', () => ({
      ...GUIDED_ENVELOPE,
      parts: GUIDED_ENVELOPE.parts.slice(0, 1),
    })],
    ['a duplicate Guided part', () => ({
      ...GUIDED_ENVELOPE,
      parts: [...GUIDED_ENVELOPE.parts, { ...GUIDED_ENVELOPE.parts[0]! }],
    })],
    ['a mismatched Guided raw answer', () => ({
      ...GUIDED_ENVELOPE,
      parts: GUIDED_ENVELOPE.parts.map((part) => (
        part.partId === 'table_values'
          ? { ...part, rawAnswer: [] }
          : part
      )),
    })],
  ] as const)(
    'rejects %s before the public server-owned writer',
    async (_label, makeBody) => {
      const POST = await loadPost();
      const response = await POST(makeRequest(makeBody(), {
        'Idempotency-Key': `im3-malformed-guided-route-${_label.replaceAll(' ', '-')}`,
      }));

      expect(response.status).toBe(400);
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['a mixed graph and equation shape', () => ({
      ...EQUATION_GUIDED_ENVELOPE,
      answers: { ...EQUATION_GUIDED_ENVELOPE.answers, tableValues: PILOT_POINTS },
    })],
    ['a mismatched equation raw answer', () => ({
      ...EQUATION_GUIDED_ENVELOPE,
      parts: EQUATION_GUIDED_ENVELOPE.parts.map((part) => (
        part.partId === 'f_a' ? { ...part, rawAnswer: 25 } : part
      )),
    })],
    ['a duplicate equation part', () => ({
      ...EQUATION_GUIDED_ENVELOPE,
      parts: [...EQUATION_GUIDED_ENVELOPE.parts, { ...EQUATION_GUIDED_ENVELOPE.parts[0]! }],
    })],
    ['an extra equation answer', () => ({
      ...EQUATION_GUIDED_ENVELOPE,
      answers: { ...EQUATION_GUIDED_ENVELOPE.answers, extra: 1 },
    })],
    ['a missing equation part', () => ({
      ...EQUATION_GUIDED_ENVELOPE,
      parts: EQUATION_GUIDED_ENVELOPE.parts.slice(0, -1),
    })],
  ] as const)(
    'rejects %s before the public server-owned writer',
    async (_label, makeBody) => {
      const POST = await loadPost();
      const response = await POST(makeRequest(makeBody(), {
        'Idempotency-Key': `im3-malformed-equation-rate-${_label.replaceAll(' ', '-')}`,
      }));

      expect(response.status).toBe(400);
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
    },
  );

  it('returns the authentication response without creating a submission', async () => {
    mocks.requireStudentRequestClaims.mockResolvedValue(new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    ));
    const POST = await loadPost();
    const response = await POST(makeRequest(ENVELOPE));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it('maps only the exact server idempotency conflict sentinel to a safe HTTP 409 response', async () => {
    mocks.fetchInternalMutation.mockRejectedValueOnce(
      new Error('idempotency_conflict'),
    );
    const POST = await loadPost();
    const response = await POST(makeRequest(ENVELOPE, {
      'Idempotency-Key': 'im3-conflicting-create-key',
    }));

    expect(response.status).toBe(409);
    const payload = await response.json() as { error?: unknown };
    expect(payload.error).toEqual(expect.any(String));
    expect(payload.error).not.toMatch(/tableValues|placedPoints/i);
  });

  it('maps the canonical same-key different-payload conflict token to HTTP 409', async () => {
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error('idempotency_conflict'));
    const POST = await loadPost();
    const response = await POST(makeRequest({
      ...ENVELOPE,
      answers: {
        ...ENVELOPE.answers,
        tableValues: PILOT_POINTS.map((point, index) => (
          index === 0 ? { ...point, y: point.y + 1 } : point
        )),
      },
      parts: ENVELOPE.parts.map((part) => (
        part.partId === 'table_values'
          ? {
              ...part,
              rawAnswer: PILOT_POINTS.map((point, index) => (
                index === 0 ? { ...point, y: point.y + 1 } : point
              )),
            }
          : part
      )),
    }, {
      'Idempotency-Key': 'im3-same-key-different-payload',
    }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: 'Idempotency key was already used for a different submission',
    });
  });

  it('keeps an unrelated internal error with an idempotency-like phrase at safe HTTP 500', async () => {
    mocks.fetchInternalMutation.mockRejectedValueOnce(
      new Error('database transaction failed after idempotency key was reused for a different payload'),
    );
    const POST = await loadPost();
    const response = await POST(makeRequest(ENVELOPE, {
      'Idempotency-Key': 'im3-unrelated-error-with-conflict-phrase',
    }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to create activity submission',
    });
  });
});
