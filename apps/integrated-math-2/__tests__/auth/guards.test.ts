// @vitest-environment node
import { it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("../../lib/convex/server", () => ({
  internal: { auth: { getAccountSettingsContext: "account" } },
  fetchInternalQuery: mocks.query,
}));
vi.mock("@math-platform/core-auth", () => ({
  SESSION_COOKIE_NAME: "bm_session",
  getAuthJwtSecret: () => "test",
  getCookieValueFromHeader: () => "token",
  verifySessionToken: async () => ({
    sub: "user",
    role: "student",
    username: "learner",
    organizationId: "org",
  }),
}));
import { requireRequestSessionClaims } from "../../lib/auth/server";
it("returns a controlled unavailable response if account verification fails", async () => {
  mocks.query.mockRejectedValueOnce(Error("backend unavailable"));
  const result = await requireRequestSessionClaims(
    new Request("http://localhost/api/learning"),
  );
  expect(result).toBeInstanceOf(Response);
  expect((result as Response).status).toBe(503);
});
it("rejects a session after a role change", async () => {
  mocks.query.mockResolvedValueOnce({
    role: "teacher",
    username: "learner",
    organizationId: "org",
  });
  const result = await requireRequestSessionClaims(
    new Request("http://localhost/api/learning"),
  );
  expect((result as Response).status).toBe(401);
});
