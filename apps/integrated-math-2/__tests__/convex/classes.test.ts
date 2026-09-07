// @vitest-environment node
import { it, expect } from "vitest";
import { createClass, assignLesson, getClass } from "../../convex/classes";
import { database, invoke } from "../helpers/database";
async function setup() {
  const t = database();
  const teacher = await t.db.insert("profiles", {
    role: "teacher",
    username: "teacher",
    organizationId: "org1",
  });
  await t.db.insert("auth_credentials", {
    profileId: teacher,
    role: "teacher",
    username: "teacher",
    organizationId: "org1",
    isActive: true,
  });
  return { ...t, teacher };
}
it("creates a teacher-owned class and rejects another teacher assignment", async () => {
  const t = await setup();
  const classId = await invoke(createClass, t.ctx, {
    teacherId: t.teacher,
    name: "IM2 A",
    joinCode: "unique-class-code",
  });
  expect(t.tables.classes[0]).toMatchObject({
    teacherId: t.teacher,
    name: "IM2 A",
    joinCode: "unique-class-code",
    archived: false,
  });
  const lessonId = await t.db.insert("lessons", { slug: "module-1-lesson-1" });
  await t.db.insert("lesson_versions", {
    lessonId,
    version: 2,
    status: "published",
  });
  for (let n = 0; n < 105; n++)
    await t.db.insert("lesson_versions", {
      lessonId,
      version: n + 3,
      status: "archived",
    });
  await invoke(assignLesson, t.ctx, {
    teacherId: t.teacher,
    classId,
    lessonId,
  });
  await invoke(assignLesson, t.ctx, {
    teacherId: t.teacher,
    classId,
    lessonId,
  });
  expect(t.tables.class_lessons).toHaveLength(1);
  const other = await t.db.insert("profiles", {
    role: "teacher",
    username: "other",
    organizationId: "org2",
  });
  await t.db.insert("auth_credentials", {
    profileId: other,
    role: "teacher",
    username: "other",
    organizationId: "org2",
    isActive: true,
  });
  await expect(
    invoke(assignLesson, t.ctx, { teacherId: other, classId, lessonId }),
  ).rejects.toThrow();
});
it("rejects draft lessons and duplicate class codes", async () => {
  const t = await setup();
  const classId = await invoke(createClass, t.ctx, {
    teacherId: t.teacher,
    name: "IM2 A",
    joinCode: "unique-class-code",
  });
  await expect(
    invoke(createClass, t.ctx, {
      teacherId: t.teacher,
      name: "B",
      joinCode: "unique-class-code",
    }),
  ).rejects.toThrow();
  const lessonId = await t.db.insert("lessons", {});
  await t.db.insert("lesson_versions", { lessonId, status: "draft" });
  await expect(
    invoke(assignLesson, t.ctx, { teacherId: t.teacher, classId, lessonId }),
  ).rejects.toThrow();
});

it("excludes cross-organization and non-student roster records", async () => {
  const t = await setup();
  const classId = await invoke(createClass, t.ctx, {
    teacherId: t.teacher,
    name: "IM2 A",
    joinCode: "unique-class-code",
  });
  for (const [username, role, organizationId] of [
    ["valid", "student", "org1"],
    ["foreign", "student", "org2"],
    ["teacher", "teacher", "org1"],
  ]) {
    const studentId = await t.db.insert("profiles", {
      username,
      role,
      organizationId,
    });
    await t.db.insert("class_enrollments", {
      classId,
      studentId,
      status: "active",
    });
  }
  const result = await invoke<
    { teacherId: typeof t.teacher; classId: typeof classId },
    { students: { name: string }[] }
  >(getClass, t.ctx, { teacherId: t.teacher, classId });
  expect(result.students.map((student) => student.name)).toEqual(["valid"]);
});
it("paginates a large roster without failing or repeating students", async () => {
  const t = await setup();
  const classId = await invoke(createClass, t.ctx, {
    teacherId: t.teacher,
    name: "IM2 A",
    joinCode: "unique-class-code",
  });
  for (let i = 0; i < 205; i++) {
    const studentId = await t.db.insert("profiles", {
      username: `student${i}`,
      role: "student",
      organizationId: "org1",
    });
    await t.db.insert("class_enrollments", {
      classId,
      studentId,
      status: "active",
    });
  }
  const names: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await invoke<
      { teacherId: typeof t.teacher; classId: typeof classId; cursor?: string },
      { students: { name: string }[]; nextCursor: string | null }
    >(getClass, t.ctx, { teacherId: t.teacher, classId, cursor });
    names.push(...page.students.map((student) => student.name));
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  expect(names).toHaveLength(205);
  expect(new Set(names).size).toBe(205);
});
