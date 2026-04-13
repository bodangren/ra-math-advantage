import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRequireDeveloperRequestClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  requireDeveloperRequestClaims: mockRequireDeveloperRequestClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    dev: {
      listReviewQueue: 'dev:listReviewQueue',
      submitReview: 'dev:submitReview',
    },
    activities: {
      getProfileByUserId: 'activities:getProfileByUserId',
    },
  },
}));

const makeRequest = (url: string, options?: RequestInit, body?: unknown) =>
  new Request(`http://localhost${url}`, {
    ...options,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

describe('GET /api/dev/review-queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockRequireDeveloperRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );
    const { GET } = await import('@/app/api/dev/review-queue/route');
    const res = await GET(makeRequest('/api/dev/review-queue'));
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not an admin', async () => {
    mockRequireDeveloperRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }),
    );
    const { GET } = await import('@/app/api/dev/review-queue/route');
    const res = await GET(makeRequest('/api/dev/review-queue'));
    expect(res.status).toBe(403);
  });

  it('returns 200 with queue items for admin user', async () => {
    const mockItems = [
      {
        componentKind: 'activity',
        componentId: 'act1',
        componentKey: 'graphing-explorer',
        displayName: 'Graphing Explorer',
        currentHash: 'abc123',
        storedHash: 'abc123',
        isStale: false,
        approval: { status: 'approved' },
      },
    ];
    mockRequireDeveloperRequestClaims.mockResolvedValue({
      sub: 'admin-user',
      role: 'admin',
    });
    mockFetchInternalQuery.mockResolvedValue(mockItems);
    const { GET } = await import('@/app/api/dev/review-queue/route');
    const res = await GET(makeRequest('/api/dev/review-queue'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(mockItems);
  });

  it('passes query parameters to the internal query', async () => {
    mockRequireDeveloperRequestClaims.mockResolvedValue({
      sub: 'admin-user',
      role: 'admin',
    });
    mockFetchInternalQuery.mockResolvedValue([]);
    const { GET } = await import('@/app/api/dev/review-queue/route');
    const res = await GET(makeRequest('/api/dev/review-queue?componentKind=activity&status=unreviewed&onlyStale=true'));
    expect(res.status).toBe(200);
    expect(mockFetchInternalQuery).toHaveBeenCalledWith(
      'dev:listReviewQueue',
      expect.objectContaining({
        componentKind: 'activity',
        status: 'unreviewed',
        onlyStale: true,
      }),
    );
  });

  it('returns 500 on internal query error', async () => {
    mockRequireDeveloperRequestClaims.mockResolvedValue({
      sub: 'admin-user',
      role: 'admin',
    });
    mockFetchInternalQuery.mockRejectedValue(new Error('Convex error'));
    const { GET } = await import('@/app/api/dev/review-queue/route');
    const res = await GET(makeRequest('/api/dev/review-queue'));
    expect(res.status).toBe(500);
  });
});

describe('POST /api/dev/review-queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockRequireDeveloperRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );
    const { POST } = await import('@/app/api/dev/review-queue/route');
    const res = await POST(
      makeRequest('/api/dev/review-queue', { method: 'POST' }, { componentKind: 'activity', componentId: 'act1', status: 'approved' }),
    );
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not an admin', async () => {
    mockRequireDeveloperRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }),
    );
    const { POST } = await import('@/app/api/dev/review-queue/route');
    const res = await POST(
      makeRequest('/api/dev/review-queue', { method: 'POST' }, { componentKind: 'activity', componentId: 'act1', status: 'approved' }),
    );
    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields are missing', async () => {
    mockRequireDeveloperRequestClaims.mockResolvedValue({
      sub: 'admin-user',
      role: 'admin',
    });
    const { POST } = await import('@/app/api/dev/review-queue/route');
    const res = await POST(
      makeRequest('/api/dev/review-queue', { method: 'POST' }, { componentKind: 'activity' }),
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when comment is missing for needs_changes', async () => {
    mockRequireDeveloperRequestClaims.mockResolvedValue({
      sub: 'admin-user',
      role: 'admin',
    });
    const { POST } = await import('@/app/api/dev/review-queue/route');
    const res = await POST(
      makeRequest('/api/dev/review-queue', { method: 'POST' }, { componentKind: 'activity', componentId: 'act1', status: 'needs_changes' }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Comment is required');
  });

  it('returns 400 when comment is missing for rejected', async () => {
    mockRequireDeveloperRequestClaims.mockResolvedValue({
      sub: 'admin-user',
      role: 'admin',
    });
    const { POST } = await import('@/app/api/dev/review-queue/route');
    const res = await POST(
      makeRequest('/api/dev/review-queue', { method: 'POST' }, { componentKind: 'activity', componentId: 'act1', status: 'rejected' }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Comment is required');
  });

  it('returns 200 on successful review submission', async () => {
    mockRequireDeveloperRequestClaims.mockResolvedValue({
      sub: 'admin-user',
      role: 'admin',
    });
    mockFetchInternalQuery.mockResolvedValue({ id: 'profile-123' });
    mockFetchInternalMutation.mockResolvedValue({ reviewId: 'review-1' });
    const { POST } = await import('@/app/api/dev/review-queue/route');
    const res = await POST(
      makeRequest('/api/dev/review-queue', { method: 'POST' }, {
        componentKind: 'activity',
        componentId: 'act1',
        status: 'approved',
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reviewId).toBe('review-1');
  });

  it('returns 404 when profile not found', async () => {
    mockRequireDeveloperRequestClaims.mockResolvedValue({
      sub: 'admin-user',
      role: 'admin',
    });
    mockFetchInternalQuery.mockResolvedValue(null);
    const { POST } = await import('@/app/api/dev/review-queue/route');
    const res = await POST(
      makeRequest('/api/dev/review-queue', { method: 'POST' }, {
        componentKind: 'activity',
        componentId: 'act1',
        status: 'approved',
      }),
    );
    expect(res.status).toBe(404);
  });

  it('returns 500 on mutation error', async () => {
    mockRequireDeveloperRequestClaims.mockResolvedValue({
      sub: 'admin-user',
      role: 'admin',
    });
    mockFetchInternalQuery.mockResolvedValue({ id: 'profile-123' });
    mockFetchInternalMutation.mockRejectedValue(new Error('Convex error'));
    const { POST } = await import('@/app/api/dev/review-queue/route');
    const res = await POST(
      makeRequest('/api/dev/review-queue', { method: 'POST' }, {
        componentKind: 'activity',
        componentId: 'act1',
        status: 'approved',
      }),
    );
    expect(res.status).toBe(500);
  });
});