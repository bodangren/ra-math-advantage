import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRequireStudentRequestClaims = vi.fn();
const mockFetchInternalMutation = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  requireStudentRequestClaims: mockRequireStudentRequestClaims,
}));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    queue: {
      sessions: {
        completeDailySession: 'queue:sessions:completeDailySession',
      },
    },
  },
}));

const makeRequest = (body?: object) =>
  new Request('http://localhost/api/practice/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

describe('POST /api/practice/complete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );
    const { POST } = await import('@/app/api/practice/complete/route');
    const res = await POST(makeRequest({ sessionId: 'session-123' }));
    expect(res.status).toBe(401);
  });

  it('calls completeDailySession and returns sessionId on success', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockResolvedValue('session-123');

    const { POST } = await import('@/app/api/practice/complete/route');
    const res = await POST(makeRequest({ sessionId: 'session-123' }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.sessionId).toBe('session-123');
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'queue:sessions:completeDailySession',
      { studentId: 'p1', sessionId: 'session-123' },
    );
  });

  it('returns 400 when sessionId is missing', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });

    const { POST } = await import('@/app/api/practice/complete/route');
    const res = await POST(makeRequest({}));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Missing sessionId');
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns 500 when completeDailySession throws', async () => {
    mockRequireStudentRequestClaims.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
    });
    mockFetchInternalMutation.mockRejectedValue(new Error('No active session'));

    const { POST } = await import('@/app/api/practice/complete/route');
    const res = await POST(makeRequest({ sessionId: 'session-123' }));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Failed to complete session');
  });
});
