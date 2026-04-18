import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRequireStudentRequestClaims = vi.fn();
const mockFetchInternalMutation = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  requireStudentRequestClaims: mockRequireStudentRequestClaims,
}));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    study: {
      savePracticeTestResult: 'study:savePracticeTestResult',
      recordStudySession: 'study:recordStudySession',
    },
  },
}));

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/practice-tests/complete', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('POST /api/practice-tests/complete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );
    const { POST } = await import('@/app/api/practice-tests/complete/route');
    const res = await POST(makeRequest({ moduleNumber: 1, score: 5 }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    const { POST } = await import('@/app/api/practice-tests/complete/route');
    const res = await POST(makeRequest({ moduleNumber: 1 }));
    expect(res.status).toBe(400);
  });

  it('saves practice test result and records session on valid payload', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockResolvedValue({ resultId: 'r1' });

    const { POST } = await import('@/app/api/practice-tests/complete/route');
    const res = await POST(
      makeRequest({
        moduleNumber: 1,
        lessonsTested: ['lesson-1-1'],
        questionCount: 10,
        score: 8,
        perLessonBreakdown: [
          { lessonId: 'lesson-1-1', lessonTitle: 'Lesson 1-1', correct: 8, total: 10 },
        ],
        durationSeconds: 120,
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'study:savePracticeTestResult',
      expect.objectContaining({
        userId: 'p1',
        moduleNumber: 1,
        score: 8,
      })
    );

    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'study:recordStudySession',
      expect.objectContaining({
        userId: 'p1',
        activityType: 'practice_test',
      })
    );
  });

  it('returns 500 when mutation throws', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockRejectedValue(new Error('Convex error'));

    const { POST } = await import('@/app/api/practice-tests/complete/route');
    const res = await POST(
      makeRequest({
        moduleNumber: 1,
        lessonsTested: ['lesson-1-1'],
        questionCount: 10,
        score: 8,
        perLessonBreakdown: [],
        durationSeconds: 120,
      })
    );

    expect(res.status).toBe(500);
  });
});
