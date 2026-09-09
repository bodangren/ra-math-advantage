import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), mutate: vi.fn(), query: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({
  requireStudentRequestClaims: mocks.auth,
}));
vi.mock("@/lib/convex/server", () => ({
  internal: { activities: { createServerOwnedSubmission: "selected-writer", getSelectedWorkedAcknowledgement: "worked-reader", getLesson16QuizReceipt: "quiz-reader" } },
  fetchInternalMutation: mocks.mutate,
  fetchInternalQuery: mocks.query,
}));
import { GET, POST } from "@/app/api/activities/submissions/route";
const points = [
  { x: -2, y: -5 },
  { x: -1, y: -2 },
  { x: 0, y: -1 },
  { x: 1, y: -2 },
  { x: 2, y: -5 },
];
function request(body: unknown, key = "route-key") {
  return new Request("http://local/api/activities/submissions", {
    method: "POST",
    headers: { "content-type": "application/json", "Idempotency-Key": key },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
function envelope(overrides: Record<string, unknown> = {}) {
  return {
    contractVersion: "practice.v1",
    activityId: "activities:selected",
    mode: "independent_practice",
    status: "submitted",
    attemptNumber: 1,
    submittedAt: "2026-09-07T00:00:00.000Z",
    answers: { table_values: points, placed_points: points },
    parts: [
      { partId: "table_values", rawAnswer: points },
      { partId: "placed_points", rawAnswer: points },
    ],
    ...overrides,
  };
}
beforeEach(() => {
  mocks.auth
    .mockReset()
    .mockResolvedValue({ sub: "profiles:student", role: "student" });
  mocks.mutate.mockReset().mockResolvedValue({
    id: "activity_submissions:physical",
    submissionId: "activity_submissions:physical",
    score: 2,
    maxScore: 2,
  });
  mocks.query.mockReset().mockResolvedValue(null);
});

describe("Lesson 1.6 quiz route", () => {
  it("uses the explicit receipt selector and rejects unknown selectors", async () => {
    mocks.query.mockResolvedValue({ submissionId: "activity_submissions:quiz", score: 1, maxScore: 2, answers: { "discriminant-purpose": "x", "zero-discriminant-real-solution-count": "1" } });
    const response = await GET(new Request("http://local/api/activities/submissions?activityId=activities%3Aquiz&receipt=lesson-1-6-quiz"));
    expect(response.status).toBe(200);
    expect(mocks.query).toHaveBeenCalledWith("quiz-reader", expect.objectContaining({ activityId: "activities:quiz" }));
    expect((await GET(new Request("http://local/api/activities/submissions?activityId=activities%3Aquiz&receipt=unknown"))).status).toBe(400);
  });

  it("accepts the exact ungraded quiz request and rejects a client grade", async () => {
    const quiz = envelope({ activityId: "activities:quiz", answers: { "discriminant-purpose": "The sum of the roots", "zero-discriminant-real-solution-count": "1" }, parts: [{ partId: "discriminant-purpose", rawAnswer: "The sum of the roots" }, { partId: "zero-discriminant-real-solution-count", rawAnswer: "1" }] });
    expect((await POST(request(quiz))).status).toBe(200);
    expect((await POST(request({ ...quiz, parts: [{ ...quiz.parts[0], score: 1 }, quiz.parts[1]] }))).status).toBe(400);
    const unknown = { ...quiz, answers: { ...quiz.answers, "discriminant-purpose": "Unknown choice" }, parts: [{ partId: "discriminant-purpose", rawAnswer: "Unknown choice" }, quiz.parts[1]] };
    expect((await POST(request(unknown))).status).toBe(400);
  });
});
describe("selected quadratic submission route", () => {
  it("accepts the fixed quadratic-formula answer shape", async () => {
    const qf = envelope({
      answers: { discriminant: 0, x1: "3", x2: "" },
      parts: [
        { partId: "discriminant", rawAnswer: 0 },
        { partId: "x1", rawAnswer: "3" },
        { partId: "x2", rawAnswer: "" },
      ],
    });
    expect((await POST(request(qf))).status).toBe(200);
    expect(mocks.mutate).toHaveBeenCalledOnce();
  });

  it("rejects changed or client-graded quadratic-formula parts", async () => {
    const qf = envelope({
      answers: { discriminant: 0, x1: "3", x2: "" },
      parts: [
        { partId: "discriminant", rawAnswer: 1 },
        { partId: "x1", rawAnswer: "3", isCorrect: true },
        { partId: "x2", rawAnswer: "" },
      ],
    });
    expect((await POST(request(qf))).status).toBe(400);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it("uses authenticated student identity and returns the physical submission ID", async () => {
    const response = await POST(request(envelope()));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      submissionId: "activity_submissions:physical",
      score: 2,
      maxScore: 2,
    });
    expect(mocks.mutate).toHaveBeenCalledWith(
      "selected-writer",
      expect.objectContaining({
        userId: "profiles:student",
        activityId: "activities:selected",
        idempotencyKey: "route-key",
      }),
    );
  });
  it("returns the authentication rejection without mutation", async () => {
    mocks.auth.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
    const response = await POST(request(envelope()));
    expect(response.status).toBe(401);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it.each([
    ["malformed body", "{"],
    ["wrong mode", envelope({ mode: "worked_example" })],
    [
      "client grades",
      envelope({
        parts: [
          { partId: "table_values", rawAnswer: points, score: 2 },
          { partId: "placed_points", rawAnswer: points },
        ],
      }),
    ],
  ])("rejects %s before mutation", async (_name, body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it("rejects an overlong key before mutation", async () => {
    const response = await POST(request(envelope(), "k".repeat(81)));
    expect(response.status).toBe(400);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it("maps a wrapped idempotency conflict to 409", async () => {
    mocks.mutate.mockRejectedValue(
      new Error("ConvexError: idempotency_conflict"),
    );
    const response = await POST(request(envelope()));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "Idempotency key was already used for a different submission",
    });
  });
  it("keeps an unknown backend error private and returns 503", async () => {
    mocks.mutate.mockRejectedValue(new Error("secret database detail"));
    const response = await POST(request(envelope()));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toEqual({
      error: "Failed to create activity submission",
    });
    expect(JSON.stringify(body).includes("secret")).toBe(false);
  });
});
