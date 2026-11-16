// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  hashPassword,
  signSessionToken,
  PASSWORD_HASH_ITERATIONS,
  SESSION_COOKIE_NAME,
} from "@math-platform/core-auth";
import { getFunctionName } from "convex/server";
const backend = vi.hoisted(() => ({ query: vi.fn(), mutation: vi.fn() }));
vi.mock("@/lib/convex/server", async () => ({
  internal: (await import("../../convex/_generated/api")).internal,
  fetchInternalQuery: backend.query,
  fetchInternalMutation: backend.mutation,
}));
import { POST as login } from "../../app/api/auth/login/route";
import { POST as register } from "../../app/api/auth/register/route";
import { GET as session } from "../../app/api/auth/session/route";
const request = (body: unknown) =>
  new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  process.env.AUTH_JWT_SECRET =
    "local-test-secret-at-least-thirty-two-characters";
  backend.mutation.mockResolvedValue({ allowed: true, ok: true });
});
describe("authentication boundary", () => {
  it("issues a session for a correct stored password", async () => {
    const salt = "test-salt";
    backend.query.mockResolvedValue({
      profileId: "profile1",
      username: "teacher",
      role: "teacher",
      organizationId: "org1",
      passwordSalt: salt,
      passwordHashIterations: PASSWORD_HASH_ITERATIONS,
      passwordHash: await hashPassword(
        "correct-password",
        salt,
        PASSWORD_HASH_ITERATIONS,
      ),
    });
    const response = await login(
      request({ username: "teacher", password: "correct-password" }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(await response.json()).toMatchObject({
      redirectTo: "/teacher/dashboard",
    });
  });
  it("does not expose an internal failure for a wrong password", async () => {
    backend.query.mockResolvedValue({
      passwordSalt: "salt",
      passwordHashIterations: 100,
      passwordHash: await hashPassword("correct", "salt", 100),
    });
    expect(
      (await login(request({ username: "student", password: "wrong" }))).status,
    ).toBe(401);
  });
  it.each([
    null,
    [],
    { username: { x: 1 }, password: "validpass" },
    { username: "student", password: 12 },
    { username: "x".repeat(81), password: "validpass" },
  ])("rejects malformed credentials before database work: %j", async (body) => {
    expect((await login(request(body))).status).toBe(400);
    expect(backend.query).not.toHaveBeenCalled();
    expect(backend.mutation).not.toHaveBeenCalled();
  });
  it("returns 400 for malformed JSON", async () => {
    expect(
      (
        await login(
          new Request("http://localhost", { method: "POST", body: "{" }),
        )
      ).status,
    ).toBe(400);
  });
  it("uses create-only registration and returns conflict for an existing username", async () => {
    backend.mutation.mockImplementation(async (ref) =>
      getFunctionName(ref).endsWith("consumeAuthAttempt")
        ? { allowed: true }
        : { ok: false, reason: "username_taken" },
    );
    expect(
      (
        await register(
          request({
            username: "teacher",
            password: "new-password",
            classCode: "class-code",
          }),
        )
      ).status,
    ).toBe(409);
    expect(
      backend.mutation.mock.calls.map(([ref]) => getFunctionName(ref)),
    ).not.toContain("auth:upsertCredentialByUsername");
  });
  it("requires a class code for registration", async () => {
    expect(
      (
        await register(
          request({ username: "new-student", password: "validpass" }),
        )
      ).status,
    ).toBe(400);
  });
  it("stops password work when the request limit is reached", async () => {
    backend.mutation.mockResolvedValue({ allowed: false });
    expect(
      (await login(request({ username: "student", password: "validpass" })))
        .status,
    ).toBe(429);
    expect(backend.query).not.toHaveBeenCalled();
  });
  it("rejects a token whose account was removed or deactivated", async () => {
    const token = await signSessionToken(
      {
        sub: "profile1",
        username: "student",
        role: "student",
        organizationId: "org1",
      },
      process.env.AUTH_JWT_SECRET!,
    );
    backend.query.mockResolvedValue(null);
    const response = await session(
      new Request("http://localhost/api/auth/session", {
        headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
      }),
    );
    expect(await response.json()).toMatchObject({ authenticated: false });
  });
});
