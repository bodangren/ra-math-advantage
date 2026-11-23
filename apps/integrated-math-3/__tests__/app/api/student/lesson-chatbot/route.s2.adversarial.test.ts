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

const USERNAME = "aquinn42";
const ACCOUNT_ID = "k17pii0000account";
const STUDENT_NAME = "Avery Quinn";
const STUDENT_EMAIL = "avery.quinn@example.org";
const TEACHER_NAME = "Jordan Lee";
const TEACHER_EMAIL = "jordan.lee@example.org";
const KEY = "sk-test-s2-route-fixture-3251";
const QUESTION = "How can I factor this quadratic?";
const MODEL = "vendor/s2-tutor";
const fetchMock = vi.fn<typeof fetch>();

function request() {
  return new NextRequest("http://localhost/api/student/lesson-chatbot", {
    method: "POST",
    body: JSON.stringify({ lessonId: "lesson-1", phaseNumber: 1, question: QUESTION }),
    headers: { "Content-Type": "application/json" },
  });
}

function lesson(markdown: string) {
  query.mockResolvedValueOnce({
    lessonTitle: "Quadratics",
    unitTitle: "Algebra",
    learningObjectives: ["Factor a quadratic"],
    phases: [
      {
        phaseNumber: 1,
        title: "Practice",
        sections: [{ sectionType: "text", content: { markdown } }],
      },
    ],
  });
}

beforeEach(() => {
  clearProviderCache();
  vi.clearAllMocks();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("OPENROUTER_API_KEY", KEY);
  vi.stubEnv("OPENROUTER_API_BASE", "https://openrouter-fixture.invalid/api/v1");
  vi.stubEnv("OPENROUTER_DEBUG", undefined);
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
    .mockResolvedValueOnce(true);
  mutate.mockResolvedValue({ allowed: true });
});

afterEach(() => {
  clearProviderCache();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("IM3 lesson chatbot through the real S2 provider", () => {
  it("does not send student or teacher details from lesson data", async () => {
    const mathText = "Factor by finding two numbers.";
    lesson(
      `${mathText} Student: ${STUDENT_NAME} (${STUDENT_EMAIL}), ${USERNAME}, ${ACCOUNT_ID}. ` +
        `Teacher: ${TEACHER_NAME} (${TEACHER_EMAIL}).`,
    );
    vi.spyOn(console, "info").mockImplementation(() => {});
    fetchMock.mockResolvedValue(
      Response.json({
        id: "gen-test",
        created: 1,
        model: MODEL,
        object: "chat.completion",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "Try factoring." },
            finish_reason: "stop",
          },
        ],
      }),
    );

    const result = await POST(request());
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ response: "Try factoring." });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const outbound = await (fetchMock.mock.calls[0][0] as Request).json();
    expect(outbound).toMatchObject({
      model: MODEL,
      messages: [
        { role: "system", content: expect.stringContaining(mathText) },
        { role: "user", content: QUESTION },
      ],
    });
    expect(outbound).not.toHaveProperty("provider");
    const messages = JSON.stringify(outbound.messages);
    for (const value of [
      STUDENT_NAME,
      STUDENT_EMAIL,
      USERNAME,
      ACCOUNT_ID,
      TEACHER_NAME,
      TEACHER_EMAIL,
    ]) {
      expect.soft(messages).not.toContain(value);
    }
  });

  it("does not log the prompt when an upstream HTTP error echoes it", async () => {
    lesson("Factor by finding two numbers.");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue(
      Response.json(
        { error: { code: 401, message: `Rejected ${QUESTION} ${KEY}` } },
        { status: 401 },
      ),
    );
    const result = await POST(request());
    expect(result.status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledTimes(1);
    const logs = [...info.mock.calls, ...error.mock.calls].flat().map(String).join("\n");
    expect.soft(logs).not.toContain(QUESTION);
    expect(logs).not.toContain(KEY);
  });
});
