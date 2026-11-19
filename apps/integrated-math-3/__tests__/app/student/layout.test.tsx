import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/server", () => ({
  requireStudentSessionClaims: vi.fn().mockResolvedValue({ role: "student" }),
}));

describe("StudentLayout", () => {
  it("preserves the student dashboard as the post-login destination", async () => {
    const { requireStudentSessionClaims } = await import("@/lib/auth/server");
    const { default: StudentLayout } = await import("@/app/student/layout");

    await StudentLayout({ children: null });

    expect(requireStudentSessionClaims).toHaveBeenCalledWith("/student/dashboard");
  });
});
