import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequireActiveStudentRequestClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  requireActiveStudentRequestClaims: mockRequireActiveStudentRequestClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    student: {
      getLessonProgress: 'internal.student.getLessonProgress',
    },
  },
}));

const { GET } = await import('@/app/api/lessons/[lessonId]/progress/route');

function buildRequest(lessonId: string) {
  return new Request(`http://localhost/api/lessons/${lessonId}/progress`);
}

describe('GET /api/lessons/[lessonId]/progress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireActiveStudentRequestClaims.mockResolvedValue({
      sub: 'student_profile_1',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });
  });

  it('returns 401 when unauthenticated or deactivated', async () => {
    mockRequireActiveStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );

    const response = await GET(buildRequest('lesson_1'), { params: Promise.resolve({ lessonId: 'lesson_1' }) });
    expect(response.status).toBe(401);
  });

  it('returns 403 when caller is not a student', async () => {
    mockRequireActiveStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }),
    );

    const response = await GET(buildRequest('lesson_1'), { params: Promise.resolve({ lessonId: 'lesson_1' }) });
    expect(response.status).toBe(403);
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
  });

  it('returns 400 when lessonId is missing or empty', async () => {
    const response = await GET(buildRequest(''), { params: Promise.resolve({ lessonId: '' }) });
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid parameters');
  });

  it('returns lesson progress for authenticated student', async () => {
    mockFetchInternalQuery.mockResolvedValueOnce({
      phases: [
        { phaseNumber: 1, completed: true },
        { phaseNumber: 2, completed: false },
      ],
    });

    const response = await GET(buildRequest('lesson_1'), { params: Promise.resolve({ lessonId: 'lesson_1' }) });
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.phases).toHaveLength(2);
  });

  it('returns 404 when lesson progress is not found', async () => {
    mockFetchInternalQuery.mockResolvedValueOnce(null);

    const response = await GET(buildRequest('lesson_1'), { params: Promise.resolve({ lessonId: 'lesson_1' }) });
    expect(response.status).toBe(404);
    const payload = await response.json();
    expect(payload.error).toBe('Lesson not found');
  });
});
