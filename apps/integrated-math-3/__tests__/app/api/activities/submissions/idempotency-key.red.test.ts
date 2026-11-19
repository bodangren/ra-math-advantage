import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchInternalMutation: vi.fn(),
  requireStudentRequestClaims: vi.fn(),
}));

import { getGenerator } from "@math-platform/math-content/knowledge-space";

vi.mock("@/lib/auth/server", () => ({
  requireStudentRequestClaims: mocks.requireStudentRequestClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: mocks.fetchInternalMutation,
  internal: {
    activities: {
      createServerOwnedSubmission: "internal.activities.createServerOwnedSubmission",
    },
  },
}));

const LEARNER_ID = "authenticated-im3-create-key-learner";
const PILOT_POINTS = getGenerator("quadratic-graph-analysis").generate({
  nodeId: "math.im3.skill.1.1.graph-quadratic-functions",
  seed: 0,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;

const ENVELOPE = {
  contractVersion: "practice.v1" as const,
  activityId: "activities:im3-create-key-pilot",
  mode: "independent_practice" as const,
  status: "submitted" as const,
  attemptNumber: 1,
  submittedAt: "2026-08-19T10:00:00.000Z",
  answers: {
    tableValues: PILOT_POINTS,
    placedPoints: PILOT_POINTS,
  },
  parts: [
    { partId: "table_values", rawAnswer: PILOT_POINTS },
    { partId: "placed_points", rawAnswer: PILOT_POINTS },
  ],
};

function makeRequest(idempotencyKey: string | null): Request {
  return new Request("http://localhost/api/activities/submissions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(idempotencyKey === null ? {} : { "Idempotency-Key": idempotencyKey }),
    },
    body: JSON.stringify(ENVELOPE),
  });
}

async function loadPost(): Promise<(request: Request) => Promise<Response>> {
  const route = await vi.importActual<Record<string, unknown>>(
    "@/app/api/activities/submissions/route",
  );
  if (typeof route.POST !== "function") {
    throw new Error("IM3 create route must export POST.");
  }
  return route.POST as (request: Request) => Promise<Response>;
}

describe("IM3 public create idempotency authority", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({ sub: LEARNER_ID, role: "student" });
    mocks.fetchInternalMutation.mockResolvedValue({
      submissionId: "activity_submissions:im3-create-key",
      score: 2,
      maxScore: 2,
    });
  });

  it.each([
    ["absent", null],
    ["blank", "   "],
  ])("rejects an %s Idempotency-Key before it calls Convex", async (_label, key) => {
    const POST = await loadPost();

    const response = await POST(makeRequest(key));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: expect.stringMatching(/idempotency/i),
    });
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });
});
