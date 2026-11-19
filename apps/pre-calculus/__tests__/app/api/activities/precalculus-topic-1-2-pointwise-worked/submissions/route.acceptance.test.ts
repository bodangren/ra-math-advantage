import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchInternalMutation: vi.fn(),
  requireStudentRequestClaims: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  requireStudentRequestClaims: mocks.requireStudentRequestClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: mocks.fetchInternalMutation,
  internal: {
    activities: {
      createTopic12PointwiseLeastRateWorkedSubmission:
        "internal.activities.createTopic12PointwiseLeastRateWorkedSubmission",
    },
    learningEvidence: {
      submitTopic12PointwiseLeastRateWorkedSubmission:
        "internal.learningEvidence.submitTopic12PointwiseLeastRateWorkedSubmission",
    },
  },
}));

import { POST } from "@/app/api/activities/precalculus-topic-1-2-pointwise-worked/submissions/route";
import { generateTopic12PointwiseLeastRateChoice } from "@math-platform/math-content/knowledge-space";

const LEARNER_ID = "profiles:precalc-topic-1-2-pointwise-worked-student";
const WORKED_ACTIVITY_ID =
  "math.precalc.skill.1.2.identify-least-pointwise-rate-of-change-from-graphs.worked_example";
const SUBMISSION_ID = "activity_submissions:topic-1-2-pointwise-worked";
const SERVER_SUBMITTED_AT = "2026-08-28T10:15:00.000Z";
const IDEMPOTENCY_KEY = "precalc-topic-1-2-pointwise-worked-key";
const CREATE_REFERENCE = "internal.activities.createTopic12PointwiseLeastRateWorkedSubmission";
const EVIDENCE_REFERENCE =
  "internal.learningEvidence.submitTopic12PointwiseLeastRateWorkedSubmission";

const CREATE_RESULT = {
  submissionId: SUBMISSION_ID,
  attemptOrdinal: 2,
  submittedAt: SERVER_SUBMITTED_AT,
};

const EVIDENCE_NEW = {
  persisted: true,
  masteryApplied: false,
  kstApplied: false,
  delivery: "new",
  decision: {
    idempotency: "new",
    exposureState: "introduced",
    eligible: false,
    reason: "teacher_led",
    masteryBearing: false,
  },
};

const EVIDENCE_REPLAY = {
  ...EVIDENCE_NEW,
  persisted: false,
  delivery: "replay",
  decision: { ...EVIDENCE_NEW.decision, idempotency: "replay" },
};

function makeRequest(
  body: unknown,
  idempotencyKey = IDEMPOTENCY_KEY,
  contentType = "application/json",
): Request {
  return new Request(
    "http://localhost/api/activities/precalculus-topic-1-2-pointwise-worked/submissions",
    {
      method: "POST",
      headers: {
        "content-type": contentType,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/activities/precalculus-topic-1-2-pointwise-worked/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: "student" });
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_NEW);
  });

  it("stores and consumes the raw seed-0 source selection in order", async () => {
    const selectedOptionId = generateTopic12PointwiseLeastRateChoice(0).correctOptionId;
    expect(selectedOptionId).toBe("D");
    const response = await POST(makeRequest({ selectedOptionId }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(1, CREATE_REFERENCE, {
      userId: LEARNER_ID,
      activityId: WORKED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData: expect.objectContaining({
        contractVersion: "practice.v1",
        activityId: WORKED_ACTIVITY_ID,
        mode: "worked_example",
        status: "submitted",
        attemptNumber: 1,
        submittedAt: expect.any(String),
        answers: { selectedOptionId: "D" },
        parts: [{ partId: "selectedOptionId", rawAnswer: "D" }],
      }),
    });
    const createInput = mocks.fetchInternalMutation.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(Object.keys(createInput)).toEqual([
      "userId",
      "activityId",
      "idempotencyKey",
      "submissionData",
    ]);
    const submissionData = createInput.submissionData as Record<string, unknown>;
    expect(Object.keys(submissionData).sort()).toEqual([
      "activityId",
      "answers",
      "attemptNumber",
      "contractVersion",
      "mode",
      "parts",
      "status",
      "submittedAt",
    ]);
    expect(submissionData).not.toHaveProperty("score");
    expect(submissionData).not.toHaveProperty("isCorrect");
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(2, EVIDENCE_REFERENCE, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });
  });

  it("accepts a replay only after validating the replay evidence result", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_REPLAY);

    const response = await POST(makeRequest({ selectedOptionId: "D" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["missing", undefined],
    ["blank", "   "],
  ])("rejects a %s Idempotency-Key before any mutation", async (_label, key) => {
    const request =
      key === undefined
        ? new Request(
            "http://localhost/api/activities/precalculus-topic-1-2-pointwise-worked/submissions",
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ selectedOptionId: "D" }),
            },
          )
        : makeRequest({ selectedOptionId: "D" }, key);

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    [
      "malformed JSON",
      new Request(
        "http://localhost/api/activities/precalculus-topic-1-2-pointwise-worked/submissions",
        {
          method: "POST",
          headers: { "content-type": "application/json", "Idempotency-Key": IDEMPOTENCY_KEY },
          body: "{",
        },
      ),
    ],
    ["missing selection", makeRequest({})],
    ["blank selection", makeRequest({ selectedOptionId: " " })],
    ["extra field", makeRequest({ selectedOptionId: "D", score: 1 })],
    [
      "forged activity field",
      makeRequest({ selectedOptionId: "D", activityId: WORKED_ACTIVITY_ID }),
    ],
    ["forged learner field", makeRequest({ selectedOptionId: "D", learnerId: LEARNER_ID })],
    ["forged correctness field", makeRequest({ selectedOptionId: "D", isCorrect: true })],
    ["forged answer field", makeRequest({ selectedOptionId: "D", correctAnswer: "D" })],
    ["invalid attempt field", makeRequest({ selectedOptionId: "D", attemptNumber: 1 })],
    [
      "invalid submitted-at field",
      makeRequest({ selectedOptionId: "D", submittedAt: SERVER_SUBMITTED_AT }),
    ],
    ["wrong content type", makeRequest({ selectedOptionId: "D" }, IDEMPOTENCY_KEY, "text/plain")],
  ])("rejects %s without calling Convex", async (_label, request) => {
    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: expect.any(String) }),
    );
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["a teacher role", { sub: LEARNER_ID, role: "teacher" }, 403],
    ["a missing role", { sub: LEARNER_ID }, 403],
    ["a missing subject", { role: "student" }, 401],
    ["a blank subject", { sub: "  ", role: "student" }, 401],
  ] as const)("rejects %s before calling Convex", async (_label, claims, status) => {
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(claims);

    const response = await POST(makeRequest({ selectedOptionId: "D" }));

    expect(response.status).toBe(status);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("passes through an authentication response", async () => {
    const authResponse = new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);

    const response = await POST(makeRequest({ selectedOptionId: "D" }));

    expect(response).toBe(authResponse);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("returns a safe 500 when authentication throws", async () => {
    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error("internal auth detail"));

    const response = await POST(makeRequest({ selectedOptionId: "D" }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: "Unable to authenticate request",
    });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("maps only the exact idempotency conflict sentinel to 409", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockRejectedValueOnce(new Error("idempotency_conflict"));

    const response = await POST(makeRequest({ selectedOptionId: "D" }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: expect.stringMatching(/idempotency|conflict/i) }),
    );
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it("returns a safe 500 for other mutation errors", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockRejectedValueOnce(new Error("private backend detail"));

    const response = await POST(makeRequest({ selectedOptionId: "D" }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: "Unable to record the Topic 1.2 pointwise Worked submission",
    });
  });

  it.each([
    ["incomplete create result", { submissionId: SUBMISSION_ID }],
    ["create result with grading data", { ...CREATE_RESULT, score: 1 }],
    ["create result with extra field", { ...CREATE_RESULT, extra: true }],
    ["blank create submission ID", { ...CREATE_RESULT, submissionId: " " }],
    ["invalid create ordinal", { ...CREATE_RESULT, attemptOrdinal: 0 }],
    ["invalid create timestamp", { ...CREATE_RESULT, submittedAt: "not-a-date" }],
  ])("returns a safe 500 for %s", async (_label, invalidResult) => {
    mocks.fetchInternalMutation.mockReset().mockResolvedValueOnce(invalidResult);

    const response = await POST(makeRequest({ selectedOptionId: "D" }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: "Unable to record the Topic 1.2 pointwise Worked submission",
    });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["evidence rejection", { accepted: false, reason: "submission_not_found" }],
    ["malformed evidence result", { persisted: true }],
    [
      "eligible evidence result",
      { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, eligible: true } },
    ],
    [
      "mastery-bearing evidence result",
      { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, masteryBearing: true } },
    ],
    ["graded evidence result", { ...EVIDENCE_NEW, masteryApplied: true }],
    ["inconsistent new persistence", { ...EVIDENCE_NEW, persisted: false }],
    ["inconsistent replay persistence", { ...EVIDENCE_REPLAY, persisted: true }],
    ["inconsistent delivery", { ...EVIDENCE_NEW, delivery: "replay" }],
  ])("returns a safe 500 when evidence returns %s", async (_label, evidenceResult) => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(evidenceResult);

    const response = await POST(makeRequest({ selectedOptionId: "D" }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: "Unable to record the Topic 1.2 pointwise Worked submission",
    });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });
});
