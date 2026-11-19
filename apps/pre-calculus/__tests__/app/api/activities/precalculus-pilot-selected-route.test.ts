import { describe, expect, it, vi } from "vitest";
import { createPrecalculusPilotSubmissionRoute } from "@/app/api/activities/precalculus-pilot/submissions/route";

const request = (body: unknown, key = "key-1") =>
  new Request("http://local/api/activities/precalculus-pilot/submissions", {
    method: "POST",
    headers: { "content-type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify(body),
  });
const body = {
  contractVersion: "practice.v1",
  activityId:
    "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs.guided_practice",
  mode: "guided_practice",
  status: "submitted",
  attemptNumber: 1,
  submittedAt: "2026-09-08T00:00:00.000Z",
  answers: {
    increasingIntervals: "[0,3]",
    decreasingIntervals: "[3,7]",
    constantIntervals: "none",
  },
  parts: [
    { partId: "increasingIntervals", rawAnswer: "[0,3]" },
    { partId: "decreasingIntervals", rawAnswer: "[3,7]" },
    { partId: "constantIntervals", rawAnswer: "none" },
  ],
};

describe("selected Precalculus create route", () => {
  it("uses authenticated identity and returns the physical submission ID", async () => {
    const createSubmission = vi.fn(async () => ({
      submissionId: "activity_submissions:1",
      score: 2,
      maxScore: 3,
      attemptOrdinal: 1,
      feedback: "2/3 matched.",
    }));
    const route = createPrecalculusPilotSubmissionRoute({
      requireStudentSession: async () => ({ sub: "profiles:student" }),
      createSubmission,
    });
    const response = await route.POST(request(body));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      submissionId: "activity_submissions:1",
      score: 2,
      maxScore: 3,
    });
    expect(createSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "profiles:student",
        idempotencyKey: "key-1",
      }),
    );
  });

  it.each([
    ["browser score", { ...body, score: 3 }],
    ["wrong node activity", { ...body, activityId: "math.precalc.skill.wrong.guided_practice" }],
    ["cross mode", { ...body, mode: "independent_practice" }],
  ])("rejects %s before mutation", async (_label, payload) => {
    const createSubmission = vi.fn();
    const route = createPrecalculusPilotSubmissionRoute({
      requireStudentSession: async () => ({ sub: "profiles:student" }),
      createSubmission,
    });
    expect((await route.POST(request(payload))).status).toBe(400);
    expect(createSubmission).not.toHaveBeenCalled();
  });

  it("rejects an oversized create key before mutation", async () => {
    const createSubmission = vi.fn();
    const route = createPrecalculusPilotSubmissionRoute({
      requireStudentSession: async () => ({ sub: "profiles:student" }),
      createSubmission,
    });
    expect((await route.POST(request(body, "x".repeat(257)))).status).toBe(400);
    expect(createSubmission).not.toHaveBeenCalled();
  });

  it.each(["", "   "])("rejects an invalid physical submission ID", async (submissionId) => {
    const route = createPrecalculusPilotSubmissionRoute({
      requireStudentSession: async () => ({ sub: "profiles:student" }),
      createSubmission: async () => ({
        submissionId,
        score: 2,
        maxScore: 3,
        attemptOrdinal: 1,
        feedback: "2/3 matched.",
      }),
    });
    const response = await route.POST(request(body));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to create submission",
    });
  });
});

it.each([
  ["idempotency_conflict", 409],
  [
    "[Request ID: test] Server Error\nUncaught Error: idempotency_conflict\n    at handler (activities.ts:1:1)",
    409,
  ],
  ["Server Error: database unavailable", 500],
])("maps create error to a controlled response: %s", async (message, status) => {
  const route = createPrecalculusPilotSubmissionRoute({
    requireStudentSession: async () => ({ sub: "profiles:student" }),
    createSubmission: async () => {
      throw new Error(message);
    },
  });
  const response = await route.POST(request(body));
  expect(response.status).toBe(status);
  await expect(response.json()).resolves.toEqual({
    error:
      status === 409
        ? "Idempotency key was already used for a different submission"
        : "Unable to create submission",
  });
});
