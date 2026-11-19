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
      createTopic14RateSignAndTrendWorkedSubmission:
        "internal.activities.createTopic14RateSignAndTrendWorkedSubmission",
    },
    learningEvidence: {
      submitTopic14RateSignAndTrendWorkedSubmission:
        "internal.learningEvidence.submitTopic14RateSignAndTrendWorkedSubmission",
    },
  },
}));

import { POST } from "@/app/api/activities/precalculus-topic-1-4-rate-sign-and-trend-worked/submissions/route";
import { generateTopic14RateSignAndTrendOutput } from "@math-platform/math-content/knowledge-space";
import { PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:precalc-rate-sign-worked-route-student";
const WORKED_ACTIVITY_ID = PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID;
const SUBMISSION_ID = "activity_submissions:rate-sign-worked-route";
const SUBMITTED_AT = "2026-08-29T10:30:00.000Z";
const IDEMPOTENCY_KEY = "precalc-rate-sign-worked-route-key";
const CREATE_REFERENCE = "internal.activities.createTopic14RateSignAndTrendWorkedSubmission";
const EVIDENCE_REFERENCE =
  "internal.learningEvidence.submitTopic14RateSignAndTrendWorkedSubmission";
const ANSWER_IDS = ["rateSign", "rateTrend"] as const;

function sourceAnswers(): Record<(typeof ANSWER_IDS)[number], string> {
  const expected = generateTopic14RateSignAndTrendOutput(0).expectedAnswer as Record<
    string,
    string
  >;
  return {
    rateSign: String(expected.rateSign),
    rateTrend: String(expected.rateTrend),
  };
}

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
  answers: Record<string, unknown> = sourceAnswers(),
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
    "http://localhost/api/activities/precalculus-topic-1-4-rate-sign-and-trend-worked/submissions",
    {
      method: "POST",
      headers,
      body: typeof body === "string" ? body : JSON.stringify(body),
    },
  );
}

function collectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectKeys(item, keys));
  else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, nestedValue]) => {
      keys.push(key);
      collectKeys(nestedValue, keys);
    });
  }
  return keys;
}

function expectNoAuthority(value: unknown): void {
  const forbidden = new Set([
    "score",
    "maxScore",
    "correctness",
    "isCorrect",
    "correctAnswer",
    "correctAnswers",
    "expectedAnswer",
    "answerKey",
    "solution",
    "solutions",
    "solutionSteps",
    "steps",
    "finalAnswer",
    "grading",
    "gradingMetadata",
    "normalizedAnswer",
    "authority",
  ]);
  expect(collectKeys(value).filter((key) => forbidden.has(key))).toEqual([]);
}

describe("POST /api/activities/precalculus-topic-1-4-rate-sign-and-trend-worked/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: "student" });
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_NEW);
  });

  it("forwards live seed-0 source answers unchanged and calls the opaque consumer", async () => {
    const envelope = makeEnvelope({
      rateSign: " positive ",
      rateTrend: "not-a-number",
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
    expectNoAuthority(mocks.fetchInternalMutation.mock.calls[0]);
    expectNoAuthority(mocks.fetchInternalMutation.mock.calls[1]);
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

  it("passes through an auth Response and protects authentication errors", async () => {
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
    ["missing key", null],
    ["blank key", "   "],
  ] as const)("rejects %s before either mutation", async (_label, key) => {
    const response = await POST(makeRequest(makeEnvelope(), key));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("accepts valid JSON with no Content-Type header and forwards it", async () => {
    const envelope = makeEnvelope();
    const response = await POST(makeRequest(envelope, IDEMPOTENCY_KEY, null));
    expect(response.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      1,
      CREATE_REFERENCE,
      expect.objectContaining({
        submissionData: envelope,
      }),
    );
  });

  it("accepts valid JSON with a non-JSON Content-Type header", async () => {
    const response = await POST(makeRequest(makeEnvelope(), IDEMPOTENCY_KEY, "text/plain"));
    expect(response.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it("rejects malformed JSON before either mutation", async () => {
    const response = await POST(makeRequest("{"));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["extra outer field", { ...makeEnvelope(), score: 2 }],
    ["missing outer field", makeEnvelope(sourceAnswers(), { status: undefined })],
    ["wrong activity", makeEnvelope(sourceAnswers(), { activityId: "wrong.activity" })],
    ["wrong mode", makeEnvelope(sourceAnswers(), { mode: "guided_practice" })],
    ["wrong status", makeEnvelope(sourceAnswers(), { status: "graded" })],
    ["zero attempt", makeEnvelope(sourceAnswers(), { attemptNumber: 0 })],
    ["fractional attempt", makeEnvelope(sourceAnswers(), { attemptNumber: 1.5 })],
    ["invalid time", makeEnvelope(sourceAnswers(), { submittedAt: "not-a-date" })],
  ] as const)("rejects %s before either mutation", async (_label, body) => {
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    [
      "missing answer",
      (answers: Record<string, unknown>) => {
        delete answers.rateSign;
      },
    ],
    [
      "extra answer",
      (answers: Record<string, unknown>) => {
        answers.score = "2";
      },
    ],
    [
      "non-string answer",
      (answers: Record<string, unknown>) => {
        answers.rateSign = 1;
      },
    ],
  ] as const)("rejects %s before either mutation", async (_label, mutate) => {
    const answers: Record<string, unknown> = { ...sourceAnswers() };
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
        (parts[0] as Record<string, unknown>).rawAnswer = "negative";
      },
    ],
  ] as const)("rejects %s before either mutation", async (_label, mutate) => {
    const parts = ANSWER_IDS.map((partId) => ({ partId, rawAnswer: sourceAnswers()[partId] }));
    mutate(parts);
    const response = await POST(makeRequest(makeEnvelope(sourceAnswers(), { parts })));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("rejects non-array parts before either mutation", async () => {
    const response = await POST(makeRequest(makeEnvelope(sourceAnswers(), { parts: null })));
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

  it("returns a safe 500 for non-conflict producer errors", async () => {
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
  ])("returns a safe 500 for %s", async (_label, evidenceResult) => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(evidenceResult);
    const response = await POST(makeRequest(makeEnvelope()));
    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("submission_not_found");
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it("accepts the exact consumer replay result and returns only the producer result", async () => {
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

  it("retries the same raw envelope and key after consumer failure", async () => {
    const envelope = makeEnvelope({ rateSign: "positive", rateTrend: " malformed " });
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockRejectedValueOnce(new Error("temporary consumer failure"))
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_REPLAY);

    const first = await POST(makeRequest(envelope));
    const second = await POST(makeRequest(envelope));

    expect(first.status).toBe(500);
    expect(second.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(1, CREATE_REFERENCE, {
      userId: LEARNER_ID,
      activityId: WORKED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData: envelope,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(3, CREATE_REFERENCE, {
      userId: LEARNER_ID,
      activityId: WORKED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData: envelope,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(4, EVIDENCE_REFERENCE, {
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });
  });
});
