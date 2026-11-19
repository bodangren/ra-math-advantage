import { beforeEach, describe, expect, it, vi } from "vitest";

import { PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

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
      createTopic15PolynomialInequalityWorkedSubmission:
        "internal.activities.createTopic15PolynomialInequalityWorkedSubmission",
    },
    learningEvidence: {
      submitTopic15PolynomialInequalityWorkedSubmission:
        "internal.learningEvidence.submitTopic15PolynomialInequalityWorkedSubmission",
    },
  },
}));

const ROUTE_URL =
  "http://localhost/api/activities/precalculus-topic-1-5-polynomial-inequality-worked/submissions";
const ROUTE_MODULE =
  "@/app/api/activities/precalculus-topic-1-5-polynomial-inequality-worked/submissions/route";
const LEARNER_ID = "profile:student-route";
const IDEMPOTENCY_KEY = "topic15-polynomial-inequality-worked-review";
const CREATE_REF = "internal.activities.createTopic15PolynomialInequalityWorkedSubmission";
const EXPOSURE_REF = "internal.learningEvidence.submitTopic15PolynomialInequalityWorkedSubmission";

const ANSWERS = {
  roots: [-4, -1, 3],
  intervalSigns: ["-", "+", "-", "+"],
  solution: "(-4, -1) ∪ (3, ∞)",
} as const;

const CREATE_RESULT = {
  submissionId: "activity_submissions:topic15-polynomial-inequality-worked",
  attemptOrdinal: 1,
  submittedAt: "2026-08-30T12:00:00.000Z",
} as const;

const EXPOSURE_NEW = {
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
} as const;

const EXPOSURE_REPLAY = {
  persisted: false,
  masteryApplied: false,
  kstApplied: false,
  delivery: "replay",
  decision: {
    idempotency: "replay",
    exposureState: "introduced",
    eligible: false,
    reason: "teacher_led",
    masteryBearing: false,
  },
} as const;

type Answers = {
  roots: unknown;
  intervalSigns: unknown;
  solution: unknown;
};

type EnvelopeOverrides = Record<string, unknown>;

function makeEnvelope(answers: Answers = ANSWERS, overrides: EnvelopeOverrides = {}) {
  return {
    contractVersion: "practice.v1",
    activityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
    mode: "worked_example",
    status: "submitted",
    attemptNumber: 1,
    submittedAt: "2026-08-30T12:00:00.000Z",
    answers,
    parts: [
      { partId: "roots", rawAnswer: answers.roots },
      { partId: "intervalSigns", rawAnswer: answers.intervalSigns },
      { partId: "solution", rawAnswer: answers.solution },
    ],
    ...overrides,
  };
}

function makeRequest(body: unknown, key: string | null = IDEMPOTENCY_KEY) {
  const headers: Record<string, string> = {};
  if (key !== null) headers["Idempotency-Key"] = key;
  return new Request(ROUTE_URL, {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function getPost() {
  const route = await vi.importActual<{
    POST: (request: Request) => Promise<Response>;
  }>(ROUTE_MODULE);
  return route.POST;
}

async function expectSafeError(response: Response, status: number) {
  expect(response.status).toBe(status);
  const text = await response.text();
  expect(text).not.toContain("private");
  expect(text).not.toContain("submissionId");
  expect(text).not.toContain("teacher_led");
  expect(text).not.toContain("masteryApplied");
}

function expectExactEnvelope(body: Record<string, unknown>) {
  expect(Object.keys(body).sort()).toStrictEqual([
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
  ]);
  expect(Object.keys(body.answers as object).sort()).toStrictEqual([
    "intervalSigns",
    "roots",
    "solution",
  ]);
  expect((body.parts as Array<Record<string, unknown>>).map((part) => part.partId)).toStrictEqual([
    "roots",
    "intervalSigns",
    "solution",
  ]);
  for (const part of body.parts as Array<Record<string, unknown>>) {
    expect(Object.keys(part).sort()).toStrictEqual(["partId", "rawAnswer"]);
  }
}

describe("Topic 1.5 Example 3 Worked submission route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({
      sub: LEARNER_ID,
      role: "student",
    });
    mocks.fetchInternalMutation.mockResolvedValue(CREATE_RESULT);
  });

  it("authenticates first and passes the actual request before reading headers or body", async () => {
    const POST = await getPost();
    const request = makeRequest(makeEnvelope());
    const getHeader = vi.spyOn(request.headers, "get");
    const json = vi.spyOn(request, "json");
    const authResponse = new Response("Signed out", { status: 401 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);

    await expect(POST(request)).resolves.toBe(authResponse);

    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledWith(request);
    expect(getHeader).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("preserves auth Responses and rejects invalid claims before Convex calls", async () => {
    const POST = await getPost();
    const body = makeEnvelope();
    const authResponse = new Response("Forbidden", { status: 403 });

    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);
    await expect(POST(makeRequest(body))).resolves.toBe(authResponse);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ role: "student" });
    await expect(POST(makeRequest(body))).resolves.toHaveProperty("status", 401);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: "  ", role: "student" });
    await expect(POST(makeRequest(body))).resolves.toHaveProperty("status", 401);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: LEARNER_ID, role: "teacher" });
    await expect(POST(makeRequest(body))).resolves.toHaveProperty("status", 403);
    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error("private auth detail"));
    await expectSafeError(await POST(makeRequest(body)), 500);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("creates then exposes a Worked submission and returns only the create result", async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EXPOSURE_NEW);
    const submissionData = makeEnvelope();

    const response = await POST(makeRequest(submissionData, ` ${IDEMPOTENCY_KEY} `));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(Object.keys(CREATE_RESULT).sort()).toStrictEqual([
      "attemptOrdinal",
      "submissionId",
      "submittedAt",
    ]);
    expectExactEnvelope(submissionData);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(1, CREATE_REF, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData,
    });
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(2, EXPOSURE_REF, {
      learnerId: LEARNER_ID,
      submissionId: CREATE_RESULT.submissionId,
    });
  });

  it("forwards a well-formed wrong response without source grading", async () => {
    const POST = await getPost();
    const wrongAnswers = {
      roots: [-4, -1, 3.5],
      intervalSigns: ["-", "+", "-", "+"],
      solution: " (-4,-1) U (3.5, infinity) ",
    };
    const submissionData = makeEnvelope(wrongAnswers);
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error("producer rejected wrong answer"));

    await expectSafeError(await POST(makeRequest(submissionData)), 500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(CREATE_REF, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
      idempotencyKey: IDEMPOTENCY_KEY,
      submissionData,
    });
  });

  it("maps only create idempotency_conflict to 409 and skips exposure", async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error("idempotency_conflict"));

    const response = await POST(makeRequest(makeEnvelope()));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toStrictEqual({
      error: "Idempotency key was already used for a different submission",
    });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(CREATE_REF, expect.any(Object));
  });

  it.each([
    ["missing key", makeEnvelope(), null],
    ["blank key", makeEnvelope(), "   "],
  ] as const)("rejects %s before body parsing or mutation", async (_label, body, key) => {
    const POST = await getPost();
    const request = makeRequest(body, key);
    const json = vi.spyOn(request, "json");
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(json).not.toHaveBeenCalled();
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON safely", async () => {
    const POST = await getPost();
    const response = await POST(makeRequest("{"));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["extra outer field", makeEnvelope(ANSWERS, { extra: true })],
    [
      "missing outer field",
      (() => {
        const body = makeEnvelope() as Record<string, unknown>;
        delete body.parts;
        return body;
      })(),
    ],
    ["wrong contract", makeEnvelope(ANSWERS, { contractVersion: "practice.v0" })],
    ["wrong activity", makeEnvelope(ANSWERS, { activityId: "activity:wrong" })],
    ["wrong mode", makeEnvelope(ANSWERS, { mode: "guided_practice" })],
    ["wrong status", makeEnvelope(ANSWERS, { status: "draft" })],
    ["zero attempt", makeEnvelope(ANSWERS, { attemptNumber: 0 })],
    ["fractional attempt", makeEnvelope(ANSWERS, { attemptNumber: 1.5 })],
    ["unsafe attempt", makeEnvelope(ANSWERS, { attemptNumber: Number.MAX_SAFE_INTEGER + 1 })],
    ["non-number attempt", makeEnvelope(ANSWERS, { attemptNumber: "1" })],
    ["invalid time", makeEnvelope(ANSWERS, { submittedAt: "not-a-date" })],
    ["noncanonical time", makeEnvelope(ANSWERS, { submittedAt: "2026-08-30T12:00:00Z" })],
    ["non-string time", makeEnvelope(ANSWERS, { submittedAt: 1 })],
  ] as const)("rejects malformed Worked envelope: %s", async (_label, body) => {
    const POST = await getPost();
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["missing answers", makeEnvelope(ANSWERS, { answers: undefined })],
    ["extra answer field", makeEnvelope({ ...ANSWERS, extra: 1 } as Answers)],
    ["non-record answers", makeEnvelope(ANSWERS, { answers: null })],
    ["non-array roots", makeEnvelope({ ...ANSWERS, roots: "[-4,-1,3]" })],
    ["wrong root count", makeEnvelope({ ...ANSWERS, roots: [-4, -1] })],
    ["non-number root", makeEnvelope({ ...ANSWERS, roots: [-4, "-1", 3] })],
    ["non-finite root", makeEnvelope({ ...ANSWERS, roots: [-4, Number.NaN, 3] })],
    ["unsafe root", makeEnvelope({ ...ANSWERS, roots: [-4, -1, Number.MAX_SAFE_INTEGER + 1] })],
    ["non-array signs", makeEnvelope({ ...ANSWERS, intervalSigns: "-,+,-,+" })],
    ["wrong sign count", makeEnvelope({ ...ANSWERS, intervalSigns: ["-", "+", "-"] })],
    ["invalid sign", makeEnvelope({ ...ANSWERS, intervalSigns: ["-", "+", "x", "+"] })],
    ["non-string solution", makeEnvelope({ ...ANSWERS, solution: 1 })],
    ["blank solution", makeEnvelope({ ...ANSWERS, solution: "  " })],
  ] as const)("rejects malformed Worked answers: %s", async (_label, body) => {
    const POST = await getPost();
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["missing parts", makeEnvelope(ANSWERS, { parts: undefined })],
    ["non-array parts", makeEnvelope(ANSWERS, { parts: {} })],
    ["wrong part count", makeEnvelope(ANSWERS, { parts: [makeEnvelope().parts[0]] })],
    [
      "wrong part order",
      makeEnvelope(ANSWERS, {
        parts: [
          { partId: "intervalSigns", rawAnswer: ANSWERS.intervalSigns },
          { partId: "roots", rawAnswer: ANSWERS.roots },
          { partId: "solution", rawAnswer: ANSWERS.solution },
        ],
      }),
    ],
    [
      "wrong part ID",
      makeEnvelope(ANSWERS, {
        parts: [
          { partId: "root", rawAnswer: ANSWERS.roots },
          { partId: "intervalSigns", rawAnswer: ANSWERS.intervalSigns },
          { partId: "solution", rawAnswer: ANSWERS.solution },
        ],
      }),
    ],
    [
      "raw roots mismatch",
      makeEnvelope(ANSWERS, {
        parts: [
          { partId: "roots", rawAnswer: [-4, -1, 4] },
          { partId: "intervalSigns", rawAnswer: ANSWERS.intervalSigns },
          { partId: "solution", rawAnswer: ANSWERS.solution },
        ],
      }),
    ],
    [
      "raw signs mismatch",
      makeEnvelope(ANSWERS, {
        parts: [
          { partId: "roots", rawAnswer: ANSWERS.roots },
          { partId: "intervalSigns", rawAnswer: ["-", "+", "+", "+"] },
          { partId: "solution", rawAnswer: ANSWERS.solution },
        ],
      }),
    ],
    [
      "raw solution mismatch",
      makeEnvelope(ANSWERS, {
        parts: [
          { partId: "roots", rawAnswer: ANSWERS.roots },
          { partId: "intervalSigns", rawAnswer: ANSWERS.intervalSigns },
          { partId: "solution", rawAnswer: "(-4, -1) ∪ (3, 4)" },
        ],
      }),
    ],
    [
      "extra part field",
      makeEnvelope(ANSWERS, {
        parts: [
          { partId: "roots", rawAnswer: ANSWERS.roots, score: 1 },
          { partId: "intervalSigns", rawAnswer: ANSWERS.intervalSigns },
          { partId: "solution", rawAnswer: ANSWERS.solution },
        ],
      }),
    ],
    [
      "non-record part",
      makeEnvelope(ANSWERS, {
        parts: [null, ...makeEnvelope().parts.slice(1)],
      }),
    ],
  ] as const)("rejects malformed Worked parts: %s", async (_label, body) => {
    const POST = await getPost();
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["non-object create result", null],
    ["extra create field", { ...CREATE_RESULT, hidden: true }],
    [
      "missing create field",
      (() => {
        const result = { ...CREATE_RESULT } as Record<string, unknown>;
        delete result.submittedAt;
        return result;
      })(),
    ],
    ["blank submission ID", { ...CREATE_RESULT, submissionId: " " }],
    ["non-string submission ID", { ...CREATE_RESULT, submissionId: 1 }],
    ["zero ordinal", { ...CREATE_RESULT, attemptOrdinal: 0 }],
    ["fractional ordinal", { ...CREATE_RESULT, attemptOrdinal: 1.5 }],
    ["unsafe ordinal", { ...CREATE_RESULT, attemptOrdinal: Number.MAX_SAFE_INTEGER + 1 }],
    ["non-string ordinal", { ...CREATE_RESULT, attemptOrdinal: "1" }],
    ["invalid time", { ...CREATE_RESULT, submittedAt: "not-a-date" }],
    ["noncanonical time", { ...CREATE_RESULT, submittedAt: "2026-08-30T12:00:00Z" }],
    ["non-string time", { ...CREATE_RESULT, submittedAt: 1 }],
  ] as const)("rejects create result corruption safely: %s", async (_label, result) => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockResolvedValueOnce(result);
    await expectSafeError(await POST(makeRequest(makeEnvelope())), 500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["non-object exposure", null],
    ["extra outer field", { ...EXPOSURE_NEW, hidden: true }],
    [
      "missing outer field",
      (() => {
        const result = { ...EXPOSURE_NEW } as Record<string, unknown>;
        delete result.kstApplied;
        return result;
      })(),
    ],
    ["non-boolean persisted", { ...EXPOSURE_NEW, persisted: "true" }],
    ["non-boolean mastery", { ...EXPOSURE_NEW, masteryApplied: "false" }],
    ["non-boolean KST", { ...EXPOSURE_NEW, kstApplied: 0 }],
    ["invalid delivery", { ...EXPOSURE_NEW, delivery: "queued" }],
    ["non-record decision", { ...EXPOSURE_NEW, decision: null }],
    [
      "extra decision field",
      { ...EXPOSURE_NEW, decision: { ...EXPOSURE_NEW.decision, hidden: true } },
    ],
    [
      "missing decision field",
      {
        ...EXPOSURE_NEW,
        decision: (() => {
          const decision = { ...EXPOSURE_NEW.decision } as Record<string, unknown>;
          delete decision.reason;
          return decision;
        })(),
      },
    ],
    [
      "invalid idempotency",
      { ...EXPOSURE_NEW, decision: { ...EXPOSURE_NEW.decision, idempotency: "old" } },
    ],
    [
      "invalid exposure state",
      { ...EXPOSURE_NEW, decision: { ...EXPOSURE_NEW.decision, exposureState: "mastered" } },
    ],
    [
      "invalid reason",
      { ...EXPOSURE_NEW, decision: { ...EXPOSURE_NEW.decision, reason: "private" } },
    ],
    [
      "non-boolean eligible",
      { ...EXPOSURE_NEW, decision: { ...EXPOSURE_NEW.decision, eligible: 0 } },
    ],
    [
      "non-boolean mastery bearing",
      { ...EXPOSURE_NEW, decision: { ...EXPOSURE_NEW.decision, masteryBearing: "false" } },
    ],
    [
      "new delivery with replay idempotency",
      { ...EXPOSURE_NEW, decision: { ...EXPOSURE_NEW.decision, idempotency: "replay" } },
    ],
    [
      "replay delivery with new idempotency",
      { ...EXPOSURE_REPLAY, decision: { ...EXPOSURE_REPLAY.decision, idempotency: "new" } },
    ],
    ["persisted false with new delivery", { ...EXPOSURE_NEW, persisted: false }],
    ["persisted true with replay delivery", { ...EXPOSURE_REPLAY, persisted: true }],
    ["mastery applied", { ...EXPOSURE_NEW, masteryApplied: true }],
    ["KST applied", { ...EXPOSURE_NEW, kstApplied: true }],
  ] as const)("rejects exposure result corruption safely: %s", async (_label, result) => {
    const POST = await getPost();
    mocks.fetchInternalMutation.mockResolvedValueOnce(CREATE_RESULT).mockResolvedValueOnce(result);
    await expectSafeError(await POST(makeRequest(makeEnvelope())), 500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
  });

  it("retries exposure with the same body and key after a private exposure failure", async () => {
    const POST = await getPost();
    const body = makeEnvelope();
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockRejectedValueOnce(new Error("private exposure detail"))
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EXPOSURE_REPLAY);

    await expectSafeError(await POST(makeRequest(body)), 500);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(2);
    const retryResponse = await POST(makeRequest(body));
    expect(retryResponse.status).toBe(200);
    await expect(retryResponse.json()).resolves.toStrictEqual(CREATE_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(4);
    expect(mocks.fetchInternalMutation.mock.calls[0]).toStrictEqual(
      mocks.fetchInternalMutation.mock.calls[2],
    );
    expect(mocks.fetchInternalMutation.mock.calls[1]).toStrictEqual(
      mocks.fetchInternalMutation.mock.calls[3],
    );
  });

  it("does not expose evidence details or call any other internal mutation", async () => {
    const POST = await getPost();
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(CREATE_RESULT)
      .mockResolvedValueOnce(EXPOSURE_NEW);

    const response = await POST(makeRequest(makeEnvelope()));
    const responseText = await response.text();

    expect(responseText).not.toContain("introduced");
    expect(responseText).not.toContain("teacher_led");
    expect(responseText).not.toContain("masteryBearing");
    expect(mocks.fetchInternalMutation.mock.calls.map(([ref]) => ref)).toStrictEqual([
      CREATE_REF,
      EXPOSURE_REF,
    ]);
  });
});
