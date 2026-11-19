import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateTopic14PolynomialDegreeLeadingCoefficientOutput } from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
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
      createTopic14PolynomialDegreeLeadingCoefficientSubmission:
        "internal.activities.createTopic14PolynomialDegreeLeadingCoefficientSubmission",
    },
  },
}));

const GUIDED_ACTIVITY_ID =
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID =
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID;
const LEARNER_ID = "profiles:precalc-topic-1-4-polynomial-student";
const IDEMPOTENCY_KEY = "precalc-topic-1-4-polynomial-key";
const ANSWER_IDS = [
  "a_degree",
  "a_leading_coefficient",
  "b_degree",
  "b_leading_coefficient",
  "c_degree",
  "c_leading_coefficient",
] as const;
type AnswerId = (typeof ANSWER_IDS)[number];
type Mode = "guided_practice" | "independent_practice";
type RawAnswers = Record<string, unknown>;
type RawParts = Array<Record<string, unknown>> | null;

const SERVER_RESULT = {
  submissionId: "activity_submissions:topic-1-4-polynomial",
  score: 6,
  maxScore: 6,
  attemptOrdinal: 1,
  feedback: "6/6 degree and leading coefficient responses matched the server rubric.",
} as const;

function answerStrings(seed: number): Record<AnswerId, string> {
  const answer = generateTopic14PolynomialDegreeLeadingCoefficientOutput(seed)
    .expectedAnswer as Record<string, number>;
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
  return new Request(
    "http://localhost/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(idempotencyKey === null ? {} : { "Idempotency-Key": idempotencyKey }),
      },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: "student" });
    mocks.fetchInternalMutation.mockResolvedValue(SERVER_RESULT);
  });

  it.each([
    ["Guided", GUIDED_ACTIVITY_ID, "guided_practice", 1],
    ["Independent", INDEPENDENT_ACTIVITY_ID, "independent_practice", 2],
  ] as const)(
    "forwards the exact %s envelope and preserves malformed numeric strings",
    async (_label, activityId, mode, seed) => {
      const answers = answerStrings(seed);
      answers.b_leading_coefficient = "not-a-number";
      const submissionData = makeEnvelope(activityId, mode, answers);
      const { POST } =
        await import("@/app/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions/route");

      const response = await POST(makeRequest(submissionData, ` ${IDEMPOTENCY_KEY} `));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toStrictEqual(SERVER_RESULT);
      expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
      expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
        "internal.activities.createTopic14PolynomialDegreeLeadingCoefficientSubmission",
        {
          userId: LEARNER_ID,
          activityId,
          submissionData,
          idempotencyKey: IDEMPOTENCY_KEY,
        },
      );
      expect(JSON.stringify(submissionData)).toContain("not-a-number");
      expect(JSON.stringify(submissionData)).not.toMatch(
        /expectedAnswer|correctAnswer|gradingMetadata|solutionSteps|score|correctness/,
      );
      expect(internal).not.toHaveProperty("learningEvidence");
    },
  );

  it("passes through an auth response and rejects invalid claims before mutation", async () => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions/route");
    const submissionData = makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1));
    const authResponse = new Response("Forbidden", { status: 403 });

    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);
    await expect(POST(makeRequest(submissionData))).resolves.toBe(authResponse);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ role: "student" });
    await expect(POST(makeRequest(submissionData))).resolves.toHaveProperty("status", 401);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: LEARNER_ID, role: "teacher" });
    await expect(POST(makeRequest(submissionData))).resolves.toHaveProperty("status", 403);
    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error("private auth detail"));
    const errorResponse = await POST(makeRequest(submissionData));
    expect(errorResponse.status).toBe(500);
    await expect(errorResponse.text()).resolves.not.toContain("private auth detail");
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON before the polynomial mutation", async () => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions/route");
    const request = new Request(
      "http://localhost/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": IDEMPOTENCY_KEY,
        },
        body: "{",
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["missing key", makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1)), null],
    ["blank key", makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1)), "  "],
    [
      "extra outer field",
      { ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1)), score: 6 },
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
  ] as const)("rejects %s before the polynomial mutation", async (_label, body, key) => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions/route");

    const response = await POST(makeRequest(body, key));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    [
      "missing answer",
      (answers: RawAnswers): RawAnswers => {
        const { c_degree: _missing, ...remaining } = answers;
        return remaining;
      },
    ],
    ["extra answer", (answers: RawAnswers): RawAnswers => ({ ...answers, score: "6" })],
    ["non-string answer", (answers: RawAnswers): RawAnswers => ({ ...answers, a_degree: 4 })],
  ] as const)("rejects %s before the polynomial mutation", async (_label, makeAnswers) => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions/route");
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
        ANSWER_IDS.slice(0, 5).map((partId) => ({ partId, rawAnswer: answers[partId] })),
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
        { partId: "a_leading_coefficient", rawAnswer: answers.a_leading_coefficient },
        ...ANSWER_IDS.filter((partId) => partId !== "a_leading_coefficient").map((partId) => ({
          partId,
          rawAnswer: answers[partId],
        })),
      ],
    ],
    [
      "duplicate part",
      (answers: RawAnswers): RawParts => [
        { partId: "a_degree", rawAnswer: answers.a_degree },
        { partId: "a_degree", rawAnswer: answers.a_degree },
        ...ANSWER_IDS.slice(2).map((partId) => ({ partId, rawAnswer: answers[partId] })),
      ],
    ],
    [
      "mismatched raw part",
      (answers: RawAnswers): RawParts => [
        { partId: "a_degree", rawAnswer: answers.b_degree },
        ...ANSWER_IDS.slice(1).map((partId) => ({ partId, rawAnswer: answers[partId] })),
      ],
    ],
    ["non-array parts", (_answers: RawAnswers): RawParts => null],
  ] as const)("rejects %s before the polynomial mutation", async (_label, makeParts) => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions/route");
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
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions/route");
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
    ["score above maximum", { ...SERVER_RESULT, score: 7 }],
    ["invalid maximum", { ...SERVER_RESULT, maxScore: 5 }],
    ["zero ordinal", { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ["non-string feedback", { ...SERVER_RESULT, feedback: 1 }],
  ] as const)("returns safe 500 for %s", async (_label, result) => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions/route");
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
      await import("@/app/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient/submissions/route");
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error("private mutation detail"));

    const response = await POST(
      makeRequest(makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", answerStrings(1))),
    );

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain("private mutation detail");
  });
});
