import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireStudentRequestClaims = vi.fn();
const mockFetchInternalMutation = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  requireStudentRequestClaims: mockRequireStudentRequestClaims,
}));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    student: {
      completePhase: "student:completePhase",
    },
  },
}));

const STUDENT = {
  sub: "profiles:phase-completion-student",
  username: "phase-completion-student",
  role: "student",
};

const VALID_BODY = {
  lessonId: "module-3-lesson-2",
  phaseNumber: 2,
  timeSpent: 75,
  idempotencyKey: "phase-completion-key-1",
  linkedStandardId: "CCSS.MATH.HSF.IF.C.7",
};

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/phases/complete", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

async function post(request: Request) {
  const { POST } = await import("@/app/api/phases/complete/route");
  return POST(request);
}

describe("POST /api/phases/complete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockRequireStudentRequestClaims.mockResolvedValue(STUDENT);
    mockFetchInternalMutation.mockResolvedValue({
      success: true,
      nextPhaseUnlocked: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["an unauthenticated request", 401],
    ["a non-student request", 403],
  ])("requires student authentication for %s", async (_label, status) => {
    mockRequireStudentRequestClaims.mockResolvedValue(
      new Response(JSON.stringify({ error: "Denied" }), { status }),
    );

    const response = await post(makeRequest(VALID_BODY));

    expect(response.status).toBe(status);
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    ["a missing authenticated subject", { role: "student" }, 401, { error: "Unauthorized" }],
    [
      "a blank authenticated subject",
      { sub: "   ", role: "student" },
      401,
      { error: "Unauthorized" },
    ],
    ["a missing authenticated role", { sub: STUDENT.sub }, 401, { error: "Unauthorized" }],
    [
      "a non-student authenticated role",
      { sub: STUDENT.sub, role: "teacher" },
      403,
      { error: "Forbidden" },
    ],
  ])("rejects %s before Convex", async (_label, claims, status, body) => {
    mockRequireStudentRequestClaims.mockResolvedValue(claims);

    const response = await post(makeRequest(VALID_BODY));

    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toStrictEqual(body);
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it.each([
    [
      "a missing body key",
      {
        lessonId: VALID_BODY.lessonId,
        phaseNumber: VALID_BODY.phaseNumber,
        timeSpent: VALID_BODY.timeSpent,
      },
    ],
    ["an empty body key", { ...VALID_BODY, idempotencyKey: "" }],
  ])("rejects %s before Convex", async (_label, body) => {
    const response = await post(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it("uses the authenticated student identity instead of a client-supplied learner identity", async () => {
    const response = await post(
      makeRequest({
        ...VALID_BODY,
        userId: "profiles:forged",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockFetchInternalMutation).toHaveBeenCalledWith("student:completePhase", {
      userId: STUDENT.sub,
      ...VALID_BODY,
    });
  });

  it.each([
    ["a normal non-pilot completion", VALID_BODY],
    [
      "phase four outside the pilot lesson",
      {
        ...VALID_BODY,
        lessonId: "module-8-lesson-1",
        phaseNumber: 4,
      },
    ],
  ])("keeps the generic route for %s", async (_label, body) => {
    const response = await post(makeRequest(body));

    expect(response.status).toBe(200);
    expect(mockFetchInternalMutation).toHaveBeenCalledTimes(1);
    expect(mockFetchInternalMutation).toHaveBeenCalledWith("student:completePhase", {
      userId: STUDENT.sub,
      ...body,
    });
    expect(await response.json()).toStrictEqual({
      success: true,
      nextPhaseUnlocked: true,
    });
  });

  it("returns a safe public replay result", async () => {
    mockFetchInternalMutation.mockResolvedValueOnce({
      success: true,
      alreadyCompleted: true,
    });

    const response = await post(makeRequest(VALID_BODY));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual({
      success: true,
      alreadyCompleted: true,
    });
  });

  it.each(["idempotency_conflict", "phase_already_completed"])(
    "maps the exact %s conflict to a safe 409",
    async (sentinel) => {
      mockFetchInternalMutation.mockRejectedValueOnce(new Error(sentinel));

      const response = await post(makeRequest(VALID_BODY));

      expect(response.status).toBe(409);
      await expect(response.json()).resolves.toStrictEqual({ error: "Phase completion conflict" });
    },
  );

  it("does not expose an unexpected mutation error as a conflict", async () => {
    mockFetchInternalMutation.mockRejectedValueOnce(
      new Error("database error: idempotency_conflict while checking another record"),
    );

    const response = await post(makeRequest(VALID_BODY));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({ error: "Phase completion failed" });
  });

  it("projects only public completion result fields", async () => {
    mockFetchInternalMutation.mockResolvedValueOnce({
      success: true,
      nextPhaseUnlocked: true,
      internalDetail: "not public",
    });

    const response = await post(makeRequest(VALID_BODY));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual({
      success: true,
      nextPhaseUnlocked: true,
    });
  });

  it("maps a malformed mutation result to a safe failure", async () => {
    mockFetchInternalMutation.mockResolvedValueOnce({
      success: true,
      alreadyCompleted: true,
      nextPhaseUnlocked: true,
    });

    const response = await post(makeRequest(VALID_BODY));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toStrictEqual({ error: "Phase completion failed" });
  });
});
