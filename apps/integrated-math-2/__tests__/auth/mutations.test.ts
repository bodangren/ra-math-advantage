// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  registerStudent,
  activeAccount,
  consumeAuthAttempt,
} from "../../convex/auth";
import { database, invoke } from "../helpers/database";
import type { Id } from "../../convex/_generated/dataModel";
const args = {
  username: "learner",
  classCode: "class-code",
  passwordHash: "hash",
  passwordSalt: "salt",
  passwordHashIterations: 120000,
};
async function setup() {
  const t = database();
  const teacher = await t.db.insert("profiles", {
    username: "teacher",
    role: "teacher",
    organizationId: "org1",
    createdAt: 1,
    updatedAt: 1,
  });
  await t.db.insert("auth_credentials", {
    profileId: teacher,
    username: "teacher",
    role: "teacher",
    organizationId: "org1",
    isActive: true,
  });
  const classroom = await t.db.insert("classes", {
    teacherId: teacher,
    joinCode: "class-code",
    archived: false,
  });
  return { ...t, teacher, classroom };
}
describe("registration storage", () => {
  it("does not replace existing credentials or role", async () => {
    const t = await setup();
    const original = structuredClone(t.tables.auth_credentials);
    expect(
      await invoke(registerStudent, t.ctx, { ...args, username: "teacher" }),
    ).toEqual({ ok: false, reason: "username_taken" });
    expect(t.tables.auth_credentials).toEqual(original);
    expect(t.tables.profiles).toHaveLength(1);
  });
  it("creates one student in the teacher organization and enrolls the student", async () => {
    const t = await setup();
    expect(await invoke(registerStudent, t.ctx, args)).toEqual({ ok: true });
    const profile = t.tables.profiles.find((p) => p.username === "learner")!;
    expect(profile).toMatchObject({ organizationId: "org1", role: "student" });
    expect(t.tables.class_enrollments).toEqual([
      expect.objectContaining({
        classId: t.classroom,
        studentId: profile._id,
        status: "active",
      }),
    ]);
    expect(await invoke(registerStudent, t.ctx, args)).toEqual({
      ok: false,
      reason: "username_taken",
    });
    expect(t.tables.class_enrollments).toHaveLength(1);
  });
  it("does not create rows for an invalid class", async () => {
    const t = await setup();
    expect(
      await invoke(registerStudent, t.ctx, { ...args, classCode: "wrong" }),
    ).toEqual({ ok: false, reason: "invalid_class" });
    expect(t.tables.profiles).toHaveLength(1);
  });
  it("does not accept archived classes or inactive teachers", async () => {
    const t = await setup();
    await t.db.patch(t.classroom, { archived: true });
    expect(await invoke(registerStudent, t.ctx, args)).toMatchObject({
      ok: false,
    });
    await t.db.patch(t.classroom, { archived: false });
    t.tables.auth_credentials[0].isActive = false;
    expect(await invoke(registerStudent, t.ctx, args)).toMatchObject({
      ok: false,
    });
  });
  it("rejects mismatched stored role and inactive accounts", async () => {
    const t = await setup();
    expect(
      await activeAccount(t.ctx, t.teacher as Id<"profiles">),
    ).not.toBeNull();
    t.tables.auth_credentials[0].role = "student";
    expect(await activeAccount(t.ctx, t.teacher as Id<"profiles">)).toBeNull();
  });
  it("persists the request limit across calls", async () => {
    const t = await setup();
    for (let i = 0; i < 10; i++)
      expect(
        await invoke(consumeAuthAttempt, t.ctx, {
          username: "learner",
          operation: "login",
        }),
      ).toEqual({ allowed: true });
    expect(
      await invoke(consumeAuthAttempt, t.ctx, {
        username: "learner",
        operation: "login",
      }),
    ).toEqual({ allowed: false });
  });
});
it("retires expired rate-limit buckets without removing current limits", async () => {
  const t = database();
  for (let i = 0; i < 30; i++)
    await t.db.insert("auth_rate_limits", {
      key: `old:${i}`,
      windowStart: Date.now() - 120000,
      count: 10,
    });
  await t.db.insert("auth_rate_limits", {
    key: "login:user:blocked",
    windowStart: Date.now(),
    count: 10,
  });
  for (let i = 0; i < 5; i++)
    await invoke(consumeAuthAttempt, t.ctx, {
      username: `new${i}`,
      operation: "login",
    });
  expect(
    t.tables.auth_rate_limits.filter((row) =>
      String(row.key).startsWith("old:"),
    ),
  ).toHaveLength(0);
  expect(
    await invoke(consumeAuthAttempt, t.ctx, {
      username: "blocked",
      operation: "login",
    }),
  ).toEqual({ allowed: false });
});
