// @vitest-environment node
import { it, expect } from "vitest";
import { database, invoke } from "../helpers/database";
import { publishLesson } from "../../convex/publication";
it("rejects an empty draft and malformed practice", async () => {
  const t = database();
  const lessonId = await t.db.insert("lessons", {});
  const versionId = await t.db.insert("lesson_versions", {
    lessonId,
    status: "draft",
    version: 2,
  });
  await expect(invoke(publishLesson, t.ctx, { versionId })).rejects.toThrow();
  const phaseId = await t.db.insert("phase_versions", {
    lessonVersionId: versionId,
    phaseNumber: 1,
  });
  const activityId = await t.db.insert("activities", {
    componentKey: "im2-question",
    props: {},
  });
  await t.db.insert("phase_sections", {
    phaseVersionId: phaseId,
    sequenceOrder: 1,
    sectionType: "activity",
    content: { activityId },
  });
  await expect(invoke(publishLesson, t.ctx, { versionId })).rejects.toThrow();
});
it("publishes valid content, archives the prior revision, and preserves evidence", async () => {
  const t = database();
  const lessonId = await t.db.insert("lessons", {});
  const oldId = await t.db.insert("lesson_versions", {
    lessonId,
    status: "published",
    version: 1,
  });
  const versionId = await t.db.insert("lesson_versions", {
    lessonId,
    status: "draft",
    version: 2,
  });
  const phaseId = await t.db.insert("phase_versions", {
    lessonVersionId: versionId,
    phaseNumber: 1,
  });
  const activityId = await t.db.insert("activities", {
    componentKey: "im2-question",
    props: {
      kind: "numeric",
      prompt: "Find 2 + 3.",
      answer: 5,
      explanation: "2 + 3 = 5.",
    },
  });
  await t.db.insert("phase_sections", {
    phaseVersionId: phaseId,
    sequenceOrder: 1,
    sectionType: "activity",
    content: { activityId },
  });
  for (let n = 0; n < 105; n++)
    await t.db.insert("lesson_versions", {
      lessonId,
      version: n + 3,
      status: "archived",
    });
  const evidenceId = await t.db.insert("activity_submissions", { score: 1 });
  await invoke(publishLesson, t.ctx, { versionId });
  await invoke(publishLesson, t.ctx, { versionId });
  expect(await t.db.get(versionId)).toMatchObject({ status: "published" });
  expect(await t.db.get(oldId)).toMatchObject({ status: "archived" });
  expect(await t.db.get(evidenceId)).toMatchObject({ score: 1 });
});
