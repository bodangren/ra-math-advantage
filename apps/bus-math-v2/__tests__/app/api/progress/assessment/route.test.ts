import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BM2_PILOT_SOURCE_ACTIVITY_ID } from '@/lib/learning-evidence/bm2-pilot';

const mockGetRequestSessionClaims = vi.fn();
const mockRequireActiveStudentRequestClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();
const SERVER_SUBMISSION_ID = 'server-owned-bm2-assessment-submission';

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
  requireActiveStudentRequestClaims: mockRequireActiveStudentRequestClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    apiRateLimits: {
      checkAndIncrementApiRateLimit: 'internal.apiRateLimits.checkAndIncrementApiRateLimit',
    },
    activities: {
      getActivityById: 'internal.activities.getActivityById',
      submitAssessment: 'internal.activities.submitAssessment',
    },
    learningEvidence: {
      submit: 'internal.learningEvidence.submit',
    },
  },
}));

const { POST } = await import('../../../../../app/api/progress/assessment/route');

function buildRequest(body: unknown) {
  return new Request('http://localhost/api/progress/assessment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

const baseActivity = {
  id: '7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b',
  componentKey: 'comprehension-quiz',
  displayName: 'Quick Check',
  description: 'Assess understanding',
  props: {
    title: 'Knowledge Check',
    description: 'Two question quiz',
    showExplanations: false,
    allowRetry: true,
    questions: [
      {
        id: 'q1',
        text: 'Choose the correct option',
        type: 'multiple-choice',
        options: ['Yes', 'No'],
        correctAnswer: 'Yes',
      },
      {
        id: 'q2',
        text: 'Type the matching word',
        type: 'short-answer',
        correctAnswer: 'Ledger',
      },
    ],
  },
  gradingConfig: {
    autoGrade: true,
    passingScore: 70,
    partialCredit: false,
  },
  standardId: '12345678-1234-1234-8234-123456789012',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('POST /api/progress/assessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });
    mockRequireActiveStudentRequestClaims.mockImplementation(async () => {
      const claims = await mockGetRequestSessionClaims();
      if (!claims) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (claims.role !== 'student') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      return claims;
    });

    mockFetchInternalQuery.mockResolvedValue(baseActivity);
    mockFetchInternalMutation.mockImplementation(async (name: string) => {
      if (name === 'internal.apiRateLimits.checkAndIncrementApiRateLimit') {
        return { allowed: true, remaining: 59, windowExpiresAt: Date.now() + 60000 };
      }
      if (name === 'internal.activities.submitAssessment') {
        return { id: SERVER_SUBMISSION_ID };
      }
      if (name === 'internal.learningEvidence.submit') {
        return {
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
        };
      }
      return null;
    });
  });

  it('accepts omitted optional fields from Convex', async () => {
    mockFetchInternalQuery.mockResolvedValue({ ...baseActivity, description: undefined, standardId: undefined });
    const response = await POST(buildRequest({ activityId: baseActivity.id, answers: { q1: 'Yes', q2: 'Ledger' } }));
    expect(response.status).toBe(200);
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: { q1: 'Yes' },
      }),
    );

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.error).toMatch(/unauthorized/i);
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
  });

  it('returns 401 when student session is deactivated', async () => {
    mockRequireActiveStudentRequestClaims.mockResolvedValue(
      Response.json({ error: 'Session revoked' }, { status: 401 }),
    );

    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: { q1: 'Yes' },
      }),
    );

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.error).toMatch(/session revoked/i);
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
  });

  it('returns 403 when a teacher session attempts to submit an assessment', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_teacher',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });

    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: { q1: 'Yes' },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'Forbidden' });
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it('validates the incoming payload schema', async () => {
    const response = await POST(buildRequest({ answers: { q1: 'Yes' } }));

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid payload');
  });

  it('rejects empty answer sets', async () => {
    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: {},
      }),
    );

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toMatch(/at least one entry/i);
  });

  it('returns 404 when the activity cannot be found', async () => {
    mockFetchInternalQuery.mockResolvedValue(null);

    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: { q1: 'Yes' },
      }),
    );

    expect(response.status).toBe(404);
    const payload = await response.json();
    expect(payload.error).toMatch(/not found/i);
  });

  it.each([
    BM2_PILOT_SOURCE_ACTIVITY_ID,
    'accounting-equation',
  ])('uses the physical activity lookup for %s and rejects a missing row', async (activityId) => {
    mockFetchInternalQuery.mockImplementation(async (name: string) => (
      name === 'internal.activities.getActivityById' ? null : baseActivity
    ));

    const response = await POST(
      buildRequest({
        activityId,
        answers: { q1: 'Yes' },
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Activity not found' });
    expect(mockFetchInternalQuery).toHaveBeenCalledWith(
      'internal.activities.getActivityById',
      { activityId },
    );
    expect(mockFetchInternalMutation).not.toHaveBeenCalledWith(
      'internal.activities.submitAssessment',
      expect.anything(),
    );
    expect(mockFetchInternalMutation).not.toHaveBeenCalledWith(
      'internal.learningEvidence.submit',
      expect.anything(),
    );
  });

  it('scores and persists submission with claims-based user id', async () => {
    const response = await POST(
      buildRequest({
        contractVersion: 'practice.v1',
        activityId: baseActivity.id,
        mode: 'assessment',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date().toISOString(),
        answers: {
          q1: 'Yes',
          q2: 'ledger',
        },
        parts: [
          {
            partId: 'q1',
            rawAnswer: 'Yes',
            normalizedAnswer: 'yes',
          },
          {
            partId: 'q2',
            rawAnswer: 'ledger',
            normalizedAnswer: 'ledger',
          },
        ],
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.score).toBe(2);
    expect(payload.maxScore).toBe(2);
    expect(payload.percentage).toBe(100);

    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.submitAssessment',
      expect.objectContaining({
        userId: 'profile_123',
        activityId: baseActivity.id,
        score: 2,
        maxScore: 2,
      }),
    );
  });

  it('derives trusted aggregate grades from the rubric instead of browser top-level grade fields', async () => {
    const response = await POST(
      buildRequest({
        contractVersion: 'practice.v1',
        activityId: baseActivity.id,
        mode: 'assessment',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: '1999-01-01T00:00:00.000Z',
        answers: {
          q1: 'No',
          q2: 'wrong',
        },
        parts: [
          { partId: 'q1', rawAnswer: 'No' },
          { partId: 'q2', rawAnswer: 'wrong' },
        ],
        score: 999,
        maxScore: 999,
        feedback: 'Forged browser feedback.',
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      score: 0,
      maxScore: 2,
    });
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.submitAssessment',
      expect.objectContaining({
        score: 0,
        maxScore: 2,
        feedback: expect.not.stringContaining('Forged browser feedback.'),
      }),
    );
  });

  it('stores the Guided source response without recording teacher exposure', async () => {
    const sourceActivityDocumentId = 'activities:bm2-daily-source-row';
    const submittedAt = '2026-08-19T10:00:00.000Z';
    mockFetchInternalQuery.mockResolvedValue({
      ...baseActivity,
      id: sourceActivityDocumentId,
      stableActivityId: BM2_PILOT_SOURCE_ACTIVITY_ID,
    });

    const request = buildRequest({
      contractVersion: 'practice.v1',
      activityId: sourceActivityDocumentId,
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt,
      answers: { q1: 'Yes', q2: 'ledger' },
      parts: [
        { partId: 'q1', rawAnswer: 'Yes' },
        { partId: 'q2', rawAnswer: 'ledger' },
      ],
    });
    request.headers.set('Idempotency-Key', submittedAt);
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.submitAssessment',
      expect.objectContaining({
        userId: 'profile_123',
        activityId: sourceActivityDocumentId,
      }),
    );
    expect(mockFetchInternalMutation).not.toHaveBeenCalledWith(
      'internal.learningEvidence.submit',
      expect.anything(),
    );
  });

  it('ignores client score metadata and returns canonical score fields', async () => {
    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: {
          q1: 'No',
          q2: 'wrong',
        },
        metadata: {
          score: 999,
          maxScore: 999,
          percentage: 100,
        },
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();

    expect(Object.keys(payload).sort()).toEqual(
      ['score', 'maxScore', 'percentage', 'feedback'].sort(),
    );
    expect(payload.score).toBe(0);
    expect(payload.maxScore).toBe(2);
    expect(payload.percentage).toBe(0);
  });

  it('saves work for teacher review when automatic grading is disabled', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      ...baseActivity,
      gradingConfig: {
        ...baseActivity.gradingConfig,
        autoGrade: false,
      },
    });

    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: { q1: 'Yes' },
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.feedback).toBe('Your work is saved for teacher review.');
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ submissionData: expect.objectContaining({ answers: { q1: 'Yes' } }) }));
  });
});
