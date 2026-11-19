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
      createTopic14PolynomialExtremaWorkedSubmission:
        "internal.activities.createTopic14PolynomialExtremaWorkedSubmission",
    },
    learningEvidence: {
      submitTopic14PolynomialExtremaWorkedSubmission:
        "internal.learningEvidence.submitTopic14PolynomialExtremaWorkedSubmission",
    },
  },
}));

import { POST } from "@/app/api/activities/precalculus-topic-1-4-polynomial-extrema-worked/submissions/route";
import { PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:precalc-extrema-worked-route-student";
const WORKED_ACTIVITY_ID = PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID;
const SUBMISSION_ID = "activity_submissions:polynomial-extrema-worked-route";
const SUBMITTED_AT = "2026-08-29T10:30:00.000Z";
const IDEMPOTENCY_KEY = "precalc-polynomial-extrema-worked-route-key";
const CREATE_REFERENCE = "internal.activities.createTopic14PolynomialExtremaWorkedSubmission";
const EVIDENCE_REFERENCE =
  "internal.learningEvidence.submitTopic14PolynomialExtremaWorkedSubmission";
const ANSWER_IDS = ["relative_minimum_x", "relative_maximum_x", "absolute_minimum_x"] as const;

const SOURCE_ANSWERS = {
  relative_minimum_x: "1",
  relative_maximum_x: "4",
  absolute_minimum_x: "1",
} as const;

const CREATE_RESULT = {
  submissionId: SUBMISSION_ID,
  attemptOrdinal: 2,
  submittedAt: SUBMITTED_AT,
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

function makeEnvelope(
  answers: Record<string, unknown> = SOURCE_ANSWERS,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    contractVersion: "practice.v1",
    activityId: WORKED_ACTIVITY_ID,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 1,
    submittedAt: "2026-08-29T10:00:00.000Z",
    answers,
    parts: ANSWER_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    ...overrides,
  };
}

function makeRequest(
  body: unknown,
  key: string | null = IDEMPOTENCY_KEY,
  contentType: string | null = "application/json",
): Request {
  const headers = new Headers();
  if (key !== null) headers.set("Idempotency-Key", key);
  if (contentType !== null) headers.set("content-type", contentType);
  return new Request(
    "http://localhost/api/activities/precalculus-topic-1-4-polynomial-extrema-worked/submissions",
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  );
}

function makeMalformedJsonRequest(key = IDEMPOTENCY_KEY): Request {
  return new Request(
    "http://localhost/api/activities/precalculus-topic-1-4-polynomial-extrema-worked/submissions",
    {
      method: "POST",
      headers: { "content-type": "application/json", "Idempotency-Key": key },
      body: "{",
    },
  );
}

function expectNoAuthority(value: unknown): void {
  const forbidden = [
    "learnerId",
    "score",
    "correctness",
    "isCorrect",
    "correctAnswer",
    "correctAnswers",
    "expectedAnswer",
    "answerKey",
    "solution",
    "steps",
    "grading",
    "gradingMetadata",
    "authority",
  ];
  expect(JSON.stringify(value)).not.toMatch(new RegExp(`(?:${forbidden.join("|")})`));
}

describe("POST /api/activities/precalculus-topic-1-4-polynomial-extrema-worked/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: "student" });
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_NEW);
  });

  it("forwards the exact raw envelope, identity, trimmed key, and opaque consumer call", async () => {
    const envelope = makeEnvelope({
      relative_minimum_x: " 1 ",
      relative_maximum_x: "not-a-number",
      absolute_minimum_x: "1.0",
    });
    const response = await POST(makeRequest(envelope, ` ${IDEMPOTENCY_KEY} `));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(1, CREATE_REFERENCE, {
      userId: LEARNER_ID,
      activityId: WORKED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData: envelope,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(2, EVIDENCE_REFERENCE, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });
    expectNoAuthority(envelope);
    expectNoAuthority(mocks.fetchInternalMutation.mock.calls[0]);
  });

  it.each([
    ["missing sub", { role: "student" }, 401],
    ["blank sub", { sub: "  ", role: "student" }, 401],
    ["teacher role", { sub: LEARNER_ID, role: "teacher" }, 403],
    ["missing role", { sub: LEARNER_ID }, 403],
  ] as const)("rejects %s before either mutation", async (_label, claims, status) => {
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(claims);

    const response = await POST(makeRequest(makeEnvelope()));

    expect(response.status).toBe(status);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("passes through an authentication Response and protects auth errors", async () => {
    const authResponse = new Response("Unauthorized", { status: 401 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);
    await expect(POST(makeRequest(makeEnvelope()))).resolves.toBe(authResponse);

    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error("private auth detail"));
    const response = await POST(makeRequest(makeEnvelope()));
    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("private auth detail");
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["missing key", makeEnvelope(), null, "application/json"],
    ["blank key", makeEnvelope(), "   ", "application/json"],
  ] as const)("rejects %s before either mutation", async (_label, body, key, contentType) => {
    const response = await POST(makeRequest(body, key, contentType));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["missing", null],
    ["text/plain", "text/plain"],
  ] as const)("accepts valid JSON with %s Content-Type", async (_label, contentType) => {
    const response = await POST(makeRequest(makeEnvelope(), IDEMPOTENCY_KEY, contentType));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it("rejects malformed JSON before either mutation", async () => {
    const response = await POST(makeMalformedJsonRequest());

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["extra outer field", { ...makeEnvelope(), score: 3 }],
    ["missing outer field", makeEnvelope(SOURCE_ANSWERS, { status: undefined })],
    ["wrong activity", makeEnvelope(SOURCE_ANSWERS, { activityId: "wrong.activity" })],
    ["wrong mode", makeEnvelope(SOURCE_ANSWERS, { mode: "guided_practice" })],
    ["wrong status", makeEnvelope(SOURCE_ANSWERS, { status: "graded" })],
    ["zero attempt", makeEnvelope(SOURCE_ANSWERS, { attemptNumber: 0 })],
    ["fractional attempt", makeEnvelope(SOURCE_ANSWERS, { attemptNumber: 1.5 })],
    ["invalid time", makeEnvelope(SOURCE_ANSWERS, { submittedAt: "not-a-date" })],
  ] as const)("rejects %s before either mutation", async (_label, body) => {
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    [
      "missing answer",
      (answers: Record<string, unknown>) => {
        delete answers.relative_minimum_x;
      },
    ],
    [
      "extra answer",
      (answers: Record<string, unknown>) => {
        answers.score = "3";
      },
    ],
    [
      "non-string answer",
      (answers: Record<string, unknown>) => {
        answers.relative_minimum_x = 1;
      },
    ],
  ] as const)("rejects %s before either mutation", async (_label, mutate) => {
    const answers: Record<string, unknown> = { ...SOURCE_ANSWERS };
    mutate(answers);
    const response = await POST(makeRequest(makeEnvelope(answers)));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["missing part", (parts: unknown[]) => parts.shift()],
    [
      "extra part field",
      (parts: unknown[]) => {
        (parts[0] as Record<string, unknown>).score = 1;
      },
    ],
    ["reordered parts", (parts: unknown[]) => parts.reverse()],
    [
      "duplicate part",
      (parts: unknown[]) => {
        parts[1] = parts[0];
      },
    ],
    [
      "mismatched raw part",
      (parts: unknown[]) => {
        (parts[0] as Record<string, unknown>).rawAnswer = "4";
      },
    ],
  ] as const)("rejects %s before either mutation", async (_label, mutate) => {
    const parts = ANSWER_IDS.map((partId) => ({ partId, rawAnswer: SOURCE_ANSWERS[partId] }));
    mutate(parts);
    const response = await POST(makeRequest(makeEnvelope(SOURCE_ANSWERS, { parts })));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("rejects non-array parts before either mutation", async () => {
    const response = await POST(makeRequest(makeEnvelope(SOURCE_ANSWERS, { parts: null })));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("maps only the exact producer conflict to 409", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockRejectedValueOnce(new Error("idempotency_conflict"));

    const response = await POST(makeRequest(makeEnvelope()));

    expect(response.status).toBe(409);
    await expect(response.text()).resolves.not.toContain("idempotency_conflict");
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it("returns safe 500 for producer errors and never calls evidence", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockRejectedValueOnce(new Error("private producer detail"));

    const response = await POST(makeRequest(makeEnvelope()));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("private producer detail");
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["missing field", { submissionId: SUBMISSION_ID, attemptOrdinal: 2 }],
    ["extra field", { ...CREATE_RESULT, score: 1 }],
    ["blank ID", { ...CREATE_RESULT, submissionId: " " }],
    ["zero ordinal", { ...CREATE_RESULT, attemptOrdinal: 0 }],
    ["fractional ordinal", { ...CREATE_RESULT, attemptOrdinal: 1.5 }],
    ["invalid timestamp", { ...CREATE_RESULT, submittedAt: "not-a-date" }],
    ["noncanonical timestamp", { ...CREATE_RESULT, submittedAt: "2026-08-29" }],
  ] as const)(
    "rejects malformed producer result %s without calling evidence",
    async (_label, result) => {
      mocks.fetchInternalMutation.mockReset().mockResolvedValueOnce(result);

      const response = await POST(makeRequest(makeEnvelope()));

      expect(response.status).toBe(500);
      expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    ["rejected evidence", { accepted: false, reason: "submission_not_found" }],
    ["extra evidence field", { ...EVIDENCE_NEW, extra: true }],
    [
      "eligible evidence",
      { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, eligible: true } },
    ],
    [
      "mastery evidence",
      { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, masteryBearing: true } },
    ],
    ["wrong delivery", { ...EVIDENCE_NEW, delivery: "replay" }],
    ["wrong persistence", { ...EVIDENCE_NEW, persisted: false }],
    ["malformed evidence", { persisted: true }],
  ])("returns safe 500 for %s", async (_label, evidenceResult) => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(evidenceResult);

    const response = await POST(makeRequest(makeEnvelope()));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("submission_not_found");
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it("accepts the consumer replay result and preserves one opaque submission call", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_REPLAY);

    const response = await POST(makeRequest(makeEnvelope()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(2, EVIDENCE_REFERENCE, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });
  });

  it("retries the same producer envelope and key when the idempotent producer replays", async () => {
    const envelope = makeEnvelope();
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockRejectedValueOnce(new Error("temporary evidence failure"))
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_REPLAY);

    const first = await POST(makeRequest(envelope));
    const second = await POST(makeRequest(envelope));

    expect(first.status).toBe(500);
    expect(second.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      1,
      CREATE_REFERENCE,
      expect.objectContaining({ idempotencyKey: IDEMPOTENCY_KEY, submissionData: envelope }),
    );
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      3,
      CREATE_REFERENCE,
      expect.objectContaining({ idempotencyKey: IDEMPOTENCY_KEY, submissionData: envelope }),
    );
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(4, EVIDENCE_REFERENCE, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });
  });
});
