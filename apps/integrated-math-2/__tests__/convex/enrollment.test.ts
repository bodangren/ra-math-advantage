// @vitest-environment node
import { expect, it } from "vitest";
import { joinClass } from "../../convex/classes";
import { database, invoke } from "../helpers/database";
async function setup() {
  const t = database();
  async function account(username: string, role: string, organizationId = "org1") {
    const id = await t.db.insert("profiles", { username, role, organizationId });
    const credential = await t.db.insert("auth_credentials", {
      username,
      role,
      organizationId,
      profileId: id,
      isActive: true,
    });
    return { id, credential };
  }
  const teacher = await account("teacher", "teacher");
  const student = await account("student", "student");
  const classId = await t.db.insert("classes", {
    teacherId: teacher.id,
    joinCode: "class-code-12345",
    archived: false,
    name: "Class A",
  });
  return { ...t, teacher, student, classId, account };
}
it("joins an existing account once and preserves an active enrollment on replay", async () => {
  const t = await setup();
  for (let i = 0; i < 2; i++)
    await invoke(joinClass, t.ctx, { studentId: t.student.id, classCode: " class-code-12345 " });
  expect(t.tables.class_enrollments).toHaveLength(1);
  expect(t.tables.class_enrollments[0]).toMatchObject({
    studentId: t.student.id,
    classId: t.classId,
    status: "active",
  });
});
it("rejects foreign organizations, teacher accounts, archived classes, and inactive accounts", async () => {
  const t = await setup();
  const foreign = await t.account("foreign", "student", "org2");
  for (const studentId of [foreign.id, t.teacher.id])
    await expect(
      invoke(joinClass, t.ctx, { studentId, classCode: "class-code-12345" }),
    ).rejects.toThrow();
  await t.db.patch(t.classId, { archived: true });
  await expect(
    invoke(joinClass, t.ctx, { studentId: t.student.id, classCode: "class-code-12345" }),
  ).rejects.toThrow();
  await t.db.patch(t.classId, { archived: false });
  await t.db.patch(t.student.credential, { isActive: false });
  await expect(
    invoke(joinClass, t.ctx, { studentId: t.student.id, classCode: "class-code-12345" }),
  ).rejects.toThrow();
  expect(t.tables.class_enrollments ?? []).toHaveLength(0);
});
it("does not reactivate withdrawn or completed enrollments through a shared code", async () => {
  const t = await setup();
  const id = await t.db.insert("class_enrollments", {
    classId: t.classId,
    studentId: t.student.id,
    status: "withdrawn",
  });
  for (const status of ["withdrawn", "completed"]) {
    await t.db.patch(id, { status });
    await expect(
      invoke(joinClass, t.ctx, { studentId: t.student.id, classCode: "class-code-12345" }),
    ).rejects.toThrow();
    expect(t.tables.class_enrollments[0].status).toBe(status);
  }
});
