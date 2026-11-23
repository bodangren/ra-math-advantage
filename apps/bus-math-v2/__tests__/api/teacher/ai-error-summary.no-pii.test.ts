import { beforeEach, describe, expect, it, vi } from "vitest";

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
                    parts: [],
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
});
