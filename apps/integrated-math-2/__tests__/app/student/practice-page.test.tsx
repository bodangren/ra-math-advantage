import { it, expect, vi } from "vitest";
const q = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/server", () => ({ requireStudentSessionClaims: async () => ({ sub: "s" }) }));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: q,
  internal: {
    activities: {
      getApprovedPerpendicularBisectorPilot: "p",
      getApprovedTriangleOrderingPractice: "t",
    },
  },
}));
vi.mock("@/components/student/PerpendicularBisectorPilot", () => ({
  PerpendicularBisectorPilot: () => null,
}));
vi.mock("@/components/student/TriangleOrderingPractice", () => ({
  TriangleOrderingPractice: () => null,
}));
import Page from "@/app/student/practice/page";
it("loads both bounded practices", async () => {
  q.mockResolvedValue([]);
  expect(await Page()).toBeTruthy();
  expect(q).toHaveBeenCalledTimes(2);
});
