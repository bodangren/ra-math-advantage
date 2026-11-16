// @vitest-environment node
import { it, expect } from "vitest";
import { database, invoke } from "../helpers/database";
import { getDashboardData } from "../../convex/student";
import { getLesson } from "../../convex/learning";
it("uses the published revision and its progress after more than 100 revisions", async () => {
  const t = database();
  const student = await t.db.insert("profiles", {
    username: "student",
    role: "student",
    organizationId: "org",
  });
  await t.db.insert("auth_credentials", {
    username: "student",
    profileId: student,
    role: "student",
    organizationId: "org",
    isActive: true,
  });
  const teacher = await t.db.insert("profiles", {
    username: "teacher",
    role: "teacher",
    organizationId: "org",
  });
  const teacherCredential = await t.db.insert("auth_credentials", {
    username: "teacher", profileId: teacher, role: "teacher", organizationId: "org", isActive: true,
  });
  const classId = await t.db.insert("classes", { teacherId: teacher });
  await t.db.insert("class_enrollments", {
    classId,
    studentId: student,
    status: "active",
  });
  const lessonId = await t.db.insert("lessons", {
    slug: "example",
    title: "Unpublished title",
    unitNumber: 1,
    orderIndex: 1,
  });
  await t.db.insert("class_lessons", { classId, lessonId });
  const version = await t.db.insert("lesson_versions", {
    lessonId,
    title: "Published title",
    status: "published",
    version: 1,
  });
  for (let n = 0; n < 105; n++) {
    await t.db.insert("lesson_versions", {
      lessonId,
      status: "archived",
      version: n + 2,
    });
    await t.db.insert("student_progress", {
      userId: student,
      lessonId,
      phaseId: `old:${n}`,
      status: "completed",
    });
  }
  const phaseId = await t.db.insert("phase_versions", {
    lessonVersionId: version,
    phaseNumber: 1,
    title: "Read",
    phaseType: "learn",
  });
  await t.db.insert("student_progress", {
    userId: student,
    lessonId,
    phaseId,
    status: "completed",
  });
  expect(await invoke(getDashboardData, t.ctx, { userId: student })).toEqual([
    {
      id: lessonId,
      title: "Published title",
      slug: "example",
      unitNumber: 1,
      orderIndex: 1,
      completed: 1,
      total: 1,
    },
  ]);
  expect(
    await invoke(getLesson, t.ctx, { userId: student, slug: "example" }),
  ).toMatchObject({ title: "Published title" });
  await t.db.patch(teacherCredential, { isActive: false });
  expect(await invoke(getDashboardData, t.ctx, { userId: student })).toEqual([]);
  await expect(invoke(getLesson, t.ctx, { userId: student, slug: "example" })).rejects.toThrow("not_allowed");

});
