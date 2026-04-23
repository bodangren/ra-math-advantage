import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequireActiveRequestSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  requireActiveRequestSessionClaims: mockRequireActiveRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    activities: {
      getSpreadsheetResponse: 'internal.activities.getSpreadsheetResponse',
      getSpreadsheetAttempts: 'internal.activities.getSpreadsheetAttempts',
      getProfileByUserId: 'internal.activities.getProfileByUserId',
      getProfileById: 'internal.activities.getProfileById',
    },
  },
}));

const { GET } = await import('@/app/api/activities/spreadsheet/[activityId]/submit/route');

function buildRequest(activityId: string, searchParams?: Record<string, string>) {
  const url = new URL(`http://localhost/api/activities/spreadsheet/${activityId}/submit`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }
  return new Request(url.toString());
}

describe('GET /api/activities/spreadsheet/[activityId]/submit', () => {
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

    const response = await GET(buildRequest('activity_1'), { params: Promise.resolve({ activityId: 'activity_1' }) });
    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid activity ID', async () => {
    const response = await GET(buildRequest(''), { params: Promise.resolve({ activityId: '' }) });
    expect(response.status).toBe(400);
  });

  it('returns 400 for empty studentId query param', async () => {
    const response = await GET(buildRequest('activity_1', { studentId: '' }), { params: Promise.resolve({ activityId: 'activity_1' }) });
    expect(response.status).toBe(400);
  });

  it('returns 403 when non-teacher tries to view another student', async () => {
    mockFetchInternalQuery.mockResolvedValueOnce({ role: 'student' });

    const response = await GET(
      buildRequest('activity_1', { studentId: 'other_student' }),
      { params: Promise.resolve({ activityId: 'activity_1' }) },
    );
    expect(response.status).toBe(403);
  });

  it('returns 404 when spreadsheet response not found', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({ role: 'student' })
      .mockResolvedValueOnce(null);

    const response = await GET(buildRequest('activity_1'), { params: Promise.resolve({ activityId: 'activity_1' }) });
    expect(response.status).toBe(404);
  });

  it('returns spreadsheet replay for own student', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({ role: 'student' })
      .mockResolvedValueOnce({
        studentId: 'student_profile_1',
        spreadsheetData: [['1', '2']],
        draftData: [['3', '4']],
        isCompleted: true,
        maxAttempts: 3,
        lastValidationResult: { isValid: true },
        submittedAt: 1700000000000,
        updatedAt: 1700000000000,
      })
      .mockResolvedValueOnce([]);

    const response = await GET(buildRequest('activity_1'), { params: Promise.resolve({ activityId: 'activity_1' }) });
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.readOnly).toBe(true);
    expect(payload.spreadsheetData).toEqual([['1', '2']]);
    expect(payload.attempts).toBe(0);
  });

  it('allows teacher to view student in same org', async () => {
    mockRequireActiveRequestSessionClaims.mockResolvedValue({
      sub: 'teacher_profile_1',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });

    mockFetchInternalQuery
      .mockResolvedValueOnce({ role: 'teacher', organizationId: 'org_1' })
      .mockResolvedValueOnce({ role: 'student', organizationId: 'org_1' })
      .mockResolvedValueOnce({
        studentId: 'student_profile_1',
        spreadsheetData: [['1', '2']],
        draftData: null,
        isCompleted: false,
        maxAttempts: 3,
        lastValidationResult: null,
        submittedAt: null,
        updatedAt: null,
      })
      .mockResolvedValueOnce([]);

    const response = await GET(
      buildRequest('activity_1', { studentId: 'student_profile_1' }),
      { params: Promise.resolve({ activityId: 'activity_1' }) },
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.studentId).toBe('student_profile_1');
  });
});
