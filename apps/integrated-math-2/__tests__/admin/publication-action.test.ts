// @vitest-environment node
import { it, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({
  guard: vi.fn(),
  mutate: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("../../lib/auth/server", () => ({
  requireAdminSessionClaims: mocks.guard,
}));
vi.mock("../../lib/convex/server", () => ({
  fetchInternalMutation: mocks.mutate,
  internal: { publication: { publishLesson: "publish" } },
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw Error(`redirect:${path}`);
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import { publishDraft } from "../../app/admin/curriculum/actions";
beforeEach(() => {
  vi.resetAllMocks();
});
it("uses the authenticated administrator identity and refreshes the draft list", async () => {
  mocks.guard.mockResolvedValue({ sub: "trusted-admin" });
  mocks.mutate.mockResolvedValue(null);
  const form = new FormData();
  form.set("versionId", "draft-version");
  form.set("adminId", "forged-admin");
  await expect(publishDraft(form)).rejects.toThrow("?published=1");
  expect(mocks.mutate).toHaveBeenCalledWith("publish", {
    adminId: "trusted-admin",
    versionId: "draft-version",
  });
  expect(mocks.revalidate).toHaveBeenCalledWith("/admin/curriculum");
});
it("performs no publication if the administrator guard rejects access", async () => {
  mocks.guard.mockRejectedValue(Error("not_allowed"));
  await expect(publishDraft(new FormData())).rejects.toThrow("not_allowed");
  expect(mocks.mutate).not.toHaveBeenCalled();
});
it("shows a controlled error after a backend outage", async () => {
  mocks.guard.mockResolvedValue({ sub: "trusted-admin" });
  mocks.mutate.mockRejectedValue(Error("private backend details"));
  const form = new FormData();
  form.set("versionId", "draft-version");
  await expect(publishDraft(form)).rejects.toThrow("?error=unavailable");
  expect(mocks.revalidate).not.toHaveBeenCalled();
});
