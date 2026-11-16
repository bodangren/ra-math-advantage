import { expect, it, vi } from "vitest";
import { database, invoke } from "../helpers/database";

vi.mock("@/convex/activities", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/convex/activities")>()),
  isPilotPublished: () => true,
  trianglePublished: () => true,
}));
import { submitBoundedPracticeHandler, submitTriangleHandler } from "@/convex/activities";
import { triangleNodeIds } from "@/lib/practice/triangle-ordering";
import { getStudentEvidence } from "@/convex/teacher";

const stableActivityId = "math.im2.skill.1.1.perpendicular-bisector-equidistance.guided_practice";

it("hides the teacher action for a source with an invalid component contract", async () => {
  const { db, ctx } = database();
  const teacherId = await db.insert("profiles", { role: "teacher", organizationId: "org", username: "teacher" });
  const studentId = await db.insert("profiles", { role: "student", organizationId: "org", username: "student" });
  await db.insert("auth_credentials", { profileId: teacherId, isActive: true, role: "teacher", organizationId: "org", username: "teacher" });
  await db.insert("auth_credentials", { profileId: studentId, isActive: true, role: "student", organizationId: "org", username: "student" });
  const classId = await db.insert("classes", { teacherId, archived: false });
  await db.insert("class_enrollments", { classId, studentId, status: "active", enrolledAt: 10 });
  const lessonId = await db.insert("lessons", { slug: "module-1-lesson-1" });
  await db.insert("class_lessons", { classId, lessonId, assignedAt: 20 });
  const activityId = await db.insert("activities", { stableActivityId, componentKey: "wrong-component", masteryNodeId: "wrong-node", learningEvidenceMode: "worked_example", approval: { status: "approved" } });
  const submissionId = await db.insert("activity_submissions", { userId: studentId, activityId, lessonId, submissionData: { rawResponse: "4" }, score: 1, maxScore: 1, gradedAt: 30, submittedAt: 30 });

  const read = () => invoke<unknown, { submissions: Array<{ id: string; answer: string; score: number; maxScore: number; canRecordExposure: boolean }> }>(getStudentEvidence, ctx, { teacherId, classId, studentId });
  expect((await read()).submissions[0].canRecordExposure).toBe(false);
  expect((await read()).submissions[0].answer).toBe("4");

  await db.patch(activityId, { componentKey: "im2-question", masteryNodeId: "math.im2.skill.1.1.perpendicular-bisector-equidistance", learningEvidenceMode: "guided_practice" });
  expect((await read()).submissions[0].canRecordExposure).toBe(true);

  await db.patch(submissionId, { submittedAt: 19 });
  expect((await read()).submissions[0].canRecordExposure).toBe(false);

  await db.patch(submissionId, { submissionData: { answers: { response: "legacy answer" } } });
  expect((await read()).submissions[0].answer).toBe("legacy answer");

  const otherLessonId = await db.insert("lessons", { slug: "module-1-lesson-4" });
  await db.insert("class_lessons", { classId, lessonId: otherLessonId, assignedAt: 20 });
  const stagedId = await db.insert("activity_submissions", {
    userId: studentId,
    activityId,
    lessonId: otherLessonId,
    submissionData: {
      artifact: { currentPartId: "final_order", finalPart: true },
      parts: [
        { partId: "missing_angle", rawAnswer: "66", isCorrect: true, score: 1, maxScore: 1 },
        { partId: "final_order", rawAnswer: "wrong", isCorrect: false, score: 0, maxScore: 1 },
      ],
    },
    score: 0,
    maxScore: 1,
    feedback: "Try again.",
    gradedAt: 40,
    submittedAt: 40,
  });
  const staged = (await read()).submissions.find((row) => row.answer.startsWith("final_order"));
  expect(staged).toMatchObject({ answer: "final_order: wrong", score: 0, maxScore: 1 });
  expect(staged?.canRecordExposure).toBe(false);
  expect(stagedId).toBeTruthy();

  const workedActivityId = await db.insert("activities", {
    stableActivityId: "math.im2.skill.1.4.order-triangle-angles-from-side-lengths.worked_example",
    componentKey: "im2-question",
    masteryNodeId: "math.im2.skill.1.4.order-triangle-angles-from-side-lengths",
    learningEvidenceMode: "worked_example",
    generatorSeed: 6,
    generatorDifficulty: 1,
    approval: { status: "approved" },
  });
  const receipt = await submitBoundedPracticeHandler(ctx, {
    userId: studentId,
    activityId: workedActivityId,
    idempotencyKey: "worked",
    answers: {},
    hintsUsed: 0,
    revealStepsSeen: 0,
  } as never, {
    nodes: [{
      id: "math.im2.skill.1.4.order-triangle-angles-from-side-lengths",
      kind: "skill",
      reviewStatus: "approved",
    }],
    blueprints: [{
      nodeId: "math.im2.skill.1.4.order-triangle-angles-from-side-lengths",
      reviewStatus: "approved",
    }],
  });
  const worked = (await read()).submissions.find((row) => row.id === receipt.submissionId);
  expect(worked).toMatchObject({ id: receipt.submissionId, answer: "", score: 0, maxScore: 1, canRecordExposure: false });
});

it.each([
  [triangleNodeIds.angles, 8],
  [triangleNodeIds.sides, 9],
] as const)("offers teacher confirmation only for the final %s Guided row", async (node, seed) => {
  const { db, ctx } = database();
  const teacherId = await db.insert("profiles", { role: "teacher", organizationId: "org", username: "teacher" });
  const studentId = await db.insert("profiles", { role: "student", organizationId: "org", username: "student" });
  await db.insert("auth_credentials", { profileId: teacherId, isActive: true, role: "teacher", organizationId: "org", username: "teacher" });
  await db.insert("auth_credentials", { profileId: studentId, isActive: true, role: "student", organizationId: "org", username: "student" });
  const classId = await db.insert("classes", { teacherId, archived: false });
  await db.insert("class_enrollments", { classId, studentId, status: "active", enrolledAt: 0 });
  const lessonId = await db.insert("lessons", { slug: "module-1-lesson-4" });
  await db.insert("class_lessons", { classId, lessonId, assignedAt: 0 });
  const activityId = await db.insert("activities", {
    stableActivityId: `${node}.guided_practice`, masteryNodeId: node,
    learningEvidenceMode: "guided_practice", componentKey: "im2-question",
    generatorSeed: seed, generatorDifficulty: 1, approval: { status: "approved" },
  });
  const publication = {
    nodes: [{ id: node, kind: "skill", reviewStatus: "approved" }],
    blueprints: [{ nodeId: node, reviewStatus: "approved" }],
  };
  await submitTriangleHandler(ctx, {
    userId: studentId, activityId, idempotencyKey: "one",
    answers: { measure_order: "choice-1" }, hintsUsed: 0, revealStepsSeen: 0,
  } as never, publication);
  await submitTriangleHandler(ctx, {
    userId: studentId, activityId, idempotencyKey: "two",
    answers: { measure_order: "choice-1", opposite_correspondence: "choice-1" }, hintsUsed: 0, revealStepsSeen: 0,
  } as never, publication);
  const beforeFinal = await invoke<unknown, { submissions: Array<{ canRecordExposure: boolean }> }>(getStudentEvidence, ctx, { teacherId, classId, studentId });
  expect(beforeFinal.submissions.every((row) => !row.canRecordExposure)).toBe(true);
  const final = await submitTriangleHandler(ctx, {
    userId: studentId, activityId, idempotencyKey: "three",
    answers: { measure_order: "choice-1", opposite_correspondence: "choice-1", final_order: "choice-1" }, hintsUsed: 0, revealStepsSeen: 0,
  } as never, publication);
  const projected = await invoke<unknown, { submissions: Array<{ id: string; canRecordExposure: boolean }> }>(getStudentEvidence, ctx, { teacherId, classId, studentId });
  expect(projected.submissions.filter((row) => row.canRecordExposure).map((row) => row.id)).toEqual([final.submissionId]);
});
