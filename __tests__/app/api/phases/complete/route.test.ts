import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRequireStudentRequestClaims = vi.fn();
const mockFetchInternalMutation = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  requireStudentRequestClaims: mockRequireStudentRequestClaims,
}));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    student: {
      completePhase: 'student:completePhase',
    },
  },
}));

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/phases/complete', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('POST /api/phases/complete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );
    const { POST } = await import('@/app/api/phases/complete/route');
    const res = await POST(makeRequest({ lessonId: 'lesson-1', phaseNumber: 1, timeSpent: 60, idempotencyKey: 'key1' }));
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not a student', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }),
    );
    const { POST } = await import('@/app/api/phases/complete/route');
    const res = await POST(makeRequest({ lessonId: 'lesson-1', phaseNumber: 1, timeSpent: 60, idempotencyKey: 'key1' }));
    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields are missing', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    const { POST } = await import('@/app/api/phases/complete/route');
    const res = await POST(makeRequest({ lessonId: 'lesson-1' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with success on valid completion', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockResolvedValue({
      success: true,
      nextPhaseUnlocked: true,
    });
    const { POST } = await import('@/app/api/phases/complete/route');
    const res = await POST(makeRequest({
      lessonId: 'lesson-1',
      phaseNumber: 1,
      timeSpent: 60,
      idempotencyKey: 'key1',
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('returns 200 with alreadyCompleted for idempotent request', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockResolvedValue({
      success: true,
      alreadyCompleted: true,
    });
    const { POST } = await import('@/app/api/phases/complete/route');
    const res = await POST(makeRequest({
      lessonId: 'lesson-1',
      phaseNumber: 1,
      timeSpent: 60,
      idempotencyKey: 'key1',
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.alreadyCompleted).toBe(true);
  });

  it('passes linkedStandardId when provided', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockResolvedValue({
      success: true,
      nextPhaseUnlocked: true,
    });
    const { POST } = await import('@/app/api/phases/complete/route');
    await POST(makeRequest({
      lessonId: 'lesson-1',
      phaseNumber: 1,
      timeSpent: 60,
      idempotencyKey: 'key1',
      linkedStandardId: 'CCSS.MATH.HSF.IF.C.7',
    }));
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'student:completePhase',
      expect.objectContaining({ linkedStandardId: 'CCSS.MATH.HSF.IF.C.7' }),
    );
  });

  it('returns 500 when Convex mutation throws', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockRejectedValue(new Error('Convex error'));
    const { POST } = await import('@/app/api/phases/complete/route');
    const res = await POST(makeRequest({
      lessonId: 'lesson-1',
      phaseNumber: 1,
      timeSpent: 60,
      idempotencyKey: 'key1',
    }));
    expect(res.status).toBe(500);
  });
});
