import { beforeEach, describe, expect, it, vi } from "vitest";

const ROUTE_MODULE = "../../../../../app/api/learning-evidence/im3-pilot/route";

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
    learningEvidence: {
      submit: "internal.learningEvidence.submit",
    },
  },
}));

const SERVER_LEARNER_ID = "authenticated-im3-learner";
const CLIENT_LEARNER_ID = "client-supplied-im3-learner";
const SERVER_SUBMISSION_ID = "server-owned-im3-submission";

const APPLIED_RESULT = {
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

const REPLAY_RESULT = { ...APPLIED_RESULT, delivery: "replay" } as const;

const SUBMISSION_NOT_FOUND = {
  accepted: false,
  reason: "submission_not_found",
} as const;

type PilotPost = (request: Request) => Promise<Response>;

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/learning-evidence/im3-pilot", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function getPilotPost(): Promise<PilotPost> {
  let routeModule: Record<string, unknown>;

  try {
    routeModule = await vi.importActual<Record<string, unknown>>(ROUTE_MODULE);
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : "";
    throw new Error(
      "Missing IM3 dedicated pilot learning-evidence route. " +
        "Add apps/integrated-math-3/app/api/learning-evidence/im3-pilot/route.ts " +
        `with POST(request).${detail}`,
    );
  }

  const post = routeModule.POST;
  if (typeof post !== "function") {
    throw new Error(
      "IM3 dedicated pilot learning-evidence route must export POST(request).",
    );
  }

  return post as PilotPost;
}

describe("POST /api/learning-evidence/im3-pilot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({
      sub: SERVER_LEARNER_ID,
      username: "alice",
      role: "student",
    });
    mocks.fetchInternalMutation.mockResolvedValue(APPLIED_RESULT);
  });

  it("uses the authenticated learner and opaque server-owned submission ID only", async () => {
    const post = await getPilotPost();
    const response = await post(
      makeRequest({ submissionId: SERVER_SUBMISSION_ID }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(APPLIED_RESULT);
    expect(mocks.requireStudentRequestClaims).toHaveBeenCalledTimes(1);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      "internal.learningEvidence.submit",
      { learnerId: SERVER_LEARNER_ID, submissionId: SERVER_SUBMISSION_ID },
    );
    expect(mocks.fetchInternalMutation.mock.calls[0]?.[1]).not.toHaveProperty(
      "score",
    );
    expect(mocks.fetchInternalMutation.mock.calls[0]?.[1]).not.toHaveProperty(
      "evidence",
    );
    expect(mocks.fetchInternalMutation.mock.calls[0]?.[1]).not.toHaveProperty(
      "submissionData",
    );
  });

  it.each([
    [
      "learnerId",
      { learnerId: CLIENT_LEARNER_ID, submissionId: SERVER_SUBMISSION_ID },
    ],
    ["score", { submissionId: SERVER_SUBMISSION_ID, score: 6 }],
    ["isCorrect", { submissionId: SERVER_SUBMISSION_ID, isCorrect: true }],
    [
      "gradedEvidence",
      {
        submissionId: SERVER_SUBMISSION_ID,
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      },
    ],
    [
      "submissionData",
      {
        submissionId: SERVER_SUBMISSION_ID,
        submissionData: {
          answers: { vertex_x: 999 },
          parts: [
            { partId: "vertex_x", isCorrect: true, score: 2, maxScore: 2 },
          ],
        },
      },
    ],
    ["extra", { submissionId: SERVER_SUBMISSION_ID, extra: "not accepted" }],
  ])(
    "rejects client-supplied %s before the server transaction",
    async (field, body) => {
      const post = await getPilotPost();
      const response = await post(makeRequest(body));

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual(
        expect.objectContaining({
          error: expect.stringContaining(field),
        }),
      );
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
    },
  );

  it.each([
    [{}, "submissionId is required"],
    [{ submissionId: "" }, "submissionId must be a non-empty string"],
    [{ submissionId: 42 }, "submissionId must be a non-empty string"],
  ])(
    "rejects a request without a valid opaque submission ID",
    async (body, error) => {
      const post = await getPilotPost();
      const response = await post(makeRequest(body));

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error });
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["an unknown submission", "unknown-im3-submission"],
    ["a submission owned by another learner", "other-learner-im3-submission"],
  ])("does not disclose %s", async (_label, submissionId) => {
    mocks.fetchInternalMutation.mockResolvedValueOnce(SUBMISSION_NOT_FOUND);
    const post = await getPilotPost();

    const response = await post(makeRequest({ submissionId }));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Submission not found",
    });
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      "internal.learningEvidence.submit",
      { learnerId: SERVER_LEARNER_ID, submissionId },
    );
  });

  it("projects only the safe server-authoritative pilot result", async () => {
    mocks.fetchInternalMutation.mockResolvedValueOnce({
      ...APPLIED_RESULT,
      internalDetail: "server-only-detail",
    });
    const post = await getPilotPost();

    const response = await post(
      makeRequest({ submissionId: SERVER_SUBMISSION_ID }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual(APPLIED_RESULT);
    expect(JSON.stringify(payload)).not.toContain("server-only-detail");
  });

  it("returns the durable replay result for the same opaque submission ID", async () => {
    mocks.fetchInternalMutation
      .mockResolvedValueOnce(APPLIED_RESULT)
      .mockResolvedValueOnce(REPLAY_RESULT);
    const post = await getPilotPost();

    const first = await post(
      makeRequest({ submissionId: SERVER_SUBMISSION_ID }),
    );
    const replay = await post(
      makeRequest({ submissionId: SERVER_SUBMISSION_ID }),
    );

    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual(APPLIED_RESULT);
    expect(replay.status).toBe(200);
    await expect(replay.json()).resolves.toEqual(REPLAY_RESULT);
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      1,
      "internal.learningEvidence.submit",
      { learnerId: SERVER_LEARNER_ID, submissionId: SERVER_SUBMISSION_ID },
    );
    expect(mocks.fetchInternalMutation).toHaveBeenNthCalledWith(
      2,
      "internal.learningEvidence.submit",
      { learnerId: SERVER_LEARNER_ID, submissionId: SERVER_SUBMISSION_ID },
    );
  });

  it("maps a complete stored attempt ordinal conflict to a safe HTTP 409 response", async () => {
    mocks.fetchInternalMutation.mockResolvedValueOnce({
      accepted: false,
      reason: "attempt_ordinal_conflict",
      latestAttemptOrdinal: 8,
      receivedAttemptOrdinal: 2,
    });
    const post = await getPilotPost();

    const response = await post(
      makeRequest({ submissionId: SERVER_SUBMISSION_ID }),
    );

    expect(response.status).toBe(409);
    const payload = (await response.json()) as Record<string, unknown>;
    expect(Object.keys(payload)).toEqual(["error"]);
    expect(payload.error).toEqual(expect.any(String));
    expect(JSON.stringify(payload)).not.toContain("attempt_ordinal_conflict");
    expect(JSON.stringify(payload)).not.toContain("8");
  });

  it("fails safely when an attempt ordinal conflict result is malformed", async () => {
    mocks.fetchInternalMutation.mockResolvedValueOnce({
      accepted: false,
      reason: "attempt_ordinal_conflict",
    });
    const post = await getPilotPost();

    const response = await post(
      makeRequest({ submissionId: SERVER_SUBMISSION_ID }),
    );

    expect(response.status).toBe(500);
    const payload = (await response.json()) as Record<string, unknown>;
    expect(Object.keys(payload)).toEqual(["error"]);
    expect(payload.error).toEqual(expect.any(String));
    expect(JSON.stringify(payload)).not.toContain("attempt_ordinal_conflict");
  });

  it.each([
    ["a primitive internal result", 42],
    [
      "an incomplete internal result",
      {
        persisted: true,
        masteryApplied: true,
        delivery: "new",
        decision: {
          idempotency: "new",
          exposureState: "introduced",
          eligible: true,
          reason: "eligible",
          masteryBearing: true,
        },
      },
    ],
  ])("fails safely for %s", async (_label, result) => {
    mocks.fetchInternalMutation.mockResolvedValueOnce(result);
    const post = await getPilotPost();

    const response = await post(
      makeRequest({ submissionId: SERVER_SUBMISSION_ID }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to submit activity",
    });
  });

  it("returns the authentication response without calling the transaction", async () => {
    mocks.requireStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );
    const post = await getPilotPost();

    const response = await post(
      makeRequest({ submissionId: SERVER_SUBMISSION_ID }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });
});
