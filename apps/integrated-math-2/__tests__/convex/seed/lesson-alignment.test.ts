// @vitest-environment node
import { it, expect } from "vitest";
import { database, invoke } from "../../helpers/database";
import { seedStandards } from "../../../convex/seed/seed_standards";
import { seedModule2LessonStandards } from "../../../convex/seed/seed_im2_module_2_standards";
import { seedModule4LessonStandards } from "../../../convex/seed/seed_im2_module_4_standards";
import { seedModule5LessonStandards } from "../../../convex/seed/seed_im2_module_5_standards";
import { seedModule6LessonStandards } from "../../../convex/seed/seed_im2_module_6_standards";
import { seedModule7LessonStandards } from "../../../convex/seed/seed_im2_module_7_standards";
import { seedModule9LessonStandards } from "../../../convex/seed/seed_im2_module_9_standards";
import { seedModule11LessonStandards } from "../../../convex/seed/seed_im2_module_11_standards";
import lessons from "../../../curriculum/lessons.json";
it("seeds relevant foundation and topic links instead of unrelated standards", async () => {
  const t = database();
  const revisions = new Map<string, string>();
  for (const lesson of lessons) {
    const lessonId = await t.db.insert("lessons", { slug: lesson.slug });
    revisions.set(lesson.slug, await t.db.insert("lesson_versions", { lessonId, status: "draft", version: 2 }));
  }
  await invoke(seedStandards, t.ctx, {});
  for (const seed of [seedModule2LessonStandards, seedModule4LessonStandards, seedModule5LessonStandards, seedModule6LessonStandards, seedModule7LessonStandards, seedModule9LessonStandards, seedModule11LessonStandards]) await invoke(seed, t.ctx, {});
  const expected: Record<string, string[]> = {
    "2-3": ["G-GPE.B.4", "G-CO.C.11"], "4-3": ["8.G.B.8", "8.G.B.7"],
    "5-1": ["7.G.B.4"], "5-3": ["G-C.A.2"], "5-5": ["G-C.A.2"], "5-6": ["G-C.A.2"],
    "6-1": ["7.G.B.6", "G-MG.A.1"], "6-2": ["7.G.B.6", "G-SRT.C.8"], "6-4": ["7.G.B.6"],
    "6-6": ["G-GMD.A.3"], "6-7": ["G-GMD.A.3"], "7-2": ["S-CP.A.1", "S-CP.B.7"],
    "9-8": ["A-REI.C.6"], "11-4": ["A-APR.C.4", "A-APR.A.1"],
  };
  for (const [key, codes] of Object.entries(expected)) {
    const [unit, number] = key.split("-");
    const version = revisions.get(`module-${unit}-lesson-${number}`);
    const actual = t.tables.lesson_standards.filter((row) => row.lessonVersionId === version).map((row) => t.tables.competency_standards.find((standard) => standard._id === row.standardId)?.code);
    expect(actual.sort(), key).toEqual(codes.sort());
  }
});
