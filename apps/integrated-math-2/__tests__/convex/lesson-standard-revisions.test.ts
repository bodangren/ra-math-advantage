// @vitest-environment node
import { it, expect } from "vitest";
import { seedModule7LessonStandards } from "../../convex/seed/seed_im2_module_7_standards";
import { database, invoke } from "../helpers/database";
it("updates the newest draft standards without changing published revision links", async () => {
  const t = database();
  for (const code of [
    "S-CP.A.1",
    "S-CP.A.2",
    "7.SP.C.5",
    "S-CP.B.9",
    "S-CP.B.6",
    "S-CP.B.7",
    "S-CP.B.8",
    "S-CP.A.3",
    "S-CP.A.4",
  ])
    await t.db.insert("competency_standards", { code });
  let latest = "";
  for (let n = 1; n <= 8; n++) {
    const lessonId = await t.db.insert("lessons", { slug: `module-7-lesson-${n}` });
    const published = await t.db.insert("lesson_versions", {
      lessonId,
      status: "published",
      version: 1,
    });
    await t.db.insert("lesson_standards", {
      lessonVersionId: published,
      standardId: "historical-standard",
      isPrimary: true,
    });
    await t.db.insert("lesson_versions", { lessonId, status: "draft", version: 2 });
    const draft = await t.db.insert("lesson_versions", { lessonId, status: "draft", version: 3 });
    await t.db.insert("lesson_standards", {
      lessonVersionId: draft,
      standardId: "obsolete-standard",
      isPrimary: true,
    });
    if (n === 8) latest = draft;
  }
  await invoke(seedModule7LessonStandards, t.ctx, {});
  await invoke(seedModule7LessonStandards, t.ctx, {});
  expect(
    t.tables.lesson_standards.filter((r) => r.standardId === "historical-standard"),
  ).toHaveLength(8);
  expect(
    t.tables.lesson_standards.filter((r) => r.standardId === "obsolete-standard"),
  ).toHaveLength(0);
  const links = t.tables.lesson_standards.filter((r) => r.lessonVersionId === latest);
  expect(links).toHaveLength(1);
  expect(t.tables.competency_standards.find((r) => r._id === links[0].standardId)?.code).toBe(
    "S-CP.A.4",
  );
});
