import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), mutate: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({
  requireStudentRequestClaims: mocks.auth,
}));
vi.mock("@/lib/convex/server", () => ({
  internal: { activities: { createServerOwnedSubmission: "selected-writer" } },
  fetchInternalMutation: mocks.mutate,
}));
import { POST } from "@/app/api/activities/submissions/route";
const points = [
  { x: -2, y: -5 },
  { x: -1, y: -2 },
  { x: 0, y: -1 },
  { x: 1, y: -2 },
  { x: 2, y: -5 },
];
function request(body: unknown, key = "route-key") {
  return new Request("http://local/api/activities/submissions", {
    method: "POST",
    headers: { "content-type": "application/json", "Idempotency-Key": key },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
function envelope(overrides: Record<string, unknown> = {}) {
  return {
    contractVersion: "practice.v1",
    activityId: "activities:selected",
    mode: "independent_practice",
    status: "submitted",
    attemptNumber: 1,
    submittedAt: "2026-09-07T00:00:00.000Z",
    answers: { table_values: points, placed_points: points },
    parts: [
      { partId: "table_values", rawAnswer: points },
      { partId: "placed_points", rawAnswer: points },
    ],
    ...overrides,
  };
}
beforeEach(() => {
  mocks.auth
    .mockReset()
    .mockResolvedValue({ sub: "profiles:student", role: "student" });
  mocks.mutate.mockReset().mockResolvedValue({
    submissionId: "activity_submissions:physical",
    score: 2,
    maxScore: 2,
  });
});
describe("selected quadratic submission route", () => {
  it("uses authenticated student identity and returns the physical submission ID", async () => {
    const response = await POST(request(envelope()));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      submissionId: "activity_submissions:physical",
      score: 2,
      maxScore: 2,
    });
    expect(mocks.mutate).toHaveBeenCalledWith(
      "selected-writer",
      expect.objectContaining({
        userId: "profiles:student",
        activityId: "activities:selected",
        idempotencyKey: "route-key",
      }),
    );
  });
  it("returns the authentication rejection without mutation", async () => {
    mocks.auth.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
    const response = await POST(request(envelope()));
    expect(response.status).toBe(401);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it.each([
    ["malformed body", "{"],
    ["wrong mode", envelope({ mode: "worked_example" })],
    [
      "client grades",
      envelope({
        parts: [
          { partId: "table_values", rawAnswer: points, score: 2 },
          { partId: "placed_points", rawAnswer: points },
        ],
      }),
    ],
  ])("rejects %s before mutation", async (_name, body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it("rejects an overlong key before mutation", async () => {
    const response = await POST(request(envelope(), "k".repeat(81)));
    expect(response.status).toBe(400);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it("maps a wrapped idempotency conflict to 409", async () => {
    mocks.mutate.mockRejectedValue(
      new Error("ConvexError: idempotency_conflict"),
    );
    const response = await POST(request(envelope()));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "Idempotency key was already used for a different submission",
    });
  });
  it("keeps an unknown backend error private and returns 503", async () => {
    mocks.mutate.mockRejectedValue(new Error("secret database detail"));
    const response = await POST(request(envelope()));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toEqual({
      error: "Failed to create activity submission",
    });
    expect(JSON.stringify(body).includes("secret")).toBe(false);
  });
});
