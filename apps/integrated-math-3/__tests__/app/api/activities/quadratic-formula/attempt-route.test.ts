import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  query: vi.fn(),
  mutate: vi.fn(),
}));
vi.mock("@/lib/auth/server", () => ({
  requireStudentRequestClaims: mocks.auth,
}));
vi.mock("@/lib/convex/server", () => ({
  internal: {
    activities: {
      getQuadraticFormulaAttempt: "get",
      startQuadraticFormulaAttempt: "start",
    },
  },
  fetchInternalQuery: mocks.query,
  fetchInternalMutation: mocks.mutate,
}));
import {
  GET,
  POST,
} from "@/app/api/activities/quadratic-formula/attempt/route";

const url =
  "http://local/api/activities/quadratic-formula/attempt?activityId=activities:qf&mode=guided_practice";
beforeEach(() => {
  mocks.auth.mockReset().mockResolvedValue({ sub: "profiles:student" });
  mocks.query.mockReset().mockResolvedValue({ state: "no_attempt" });
  mocks.mutate.mockReset().mockResolvedValue({ state: "exhausted" });
});
describe("quadratic-formula attempt route", () => {
  it("GET reads without allocation and keeps the response private", async () => {
    const response = await GET(new Request(url));
    expect(await response.json()).toEqual({ state: "no_attempt" });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.query).toHaveBeenCalledOnce();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it("POST explicitly starts or reuses one attempt", async () => {
    const response = await POST(new Request(url, { method: "POST" }));
    expect(await response.json()).toEqual({ state: "exhausted" });
    expect(mocks.mutate).toHaveBeenCalledOnce();
  });
  it.each([
    null,
    { state: "no_attempt", seed: 1 },
    { state: "pending", pendingSubmissionId: "sub:1" },
  ])("rejects an invalid or private internal result", async (result) => {
    mocks.query.mockResolvedValue(result);
    const response = await GET(new Request(url));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("seed");
  });
  it.each([
    {
      state: "pending",
      pendingSubmissionId: "sub:1",
      activityId: "activities:qf",
      mode: "guided_practice",
      attemptOrdinal: 1,
      idempotencyKey: "qf:sub:1",
      props: {
        prompt: "p",
        equation: "x=0",
        presentationMode: "guided",
        fieldHelp: { discriminant: "d", x1: "1", x2: "2", seed: 7 },
      },
    },
    {
      state: "pending",
      pendingSubmissionId: "sub:1",
      activityId: "activities:other",
      mode: "guided_practice",
      attemptOrdinal: 1,
      idempotencyKey: "qf:sub:1",
      props: {
        prompt: "p",
        equation: "x=0",
        presentationMode: "guided",
        fieldHelp: { discriminant: "d", x1: "1", x2: "2" },
      },
    },
    {
      state: "pending",
      pendingSubmissionId: "sub:1",
      activityId: "activities:qf",
      mode: "guided_practice",
      attemptOrdinal: 1,
      idempotencyKey: "learner",
      props: {
        prompt: "p",
        equation: "x=0",
        presentationMode: "guided",
        fieldHelp: { discriminant: "d", x1: "1", x2: "2" },
      },
    },
  ])("rejects nested private data or incoherent identity", async (result) => {
    mocks.query.mockResolvedValue(result);
    expect((await GET(new Request(url))).status).toBe(503);
  });
  it("returns a repeated-root final state with a zero-point x2 part", async () => {
    mocks.query.mockResolvedValue({
      state: "final",
      activityId: "activities:qf",
      mode: "guided_practice",
      attemptOrdinal: 3,
      props: {
        prompt: "Solve.",
        equation: "x^2 - 2x + 1 = 0",
        presentationMode: "guided",
        fieldHelp: { discriminant: "d", x1: "1", x2: "2" },
      },
      submissionId: "activity_submissions:3",
      score: 2,
      maxScore: 2,
      answers: { discriminant: 0, x1: 1, x2: "" },
      parts: [
        {
          partId: "discriminant",
          rawAnswer: 0,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        },
        { partId: "x1", rawAnswer: 1, isCorrect: true, score: 1, maxScore: 1 },
        { partId: "x2", rawAnswer: "", isCorrect: true, score: 0, maxScore: 0 },
      ],
    });
    const response = await GET(new Request(url));
    expect(response.status).toBe(200);
    expect((await response.json()).maxScore).toBe(2);
  });
  it.each(["assessment", "", "Guided"])(
    "rejects an invalid mode",
    async (mode) => {
      const response = await GET(
        new Request(url.replace("guided_practice", mode)),
      );
      expect(response.status).toBe(400);
    },
  );
});
