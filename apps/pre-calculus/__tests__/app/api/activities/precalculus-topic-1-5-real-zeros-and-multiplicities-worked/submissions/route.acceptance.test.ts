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
      createTopic15RealZerosAndMultiplicitiesWorkedSubmission:
        "internal.activities.createTopic15RealZerosAndMultiplicitiesWorkedSubmission",
    },
    learningEvidence: {
      submitTopic15RealZerosAndMultiplicitiesWorkedSubmission:
        "internal.learningEvidence.submitTopic15RealZerosAndMultiplicitiesWorkedSubmission",
    },
  },
}));

import { POST } from "@/app/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities-worked/submissions/route";
import { PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const LEARNER_ID = "profiles:precalc-topic-1-5-real-zeros-and-multiplicities-worked-route-student";
const WORKED_ACTIVITY_ID = PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID;
const SUBMISSION_ID = "activity_submissions:topic-1-5-real-zeros-and-multiplicities-worked-route";
const IDEMPOTENCY_KEY = "precalc-topic-1-5-real-zeros-and-multiplicities-worked-route-key";
const CREATE_REFERENCE =
  "internal.activities.createTopic15RealZerosAndMultiplicitiesWorkedSubmission";
const EVIDENCE_REFERENCE =
  "internal.learningEvidence.submitTopic15RealZerosAndMultiplicitiesWorkedSubmission";
const SUBMITTED_AT = "2026-08-30T10:30:00.000Z";

const SOURCE_ANSWERS = {
  a: [
    { zero: -1, multiplicity: 1 },
    { zero: 0, multiplicity: 3 },
    { zero: 4, multiplicity: 2 },
  ],
  b: [
    { zero: -2, multiplicity: 1 },
    { zero: 2, multiplicity: 5 },
  ],
} as const;

type Pair = { zero: number; multiplicity: number };
type Answers = { a: Pair[]; b: Pair[] };

const CREATE_RESULT = {
  submissionId: SUBMISSION_ID,
  attemptOrdinal: 3,
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

const AUTHORITY_KEYS = [
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "normalizedAnswer",
  "solution",
  "solutions",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "authority",
  "isCorrect",
  "correctness",
  "score",
  "maxScore",
  "mastery",
  "kst",
  "nodeId",
] as const;

function cloneAnswers(): Answers {
  return {
    a: SOURCE_ANSWERS.a.map((pair) => ({ ...pair })),
    b: SOURCE_ANSWERS.b.map((pair) => ({ ...pair })),
  };
}

function makeEnvelope(
  answers: unknown = cloneAnswers(),
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const answerRecord = answers as Record<string, unknown>;
  return {
    contractVersion: "practice.v1",
    activityId: WORKED_ACTIVITY_ID,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 1,
    submittedAt: "2026-08-30T10:00:00.000Z",
    answers,
    parts: [
      { partId: "a", rawAnswer: answerRecord.a },
      { partId: "b", rawAnswer: answerRecord.b },
    ],
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
    "http://localhost/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities-worked/submissions",
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
    Object.entries(value).forEach(([key, nested]) => {
      keys.push(key);
      collectKeys(nested, keys);
    });
  }
  return keys;
}

function expectNoAuthority(value: unknown): void {
  const keys = new Set(AUTHORITY_KEYS);
  expect(
    collectKeys(value).filter((key) => keys.has(key as (typeof AUTHORITY_KEYS)[number])),
  ).toEqual([]);
}

describe("POST /api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities-worked/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: "student" });
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_NEW);
  });

  it("forwards the exact seed-0 envelope, exposes the opaque submission, and returns only the create result", async () => {
    const envelope = makeEnvelope();
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

  it("forwards finite valid wrong pairs unchanged and maps producer rejection safely", async () => {
    const answers = cloneAnswers();
    answers.a[0] = { zero: 7.5, multiplicity: 9 };
    const envelope = makeEnvelope(answers);
    mocks.fetchInternalMutation
      .mockReset()
      .mockRejectedValueOnce(new Error("private source validation detail"));

    const response = await POST(makeRequest(envelope));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("private source validation detail");
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      CREATE_REFERENCE,
      expect.objectContaining({ submissionData: envelope }),
    );
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it("passes through auth responses and rejects authentication before body work", async () => {
    const authResponse = new Response("Unauthorized", { status: 401 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);
    await expect(POST(makeRequest("{", IDEMPOTENCY_KEY, null))).resolves.toBe(authResponse);

    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error("private auth detail"));
    const failedAuth = await POST(makeRequest("{", IDEMPOTENCY_KEY, null));
    expect(failedAuth.status).toBe(500);
    await expect(failedAuth.text()).resolves.not.toContain("private auth detail");

    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ role: "student" });
    expect((await POST(makeRequest(makeEnvelope()))).status).toBe(401);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: "  ", role: "student" });
    expect((await POST(makeRequest(makeEnvelope()))).status).toBe(401);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: LEARNER_ID, role: "teacher" });
    expect((await POST(makeRequest(makeEnvelope()))).status).toBe(403);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("requires the key before parsing and accepts JSON without a content type", async () => {
    expect((await POST(makeRequest("{", null, null))).status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();

    const response = await POST(makeRequest(makeEnvelope(), IDEMPOTENCY_KEY, null));
    expect(response.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it("rejects malformed JSON before mutation", async () => {
    expect((await POST(makeRequest("{"))).status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["extra outer field", { ...makeEnvelope(), score: 2 }],
    ["missing outer field", makeEnvelope(cloneAnswers(), { status: undefined })],
    ["wrong activity", makeEnvelope(cloneAnswers(), { activityId: "wrong.activity" })],
    ["wrong mode", makeEnvelope(cloneAnswers(), { mode: "guided_practice" })],
    ["wrong status", makeEnvelope(cloneAnswers(), { status: "graded" })],
    ["zero attempt", makeEnvelope(cloneAnswers(), { attemptNumber: 0 })],
    ["fractional attempt", makeEnvelope(cloneAnswers(), { attemptNumber: 1.5 })],
    ["non-number attempt", makeEnvelope(cloneAnswers(), { attemptNumber: "1" })],
    ["invalid time", makeEnvelope(cloneAnswers(), { submittedAt: "not-a-date" })],
    ["non-string time", makeEnvelope(cloneAnswers(), { submittedAt: 1 })],
  ] as const)("rejects %s before mutation", async (_label, body) => {
    expect((await POST(makeRequest(body))).status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each(AUTHORITY_KEYS)("rejects top-level authority field %s before mutation", async (field) => {
    expect((await POST(makeRequest({ ...makeEnvelope(), [field]: true }))).status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    [
      "missing answer",
      (answers: Record<string, unknown>) => {
        delete answers.a;
      },
    ],
    [
      "extra answer",
      (answers: Record<string, unknown>) => {
        answers.score = 2;
      },
    ],
  ] as const)("rejects %s before mutation", async (_label, mutate) => {
    const answers: Record<string, unknown> = { ...cloneAnswers() };
    mutate(answers);
    expect((await POST(makeRequest(makeEnvelope(answers)))).status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("rejects non-record answers before mutation", async () => {
    expect((await POST(makeRequest(makeEnvelope([], { answers: [] })))).status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    [
      "non-array a",
      (answers: Record<string, unknown>) => {
        answers.a = {};
      },
    ],
    [
      "too few a pairs",
      (answers: Record<string, unknown>) => {
        answers.a = [{ zero: 0, multiplicity: 1 }];
      },
    ],
    [
      "too many b pairs",
      (answers: Record<string, unknown>) => {
        answers.b = [
          { zero: 0, multiplicity: 1 },
          { zero: 1, multiplicity: 1 },
          { zero: 2, multiplicity: 1 },
          { zero: 3, multiplicity: 1 },
        ];
      },
    ],
    [
      "non-record pair",
      (answers: Record<string, unknown>) => {
        answers.a = [null, ...cloneAnswers().a.slice(1)];
      },
    ],
    [
      "extra pair field",
      (answers: Record<string, unknown>) => {
        answers.a = [{ ...cloneAnswers().a[0], score: 1 }, ...cloneAnswers().a.slice(1)];
      },
    ],
    [
      "non-number pair",
      (answers: Record<string, unknown>) => {
        answers.a = [{ zero: "0", multiplicity: 1 }, ...cloneAnswers().a.slice(1)];
      },
    ],
    [
      "non-finite pair",
      (answers: Record<string, unknown>) => {
        answers.a = [{ zero: Number.NaN, multiplicity: 1 }, ...cloneAnswers().a.slice(1)];
      },
    ],
  ] as const)("rejects %s before mutation", async (_label, mutate) => {
    const answers: Record<string, unknown> = cloneAnswers();
    mutate(answers);
    expect((await POST(makeRequest(makeEnvelope(answers)))).status).toBe(400);
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
      "changed part id",
      (parts: unknown[]) => {
        (parts[0] as Record<string, unknown>).partId = "wrong";
      },
    ],
    [
      "mismatched raw part",
      (parts: unknown[]) => {
        (parts[0] as Record<string, unknown>).rawAnswer = [];
      },
    ],
  ] as const)("rejects %s before mutation", async (_label, mutate) => {
    const envelope = makeEnvelope();
    const parts = envelope.parts as unknown[];
    mutate(parts);
    expect((await POST(makeRequest({ ...envelope, parts }))).status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("rejects non-array parts before mutation", async () => {
    expect((await POST(makeRequest(makeEnvelope(cloneAnswers(), { parts: null })))).status).toBe(
      400,
    );
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("maps only exact create conflict to 409 and other create failures to safe 500", async () => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockRejectedValueOnce(new Error("idempotency_conflict"));
    const conflictResponse = await POST(makeRequest(makeEnvelope()));
    expect(conflictResponse.status).toBe(409);
    await expect(conflictResponse.text()).resolves.not.toContain("idempotency_conflict");

    mocks.fetchInternalMutation
      .mockReset()
      .mockRejectedValueOnce(new Error("private create detail"));
    const response = await POST(makeRequest(makeEnvelope()));
    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("private create detail");
  });

  it.each([
    ["missing field", { submissionId: SUBMISSION_ID, attemptOrdinal: 1 }],
    ["extra field", { ...CREATE_RESULT, score: 2 }],
    ["blank ID", { ...CREATE_RESULT, submissionId: " " }],
    ["non-string ID", { ...CREATE_RESULT, submissionId: 1 }],
    ["zero ordinal", { ...CREATE_RESULT, attemptOrdinal: 0 }],
    ["fractional ordinal", { ...CREATE_RESULT, attemptOrdinal: 1.5 }],
    ["invalid time", { ...CREATE_RESULT, submittedAt: "not-a-date" }],
    ["noncanonical time", { ...CREATE_RESULT, submittedAt: "2026-08-30" }],
    ["non-string time", { ...CREATE_RESULT, submittedAt: 1 }],
  ] as const)("rejects malformed create result %s before exposure", async (_label, result) => {
    mocks.fetchInternalMutation.mockReset().mockResolvedValueOnce(result);
    expect((await POST(makeRequest(makeEnvelope()))).status).toBe(500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["non-object", null],
    ["extra field", { ...EVIDENCE_NEW, extra: true }],
    ["missing field", { persisted: true }],
    ["non-record decision", { ...EVIDENCE_NEW, decision: null }],
    [
      "extra decision field",
      { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, extra: true } },
    ],
    [
      "missing decision field",
      { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, reason: undefined } },
    ],
    ["wrong persisted type", { ...EVIDENCE_NEW, persisted: "true" }],
    ["wrong mastery flag", { ...EVIDENCE_NEW, masteryApplied: true }],
    ["wrong kst flag", { ...EVIDENCE_NEW, kstApplied: true }],
    ["wrong delivery", { ...EVIDENCE_NEW, delivery: "bad" }],
    [
      "wrong idempotency",
      { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, idempotency: "bad" } },
    ],
    [
      "wrong exposure",
      {
        ...EVIDENCE_NEW,
        decision: { ...EVIDENCE_NEW.decision, exposureState: "awaiting_teacher_exposure" },
      },
    ],
    [
      "wrong eligibility",
      { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, eligible: true } },
    ],
    [
      "wrong reason",
      { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, reason: "eligible" } },
    ],
    [
      "wrong mastery bearing",
      { ...EVIDENCE_NEW, decision: { ...EVIDENCE_NEW.decision, masteryBearing: true } },
    ],
    ["delivery mismatch", { ...EVIDENCE_NEW, delivery: "replay" }],
  ])("returns safe 500 for malformed exposure result: %s", async (_label, result) => {
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(result);
    const response = await POST(makeRequest(makeEnvelope()));
    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("private");
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it("accepts a valid new and replay exposure result", async () => {
    const first = await POST(makeRequest(makeEnvelope()));
    expect(first.status).toBe(200);

    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_REPLAY);
    const replay = await POST(makeRequest(makeEnvelope()));
    expect(replay.status).toBe(200);
    await expect(replay.json()).resolves.toStrictEqual(CREATE_RESULT);
  });

  it("retries the same raw envelope and key after exposure failure", async () => {
    const envelope = makeEnvelope({
      a: [{ zero: 7.5, multiplicity: 9 }, ...cloneAnswers().a.slice(1)],
      b: cloneAnswers().b,
    });
    mocks.fetchInternalMutation
      .mockReset()
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockRejectedValueOnce(new Error("private exposure detail"))
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EVIDENCE_REPLAY);

    const failedResponse = await POST(makeRequest(envelope));
    expect(failedResponse.status).toBe(500);
    await expect(failedResponse.text()).resolves.not.toContain("private exposure detail");
    const retryResponse = await POST(makeRequest(envelope));
    expect(retryResponse.status).toBe(200);
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
