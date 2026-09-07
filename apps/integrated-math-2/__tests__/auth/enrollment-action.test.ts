// @vitest-environment node
import { it, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({
  guard: vi.fn(),
  mutate: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("../../lib/auth/server", () => ({
  requireStudentSessionClaims: mocks.guard,
}));
vi.mock("../../lib/convex/server", () => ({
  fetchInternalMutation: mocks.mutate,
  internal: { classes: { joinClass: "join" } },
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw Error(`redirect:${path}`);
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import { joinClass } from "../../app/student/dashboard/actions";
beforeEach(() => {
  vi.resetAllMocks();
});
it("uses the authenticated student identity and refreshes the dashboard", async () => {
  mocks.guard.mockResolvedValue({ sub: "trusted-student" });
  mocks.mutate.mockResolvedValue(null);
  const form = new FormData();
  form.set("classCode", "class-code-12345");
  form.set("studentId", "forged-student");
  await expect(joinClass(form)).rejects.toThrow("?join=joined");
  expect(mocks.mutate).toHaveBeenCalledWith("join", {
    studentId: "trusted-student",
    classCode: "class-code-12345",
  });
  expect(mocks.revalidate).toHaveBeenCalledWith("/student/dashboard");
});
it("performs no enrollment if the student guard rejects access", async () => {
  mocks.guard.mockRejectedValue(Error("not_allowed"));
  await expect(joinClass(new FormData())).rejects.toThrow("not_allowed");
  expect(mocks.mutate).not.toHaveBeenCalled();
});
it("shows a controlled error after a backend outage", async () => {
  mocks.guard.mockResolvedValue({ sub: "trusted-student" });
  mocks.mutate.mockRejectedValue(Error("private backend details"));
  const form = new FormData();
  form.set("classCode", "class-code-12345");
  await expect(joinClass(form)).rejects.toThrow("?join=unavailable");
  expect(mocks.revalidate).not.toHaveBeenCalled();
});
