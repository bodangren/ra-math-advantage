import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireTeacher: vi.fn(),
  mutate: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  requireActiveTeacherRequestClaims: mocks.requireTeacher,
}));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: mocks.mutate,
  internal: { learningEvidence: { verifyTeacherExposure: "verifyTeacherExposure" } },
}));

import { POST } from "@/app/api/teacher/learning-evidence/bm2-pilot/route";

describe("BM2 teacher exposure route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireTeacher.mockResolvedValue({ sub: "profiles:teacher" });
    mocks.mutate.mockResolvedValue({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: "new",
      decision: { reason: "teacher_led" },
    });
  });

  it("uses the authenticated teacher and exact class, learner, and submission identities", async () => {
    const response = await POST(
      new Request("http://local.test", {
        method: "POST",
        body: JSON.stringify({
          learnerId: "profiles:student",
          submissionId: "activity_submissions:one",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.mutate).toHaveBeenCalledWith("verifyTeacherExposure", {
      teacherId: "profiles:teacher",
      learnerId: "profiles:student",
      submissionId: "activity_submissions:one",
    });
  });

  it("rejects extra client authority fields", async () => {
    const response = await POST(
      new Request("http://local.test", {
        method: "POST",
        body: JSON.stringify({
          learnerId: "profiles:student",
          submissionId: "activity_submissions:one",
          trustedTeacherExposure: true,
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("returns a stable error when durable verification fails", async () => {
    mocks.mutate.mockRejectedValueOnce(new Error("temporary backend failure"));
    const response = await POST(
      new Request("http://local.test", {
        method: "POST",
        body: JSON.stringify({
          learnerId: "profiles:student",
          submissionId: "activity_submissions:one",
        }),
      }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to verify teacher exposure" });
  });
});
