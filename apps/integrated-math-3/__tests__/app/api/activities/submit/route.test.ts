import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRequireStudentRequestClaims = vi.fn();
const mockFetchInternalMutation = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  requireStudentRequestClaims: mockRequireStudentRequestClaims,
}));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    activities: {
      submitActivity: 'activities:submitActivity',
    },
  },
}));

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/activities/submit', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('POST /api/activities/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates envelope and returns 401 when not authenticated', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );
    const { POST } = await import('@/app/api/activities/submit/route');
    const res = await POST(makeRequest({
      contractVersion: 'practice.v1',
      activityId: 'act123',
      mode: 'assessment',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2024-01-01T00:00:00Z',
      answers: { q1: 'A' },
      parts: [],
    }));
    expect(res.status).toBe(401);
  });

  it('validates envelope and rejects with 400 when invalid', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    const { POST } = await import('@/app/api/activities/submit/route');
    const res = await POST(makeRequest({
      contractVersion: 'wrong-version',
      activityId: 'act123',
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('calls Convex mutation and returns confirmation with submissionId', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockResolvedValue({
      id: 'sub123',
    });
    const { POST } = await import('@/app/api/activities/submit/route');
    const res = await POST(makeRequest({
      contractVersion: 'practice.v1',
      activityId: 'act123',
      mode: 'assessment',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2024-01-01T00:00:00Z',
      answers: { q1: 'A' },
      parts: [],
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.submissionId).toBe('sub123');
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'activities:submitActivity',
      expect.objectContaining({
        userId: 'p1',
        activityId: 'act123',
        submissionData: expect.any(Object),
      }),
    );
  });

  it('returns confirmation with score when auto-graded', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockResolvedValue({
      id: 'sub456',
      score: 85,
      maxScore: 100,
    });
    const { POST } = await import('@/app/api/activities/submit/route');
    const res = await POST(makeRequest({
      contractVersion: 'practice.v1',
      activityId: 'act456',
      mode: 'assessment',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2024-01-01T00:00:00Z',
      answers: { q1: 'A', q2: 'B' },
      parts: [],
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.score).toBe(85);
    expect(body.maxScore).toBe(100);
  });

  it('returns 400 when activityId is missing', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    const { POST } = await import('@/app/api/activities/submit/route');
    const res = await POST(makeRequest({
      contractVersion: 'practice.v1',
      mode: 'assessment',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2024-01-01T00:00:00Z',
      answers: { q1: 'A' },
      parts: [],
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('returns 500 when Convex mutation throws', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockRejectedValue(new Error('Convex error'));
    const { POST } = await import('@/app/api/activities/submit/route');
    const res = await POST(makeRequest({
      contractVersion: 'practice.v1',
      activityId: 'act789',
      mode: 'assessment',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2024-01-01T00:00:00Z',
      answers: { q1: 'A' },
      parts: [],
    }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Failed to submit activity');
  });

  it('validates that contractVersion is exactly "practice.v1"', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    const { POST } = await import('@/app/api/activities/submit/route');
    const res = await POST(makeRequest({
      contractVersion: 'practice.v2',
      activityId: 'act123',
      mode: 'assessment',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2024-01-01T00:00:00Z',
      answers: { q1: 'A' },
      parts: [],
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('includes all envelope fields in Convex mutation', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockResolvedValue({
      id: 'sub999',
    });
    const { POST } = await import('@/app/api/activities/submit/route');
    const envelope = {
      contractVersion: 'practice.v1' as const,
      activityId: 'act999',
      mode: 'assessment' as const,
      status: 'submitted' as const,
      attemptNumber: 2,
      submittedAt: '2024-01-01T00:00:00Z',
      answers: { q1: 'A', q2: 'B' },
      parts: [
        { partId: 'q1', rawAnswer: 'A', normalizedAnswer: 'a' },
        { partId: 'q2', rawAnswer: 'B', normalizedAnswer: 'b' },
      ],
      artifact: { type: 'graph', data: [1, 2, 3] },
      interactionHistory: [{ type: 'hint', timestamp: '2024-01-01T00:00:00Z' }],
      analytics: { timeSpent: 120 },
      studentFeedback: 'Good exercise',
    };
    const res = await POST(makeRequest(envelope));
    expect(res.status).toBe(200);
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'activities:submitActivity',
      expect.objectContaining({
        userId: 'p1',
        activityId: 'act999',
        submissionData: envelope,
      }),
    );
  });
});
