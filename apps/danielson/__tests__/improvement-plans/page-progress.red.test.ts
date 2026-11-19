import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFetchInternalQuery, mockRedirect, mockRequireDanielsonSession } = vi.hoisted(() => ({
  mockFetchInternalQuery: vi.fn(),
  mockRedirect: vi.fn(),
  mockRequireDanielsonSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mockRedirect }));
vi.mock("@/lib/auth/server", () => ({
  requireDanielsonSession: mockRequireDanielsonSession,
}));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    improvementPlans: {
      readImprovementPlan: "read-improvement-plan",
      readImprovementPlanReportProjection: "read-improvement-plan-progress",
    },
  },
}));

const { getImprovementPlan } = await import("../../lib/improvement-plans/improvement-plan-page");

describe("improvement plan detail progress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireDanielsonSession.mockResolvedValue({
      claims: { sub: "accounts:supervisor" },
      account: { danielsonRoles: ["school_head"] },
    });
  });

  it("requests progress for the selected historical root, not only its teacher", async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({
        kind: "allowed",
        plan: {
          planId: "improvement_plans:historical",
          teacherProfileId: "teacher_profiles:one",
        },
        viewer: { isSubjectTeacher: false, isFrozenSupervisor: false },
      })
      .mockResolvedValueOnce({
        kind: "allowed",
        projection: {
          contractVersion: "danielson.ip-progress.v1",
          state: "closed",
          planId: "improvement_plans:historical",
          version: 1,
          daysRemaining: 0,
          outcome: "successful",
          closedAt: Date.parse("2026-10-02T00:00:00.000Z"),
          targets: [],
        },
      });

    await expect(getImprovementPlan("improvement_plans:historical")).resolves.toMatchObject({
      progress: { planId: "improvement_plans:historical", state: "closed" },
    });
    expect(mockFetchInternalQuery).toHaveBeenNthCalledWith(2, "read-improvement-plan-progress", {
      actorAccountId: "accounts:supervisor",
      teacherProfileId: "teacher_profiles:one",
      planId: "improvement_plans:historical",
      now: expect.any(Number),
    });
  });
});
