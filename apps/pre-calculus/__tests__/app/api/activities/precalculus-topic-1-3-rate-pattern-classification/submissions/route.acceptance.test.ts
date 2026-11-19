import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateTopic13RatePatternClassificationOutput } from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
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
      createTopic13RatePatternClassificationSubmission:
        "internal.activities.createTopic13RatePatternClassificationSubmission",
    },
  },
}));

const GUIDED_ACTIVITY_ID = PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ACTIVITY_ID =
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID;
const LEARNER_ID = "profiles:precalc-topic-1-3-rate-pattern-student";
const IDEMPOTENCY_KEY = "precalc-topic-1-3-rate-pattern-key";
const SERVER_RESULT = {
  submissionId: "activity_submissions:topic-1-3-rate-pattern",
  score: 3,
  maxScore: 3,
  attemptOrdinal: 1,
  feedback: "3/3 rate-pattern classifications matched the server rubric.",
} as const;

type Mode = "guided_practice" | "independent_practice";
type CaseId = "a" | "b" | "c";

function expectedAnswers(seed: number): Record<CaseId, string> {
  return generateTopic13RatePatternClassificationOutput(seed).expectedAnswer as Record<
    CaseId,
    string
  >;
}

function makeEnvelope(
  activityId: string,
  mode: Mode,
  answers: Record<CaseId, unknown>,
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
    parts: (["a", "b", "c"] as const).map((partId) => ({
      partId,
      rawAnswer: answers[partId],
    })),
    ...overrides,
  };
}

function makeRequest(body: unknown, idempotencyKey: string | null = IDEMPOTENCY_KEY): Request {
  return new Request(
    "http://localhost/api/activities/precalculus-topic-1-3-rate-pattern-classification/submissions",
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

describe("POST /api/activities/precalculus-topic-1-3-rate-pattern-classification/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: "student" });
    mocks.fetchInternalMutation.mockResolvedValue(SERVER_RESULT);
  });

  it.each([
    ["Guided", GUIDED_ACTIVITY_ID, "guided_practice", 1],
    ["Independent", INDEPENDENT_ACTIVITY_ID, "independent_practice", 2],
  ] as const)(
    "forwards the exact generated %s envelope without adding authority",
    async (_label, activityId, mode, seed) => {
      const expected = expectedAnswers(seed);
      const answers = {
        a: expected.a,
        b: expected.b === "linear" ? "quadratic" : "linear",
        c: expected.c,
      };
      const submissionData = makeEnvelope(activityId, mode, answers);
      const { POST } =
        await import("@/app/api/activities/precalculus-topic-1-3-rate-pattern-classification/submissions/route");

      const response = await POST(makeRequest(submissionData, ` ${IDEMPOTENCY_KEY} `));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toStrictEqual(SERVER_RESULT);
      expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
      expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
        "internal.activities.createTopic13RatePatternClassificationSubmission",
        {
          userId: LEARNER_ID,
          activityId,
          submissionData,
          idempotencyKey: IDEMPOTENCY_KEY,
        },
      );
      expect(JSON.stringify(submissionData)).not.toMatch(
        /expectedAnswer|correctAnswer|gradingMetadata|solutionSteps|score|correctness/,
      );
      expect(internal).not.toHaveProperty("learningEvidence");
    },
  );

  it("passes through auth responses and rejects invalid claims before mutation", async () => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-3-rate-pattern-classification/submissions/route");
    const submissionData = makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1));

    const authResponse = new Response("Forbidden", { status: 403 });
    mocks.requireStudentRequestClaims.mockResolvedValueOnce(authResponse);
    await expect(POST(makeRequest(submissionData))).resolves.toBe(authResponse);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ sub: LEARNER_ID, role: "teacher" });
    await expect(POST(makeRequest(submissionData))).resolves.toHaveProperty("status", 403);
    mocks.requireStudentRequestClaims.mockResolvedValueOnce({ role: "student" });
    await expect(POST(makeRequest(submissionData))).resolves.toHaveProperty("status", 401);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["missing key", makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)), null],
    ["blank key", makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)), "  "],
    [
      "unknown activity",
      makeEnvelope(
        "math.precalc.skill.1.3.other.guided_practice",
        "guided_practice",
        expectedAnswers(1),
      ),
      IDEMPOTENCY_KEY,
    ],
    [
      "mismatched mode",
      makeEnvelope(GUIDED_ACTIVITY_ID, "independent_practice", expectedAnswers(2)),
      IDEMPOTENCY_KEY,
    ],
    [
      "extra learner field",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        userId: LEARNER_ID,
      },
      IDEMPOTENCY_KEY,
    ],
    [
      "extra score field",
      { ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)), score: 3 },
      IDEMPOTENCY_KEY,
    ],
    [
      "extra correctness field",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        isCorrect: true,
      },
      IDEMPOTENCY_KEY,
    ],
    [
      "extra answer field",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        answers: { ...expectedAnswers(1), score: 3 },
      },
      IDEMPOTENCY_KEY,
    ],
    [
      "extra part field",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        parts: [
          { partId: "a", rawAnswer: expectedAnswers(1).a, score: 1 },
          { partId: "b", rawAnswer: expectedAnswers(1).b },
          { partId: "c", rawAnswer: expectedAnswers(1).c },
        ],
      },
      IDEMPOTENCY_KEY,
    ],
    [
      "zero attempt",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        attemptNumber: 0,
      },
      IDEMPOTENCY_KEY,
    ],
    [
      "fractional attempt",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        attemptNumber: 1.5,
      },
      IDEMPOTENCY_KEY,
    ],
    [
      "invalid timestamp",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        submittedAt: "not-a-date",
      },
      IDEMPOTENCY_KEY,
    ],
  ] as const)("rejects %s before the rate-pattern mutation", async (_label, body, key) => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-3-rate-pattern-classification/submissions/route");

    const response = await POST(makeRequest(body, key));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    [
      "missing answers",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        answers: undefined,
      },
    ],
    [
      "blank a",
      makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", { ...expectedAnswers(1), a: " " }),
    ],
    [
      "uppercase b",
      makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", { ...expectedAnswers(1), b: "LINEAR" }),
    ],
    [
      "unknown c",
      makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", { ...expectedAnswers(1), c: "cubic" }),
    ],
    [
      "non-string answer",
      makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", { ...expectedAnswers(1), a: 1 }),
    ],
    [
      "missing part",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        parts: [
          { partId: "a", rawAnswer: expectedAnswers(1).a },
          { partId: "b", rawAnswer: expectedAnswers(1).b },
        ],
      },
    ],
    [
      "parts out of order",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        parts: [
          { partId: "b", rawAnswer: expectedAnswers(1).b },
          { partId: "a", rawAnswer: expectedAnswers(1).a },
          { partId: "c", rawAnswer: expectedAnswers(1).c },
        ],
      },
    ],
    [
      "duplicate part",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        parts: [
          { partId: "a", rawAnswer: expectedAnswers(1).a },
          { partId: "a", rawAnswer: expectedAnswers(1).a },
          { partId: "c", rawAnswer: expectedAnswers(1).c },
        ],
      },
    ],
    [
      "unknown part",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        parts: [
          { partId: "a", rawAnswer: expectedAnswers(1).a },
          { partId: "x", rawAnswer: expectedAnswers(1).b },
          { partId: "c", rawAnswer: expectedAnswers(1).c },
        ],
      },
    ],
    [
      "mismatched raw part",
      {
        ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)),
        parts: [
          { partId: "a", rawAnswer: expectedAnswers(1).b },
          { partId: "b", rawAnswer: expectedAnswers(1).b },
          { partId: "c", rawAnswer: expectedAnswers(1).c },
        ],
      },
    ],
    [
      "non-array parts",
      { ...makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1)), parts: null },
    ],
  ] as const)("rejects %s at the raw classification boundary", async (_label, body) => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-3-rate-pattern-classification/submissions/route");

    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON before the rate-pattern mutation", async () => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-3-rate-pattern-classification/submissions/route");
    const request = new Request(
      "http://localhost/api/activities/precalculus-topic-1-3-rate-pattern-classification/submissions",
      {
        method: "POST",
        headers: { "content-type": "application/json", "Idempotency-Key": IDEMPOTENCY_KEY },
        body: "{",
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });

  it("returns 409 only for the exact idempotency conflict sentinel", async () => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-3-rate-pattern-classification/submissions/route");
    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error("idempotency_conflict"));

    const response = await POST(
      makeRequest(
        makeEnvelope(INDEPENDENT_ACTIVITY_ID, "independent_practice", expectedAnswers(2)),
      ),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toStrictEqual({
      error: "Idempotency key was already used for a different submission",
    });
  });

  it.each([
    ["extra result field", { ...SERVER_RESULT, internal: "hidden" }],
    ["blank submission ID", { ...SERVER_RESULT, submissionId: " " }],
    ["negative score", { ...SERVER_RESULT, score: -1 }],
    ["fractional score", { ...SERVER_RESULT, score: 1.5 }],
    ["score above maximum", { ...SERVER_RESULT, score: 4 }],
    ["invalid maximum", { ...SERVER_RESULT, maxScore: 2 }],
    ["zero ordinal", { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ["fractional ordinal", { ...SERVER_RESULT, attemptOrdinal: 1.5 }],
    ["non-string feedback", { ...SERVER_RESULT, feedback: 1 }],
  ] as const)("returns a safe 500 for %s", async (_label, serverResult) => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-3-rate-pattern-classification/submissions/route");
    mocks.fetchInternalMutation.mockResolvedValueOnce(serverResult);

    const response = await POST(
      makeRequest(makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1))),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({
      error: "Unable to create Topic 1.3 rate-pattern classification practice submission",
    });
  });

  it("returns safe 500 responses for auth and non-conflict mutation errors", async () => {
    const { POST } =
      await import("@/app/api/activities/precalculus-topic-1-3-rate-pattern-classification/submissions/route");
    const submissionData = makeEnvelope(GUIDED_ACTIVITY_ID, "guided_practice", expectedAnswers(1));

    mocks.requireStudentRequestClaims.mockRejectedValueOnce(new Error("secret auth detail"));
    const authError = await POST(makeRequest(submissionData));
    expect(authError.status).toBe(500);
    await expect(authError.text()).resolves.not.toContain("secret auth detail");

    mocks.fetchInternalMutation.mockRejectedValueOnce(new Error("secret backend detail"));
    const mutationError = await POST(makeRequest(submissionData));
    expect(mutationError.status).toBe(500);
    await expect(mutationError.text()).resolves.not.toContain("secret backend detail");
  });
});
