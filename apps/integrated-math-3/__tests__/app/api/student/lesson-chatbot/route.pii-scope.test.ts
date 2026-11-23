import { clearProviderCache } from "@math-platform/ai-tutoring";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/student/lesson-chatbot/route";

const { getSession, query, mutate } = vi.hoisted(() => ({
  getSession: vi.fn(),
  query: vi.fn(),
  mutate: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ getRequestSessionClaims: getSession }));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: query,
  fetchInternalMutation: mutate,
}));
vi.mock("@/convex/_generated/api", () => ({
  internal: {
    activities: { getProfileByUsername: "getProfileByUsername" },
    student: {
      isStudentEnrolledInClassForLesson: "isStudentEnrolledInClassForLesson",
      getLessonForChatbot: "getLessonForChatbot",
    },
    rateLimits: { checkAndIncrementRateLimit: "checkAndIncrementRateLimit" },
  },
}));

const STUDENT_NAME = "Avery Quinn";
const STUDENT_EMAIL = "avery.quinn@example.org";
const USERNAME = "aquinn42";
const ACCOUNT_ID = "k17pii0000account";
const TEACHER_NAME = "Jordan Lee";
const TEACHER_EMAIL = "jordan.lee@example.org";
const KEY = "sk-test-pii-scope-8817";
const QUESTION = "What are the two numbers?";
const MODEL = "vendor/pii-scope-tutor";
const MATH_SAME_LINE = "Factor x^2 - 5x + 6 = 0 by finding two numbers.";
const MATH_LATER_LINE = "Then check the product of the two numbers.";
const fetchMock = vi.fn<typeof fetch>();

function request() {
  return new NextRequest("http://localhost/api/student/lesson-chatbot", {
    method: "POST",
    body: JSON.stringify({ lessonId: "lesson-1", phaseNumber: 1, question: QUESTION }),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  clearProviderCache();
  vi.clearAllMocks();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("OPENROUTER_API_KEY", KEY);
  vi.stubEnv("OPENROUTER_API_BASE", "https://openrouter-fixture.invalid/api/v1");
  vi.stubEnv("OPENROUTER_MODEL_STUDENT_TUTOR", MODEL);
  getSession.mockResolvedValue({ sub: ACCOUNT_ID, username: USERNAME, role: "student" });
  query
    .mockResolvedValueOnce({
      id: ACCOUNT_ID,
      username: USERNAME,
      displayName: STUDENT_NAME,
      email: STUDENT_EMAIL,
      organizationId: "test-org",
      role: "student",
    })
    .mockResolvedValueOnce(true)
    .mockResolvedValueOnce({
      lessonTitle: "Quadratics",
      unitTitle: "Algebra",
      learningObjectives: ["Factor a quadratic"],
      phases: [
        {
          phaseNumber: 1,
          title: "Practice",
          sections: [
            {
              sectionType: "text",
              content: {
                markdown:
                  `Student: ${STUDENT_NAME} (${STUDENT_EMAIL}), ${USERNAME}, ${ACCOUNT_ID}.\n` +
                  `${MATH_SAME_LINE}\n` +
                  `Teacher: ${TEACHER_NAME} (${TEACHER_EMAIL}).\n` +
                  MATH_LATER_LINE,
              },
            },
          ],
        },
      ],
    });
  mutate.mockResolvedValue({ allowed: true });
  fetchMock.mockResolvedValue(
    Response.json({
      id: "gen-pii-scope",
      created: 1,
      model: MODEL,
      object: "chat.completion",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "Try factoring." },
          finish_reason: "stop",
        },
      ],
    }),
  );
});

afterEach(() => {
  clearProviderCache();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("IM3 person-detail stripping keeps lesson content", () => {
  it("keeps math text after a detail label on the same line and on later lines", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const result = await POST(request());
    expect(result.status).toBe(200);

    const outbound = (await (fetchMock.mock.calls[0][0] as Request).json()) as {
      messages: Array<{ role: string; content: string }>;
    };
    const system = outbound.messages.find((message) => message.role === "system");
    expect(system).toBeDefined();
    expect(system?.content).toContain(MATH_SAME_LINE);
    expect(system?.content).toContain(MATH_LATER_LINE);

    const messages = JSON.stringify(outbound.messages);
    for (const value of [
      STUDENT_NAME,
      STUDENT_EMAIL,
      USERNAME,
      ACCOUNT_ID,
      TEACHER_NAME,
      TEACHER_EMAIL,
    ]) {
      expect(messages).not.toContain(value);
    }
  });
});
