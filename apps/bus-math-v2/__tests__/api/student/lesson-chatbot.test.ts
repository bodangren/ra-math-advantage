import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mockRequireActiveStudentRequestClaims = vi.fn();
const mockFetchInternalMutation = vi.fn();
const mockResolveOpenRouterProviderFromEnv = vi.fn();
const mockAssembleLessonChatbotContext = vi.fn();
const mockBuildPublishedCurriculumManifest = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  requireActiveStudentRequestClaims: mockRequireActiveStudentRequestClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    rateLimits: {
      checkAndIncrementRateLimit: 'internal.rateLimits.checkAndIncrementRateLimit',
    },
  },
}));

vi.mock('@math-platform/ai-tutoring', () => ({
  resolveOpenRouterProviderFromEnv: mockResolveOpenRouterProviderFromEnv,
  assembleLessonChatbotContext: mockAssembleLessonChatbotContext,
}));

vi.mock('@/lib/curriculum/published-manifest', () => ({
  buildPublishedCurriculumManifest: mockBuildPublishedCurriculumManifest,
}));

const { POST } = await import('@/app/api/student/lesson-chatbot/route');

function buildRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/student/lesson-chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe('POST /api/student/lesson-chatbot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireActiveStudentRequestClaims.mockResolvedValue({
      sub: 'student_profile_1',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });
    mockBuildPublishedCurriculumManifest.mockReturnValue({
      lessons: [
        {
          slug: 'lesson-1',
          title: 'Lesson 1',
          unitTitle: 'Unit 1',
          learningObjectives: ['Objective 1'],
          phases: [
            {
              phaseNumber: 1,
              title: 'Phase 1',
              sections: [{ sectionType: 'text', content: { markdown: 'Content' } }],
            },
          ],
        },
      ],
    });
    mockAssembleLessonChatbotContext.mockReturnValue({
      lessonTitle: 'Lesson 1',
      unitTitle: 'Unit 1',
      phaseTitle: 'Phase 1',
      learningObjectives: ['Objective 1'],
      contentSummary: 'Content',
    });
    mockFetchInternalMutation.mockResolvedValue({ allowed: true });
    mockResolveOpenRouterProviderFromEnv.mockReturnValue(() => Promise.resolve('AI response'));
  });

  it('returns 401 when unauthenticated or deactivated', async () => {
    mockRequireActiveStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );

    const response = await POST(buildRequest({ lessonId: 'lesson-1', phaseNumber: 1, question: 'Hello' }));
    expect(response.status).toBe(401);
  });

  it('returns 403 when caller is not a student', async () => {
    mockRequireActiveStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }),
    );

    const response = await POST(buildRequest({ lessonId: 'lesson-1', phaseNumber: 1, question: 'Hello' }));
    expect(response.status).toBe(403);
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await POST(new Request('http://localhost/api/student/lesson-chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    }) as unknown as NextRequest);
    expect(response.status).toBe(400);
  });

  it('returns 400 for missing lessonId', async () => {
    const response = await POST(buildRequest({ phaseNumber: 1, question: 'Hello' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 for invalid phaseNumber', async () => {
    const response = await POST(buildRequest({ lessonId: 'lesson-1', phaseNumber: 0, question: 'Hello' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 for missing question', async () => {
    const response = await POST(buildRequest({ lessonId: 'lesson-1', phaseNumber: 1 }));
    expect(response.status).toBe(400);
  });

  it('returns 404 for unknown lesson', async () => {
    const response = await POST(buildRequest({ lessonId: 'unknown', phaseNumber: 1, question: 'Hello' }));
    expect(response.status).toBe(404);
  });

  it('returns 200 with AI response for valid request', async () => {
    const response = await POST(buildRequest({ lessonId: 'lesson-1', phaseNumber: 1, question: 'Hello' }));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.response).toBe('AI response');
  });
});
