import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetRequestSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();
const mockResolveOpenRouterProviderWithMessagesFromEnv = vi.fn();
const mockAssembleLessonChatbotContext = vi.fn();
const mockDetectPromptInjection = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
}));
vi.mock("@/convex/_generated/api", () => ({
  internal: {
    activities: {
      getProfileByUsername: "activities:getProfileByUsername",
    },
    student: {
      isStudentActivelyEnrolled: "student:isStudentActivelyEnrolled",
      isStudentEnrolledInClassForLesson: "student:isStudentEnrolledInClassForLesson",
      getLessonForChatbot: "student:getLessonForChatbot",
    },
    rateLimits: {
      checkAndIncrementRateLimit: "rateLimits:checkAndIncrementRateLimit",
    },
  },
}));
vi.mock("@math-platform/ai-tutoring", () => ({
  resolveOpenRouterProviderWithMessagesFromEnv: mockResolveOpenRouterProviderWithMessagesFromEnv,
  assembleLessonChatbotContext: mockAssembleLessonChatbotContext,
  detectPromptInjection: (...args: unknown[]) => mockDetectPromptInjection(...args),
}));

const makeRequest = (body?: object) =>
  new NextRequest("http://localhost/api/student/lesson-chatbot", {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });

const NO_PII_VALUES = [
  "Avery Quinn",
  "Jordan Lee",
  "avery.quinn@example.org",
  "jordan.lee@example.org",
  "aquinn42",
  "k17pii0000account",
];

describe("POST /api/student/lesson-chatbot no-PII", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssembleLessonChatbotContext.mockReturnValue({
      lessonTitle: "Lesson 1",
      unitTitle: "Unit 1",
      phaseTitle: "Phase 1",
      learningObjectives: ["Objective 1"],
      contentSummary: "Some content",
    });
    mockDetectPromptInjection.mockReturnValue(null);
  });

  it("sends no session, profile, or account value to the provider", async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: "k17pii0000account",
      username: "aquinn42",
      role: "student",
    });
    mockFetchInternalQuery.mockResolvedValueOnce({
      id: "k17pii0000account",
      organizationId: "org1",
      username: "aquinn42",
      displayName: "Avery Quinn",
      email: "avery.quinn@example.org",
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
          sections: [
            {
              sectionType: "text",
              content: { markdown: "Some content" },
            },
          ],
        },
      ],
    });
    const mockProvider = vi.fn().mockResolvedValue("AI response");
    mockResolveOpenRouterProviderWithMessagesFromEnv.mockReturnValue(mockProvider);

    const { POST } = await import("@/app/api/student/lesson-chatbot/route");
    const res = await POST(
      makeRequest({ lessonId: "lesson-1", phaseNumber: 1, question: "What is x?" }),
    );

    expect(res.status).toBe(200);
    expect(mockProvider).toHaveBeenCalledTimes(1);
    const sent = JSON.stringify(mockProvider.mock.calls[0][0]);
    for (const value of NO_PII_VALUES) {
      expect(sent).not.toContain(value);
    }
  });
});
