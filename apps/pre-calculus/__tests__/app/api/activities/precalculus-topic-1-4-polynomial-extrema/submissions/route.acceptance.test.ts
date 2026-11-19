import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateTopic14PolynomialExtremaFromGraphOutput } from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";
import { internal } from "@/lib/convex/server";

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
      createTopic14PolynomialExtremaFromGraphSubmission:
        "internal.activities.createTopic14PolynomialExtremaFromGraphSubmission",
    },
  },
}));

const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID = PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID;
const LEARNER_ID = "profiles:precalc-topic-1-4-polynomial-extrema-student";
const IDEMPOTENCY_KEY = "precalc-topic-1-4-polynomial-extrema-key";
const ANSWER_IDS = ["relative_minimum_x", "relative_maximum_x", "absolute_minimum_x"] as const;
type AnswerId = (typeof ANSWER_IDS)[number];
type Mode = "guided_practice" | "independent_practice";
type RawAnswers = Record<string, unknown>;
type RawParts = Array<Record<string, unknown>> | null;

const SERVER_RESULT = {
  submissionId: "activity_submissions:topic-1-4-polynomial-extrema",
  score: 3,
  maxScore: 3,
  attemptOrdinal: 1,
  feedback: "3/3 extrema responses matched the server rubric.",
} as const;

function answerStrings(seed: number): Record<AnswerId, string> {
  const answer = generateTopic14PolynomialExtremaFromGraphOutput(seed).expectedAnswer as Record<
    string,
    number
  >;
  return Object.fromEntries(ANSWER_IDS.map((id) => [id, String(answer[id])])) as Record<
    AnswerId,
    string
  >;
}

function makeEnvelope(
  activityId: string,
  mode: Mode,
  answers: RawAnswers,
  overrides: Record<string, unknown> = {},
) {
  return {
    contractVersion: "practice.v1" as const,
    activityId,
    mode,
    status: "submitted" as const,
    attemptNumber: 4,
    submittedAt: "2026-08-28T10:15:00.000Z",
    answers,
    parts: ANSWER_IDS.map((partId) => ({
      partId,
      rawAnswer: answers[partId],
    })),
    ...overrides,
  };
}

function makeRequest(body: unknown, idempotencyKey: string | null = IDEMPOTENCY_KEY): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (idempotencyKey !== null) headers.set("Idempotency-Key", idempotencyKey);
  return new Request(
    "http://localhost/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions",
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/activities/precalculus-topic-1-4-polynomial-extrema/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: "student" });
    mocks.fetchInternalMutation.mockResolvedValue(SERVER_RESULT);
  });

  it.each([
    ["Guided", GUIDED_ACTIVITY_ID, "guided_practice", 1],
    ["Independent", INDEPENDENT_ACTIVITY_ID, "independent_practice", 2],
  ] as const)(
    "forwards the exact %s envelope and preserves raw strings",
    async (_label, activityId, mode, seed) => {
      const answers = answerStrings(seed);
      answers.relative_maximum_x = "not-a-number";
      const submissionData = makeEnvelope(activityId, mode, answers);
      const { POST } =
        await import("@/app/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions/route");

      const response = await POST(makeRequest(submissionData, ` ${IDEMPOTENCY_KEY} `));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toStrictEqual(SERVER_RESULT);
      expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
      expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
        "internal.activities.createTopic14PolynomialExtremaFromGraphSubmission",
        {
          userId: LEARNER_ID,
          activityId,
          submissionData,
          idempotencyKey: IDEMPOTENCY_KEY,
        },
      );
      expect(JSON.stringify(submissionData)).toContain("not-a-number");
      expect(JSON.stringify(submissionData)).not.toMatch(
        /answerKey|correctAnswer|expectedAnswer|grading|score|solution|authority/,
      );
      expect(internal).not.toHaveProperty("learningEvidence");
    },
  );

  it("passes through auth responses and rejects invalid claims before mutation", async () => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions/route");
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1));
    const authResponse = new Response("Forbidden", { status: 403 });

    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);
    await expect(POST(makeRequest(body))).resolves.toBe(authResponse);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ role: "student" });
    await expect(POST(makeRequest(body))).resolves.toHaveProperty("status", 401);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: LEARNER_ID, role: "teacher" });
    await expect(POST(makeRequest(body))).resolves.toHaveProperty("status", 403);
    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error("private auth detail"));
    const errorResponse = await POST(makeRequest(body));
    expect(errorResponse.status).toBe(500);
    await expect(errorResponse.text()).resolves.not.toContain("private auth detail");
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("accepts valid JSON without content type and rejects malformed JSON before mutation", async () => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions/route");
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1));

    const validWithoutContentType = new Request(
      "http://localhost/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions",
      {
        method: "POST",
        headers: { "Idempotency-Key": IDEMPOTENCY_KEY },
        body: JSON.stringify(body),
      },
    );
    const validResponse = await POST(validWithoutContentType);
    expect(validResponse.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      "internal.activities.createTopic14PolynomialExtremaFromGraphSubmission",
      {
        userId: LEARNER_ID,
        activityId: GUIDED_ACTIVITY_ID,
        submissionData: body,
        idempotencyKey: IDEMPOTENCY_KEY,
      },
    );

    mocks.fetchInternalMutation.mockClear();
    const malformedJson = new Request(
      "http://localhost/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": IDEMPOTENCY_KEY,
        },
        body: "{",
      },
    );
    const malformedResponse = await POST(malformedJson);
    expect(malformedResponse.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["missing key", makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1)), null],
    ["blank key", makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1)), "  "],
    [
      "extra outer field",
      { ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1)), score: 3 },
      IDEMPOTENCY_KEY,
    ],
    [
      "unknown activity",
      makeEnvelope(
        "math.precalc.skill.1.4.unknown.guided_practice",
        "guided_practice",
        answerStrings(1),
      ),
      IDEMPOTENCY_KEY,
    ],
    [
      "mismatched mode",
      makeEnvelope(GUIDED_ACTIVITY_ID, "independent_practice", answerStrings(2)),
      IDEMPOTENCY_KEY,
    ],
    [
      "wrong contract",
      makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1), {
        contractVersion: "practice.v2",
      }),
      IDEMPOTENCY_KEY,
    ],
    [
      "wrong status",
      makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1), { status: "draft" }),
      IDEMPOTENCY_KEY,
    ],
    [
      "zero attempt",
      makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1), { attemptNumber: 0 }),
      IDEMPOTENCY_KEY,
    ],
    [
      "fractional attempt",
      makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1), { attemptNumber: 1.5 }),
      IDEMPOTENCY_KEY,
    ],
    [
      "invalid timestamp",
      makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1), {
        submittedAt: "not-a-date",
      }),
      IDEMPOTENCY_KEY,
    ],
  ] as const)("rejects %s before the mutation", async (_label, body, key) => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions/route");

    const response = await POST(makeRequest(body, key));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    [
      "missing answer",
      (answers: RawAnswers): RawAnswers => {
        const { absolute_minimum_x: _missing, ...remaining } = answers;
        return remaining;
      },
    ],
    ["extra answer", (answers: RawAnswers): RawAnswers => ({ ...answers, score: "3" })],
    [
      "non-string answer",
      (answers: RawAnswers): RawAnswers => ({ ...answers, relative_minimum_x: 1 }),
    ],
  ] as const)("rejects %s before the mutation", async (_label, makeAnswers) => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions/route");
    const answers = answerStrings(1);
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", makeAnswers(answers));

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    [
      "missing part",
      (answers: RawAnswers): RawParts =>
        ANSWER_IDS.slice(0, 2).map((partId) => ({ partId, rawAnswer: answers[partId] })),
    ],
    [
      "extra part field",
      (answers: RawAnswers): RawParts =>
        ANSWER_IDS.map((partId, index) =>
          index === 0
            ? { partId, rawAnswer: answers[partId], score: 1 }
            : { partId, rawAnswer: answers[partId] },
        ),
    ],
    [
      "parts out of order",
      (answers: RawAnswers): RawParts => [
        { partId: "relative_maximum_x", rawAnswer: answers.relative_maximum_x },
        ...ANSWER_IDS.filter((partId) => partId !== "relative_maximum_x").map((partId) => ({
          partId,
          rawAnswer: answers[partId],
        })),
      ],
    ],
    [
      "duplicate part",
      (answers: RawAnswers): RawParts => [
        { partId: "relative_minimum_x", rawAnswer: answers.relative_minimum_x },
        { partId: "relative_minimum_x", rawAnswer: answers.relative_minimum_x },
        { partId: "absolute_minimum_x", rawAnswer: answers.absolute_minimum_x },
      ],
    ],
    [
      "mismatched raw part",
      (answers: RawAnswers): RawParts => [
        { partId: "relative_minimum_x", rawAnswer: answers.relative_maximum_x },
        ...ANSWER_IDS.slice(1).map((partId) => ({ partId, rawAnswer: answers[partId] })),
      ],
    ],
    ["non-array parts", (_answers: RawAnswers): RawParts => null],
  ] as const)("rejects %s before the mutation", async (_label, makeParts) => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions/route");
    const answers = answerStrings(1);
    const body = makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answers, {
      parts: makeParts(answers),
    });

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("maps only the exact idempotency conflict to 409", async () => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions/route");
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error("idempotency_conflict"));

    const response = await POST(
      makeRequest(makeEnvelope(INDEPENDENT_ACTIVITY_ID, "independent_practice", answerStrings(2))),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toStrictEqual({
      error: "Idempotency key was already used for a different submission",
    });
  });

  it.each([
    ["extra result field", { ...SERVER_RESULT, hidden: true }],
    ["blank submission ID", { ...SERVER_RESULT, submissionId: " " }],
    ["negative score", { ...SERVER_RESULT, score: -1 }],
    ["fractional score", { ...SERVER_RESULT, score: 1.5 }],
    ["score above maximum", { ...SERVER_RESULT, score: 4 }],
    ["invalid maximum", { ...SERVER_RESULT, maxScore: 2 }],
    ["zero ordinal", { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ["non-string feedback", { ...SERVER_RESULT, feedback: 1 }],
  ] as const)("returns safe 500 for %s", async (_label, result) => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions/route");
    mocks.fetchInternalMutation.mockResolvedValueOnce(result);

    const response = await POST(
      makeRequest(makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1))),
    );

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).not.toContain(JSON.stringify(result));
    expect(text).not.toContain("hidden");
  });

  it("returns a safe 500 for non-conflict mutation errors", async () => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions/route");
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error("private mutation detail"));

    const response = await POST(
      makeRequest(makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1))),
    );

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("private mutation detail");
  });
});
