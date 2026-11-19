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
      createTopic12NegativeRateContextWorkedSubmission:
        "internal.activities.createTopic12NegativeRateContextWorkedSubmission",
    },
    learningEvidence: {
      submitTopic12NegativeRateContextWorkedSubmission:
        "internal.learningEvidence.submitTopic12NegativeRateContextWorkedSubmission",
    },
  },
}));

import { POST } from "@/app/api/activities/precalculus-topic-1-2-negative-rate-context-worked/submissions/route";
import { generateTopic12NegativeRateContextChoiceOutput } from "@math-platform/math-content/knowledge-space";

const LEARNER_ID = "profiles:precalc-negative-rate-worked-route-student";
const WORKED_ACTIVITY_ID = "math.precalc.skill.1.2.model-negative-rate-contexts.worked_example";
const SUBMISSION_ID = "activity_submissions:negative-rate-worked-route";
const SERVER_SUBMITTED_AT = "2026-08-29T10:15:00.000Z";
const IDEMPOTENCY_KEY = "precalc-negative-rate-worked-route-key";
const CREATE_REFERENCE = "internal.activities.createTopic12NegativeRateContextWorkedSubmission";
const EVIDENCE_REFERENCE =
  "internal.learningEvidence.submitTopic12NegativeRateContextWorkedSubmission";

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

function makeRequest(body: unknown, key = IDEMPOTENCY_KEY, contentType = "application/json") {
  return new Request(
    "http://localhost/api/activities/precalculus-topic-1-2-negative-rate-context-worked/submissions",
    {
      method: "POST",
      headers: { "content-type": contentType, "Idempotency-Key": key },
      body: JSON.stringify(body),
    },
  );
}

function makeMalformedJsonRequest(key = IDEMPOTENCY_KEY) {
  return new Request(
    "http://localhost/api/activities/precalculus-topic-1-2-negative-rate-context-worked/submissions",
    {
      method: "POST",
      headers: { "content-type": "application/json", "Idempotency-Key": key },
      body: "{",
    },
  );
}

function makeRequestWithoutIdempotencyKey(body: unknown) {
  return new Request(
    "http://localhost/api/activities/precalculus-topic-1-2-negative-rate-context-worked/submissions",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/activities/precalculus-topic-1-2-negative-rate-context-worked/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: "student" });
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_NEW);
  });

  it.each([
    ["B", "source selection"],
    ["A", "non-correct raw selection"],
  ])("forwards the %s %s and returns only the create result", async (selectedOptionId) => {
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
        answers: { selectedOptionId },
        parts: [{ partId: "selectedOptionId", rawAnswer: selectedOptionId }],
      }),
    });
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(2, EVIDENCE_REFERENCE, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
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
    expect(submissionData).not.toHaveProperty("learnerId");
    expect(submissionData).not.toHaveProperty("correctness");
    expect(submissionData).not.toHaveProperty("score");
    expect(submissionData).not.toHaveProperty("attemptOrdinal");
  });

  it("uses the generated seed-0 source answer as B", () => {
    expect(
      (
        generateTopic12NegativeRateContextChoiceOutput(0).expectedAnswer as {
          selectedOptionId: string;
        }
      ).selectedOptionId,
    ).toBe("B");
  });

  it("accepts a replay evidence result and calls each mutation once", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_REPLAY);

    const response = await POST(makeRequest({ selectedOptionId: "B" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["missing", makeRequestWithoutIdempotencyKey({ selectedOptionId: "B" })],
    ["blank", makeRequest({ selectedOptionId: "B" }, "   ")],
  ])("rejects a %s Idempotency-Key before both mutations", async (_label, key) => {
    const response = await POST(key);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["missing selection", makeRequest({})],
    ["blank selection", makeRequest({ selectedOptionId: " " })],
    ["lowercase selection", makeRequest({ selectedOptionId: "b" })],
    ["unknown selection", makeRequest({ selectedOptionId: "E" })],
    ["array selection", makeRequest({ selectedOptionId: ["B"] })],
    [
      "extra outer activity",
      makeRequest({ selectedOptionId: "B", activityId: WORKED_ACTIVITY_ID }),
    ],
    ["extra outer learner", makeRequest({ selectedOptionId: "B", learnerId: LEARNER_ID })],
    ["extra outer ordinal", makeRequest({ selectedOptionId: "B", attemptNumber: 1 })],
    ["extra outer time", makeRequest({ selectedOptionId: "B", submittedAt: SERVER_SUBMITTED_AT })],
    ["extra outer correctness", makeRequest({ selectedOptionId: "B", correctness: true })],
    ["extra outer score", makeRequest({ selectedOptionId: "B", score: 1 })],
    ["wrong content type", makeRequest({ selectedOptionId: "B" }, IDEMPOTENCY_KEY, "text/plain")],
  ])("rejects %s without calling either mutation", async (_label, request) => {
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON before calling either mutation", async () => {
    const response = await POST(makeMalformedJsonRequest());

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["teacher claims", { sub: LEARNER_ID, role: "teacher" }, 403],
    ["missing role", { sub: LEARNER_ID }, 403],
    ["missing subject", { role: "student" }, 401],
    ["blank subject", { sub: "  ", role: "student" }, 401],
  ] as const)("rejects %s before calling either mutation", async (_label, claims, status) => {
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(claims);

    const response = await POST(makeRequest({ selectedOptionId: "B" }));

    expect(response.status).toBe(status);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("passes through an authentication Response", async () => {
    const authResponse = new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);

    const response = await POST(makeRequest({ selectedOptionId: "B" }));

    expect(response).toBe(authResponse);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("returns a safe 500 when authentication throws", async () => {
    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error("secret auth detail"));

    const response = await POST(makeRequest({ selectedOptionId: "B" }));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("secret auth detail");
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("maps only the exact idempotency conflict sentinel to 409", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockRejectedValueOnce(new Error("idempotency_conflict"));

    const response = await POST(makeRequest({ selectedOptionId: "B" }));

    expect(response.status).toBe(409);
    await expect(response.text()).resolves.not.toContain("idempotency_conflict");
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it("returns a safe 500 for other create errors", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockRejectedValueOnce(new Error("private backend detail"));

    const response = await POST(makeRequest({ selectedOptionId: "B" }));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("private backend detail");
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["missing create result", { submissionId: SUBMISSION_ID, attemptOrdinal: 2 }],
    ["extra create field", { ...CREATE_RESULT, score: 1 }],
    ["blank create submission ID", { ...CREATE_RESULT, submissionId: " " }],
    ["invalid create ordinal", { ...CREATE_RESULT, attemptOrdinal: 0 }],
    ["invalid create timestamp", { ...CREATE_RESULT, submittedAt: "not-a-date" }],
  ])("returns a safe 500 for %s without calling evidence", async (_label, result) => {
    mocks.fetchInternalMutation.mockReset().mockResolvedValueOnce(result);

    const response = await POST(makeRequest({ selectedOptionId: "B" }));

    expect(response.status).toBe(500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["rejected evidence", { accepted: false, reason: "submission_not_found" }],
    ["malformed evidence", { persisted: true }],
    [
      "eligible evidence",
      { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, eligible: true } },
    ],
    [
      "mastery evidence",
      { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, masteryBearing: true } },
    ],
    ["inconsistent new persistence", { ...EVIDENCE_NEW, persisted: false }],
    ["inconsistent replay persistence", { ...EVIDENCE_REPLAY, persisted: true }],
    ["inconsistent delivery", { ...EVIDENCE_NEW, delivery: "replay" }],
  ])("returns a safe 500 for %s", async (_label, evidenceResult) => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(evidenceResult);

    const response = await POST(makeRequest({ selectedOptionId: "B" }));

    expect(response.status).toBe(500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it("does not call evidence when create returns an invalid result", async () => {
    mocks.fetchInternalMutation.mockReset().mockResolvedValueOnce({ submissionId: SUBMISSION_ID });

    await POST(makeRequest({ selectedOptionId: "B" }));

    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });
});
