// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ guard: vi.fn(), mutate: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({
  requireRequestSessionClaims: mocks.guard,
}));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: mocks.mutate,
  internal: { activities: { submitBoundedPractice: "submit-bounded" } },
}));

import { POST } from "@/app/api/activities/[activityId]/submissions/route";

function request(body: unknown, key = "retry-key") {
  return new Request("http://localhost/api/activities/forged/submissions", {
    method: "POST",
    headers: { "content-type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify(body),
  });
}

const context = { params: Promise.resolve({ activityId: "activity-1" }) };
const validBody = { rawResponse: "4", hintsUsed: 0, revealStepsSeen: 0 };

beforeEach(() => {
  vi.resetAllMocks();
  mocks.guard.mockResolvedValue({
    sub: "student-from-session",
    role: "student",
  });
  mocks.mutate.mockResolvedValue({ kind: "graded", score: 1 });
});

describe("IM2 activity submission route", () => {
  it("rejects a non-student session before database work", async () => {
    mocks.guard.mockResolvedValue({ sub: "teacher", role: "teacher" });
    expect((await POST(request(validBody), context)).status).toBe(403);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("uses the session student and route activity identifiers", async () => {
    expect((await POST(request(validBody), context)).status).toBe(200);
    expect(mocks.mutate).toHaveBeenCalledWith("submit-bounded", {
      userId: "student-from-session",
      activityId: "activity-1",
      idempotencyKey: "retry-key",
      ...validBody,
    });
  });

  it.each([
    [{ ...validBody, userId: "forged-student" }, "retry-key"],
    [{ ...validBody, extra: true }, "retry-key"],
    [{ ...validBody, hintsUsed: -1 }, "retry-key"],
    [{ ...validBody, rawResponse: "x".repeat(129) }, "retry-key"],
    [validBody, ""],
    [validBody, "x".repeat(81)],
  ])("rejects an invalid body or key before database work", async (body, key) => {
    expect((await POST(request(body, key), context)).status).toBe(400);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("routes a strict triangle prefix to the bounded mutation", async () => {
    const body = {
      answers: { measure_order: "choice-1" },
      hintsUsed: 0,
      revealStepsSeen: 0,
    };
    expect((await POST(request(body), context)).status).toBe(200);
    expect(mocks.mutate).toHaveBeenCalledWith(
      "submit-bounded",
      expect.objectContaining({ answers: body.answers }),
    );
  });

  it("routes an empty Worked acknowledgement body to the bounded mutation", async () => {
    const body = { answers: {}, hintsUsed: 0, revealStepsSeen: 0 };
    expect((await POST(request(body), context)).status).toBe(200);
    expect(mocks.mutate).toHaveBeenCalledWith(
      "submit-bounded",
      expect.objectContaining({ answers: {} }),
    );
  });

  it("returns conflict for a conflicting retry", async () => {
    mocks.mutate.mockRejectedValue(Error("idempotency_conflict"));
    const response = await POST(request(validBody), context);
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "This attempt conflicts with the saved response.",
    });
  });

  it("returns a controlled response for a backend failure", async () => {
    mocks.mutate.mockRejectedValue(Error("private database detail"));
    const response = await POST(request(validBody), context);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Could not save your work. Try again.",
    });
  });

  it.each([
    ["inactive_student", 403, "Student access is required."],
    ["unpublished_curriculum", 400, "This activity is not available."],
    ["unsupported_activity", 400, "This activity is not available."],
  ])(
    "maps the known %s failure without backend details",
    async (failure, status, publicMessage) => {
      mocks.mutate.mockRejectedValue(Error(`${failure}: private detail`));
      const response = await POST(request(validBody), context);
      expect(response.status).toBe(status);
      expect(await response.json()).toEqual({ error: publicMessage });
    },
  );
});
