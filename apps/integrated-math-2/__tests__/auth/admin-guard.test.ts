// @vitest-environment node
import { it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({ role: "admin", query: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: "test-token" }) }),
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw Error(`redirect:${path}`);
  },
}));
vi.mock("../../lib/convex/server", () => ({
  internal: { auth: { getAccountSettingsContext: "account" } },
  fetchInternalQuery: mocks.query,
}));
vi.mock("@math-platform/core-auth", () => ({
  SESSION_COOKIE_NAME: "session",
  getAuthJwtSecret: () => "test",
  verifySessionToken: async () => ({
    sub: "user",
    role: mocks.role,
    username: "reviewer",
    organizationId: "org",
  }),
}));
import { requireAdminSessionClaims } from "../../lib/auth/server";
it("allows an active administrator with matching current claims", async () => {
  mocks.role = "admin";
  mocks.query.mockResolvedValue({
    role: "admin",
    username: "reviewer",
    organizationId: "org",
  });
  expect(await requireAdminSessionClaims("/admin/curriculum")).toMatchObject({
    role: "admin",
  });
});
it("redirects a teacher and rejects a deactivated administrator", async () => {
  mocks.role = "teacher";
  mocks.query.mockResolvedValue({
    role: "teacher",
    username: "reviewer",
    organizationId: "org",
  });
  await expect(requireAdminSessionClaims("/admin/curriculum")).rejects.toThrow(
    "redirect:/teacher/dashboard",
  );
  mocks.role = "admin";
  mocks.query.mockResolvedValue(null);
  await expect(requireAdminSessionClaims("/admin/curriculum")).rejects.toThrow(
    "redirect:/auth/login",
  );
});
