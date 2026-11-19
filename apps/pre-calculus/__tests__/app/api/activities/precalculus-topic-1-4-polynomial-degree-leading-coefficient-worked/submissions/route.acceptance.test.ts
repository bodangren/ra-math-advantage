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
      createTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission:
        "internal.activities.createTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission",
    },
    learningEvidence: {
      submitTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission:
        "internal.learningEvidence.submitTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission",
    },
  },
}));

import { POST } from "@/app/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient-worked/submissions/route";
import { PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:precalc-polynomial-worked-route-student";
const WORKED_ACTIVITY_ID =
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID;
const SUBMISSION_ID = "activity_submissions:polynomial-worked-route";
const SERVER_SUBMITTED_AT = "2026-08-29T10:30:00.000Z";
const IDEMPOTENCY_KEY = "precalc-polynomial-worked-route-key";
const CREATE_REFERENCE =
  "internal.activities.createTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission";
const EVIDENCE_REFERENCE =
  "internal.learningEvidence.submitTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission";
const ANSWER_IDS = [
  "a_degree",
  "a_leading_coefficient",
  "b_degree",
  "b_leading_coefficient",
  "c_degree",
  "c_leading_coefficient",
] as const;

const SOURCE_ANSWERS = {
  a_degree: "4",
  a_leading_coefficient: "3",
  b_degree: "3",
  b_leading_coefficient: "-7",
  c_degree: "0",
  c_leading_coefficient: "4",
} as const;

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
    "http://localhost/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient-worked/submissions",
    {
      method: "POST",
      headers: { "content-type": contentType, "Idempotency-Key": key },
      body: JSON.stringify(body),
    },
  );
}

function makeMalformedJsonRequest(key = IDEMPOTENCY_KEY) {
  return new Request(
    "http://localhost/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient-worked/submissions",
    {
      method: "POST",
      headers: { "content-type": "application/json", "Idempotency-Key": key },
      body: "{",
    },
  );
}

function makeRequestWithoutIdempotencyKey(body: unknown) {
  return new Request(
    "http://localhost/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient-worked/submissions",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

function expectNoAuthority(value: unknown): void {
  const forbidden = [
    "correctAnswers",
    "correctAnswer",
    "expectedAnswer",
    "solution",
    "solutionSteps",
    "steps",
    "score",
    "correctness",
    "grading",
    "learnerId",
  ];
  expect(JSON.stringify(value)).not.toMatch(new RegExp(`(?:${forbidden.join("|")})`));
}

describe("POST /api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient-worked/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: "student" });
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_NEW);
  });

  it.each([
    ["source", SOURCE_ANSWERS],
    [
      "alternative raw",
      {
        a_degree: " 4 ",
        a_leading_coefficient: "not-a-number",
        b_degree: "3.0",
        b_leading_coefficient: "-7x",
        c_degree: "0",
        c_leading_coefficient: "+4",
      },
    ],
  ] as const)(
    "forwards %s answers without client grading or rewriting",
    async (_label, answers) => {
      const response = await POST(makeRequest(answers));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
      expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
        1,
        CREATE_REFERENCE,
        expect.objectContaining({
          userId: LEARNER_ID,
          activityId: WORKED_ACTIVITY_ID,
          idempotencyKey: IDEMPOTENCY_KEY,
        }),
      );
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
      expect(submissionData.activityId).toBe(WORKED_ACTIVITY_ID);
      expect(submissionData.contractVersion).toBe("practice.v1");
      expect(submissionData.mode).toBe("worked_example");
      expect(submissionData.status).toBe("submitted");
      expect(submissionData.attemptNumber).toBe(1);
      expect(typeof submissionData.submittedAt).toBe("string");
      expect(Number.isFinite(Date.parse(submissionData.submittedAt as string))).toBe(true);
      expect(submissionData.answers).toStrictEqual(answers);
      expect(submissionData.parts).toStrictEqual(
        ANSWER_IDS.map((partId) => ({
          partId,
          rawAnswer: answers[partId],
        })),
      );
      expectNoAuthority(createInput);
      expectNoAuthority(submissionData);
    },
  );

  it("accepts a replay teacher-led result and calls both mutations once", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_REPLAY);

    const response = await POST(makeRequest(SOURCE_ANSWERS));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["missing", makeRequestWithoutIdempotencyKey(SOURCE_ANSWERS)],
    ["blank", makeRequest(SOURCE_ANSWERS, "   ")],
  ])("rejects a %s Idempotency-Key before both mutations", async (_label, request) => {
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["wrong content type", makeRequest(SOURCE_ANSWERS, IDEMPOTENCY_KEY, "text/plain")],
    ["missing a_degree", makeRequest({ ...SOURCE_ANSWERS, a_leading_coefficient: undefined })],
    ["missing field", makeRequest({ a_degree: "4" })],
    ["extra field", makeRequest({ ...SOURCE_ANSWERS, score: "6" })],
    ["non-string value", makeRequest({ ...SOURCE_ANSWERS, a_degree: 4 })],
    ["array body", makeRequest([SOURCE_ANSWERS])],
  ])("rejects %s before either mutation", async (_label, request) => {
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

    const response = await POST(makeRequest(SOURCE_ANSWERS));

    expect(response.status).toBe(status);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("passes through an authentication Response", async () => {
    const authResponse = new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);

    const response = await POST(makeRequest(SOURCE_ANSWERS));

    expect(response).toBe(authResponse);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("returns a safe 500 when authentication throws", async () => {
    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error("secret auth detail"));

    const response = await POST(makeRequest(SOURCE_ANSWERS));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("secret auth detail");
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("maps only the exact producer idempotency conflict sentinel to 409", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockRejectedValueOnce(new Error("idempotency_conflict"));

    const response = await POST(makeRequest(SOURCE_ANSWERS));

    expect(response.status).toBe(409);
    await expect(response.text()).resolves.not.toContain("idempotency_conflict");
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it("does not map an evidence idempotency conflict to 409", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockRejectedValueOnce(new Error("idempotency_conflict"));

    const response = await POST(makeRequest(SOURCE_ANSWERS));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("idempotency_conflict");
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it("returns a safe 500 for other backend errors", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockRejectedValueOnce(new Error("private backend detail"));

    const response = await POST(makeRequest(SOURCE_ANSWERS));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("private backend detail");
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["missing create field", { submissionId: SUBMISSION_ID, attemptOrdinal: 2 }],
    ["extra create field", { ...CREATE_RESULT, score: 1 }],
    ["blank create ID", { ...CREATE_RESULT, submissionId: " " }],
    ["invalid create ordinal", { ...CREATE_RESULT, attemptOrdinal: 0 }],
    ["invalid create timestamp", { ...CREATE_RESULT, submittedAt: "not-a-date" }],
  ])("returns a safe 500 for %s without calling evidence", async (_label, result) => {
    mocks.fetchInternalMutation.mockReset().mockResolvedValueOnce(result);

    const response = await POST(makeRequest(SOURCE_ANSWERS));

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

    const response = await POST(makeRequest(SOURCE_ANSWERS));

    expect(response.status).toBe(500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it("does not call evidence when create returns an invalid result", async () => {
    mocks.fetchInternalMutation.mockReset().mockResolvedValueOnce({ submissionId: SUBMISSION_ID });

    await POST(makeRequest(SOURCE_ANSWERS));

    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });
});
