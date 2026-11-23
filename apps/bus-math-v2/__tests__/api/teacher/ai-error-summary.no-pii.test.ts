import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireActiveTeacherRequestClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();
const mockGenerateAISummary = vi.fn();
const mockBuildDeterministicSummary = vi.fn();
const mockResolveAIProviderFromEnv = vi.fn();
const mockIsPracticeSubmissionEnvelope = vi.fn();
const mockResolveOpenRouterProviderFromEnv = vi.fn();
const mockResolveStructuredProviderFromEnv = vi.fn();
const mockStructuredProvider = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  requireActiveTeacherRequestClaims: mockRequireActiveTeacherRequestClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    apiRateLimits: {
      checkAndIncrementApiRateLimit: "internal.apiRateLimits.checkAndIncrementApiRateLimit",
    },
    teacher: {
      getProfileWithOrg: "internal.teacher.getProfileWithOrg",
      getSubmissionDetail: "internal.teacher.getSubmissionDetail",
    },
    activities: {
      getProfileById: "internal.activities.getProfileById",
    },
  },
}));

vi.mock("@math-platform/practice-core/error-analysis", () => ({
  generateAISummary: mockGenerateAISummary,
  buildDeterministicSummary: mockBuildDeterministicSummary,
}));

vi.mock("@math-platform/practice-core/contract", () => ({
  isPracticeSubmissionEnvelope: mockIsPracticeSubmissionEnvelope,
}));

vi.mock("@/lib/practice/error-analysis/providers", () => ({
  resolveAIProviderFromEnv: mockResolveAIProviderFromEnv,
}));

vi.mock("@math-platform/ai-tutoring", () => ({
  resolveOpenRouterProviderFromEnv: mockResolveOpenRouterProviderFromEnv,
  resolveStructuredProviderFromEnv: mockResolveStructuredProviderFromEnv,
}));

const { GET } = await import("@/app/api/teacher/ai-error-summary/route");

const NO_PII_VALUES = [
  "Avery Quinn",
  "Jordan Lee",
  "avery.quinn@example.org",
  "jordan.lee@example.org",
  "aquinn42",
  "k17pii0000account",
];

const DET_SUMMARY = {
  type: "deterministic" as const,
  lessonId: "lesson_1",
  generatedAt: 1700000000000,
  partSummaries: [],
  topMisconceptions: [],
  studentCount: 1,
  averageAccuracy: 0,
};

function buildRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/teacher/ai-error-summary");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

describe("GET teacher ai-error-summary no-PII", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireActiveTeacherRequestClaims.mockResolvedValue({
      sub: "teacher_profile_1",
      username: "jordanlee",
      displayName: "Jordan Lee",
      email: "jordan.lee@example.org",
      role: "teacher",
      iat: 1,
      exp: 2,
    });
    mockResolveAIProviderFromEnv.mockReturnValue(null);
    mockResolveOpenRouterProviderFromEnv.mockReturnValue(null);
    mockStructuredProvider.mockResolvedValue({
      ok: true,
      data: {
        likelyMisunderstanding: "None",
        evidenceObserved: [],
        suggestedReteach: "None",
        groundedIn: [],
      },
      raw: "{}",
    });
    mockResolveStructuredProviderFromEnv.mockReturnValue(mockStructuredProvider);
    mockBuildDeterministicSummary.mockReturnValue(DET_SUMMARY);
    mockIsPracticeSubmissionEnvelope.mockReturnValue(true);
    mockFetchInternalMutation.mockResolvedValue({ allowed: true });
    mockFetchInternalQuery.mockImplementation(async (name: string) => {
      if (name === "internal.teacher.getProfileWithOrg") {
        return {
          id: "teacher_profile_1",
          role: "teacher",
          organizationId: "org_1",
          displayName: "Jordan Lee",
          email: "jordan.lee@example.org",
        };
      }
      if (name === "internal.activities.getProfileById") {
        return {
          id: "k17pii0000account",
          role: "student",
          organizationId: "org_1",
          displayName: "Avery Quinn",
          username: "aquinn42",
          email: "avery.quinn@example.org",
        };
      }
      if (name === "internal.teacher.getSubmissionDetail") {
        return {
          studentName: "Avery Quinn",
          lessonTitle: "Balancing the Ledger",
          phases: [
            {
              phaseNumber: 1,
              evidence: [
                {
                  kind: "practice",
                  submissionData: {
                    contractVersion: "practice.v1",
                    activityId: "activity-1",
                    mode: "independent_practice",
                    status: "submitted",
                    attemptNumber: 1,
                    submittedAt: new Date().toISOString(),
                    answers: { q1: "wrong-answer" },
                    parts: [
                      {
                        partId: "q1",
                        rawAnswer: "wrong-answer",
                        isCorrect: false,
                        score: 0,
                        maxScore: 1,
                        misconceptionTags: ["debit-credit-confusion"],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        };
      }
      return null;
    });
  });

  it("captures a structured prompt with no fixture value and keeps the name on the response", async () => {
    const response = await GET(buildRequest({ lessonId: "lesson_1", studentId: "student_1" }));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.studentName).toBe("Avery Quinn");
    expect(mockStructuredProvider.mock.calls.length).toBeGreaterThan(0);
    const sent = JSON.stringify(mockStructuredProvider.mock.calls);
    for (const value of NO_PII_VALUES) {
      expect(sent).not.toContain(value);
    }
  });

  describe("S3 adversarial wire", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    });

    it.each([
      [JSON.stringify({ evidenceObserved: [42] }), 200],
      ["Upstream rejected the request", 400],
    ])(
      "ADV-S3-2 and ADV-S3-3: keeps the deterministic route response for %s (%i)",
      async (raw, status) => {
        const actual = await vi.importActual<typeof import("@math-platform/ai-tutoring")>(
          "@math-platform/ai-tutoring",
        );
        vi.stubEnv("OPENROUTER_API_KEY", "sk-test-s3-teacher-wire");
        vi.stubEnv("OPENROUTER_API_BASE", "https://openrouter-fixture.invalid/api/v1");
        vi.stubEnv("OPENROUTER_DEBUG", undefined);
        vi.stubEnv("OPENROUTER_MODEL_ACCOUNTING_EVAL", "vendor/accounting");
        mockResolveStructuredProviderFromEnv.mockImplementation(
          actual.resolveStructuredProviderFromEnv,
        );
        const requests: Array<{
          model: string;
          messages: Array<{ role: string; content: string }>;
        }> = [];
        const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
          requests.push(await new Request(input, init).json());
          if (status === 400)
            return Response.json({ error: { message: raw, code: status } }, { status });
          return Response.json({
            id: "gen-teacher-s3",
            object: "chat.completion",
            created: 1,
            model: "vendor/accounting",
            system_fingerprint: null,
            choices: [
              { index: 0, finish_reason: "stop", message: { role: "assistant", content: raw } },
            ],
          });
        });
        vi.stubGlobal("fetch", fetchMock);
        const nameWithEmail = "Avery Quinn (avery.quinn@example.org)";
        const defaultQuery = mockFetchInternalQuery.getMockImplementation();
        mockFetchInternalQuery.mockImplementation(async (name: string, ...args: unknown[]) => {
          const value = await defaultQuery?.(name, ...args);
          return name === "internal.teacher.getSubmissionDetail"
            ? { ...value, studentName: nameWithEmail }
            : value;
        });

        const response = await GET(
          buildRequest({ lessonId: "lesson_1", studentId: "k17pii0000account" }),
        );

        expect(response.status).toBe(200);
        expect(await response.json()).toStrictEqual({
          studentName: nameWithEmail,
          lessonTitle: "Balancing the Ledger",
          deterministicSummary: DET_SUMMARY,
          aiSummary: null,
          aiEnabled: true,
        });
        expect(requests).toHaveLength(1);
        expect(requests[0]?.model).toBe("vendor/accounting");
        const [message] = requests[0]?.messages ?? [];
        expect(message?.role).toBe("user");
        expect(message?.content).toContain("Lesson: Balancing the Ledger");
        expect(message?.content).toContain('"the student"');
        for (const value of NO_PII_VALUES) {
          expect(message?.content).not.toContain(value);
        }
      },
    );
  });
});
