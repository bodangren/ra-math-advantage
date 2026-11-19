import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCredentialByUsername } from "../../../convex/auth";
import { getClassExport } from "../../../convex/exports";
const mocks = vi.hoisted(() => ({ query: vi.fn(), token: vi.fn() }));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: mocks.query,
  internal: { auth: { getCredentialByUsername: "credential" } },
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "token" }) }) }));
vi.mock("@math-platform/core-auth", async (original) => ({
  ...(await original()),
  verifySessionToken: mocks.token,
  getAuthJwtSecret: () => "secret",
}));
const claims = {
  sub: "student",
  username: "alice",
  role: "student",
  organizationId: "org",
  iat: 1,
  exp: 9999999999,
};
const credential = {
  _id: "credential",
  profileId: "student",
  username: "alice",
  role: "student",
  organizationId: "org",
  isActive: true,
  passwordHash: "hash",
  passwordSalt: "salt",
  passwordHashIterations: 120000,
};
const request = () => new Request("http://localhost", { headers: { cookie: "bm_session=token" } });
describe("review authentication boundaries", () => {
  beforeEach(() => {
    mocks.token.mockResolvedValue(claims);
    mocks.query.mockResolvedValue(credential);
  });
  it("accepts the real active credential query response", async () => {
    const query = {
      withIndex() {
        return this;
      },
      unique: async () => credential,
    };
    const result = await (getCredentialByUsername as any)._handler(
      { db: { query: () => query } },
      { username: "alice" },
    );
    mocks.query.mockResolvedValue(result);
    const { requireStudentRequestClaims } = await import("@/lib/auth/server");
    expect(await requireStudentRequestClaims(request())).toEqual(claims);
  });
  it.each(["profileId", "role", "organizationId"])("rejects changed %s", async (field) => {
    mocks.query.mockResolvedValue({ ...credential, [field]: "changed" });
    const { requireStudentRequestClaims } = await import("@/lib/auth/server");
    expect(await requireStudentRequestClaims(request())).toMatchObject({ status: 401 });
  });
  it("revokes a teacher request and server page after deactivation", async () => {
    mocks.token.mockResolvedValue({ ...claims, role: "teacher" });
    mocks.query.mockResolvedValue(null);
    const { requireTeacherRequestClaims, getServerSessionClaims } =
      await import("@/lib/auth/server");
    expect(await requireTeacherRequestClaims(request())).toMatchObject({ status: 401 });
    expect(await getServerSessionClaims()).toBeNull();
  });
  it("keeps exports internal", () => {
    for (const fn of [getClassExport]) expect((fn as any).isInternal).toBe(true);
  });
});
