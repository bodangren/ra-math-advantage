import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ claims: vi.fn(), mutate: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({ requireTeacherRequestClaims: mocks.claims }));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: mocks.mutate,
  internal: { selectedLearningEvidence: { submitTopic11TeacherSubmission: "selected-writer" } },
}));

import { POST } from "@/app/api/teacher/course/route";

const validResult = (delivery: "new" | "replay") => ({
  persisted: delivery === "new",
  masteryApplied: false,
  kstApplied: false,
  delivery,
  decision: {
    idempotency: delivery,
    exposureState: "introduced",
    eligible: false,
    reason: "teacher_led",
    masteryBearing: false,
  },
});
function request(body: unknown) {
  return new Request("http://local.test/api/teacher/course", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
const body = { action: "recordTopic11Exposure", classId: "class", studentId: "student", submissionId: "submission" };

describe("Topic 1.1 teacher exposure route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.claims.mockResolvedValue({ sub: "teacher" });
    mocks.mutate.mockResolvedValue(validResult("new"));
  });

  it("uses the session teacher and selected writer", async () => {
    const response = await POST(request(body));
    expect(response.status).toBe(200);
    expect(mocks.mutate).toHaveBeenCalledWith("selected-writer", {
      teacherId: "teacher", learnerId: "student", classId: "class", submissionId: "submission",
    });
    expect(await response.json()).toEqual({ delivery: "new" });
  });

  it("rejects other actions and client trust fields before mutation", async () => {
    for (const invalid of [{ action: "createClass", name: "Class" }, { ...body, trusted: true }]) {
      expect((await POST(request(invalid))).status).toBe(400);
    }
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it.each([
    {},
    { ...validResult("new"), masteryApplied: true },
    { ...validResult("new"), privateReason: "hidden" },
    { accepted: false, reason: "submission_not_found" },
  ])("rejects a malformed result without exposing it", async (result) => {
    mocks.mutate.mockResolvedValueOnce(result);
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Could not complete this action. Check the selected class, student, and lesson." });
  });

  it("returns the exact replay receipt", async () => {
    mocks.mutate.mockResolvedValueOnce(validResult("replay"));
    expect(await (await POST(request(body))).json()).toEqual({ delivery: "replay" });
  });
});
