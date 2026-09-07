// @vitest-environment node
import { it, expect } from "vitest";
import { database, invoke } from "../helpers/database";
import { completePhase, submitAnswer } from "../../convex/learning";
async function setup() {
  const t = database();
  const user = await t.db.insert("profiles", {
    username: "learner",
    role: "student",
    organizationId: "org1",
  });
  await t.db.insert("auth_credentials", {
    profileId: user,
    username: "learner",
    role: "student",
    organizationId: "org1",
    isActive: true,
  });
  const teacher = await t.db.insert("profiles", {
    username: "teacher",
    role: "teacher",
    organizationId: "org1",
  });
  const classroom = await t.db.insert("classes", {
    teacherId: teacher,
    archived: false,
  });
  await t.db.insert("class_enrollments", {
    classId: classroom,
    studentId: user,
    status: "active",
  });
  const lesson = await t.db.insert("lessons", { slug: "module-1-lesson-1" });
  await t.db.insert("class_lessons", { classId: classroom, lessonId: lesson });
  const version = await t.db.insert("lesson_versions", {
    lessonId: lesson,
    status: "published",
  });
  const first = await t.db.insert("phase_versions", {
    lessonVersionId: version,
    phaseNumber: 1,
  });
  const second = await t.db.insert("phase_versions", {
    lessonVersionId: version,
    phaseNumber: 2,
  });
  const activity = await t.db.insert("activities", {
    componentKey: "im2-question",
    props: {
      kind: "numeric",
      prompt: "Solve 2x + 1 = 11.",
      answer: 5,
      explanation: "Subtract 1, then divide by 2.",
    },
  });
  await t.db.insert("phase_sections", {
    phaseVersionId: second,
    sectionType: "activity",
    content: { activityId: activity },
    sequenceOrder: 1,
  });
  return { ...t, user, first, second, activity };
}
it("requires the previous phase and correct server grading before completion", async () => {
  const t = await setup();
  await expect(
    invoke(completePhase, t.ctx, { userId: t.user, phaseId: t.second }),
  ).rejects.toThrow();
  await invoke(completePhase, t.ctx, { userId: t.user, phaseId: t.first });
  const wrong = await invoke(submitAnswer, t.ctx, {
    userId: t.user,
    phaseId: t.second,
    activityId: t.activity,
    answer: "9",
    submissionKey: "attempt-1",
  });
  expect(wrong).toMatchObject({ score: 0, maxScore: 1 });
  await expect(
    invoke(completePhase, t.ctx, { userId: t.user, phaseId: t.second }),
  ).rejects.toThrow();
  const correct = await invoke(submitAnswer, t.ctx, {
    userId: t.user,
    phaseId: t.second,
    activityId: t.activity,
    answer: "10/2",
    submissionKey: "attempt-2",
  });
  expect(correct).toMatchObject({ score: 1, maxScore: 1 });
  await invoke(completePhase, t.ctx, { userId: t.user, phaseId: t.second });
  await invoke(completePhase, t.ctx, { userId: t.user, phaseId: t.second });
  expect(t.tables.student_progress).toHaveLength(2);
});
it("does not permit an unenrolled account or an inactive account", async () => {
  const t = await setup();
  t.tables.class_enrollments[0].status = "withdrawn";
  await expect(
    invoke(completePhase, t.ctx, { userId: t.user, phaseId: t.first }),
  ).rejects.toThrow();
  t.tables.class_enrollments[0].status = "active";
  t.tables.auth_credentials[0].isActive = false;
  await expect(
    invoke(completePhase, t.ctx, { userId: t.user, phaseId: t.first }),
  ).rejects.toThrow();
});
it("replays a submission without writing duplicate evidence and rejects a changed replay", async () => {
  const t = await setup();
  await invoke(completePhase, t.ctx, { userId: t.user, phaseId: t.first });
  const args = {
    userId: t.user,
    phaseId: t.second,
    activityId: t.activity,
    answer: "5",
    submissionKey: "same-key",
  };
  await invoke(submitAnswer, t.ctx, args);
  await invoke(submitAnswer, t.ctx, args);
  expect(t.tables.activity_submissions).toHaveLength(1);
  await expect(
    invoke(submitAnswer, t.ctx, { ...args, answer: "8" }),
  ).rejects.toThrow();
});

it("retains correct evidence after more than 100 later incorrect attempts", async () => {
  const t = await setup();
  await invoke(completePhase, t.ctx, { userId: t.user, phaseId: t.first });
  await invoke(submitAnswer, t.ctx, { userId: t.user, phaseId: t.second, activityId: t.activity, answer: "5", submissionKey: "correct" });
  for (let n = 0; n < 101; n++) {
    await t.db.insert("activity_submissions", { userId: t.user, phaseId: t.second, activityId: t.activity, score: 0, maxScore: 1 });
  }
  await expect(invoke(completePhase, t.ctx, { userId: t.user, phaseId: t.second })).resolves.toBeNull();
});
