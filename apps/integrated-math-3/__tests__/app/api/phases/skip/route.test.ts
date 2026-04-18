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
      skipPhase: 'student:skipPhase',
    },
  },
}));

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/phases/skip', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('POST /api/phases/skip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );
    const { POST } = await import('@/app/api/phases/skip/route');
    const res = await POST(makeRequest({ lessonId: 'lesson-1', phaseNumber: 1, idempotencyKey: 'key1' }));
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not a student', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }),
    );
    const { POST } = await import('@/app/api/phases/skip/route');
    const res = await POST(makeRequest({ lessonId: 'lesson-1', phaseNumber: 1, idempotencyKey: 'key1' }));
    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields are missing', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    const { POST } = await import('@/app/api/phases/skip/route');
    const res = await POST(makeRequest({ lessonId: 'lesson-1' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with success on valid skip', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockResolvedValue({
      success: true,
    });
    const { POST } = await import('@/app/api/phases/skip/route');
    const res = await POST(makeRequest({
      lessonId: 'lesson-1',
      phaseNumber: 1,
      idempotencyKey: 'key1',
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'student:skipPhase',
      {
        userId: 'p1',
        lessonId: 'lesson-1',
        phaseNumber: 1,
        idempotencyKey: 'key1',
      },
    );
  });

  it('returns 500 when Convex mutation throws', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockRejectedValue(new Error('Convex error'));
    const { POST } = await import('@/app/api/phases/skip/route');
    const res = await POST(makeRequest({
      lessonId: 'lesson-1',
      phaseNumber: 1,
      idempotencyKey: 'key1',
    }));
    expect(res.status).toBe(500);
  });
});
