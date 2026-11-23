import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const { claims, mutation, manifest } = vi.hoisted(() => ({
  claims: vi.fn(),
  mutation: vi.fn(),
  manifest: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ requireActiveStudentRequestClaims: claims }));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: mutation,
  internal: { rateLimits: { checkAndIncrementRateLimit: "checkAndIncrementRateLimit" } },
}));
vi.mock("@/lib/curriculum/published-manifest", () => ({
  buildPublishedCurriculumManifest: manifest,
}));

// Keep ai-tutoring and the SDK real, including the SDK constructor.
let POST: (request: NextRequest) => Promise<Response>;

function request() {
  return new Request("http://localhost/api/student/lesson-chatbot", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      lessonId: "lesson_01_01",
      phaseNumber: 1,
      question: "What is this lesson about?",
    }),
  }) as NextRequest;
}

beforeEach(async () => {
  vi.clearAllMocks();
  vi.stubEnv("OPENROUTER_API_KEY", "adversarial-route-key");
  vi.stubEnv("OPENROUTER_MODEL_STUDENT_TUTOR", "vendor/model-a");
  claims.mockResolvedValue({ sub: "profile_123", username: "student", role: "student" });
  mutation.mockResolvedValue({ allowed: true });
  manifest.mockReturnValue({
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
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.resetModules();
  POST = (await import("@/app/api/student/lesson-chatbot/route")).POST;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("adversarial BM2 SDK configuration failures", () => {
  it("returns the fixed 503 body without a request when the API key is absent", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const outbound = vi.fn();
    vi.stubGlobal("fetch", outbound);
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "AI provider not configured" });
    expect(outbound).not.toHaveBeenCalled();
  });

  it("contains an SDK constructor failure in the fixed 502 response", async () => {
    vi.stubEnv("OPENROUTER_API_BASE", "not a valid URL");
    const outbound = vi.fn();
    vi.stubGlobal("fetch", outbound);
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "Unable to get a response. Please try again later.",
    });
    expect(outbound).not.toHaveBeenCalled();
  });
});
