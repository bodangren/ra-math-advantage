// @vitest-environment node
import { it, expect } from "vitest";
import { getCurriculum } from "../../convex/public";
import { database, invoke } from "../helpers/database";
it("uses unit metadata and includes only published lesson versions", async () => {
  const t = database();
  const a = await t.db.insert("lessons", {
    unitNumber: 1,
    slug: "module-1-lesson-1",
    title: "Perpendicular Bisectors",
    orderIndex: 1,
  });
  const b = await t.db.insert("lessons", {
    unitNumber: 1,
    slug: "module-1-lesson-2",
    title: "Angle Bisectors",
    orderIndex: 2,
  });
  await t.db.insert("lesson_versions", {
    lessonId: a,
    status: "published",
    version: 1,
  });
  await t.db.insert("lesson_versions", {
    lessonId: b,
    status: "draft",
    version: 2,
  });
  const result = await invoke<
    Record<string, never>,
    Array<{ title: string; lessons: Array<{ slug: string }> }>
  >(getCurriculum, t.ctx, {});
  expect(result).toHaveLength(1);
  expect(result[0].title).toBe("Relationships in Triangles");
  expect(result[0].lessons.map((l) => l.slug)).toEqual(["module-1-lesson-1"]);
});
