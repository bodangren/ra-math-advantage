import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(async () => ({ sub: "learner", role: "student" })),
  query: vi.fn(async (ref: string) =>
    ref === "lessons"
      ? [{ id: "l1", topic: "1.1", title: "Change in Tandem" }]
      : {
          guidedPractice: {
            mode: "guided_practice",
            submissionId: "saved",
            attemptOrdinal: 4,
            submittedAt: 10,
            score: 2,
            maxScore: 3,
            feedback: "Stored feedback.",
            deliveryState: "needs_delivery",
          },
          independentPractice: null,
        },
  ),
}));
vi.mock("@/lib/auth/server", () => ({ requireStudentSessionClaims: mocks.auth }));
vi.mock("@/lib/convex/server", () => ({
  internal: { course: { getLessons: "lessons" }, activities: { getSavedTopic11Practice: "saved" } },
  fetchInternalQuery: mocks.query,
}));
describe("student saved-practice dashboard", () => {
  it("authenticates, links lessons, and labels stored results without a completion claim", async () => {
    const Page = (await import("@/app/student/dashboard/page")).default;
    render(await Page());
    expect(mocks.auth).toHaveBeenCalledWith("/student/dashboard");
    expect(screen.getByRole("link", { name: "1.1 Change in Tandem" })).toHaveAttribute(
      "href",
      "/student/lessons/1.1",
    );
    expect(screen.getByText("Saved score: 2/3")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Guided practice" })).toBeInTheDocument();
    expect(screen.getByText("Attempt 4")).toBeInTheDocument();
    expect(screen.getByText("Stored feedback.")).toBeInTheDocument();
    expect(screen.getByText(/retry evidence delivery/i)).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/mastered|completed/i);
  });
  it("does not query dashboard data when authentication fails", async () => {
    mocks.query.mockClear();
    mocks.auth.mockRejectedValueOnce(new Error("redirect:/auth/login"));
    const Page = (await import("@/app/student/dashboard/page")).default;
    await expect(Page()).rejects.toThrow("redirect:/auth/login");
    expect(mocks.query).not.toHaveBeenCalled();
  });
});
