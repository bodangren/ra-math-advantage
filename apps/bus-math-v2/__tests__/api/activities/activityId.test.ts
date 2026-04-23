import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mockRequireActiveRequestSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  requireActiveRequestSessionClaims: mockRequireActiveRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    api: {
      getProfile: 'internal.api.getProfile',
    },
    activities: {
      getActivityById: 'internal.activities.getActivityById',
    },
  },
}));

const { GET } = await import('@/app/api/activities/[activityId]/route');

function buildRequest(url: string) {
  return new Request(url) as unknown as NextRequest;
}

describe('GET /api/activities/[activityId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireActiveRequestSessionClaims.mockResolvedValue({
      sub: 'student_profile_1',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });
  });

  it('returns 401 when unauthenticated or deactivated', async () => {
    mockRequireActiveRequestSessionClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );

    const response = await GET(
      buildRequest('http://localhost/api/activities/activity_1'),
      { params: Promise.resolve({ activityId: 'activity_1' }) },
    );
    expect(response.status).toBe(401);
  });

  it('returns 403 when profile has no role', async () => {
    mockFetchInternalQuery.mockResolvedValueOnce(null);

    const response = await GET(
      buildRequest('http://localhost/api/activities/activity_1'),
      { params: Promise.resolve({ activityId: 'activity_1' }) },
    );
    expect(response.status).toBe(403);
  });

  it('returns 403 when profile role is unrecognized', async () => {
    mockFetchInternalQuery.mockResolvedValueOnce({ role: 'guest' });

    const response = await GET(
      buildRequest('http://localhost/api/activities/activity_1'),
      { params: Promise.resolve({ activityId: 'activity_1' }) },
    );
    expect(response.status).toBe(403);
  });

  it('returns 400 for invalid activity ID', async () => {
    mockFetchInternalQuery.mockResolvedValueOnce({ role: 'student' });

    const response = await GET(
      buildRequest('http://localhost/api/activities/'),
      { params: Promise.resolve({ activityId: '' }) },
    );
    expect(response.status).toBe(400);
  });

  it('returns 404 when activity not found', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({ role: 'student' })
      .mockResolvedValueOnce(null);

    const response = await GET(
      buildRequest('http://localhost/api/activities/activity_1'),
      { params: Promise.resolve({ activityId: 'activity_1' }) },
    );
    expect(response.status).toBe(404);
  });

  it('returns student-safe activity for student role', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({ role: 'student' })
      .mockResolvedValueOnce({
        displayName: 'Activity 1',
        gradingConfig: { maxScore: 10 },
        props: { correctAnswer: 'secret', prompt: 'Solve this' },
      });

    const response = await GET(
      buildRequest('http://localhost/api/activities/activity_1'),
      { params: Promise.resolve({ activityId: 'activity_1' }) },
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.gradingConfig).toBeNull();
    expect(payload.props.correctAnswer).toBeUndefined();
    expect(payload.props.prompt).toBe('Solve this');
  });

  it('returns full activity for teacher role', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({ role: 'teacher' })
      .mockResolvedValueOnce({
        displayName: 'Activity 1',
        gradingConfig: { maxScore: 10 },
        props: { correctAnswer: 'secret', prompt: 'Solve this' },
      });

    const response = await GET(
      buildRequest('http://localhost/api/activities/activity_1'),
      { params: Promise.resolve({ activityId: 'activity_1' }) },
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.gradingConfig).toEqual({ maxScore: 10 });
    expect(payload.props.correctAnswer).toBe('secret');
  });
});
