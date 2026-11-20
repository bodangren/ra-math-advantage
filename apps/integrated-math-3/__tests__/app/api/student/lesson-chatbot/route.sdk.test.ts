import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockGetRequestSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: (...args: unknown[]) => mockFetchInternalQuery(...args),
  fetchInternalMutation: (...args: unknown[]) => mockFetchInternalMutation(...args),
}));

vi.mock("@convex/_generated/api", () => ({
  internal: {
    activities: { getProfileByUsername: "activities:getProfileByUsername" },
    student: {
      isStudentActivelyEnrolled: "student:isStudentActivelyEnrolled",
      isStudentEnrolledInClassForLesson: "student:isStudentEnrolledInClassForLesson",
      getLessonForChatbot: "student:getLessonForChatbot",
    },
    rateLimits: { checkAndIncrementRateLimit: "rateLimits:checkAndIncrementRateLimit" },
  },
}));

// @math-platform/ai-tutoring is not mocked: the real SDK path must run.

const originalEnv = process.env;

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/student/lesson-chatbot", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
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
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: "sdk-route-key",
      OPENROUTER_MODEL: "vendor/model-a",
    };
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: "p1",
      username: "student1",
      role: "student",
    });
    mockFetchInternalQuery.mockResolvedValueOnce({
      id: "p1",
      organizationId: "org1",
      username: "student1",
      role: "student",
    });
    mockFetchInternalQuery.mockResolvedValueOnce(true);
    mockFetchInternalMutation.mockResolvedValue({ allowed: true });
    mockFetchInternalQuery.mockResolvedValueOnce({
      lessonTitle: "Lesson 1",
      unitTitle: "Unit 1",
      learningObjectives: ["Objective 1"],
      phases: [
        {
          phaseNumber: 1,
          title: "Phase 1",
          sections: [{ sectionType: "text", content: { markdown: "Some content" } }],
        },
      ],
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it("returns the SDK answer and sends one chat completion request", async () => {
    const mockFetch = vi.fn().mockResolvedValue(sdkResponse("SDK route answer"));
    vi.stubGlobal("fetch", mockFetch);
    const { POST } = await import("@/app/api/student/lesson-chatbot/route");

    const response = await POST(
      makeRequest({ lessonId: "lesson-1", phaseNumber: 1, question: "What is x?" }),
    );

    expect(response.status).toBe(200);
    expect((await response.json()).response).toBe("SDK route answer");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const request = mockFetch.mock.calls[0][0] as Request;
    expect(request.url).toMatch(/\/chat\/completions$/);
  });
});
