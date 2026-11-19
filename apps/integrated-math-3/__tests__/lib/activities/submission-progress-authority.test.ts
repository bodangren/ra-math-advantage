import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGenerator } from "@math-platform/math-content/knowledge-space";
import { submitIm3PilotActivity } from "@/lib/activities/submission";
import { practiceSubmissionEnvelopeSchema } from "@math-platform/practice-core/contract";

global.fetch = vi.fn() as unknown as typeof fetch;

const SERVER_SUBMISSION_ID = "server-owned-im3-submission";
const PILOT_CREATE_KEY = "im3-pilot-create-key";
const PILOT_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: "math.im3.skill.1.1.graph-quadratic-functions",
  seed: 0,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;

const ADVANCEMENT_RESULT = {
  persisted: true,
  masteryApplied: true,
  kstApplied: true,
  delivery: "new",
  decision: {
    idempotency: "new",
    exposureState: "introduced",
    eligible: true,
    reason: "eligible",
    masteryBearing: true,
  },
} as const;

const PILOT_ENVELOPE = practiceSubmissionEnvelopeSchema.parse({
  contractVersion: "practice.v1",
  activityId: "activities:im3-pilot-activity-document",
  mode: "independent_practice",
  status: "submitted",
  attemptNumber: 7,
  submittedAt: "2026-08-20T10:00:00.000Z",
  answers: {
    table_values: PILOT_POINTS,
    placed_points: PILOT_POINTS,
  },
  parts: [
    { partId: "table_values", rawAnswer: PILOT_POINTS },
    { partId: "placed_points", rawAnswer: PILOT_POINTS },
  ],
  timing: {
    startedAt: "2026-08-20T09:58:00.000Z",
    submittedAt: "2026-08-20T10:00:00.000Z",
    wallClockMs: 120000,
    activeMs: 110000,
    idleMs: 10000,
    pauseCount: 0,
    focusLossCount: 0,
    visibilityHiddenCount: 0,
    confidence: "high",
  },
});

function makeResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response;
}

describe("submitIm3PilotActivity progression authority", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ["empty response", {}],
    ["null response", null],
    ["missing decision", { persisted: true, masteryApplied: true, kstApplied: true }],
    ["missing SRS application", { ...ADVANCEMENT_RESULT, masteryApplied: false }],
    [
      "ineligible receipt",
      { ...ADVANCEMENT_RESULT, decision: { ...ADVANCEMENT_RESULT.decision, eligible: false } },
    ],
  ])("rejects an HTTP success with %s", async (_label, receipt) => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(receipt));
    const result = await submitIm3PilotActivity({
      submissionId: SERVER_SUBMISSION_ID,
      knownScore: 2,
      knownMaxScore: 2,
    });
    expect(result).toEqual({
      success: false,
      error: "Submission progression was rejected",
      submissionId: SERVER_SUBMISSION_ID,
      score: 2,
      maxScore: 2,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("sends raw pilot answers to create, then sends only its opaque ID to dedicated evidence delivery", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch
      .mockResolvedValueOnce(
        makeResponse({
          submissionId: SERVER_SUBMISSION_ID,
          score: 0,
          maxScore: 2,
        }),
      )
      .mockResolvedValueOnce(makeResponse(ADVANCEMENT_RESULT));

    const result = await submitIm3PilotActivity({
      ...PILOT_ENVELOPE,
      idempotencyKey: PILOT_CREATE_KEY,
      artifact: { clientGraph: "raw visual state" },
    });

    expect(result).toEqual({
      success: true,
      submissionId: SERVER_SUBMISSION_ID,
      score: 0,
      maxScore: 2,
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);

    const [createUrl, createOptions] = mockFetch.mock.calls[0] ?? [];
    expect(createUrl).toBe("/api/activities/submissions");
    expect(createOptions).toMatchObject({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": PILOT_CREATE_KEY,
      },
    });
    const createBody = JSON.parse(String(createOptions?.body));
    expect(practiceSubmissionEnvelopeSchema.safeParse(createBody).success).toBe(true);
    expect(createBody).toMatchObject({
      ...PILOT_ENVELOPE,
      artifact: { clientGraph: "raw visual state" },
    });

    const [progressUrl, progressOptions] = mockFetch.mock.calls[1] ?? [];
    expect(progressUrl).toBe("/api/learning-evidence/im3-pilot");
    expect(progressOptions).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const progressBody = JSON.parse(String(progressOptions?.body));
    expect(progressBody).toEqual({ submissionId: SERVER_SUBMISSION_ID });
    expect(progressBody).not.toHaveProperty("answers");
    expect(progressBody).not.toHaveProperty("parts");
    expect(progressBody).not.toHaveProperty("tableValues");
    expect(progressBody).not.toHaveProperty("placedPoints");
    expect(progressBody).not.toHaveProperty("score");
    expect(progressBody).not.toHaveProperty("maxScore");
    expect(progressBody).not.toHaveProperty("isCorrect");
  });

  it("posts the caller-owned pilot envelope unchanged before opaque-ID delivery", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch
      .mockResolvedValueOnce(
        makeResponse({
          submissionId: SERVER_SUBMISSION_ID,
          score: 0,
          maxScore: 2,
        }),
      )
      .mockResolvedValueOnce(makeResponse(ADVANCEMENT_RESULT));

    await submitIm3PilotActivity({ ...PILOT_ENVELOPE, idempotencyKey: PILOT_CREATE_KEY });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(mockFetch.mock.calls[0]?.[1]?.body))).toEqual(PILOT_ENVELOPE);
    expect(JSON.parse(String(mockFetch.mock.calls[1]?.[1]?.body))).toEqual({
      submissionId: SERVER_SUBMISSION_ID,
    });
  });

  it("does not call dedicated opaque delivery when server-owned creation fails", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeResponse({ error: "Invalid submission" }, false));

    const result = await submitIm3PilotActivity({
      ...PILOT_ENVELOPE,
      idempotencyKey: PILOT_CREATE_KEY,
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid submission",
      idempotencyKey: PILOT_CREATE_KEY,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]?.[0]).toBe("/api/activities/submissions");
  });

  it.each([
    ["a missing submission ID", { score: 0, maxScore: 2 }],
    ["a blank submission ID", { submissionId: "", score: 0, maxScore: 2 }],
  ])("fails safely when successful creation has %s", async (_label, createResult) => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeResponse(createResult));

    const result = await submitIm3PilotActivity({
      ...PILOT_ENVELOPE,
      idempotencyKey: PILOT_CREATE_KEY,
    });

    expect(result).toEqual({
      success: false,
      error: "Submission creation did not return a server-owned submission ID",
      idempotencyKey: PILOT_CREATE_KEY,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]?.[0]).toBe("/api/activities/submissions");
    expect(mockFetch.mock.calls.map(([url]) => url)).not.toContain(
      "/api/learning-evidence/im3-pilot",
    );
  });

  it("returns opaque retry data after a dedicated evidence delivery error without resending client answers", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch
      .mockResolvedValueOnce(
        makeResponse({
          submissionId: SERVER_SUBMISSION_ID,
          score: 1,
          maxScore: 2,
        }),
      )
      .mockResolvedValueOnce(makeResponse({ error: "Evidence delivery failed" }, false));

    const result = await submitIm3PilotActivity({
      ...PILOT_ENVELOPE,
      idempotencyKey: PILOT_CREATE_KEY,
    });

    expect(result).toEqual({
      success: false,
      error: "Evidence delivery failed",
      submissionId: SERVER_SUBMISSION_ID,
      score: 1,
      maxScore: 2,
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1]?.[0]).toBe("/api/learning-evidence/im3-pilot");
    expect(JSON.parse(String(mockFetch.mock.calls[1]?.[1]?.body))).toEqual({
      submissionId: SERVER_SUBMISSION_ID,
    });
    const failedProgressBody = JSON.parse(String(mockFetch.mock.calls[1]?.[1]?.body));
    expect(failedProgressBody).not.toHaveProperty("tableValues");
    expect(failedProgressBody).not.toHaveProperty("placedPoints");
    expect(failedProgressBody).not.toHaveProperty("answers");
    expect(failedProgressBody).not.toHaveProperty("parts");
    expect(failedProgressBody).not.toHaveProperty("score");
    expect(failedProgressBody).not.toHaveProperty("maxScore");
    expect(failedProgressBody).not.toHaveProperty("isCorrect");
  });

  it.each(["new", "replay"] as const)(
    "retries only the cached opaque pilot submission with %s delivery",
    async (delivery) => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce(makeResponse({ ...ADVANCEMENT_RESULT, delivery }));

      const result = await submitIm3PilotActivity({
        submissionId: SERVER_SUBMISSION_ID,
        knownScore: 1,
        knownMaxScore: 2,
        idempotencyKey: PILOT_CREATE_KEY,
      });

      expect(result).toEqual({
        success: true,
        submissionId: SERVER_SUBMISSION_ID,
        score: 1,
        maxScore: 2,
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0]?.[0]).toBe("/api/learning-evidence/im3-pilot");
      const retryBody = JSON.parse(String(mockFetch.mock.calls[0]?.[1]?.body));
      expect(retryBody).toEqual({ submissionId: SERVER_SUBMISSION_ID });
      expect(JSON.stringify(retryBody)).not.toContain("tableValues");
      expect(JSON.stringify(retryBody)).not.toContain("placedPoints");
      expect(JSON.stringify(retryBody)).not.toContain("answers");
      expect(JSON.stringify(retryBody)).not.toContain("parts");
      expect(JSON.stringify(retryBody)).not.toContain("score");
      expect(JSON.stringify(retryBody)).not.toContain("maxScore");
      expect(JSON.stringify(retryBody)).not.toContain("isCorrect");
    },
  );

  it("returns a network error without starting a second request", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await submitIm3PilotActivity({
      ...PILOT_ENVELOPE,
      idempotencyKey: PILOT_CREATE_KEY,
    });

    expect(result).toEqual({
      success: false,
      error: "Network error",
      idempotencyKey: PILOT_CREATE_KEY,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]?.[0]).toBe("/api/activities/submissions");
  });

  it("returns a retry key when the create response is lost and reuses it on recovery", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error("Connection reset after create"));

    const first = await submitIm3PilotActivity({
      ...PILOT_ENVELOPE,
      idempotencyKey: PILOT_CREATE_KEY,
    });

    expect(first).toEqual({
      success: false,
      error: "Connection reset after create",
      idempotencyKey: PILOT_CREATE_KEY,
    });

    mockFetch
      .mockResolvedValueOnce(
        makeResponse({
          submissionId: SERVER_SUBMISSION_ID,
          score: 2,
          maxScore: 2,
        }),
      )
      .mockResolvedValueOnce(makeResponse(ADVANCEMENT_RESULT));

    const recovered = await submitIm3PilotActivity({
      ...PILOT_ENVELOPE,
      idempotencyKey: first.idempotencyKey,
    });

    expect(recovered).toEqual({
      success: true,
      submissionId: SERVER_SUBMISSION_ID,
      score: 2,
      maxScore: 2,
    });
    expect(mockFetch.mock.calls[1]?.[1]).toMatchObject({
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": PILOT_CREATE_KEY,
      },
    });
    expect(mockFetch.mock.calls[2]?.[0]).toBe("/api/learning-evidence/im3-pilot");
  });

  it("treats an accepted HTTP response with a rejected pilot progression result as failure", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeResponse({
        accepted: false,
        reason: "attempt_ordinal_conflict",
        latestAttemptOrdinal: 8,
        receivedAttemptOrdinal: 2,
      }),
    );

    const result = await submitIm3PilotActivity({
      submissionId: SERVER_SUBMISSION_ID,
      knownScore: 0,
      knownMaxScore: 2,
      idempotencyKey: PILOT_CREATE_KEY,
    });

    expect(result).toEqual({
      success: false,
      error: "Submission progression was rejected",
      submissionId: SERVER_SUBMISSION_ID,
      score: 0,
      maxScore: 2,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]?.[0]).toBe("/api/learning-evidence/im3-pilot");
  });

  it("rejects a shaped non-persisted node_not_enabled receipt from dedicated pilot delivery", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeResponse({
        persisted: false,
        masteryApplied: false,
        kstApplied: false,
        delivery: "new",
        decision: {
          idempotency: "new",
          exposureState: "introduced",
          eligible: false,
          reason: "node_not_enabled",
          masteryBearing: false,
        },
      }),
    );

    const result = await submitIm3PilotActivity({
      submissionId: SERVER_SUBMISSION_ID,
      knownScore: 0,
      knownMaxScore: 2,
      idempotencyKey: PILOT_CREATE_KEY,
    });

    expect(result).toEqual({
      success: false,
      error: "Submission progression was rejected",
      submissionId: SERVER_SUBMISSION_ID,
      score: 0,
      maxScore: 2,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]?.[0]).toBe("/api/learning-evidence/im3-pilot");
  });
});
