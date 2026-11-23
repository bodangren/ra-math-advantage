import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mockRequireActiveStudentRequestClaims = vi.fn();
const mockResolveOpenRouterProviderWithMessagesFromEnv = vi.fn();
const mockAssembleLessonChatbotContext = vi.fn();
const mockBuildPublishedCurriculumManifest = vi.fn();
const mockFetchInternalMutation = vi.fn();
const mockDetectPromptInjection = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  requireActiveStudentRequestClaims: mockRequireActiveStudentRequestClaims,
}));

vi.mock("@math-platform/ai-tutoring", () => ({
  resolveOpenRouterProviderWithMessagesFromEnv: mockResolveOpenRouterProviderWithMessagesFromEnv,
  assembleLessonChatbotContext: mockAssembleLessonChatbotContext,
  detectPromptInjection: (...args: unknown[]) => mockDetectPromptInjection(...args),
}));

vi.mock("@/lib/curriculum/published-manifest", () => ({
  buildPublishedCurriculumManifest: mockBuildPublishedCurriculumManifest,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: (...args: unknown[]) => mockFetchInternalMutation(...args),
  internal: { rateLimits: { checkAndIncrementRateLimit: "checkAndIncrementRateLimit" } },
}));

let POST: (request: NextRequest) => Promise<Response>;

function buildRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/student/lesson-chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

const NO_PII_VALUES = [
  "Avery Quinn",
  "Jordan Lee",
  "avery.quinn@example.org",
  "jordan.lee@example.org",
  "aquinn42",
  "k17pii0000account",
];

describe("S3 fix", () => {
  const FIXTURE_MARKDOWN =
    "Student: Avery Quinn (avery.quinn@example.org), aquinn42, k17pii0000account.\n" +
    "Factor x^2 + 5x + 6 and find each root.\n" +
    "Teacher: Jordan Lee (jordan.lee@example.org).\n" +
    "Then check each root in the equation.";
  const MATH_HEAD = "Factor x^2 + 5x + 6 and find each root.";
  const MATH_TAIL = "Then check each root in the equation.";

  beforeEach(async () => {
    vi.clearAllMocks();
    mockFetchInternalMutation.mockResolvedValue({ allowed: true });
    mockDetectPromptInjection.mockReturnValue(null);
    const real = await vi.importActual<typeof import("@math-platform/ai-tutoring")>(
      "@math-platform/ai-tutoring",
    );
    mockAssembleLessonChatbotContext.mockImplementation((...args: unknown[]) =>
      (real.assembleLessonChatbotContext as (...callArgs: unknown[]) => unknown)(...args),
    );
    vi.resetModules();
    const routeModule = await import("@/app/api/student/lesson-chatbot/route");
    POST = routeModule.POST;
  });

  it("strips fixture person details from the lesson markdown before the provider call", async () => {
    mockRequireActiveStudentRequestClaims.mockResolvedValue({
      sub: "k17pii0000account",
      username: "aquinn42",
      displayName: "Avery Quinn",
      email: "avery.quinn@example.org",
      role: "student",
      iat: 1,
      exp: 2,
    });

    const mockProvider = vi.fn().mockResolvedValue("This is a lesson-scoped response.");
    mockResolveOpenRouterProviderWithMessagesFromEnv.mockReturnValue(mockProvider);

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
              sections: [{ sectionType: "text", content: { markdown: FIXTURE_MARKDOWN } }],
            },
          ],
        },
      ],
    });

    const response = await POST(
      buildRequest({
        lessonId: "lesson_01_01",
        phaseNumber: 1,
        question: "What is this lesson about?",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockProvider).toHaveBeenCalledTimes(1);
    const sent = JSON.stringify(mockProvider.mock.calls[0][0]);
    for (const value of NO_PII_VALUES) {
      expect(sent).not.toContain(value);
    }
    expect(sent).toContain(MATH_HEAD);
    expect(sent).toContain(MATH_TAIL);
  });
});
describe("POST /api/student/lesson-chatbot no-PII", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockFetchInternalMutation.mockResolvedValue({ allowed: true });
    mockDetectPromptInjection.mockReturnValue(null);
    vi.resetModules();
    const routeModule = await import("@/app/api/student/lesson-chatbot/route");
    POST = routeModule.POST;
  });

  it("sends no session or account value to the provider", async () => {
    mockRequireActiveStudentRequestClaims.mockResolvedValue({
      sub: "k17pii0000account",
      username: "aquinn42",
      displayName: "Avery Quinn",
      email: "avery.quinn@example.org",
      role: "student",
      iat: 1,
      exp: 2,
    });

    const mockProvider = vi.fn().mockResolvedValue("This is a lesson-scoped response.");
    mockResolveOpenRouterProviderWithMessagesFromEnv.mockReturnValue(mockProvider);

    mockAssembleLessonChatbotContext.mockReturnValue({
      lessonTitle: "Test Lesson",
      unitTitle: "Test Unit",
      phaseTitle: "Test Phase",
      learningObjectives: ["Learn something"],
      contentSummary: "Test content summary",
    });

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

    const response = await POST(
      buildRequest({
        lessonId: "lesson_01_01",
        phaseNumber: 1,
        question: "What is this lesson about?",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockProvider).toHaveBeenCalledTimes(1);
    const sent = JSON.stringify(mockProvider.mock.calls[0][0]);
    for (const value of NO_PII_VALUES) {
      expect(sent).not.toContain(value);
    }
  });
});
