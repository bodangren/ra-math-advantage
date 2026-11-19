import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchInternalMutation: vi.fn(),
  requireActiveStudentRequestClaims: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  requireActiveStudentRequestClaims: mocks.requireActiveStudentRequestClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: mocks.fetchInternalMutation,
  internal: {
    learningEvidence: {
      submit: "internal.learningEvidence.submit",
    },
  },
}));

import { POST } from "@/app/api/learning-evidence/bm2-pilot/route";

const AUTHENTICATED_LEARNER_ID = "authenticated-bm2-learner";
const SUBMISSION_ID = "opaque-bm2-activity-submission-id";

const SAFE_TEACHER_LED_RESULT = {
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

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/learning-evidence/bm2-pilot", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("BM2 public learning-evidence submission authority", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireActiveStudentRequestClaims.mockResolvedValue({
      sub: AUTHENTICATED_LEARNER_ID,
      role: "student",
    });
  });

  it("accepts exactly one opaque submission ID and returns only the safe server result", async () => {
    mocks.fetchInternalMutation.mockResolvedValue(SAFE_TEACHER_LED_RESULT);

    const response = await POST(makeRequest({ submissionId: SUBMISSION_ID }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(SAFE_TEACHER_LED_RESULT);
    expect(JSON.stringify(body)).not.toContain("must-not-leave-the-server");
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith("internal.learningEvidence.submit", {
      learnerId: AUTHENTICATED_LEARNER_ID,
      submissionId: SUBMISSION_ID,
    });
    expect(mocks.fetchInternalMutation.mock.calls[0]?.[1]).not.toHaveProperty("evidence");
  });
});
