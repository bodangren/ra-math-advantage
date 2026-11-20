import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mockRequireActiveStudentRequestClaims = vi.fn();
const mockFetchInternalMutation = vi.fn();
const mockBuildPublishedCurriculumManifest = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  requireActiveStudentRequestClaims: mockRequireActiveStudentRequestClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: (...args: unknown[]) => mockFetchInternalMutation(...args),
  internal: { rateLimits: { checkAndIncrementRateLimit: "checkAndIncrementRateLimit" } },
}));

vi.mock("@/lib/curriculum/published-manifest", () => ({
  buildPublishedCurriculumManifest: mockBuildPublishedCurriculumManifest,
}));

// @math-platform/ai-tutoring is not mocked: the real SDK path must run.

const originalEnv = process.env;
let POST: (request: NextRequest) => Promise<Response>;

function buildRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/student/lesson-chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

function sdkResponse(content: string) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers({ "content-type": "application/json" }),
    text: async () =>
      JSON.stringify({
        id: "gen-route-1",
        created: 1,
        model: "vendor/model-a",
        object: "chat.completion",
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: { role: "assistant", content },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      }),
  };
}

describe("POST /api/student/lesson-chatbot (SDK transport)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: "sdk-route-key",
      OPENROUTER_MODEL: "vendor/model-a",
    };
    mockRequireActiveStudentRequestClaims.mockResolvedValue({
      sub: "profile_123",
      username: "student",
      role: "student",
      iat: 1,
      exp: 2,
    });
    mockFetchInternalMutation.mockResolvedValue({ allowed: true });
    mockBuildPublishedCurriculumManifest.mockReturnValue({
      instructionalUnitCount: 8,
      capstoneLessonCount: 1,
      lessons: [
        {
          slug: "lesson_01_01",
          title: "Test Lesson",
          unitTitle: "Test Unit",
          learningObjectives: ["Learn something"],
          phases: [
            {
              phaseNumber: 1,
              title: "Test Phase",
              sections: [{ sectionType: "text", content: { markdown: "Test content" } }],
            },
          ],
        },
      ],
    });
    vi.resetModules();
    POST = (await import("@/app/api/student/lesson-chatbot/route")).POST;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it("returns the SDK answer and sends one chat completion request", async () => {
    const mockFetch = vi.fn().mockResolvedValue(sdkResponse("SDK route answer"));
    vi.stubGlobal("fetch", mockFetch);

    const response = await POST(
      buildRequest({
        lessonId: "lesson_01_01",
        phaseNumber: 1,
        question: "What is this lesson about?",
      }),
    );

    expect(response.status).toBe(200);
    expect((await response.json()).response).toBe("SDK route answer");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const request = mockFetch.mock.calls[0][0] as Request;
    expect(request.url).toMatch(/\/chat\/completions$/);
  });
});
