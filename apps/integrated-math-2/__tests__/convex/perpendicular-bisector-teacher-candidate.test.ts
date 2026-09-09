import { expect, it, vi } from "vitest";
import { database, invoke } from "../helpers/database";

vi.mock("@/convex/activities", () => ({ isPilotPublished: () => true }));
import { getStudentEvidence } from "@/convex/teacher";

const stableActivityId = "math.im2.skill.1.1.perpendicular-bisector-equidistance.guided_practice";

it("hides the teacher action for a source with an invalid component contract", async () => {
  const { db, ctx } = database();
  const teacherId = await db.insert("profiles", { role: "teacher", organizationId: "org", username: "teacher" });
  const studentId = await db.insert("profiles", { role: "student", organizationId: "org", username: "student" });
  await db.insert("auth_credentials", { profileId: teacherId, isActive: true, role: "teacher", organizationId: "org", username: "teacher" });
  const classId = await db.insert("classes", { teacherId, archived: false });
  await db.insert("class_enrollments", { classId, studentId, status: "active", enrolledAt: 10 });
  const lessonId = await db.insert("lessons", { slug: "module-1-lesson-1" });
  await db.insert("class_lessons", { classId, lessonId, assignedAt: 20 });
  const activityId = await db.insert("activities", { stableActivityId, componentKey: "wrong-component", masteryNodeId: "wrong-node", learningEvidenceMode: "worked_example", approval: { status: "approved" } });
  const submissionId = await db.insert("activity_submissions", { userId: studentId, activityId, lessonId, submissionData: { rawResponse: "4" }, score: 1, maxScore: 1, gradedAt: 30, submittedAt: 30 });

  const read = () => invoke<unknown, { submissions: Array<{ answer: string; canRecordExposure: boolean }> }>(getStudentEvidence, ctx, { teacherId, classId, studentId });
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
});
