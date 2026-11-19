// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ guard: vi.fn(), mutate: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({ requireRequestSessionClaims: mocks.guard }));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalMutation: mocks.mutate,
  internal: { activities: { recordTeacherPerpendicularBisectorExposure: "record-exposure" } },
}));

import { POST } from "@/app/api/teacher/perpendicular-bisector-exposure/route";

function request(body: unknown, key = "teacher-retry") {
  return new Request("http://localhost/api/teacher/perpendicular-bisector-exposure", {
    method: "POST",
    headers: { "content-type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify(body),
  });
}

const validBody = { studentId: "student", classId: "class", submissionId: "source" };

beforeEach(() => {
  vi.resetAllMocks();
  mocks.guard.mockResolvedValue({ sub: "teacher-from-session", role: "teacher" });
  mocks.mutate.mockResolvedValue({ evidenceId: "evidence", replay: false });
});

describe("IM2 teacher exposure route", () => {
  it("rejects a non-teacher session before database work", async () => {
    mocks.guard.mockResolvedValue({ sub: "student", role: "student" });
    expect((await POST(request(validBody))).status).toBe(403);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("uses the teacher identifier from the session", async () => {
    expect((await POST(request(validBody))).status).toBe(200);
    expect(mocks.mutate).toHaveBeenCalledWith("record-exposure", {
      teacherId: "teacher-from-session",
      ...validBody,
      idempotencyKey: "teacher-retry",
    });
  });

  it.each([
    [null, "teacher-retry"],
    [{ ...validBody, studentId: 4 }, "teacher-retry"],
    [{ ...validBody, classId: null }, "teacher-retry"],
    [{ ...validBody, submissionId: {} }, "teacher-retry"],
    [{ ...validBody, studentId: "   " }, "teacher-retry"],
    [{ ...validBody, classId: "" }, "teacher-retry"],
    [{ ...validBody, submissionId: "  " }, "teacher-retry"],
    [{ ...validBody, teacherId: "forged" }, "teacher-retry"],
    [validBody, ""],
    [validBody, "x".repeat(81)],
  ])("rejects an invalid body or key before database work", async (body, key) => {
    expect((await POST(request(body, key))).status).toBe(400);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("returns conflict for a conflicting retry", async () => {
    mocks.mutate.mockRejectedValue(Error("idempotency_conflict: private detail"));
    const response = await POST(request(validBody));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "This teacher action conflicts with the saved action.",
    });
  });

  it("returns a controlled response for an authorization failure", async () => {
    mocks.mutate.mockRejectedValue(Error("unauthorized_exposure: private detail"));
    const response = await POST(request(validBody));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Teacher access is required." });
  });

  it("returns a controlled response for a known source failure", async () => {
    mocks.mutate.mockRejectedValue(Error("invalid_source_submission: private detail"));
    const response = await POST(request(validBody));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "This teacher action is not available." });
  });

  it("returns a controlled response for an unknown backend failure", async () => {
    mocks.mutate.mockRejectedValue(Error("private authorization detail"));
    const response = await POST(request(validBody));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Unable to record exposure. Try again." });
  });
});
