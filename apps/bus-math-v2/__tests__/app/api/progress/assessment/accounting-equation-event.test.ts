import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildPracticeSubmissionEnvelope } from "@/lib/practice/contract";
import { BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES } from "@/lib/practice/accounting-equation-event-activities";

const requireStudent = vi.fn();
const fetchMutation = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  requireActiveStudentRequestClaims: requireStudent,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: vi.fn(),
  fetchInternalMutation: fetchMutation,
  internal: {
    apiRateLimits: { checkAndIncrementApiRateLimit: "rate-limit" },
    activities: {
      createAccountingEquationEventSubmission: "event-submit",
      createServerOwnedSubmission: "generated-submit",
      getActivityById: "activity-get",
      submitAssessment: "assessment-submit",
    },
  },
}));

const { POST } = await import("../../../../../app/api/progress/assessment/route");

function request(body: unknown, key = "event-request-1") {
  return new Request("http://localhost/api/progress/assessment", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify(body),
  });
}

function workedAcknowledgement() {
  return buildPracticeSubmissionEnvelope({
    activityId: BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES[0].stableActivityId,
    mode: "worked_example",
    status: "submitted",
    answers: {},
    parts: [],
    artifact: { kind: "accounting-equation-event-acknowledgement" },
  });
}

describe("accounting equation event assessment route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireStudent.mockResolvedValue({ sub: "profiles:event-student", role: "student" });
    fetchMutation.mockImplementation(async (name: string) => {
      if (name === "rate-limit") return { allowed: true, windowExpiresAt: Date.now() + 60_000 };
      if (name === "event-submit") {
        return {
          submissionId: "activity_submissions:event-1",
          acknowledged: true,
          attemptOrdinal: 1,
        };
      }
      throw new Error(`Unexpected mutation: ${name}`);
    });
  });

  it("sends an empty Worked acknowledgement to the event writer before generic answer validation", async () => {
    const body = workedAcknowledgement();
    const response = await POST(request(body));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      submissionId: "activity_submissions:event-1",
      acknowledged: true,
      attemptOrdinal: 1,
    });
    expect(fetchMutation).toHaveBeenCalledWith("event-submit", {
      userId: "profiles:event-student",
      activityId: body.activityId,
      submissionData: expect.objectContaining({ answers: {}, parts: [] }),
      idempotencyKey: "event-request-1",
    });
  });

  it.each([
    ["isCorrect", true],
    ["score", 1],
    ["maxScore", 1],
    ["normalizedAnswer", "forged"],
    ["misconceptionTags", ["forged"]],
  ])("rejects the client grade field %s before the event writer", async (field, value) => {
    const body = workedAcknowledgement();
    body.parts = [{ partId: "forged", rawAnswer: "", [field]: value }];
    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(fetchMutation).not.toHaveBeenCalledWith("event-submit", expect.anything());
  });
});
