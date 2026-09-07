// @vitest-environment node
import { expect, it } from "vitest";
import { database, invoke } from "../../helpers/database";
const counts = [7, 6, 6, 8, 8, 9, 8, 7, 9, 7, 7, 9, 5];
it("seeds all 96 source lessons without local filesystem access and replays without duplicate rows", async () => {
  const t = database();
  for (let n = 1; n <= 13; n++) {
    const seedModule = await import(
      `../../../convex/seed/seed_module_${n}_lessons.ts`
    );
    const fn = seedModule[`seedModule${n}Lessons`];
    await invoke(fn, t.ctx, {});
    expect(t.tables.lessons.filter((l) => l.unitNumber === n)).toHaveLength(
      counts[n - 1],
    );
  }
  const before = Object.fromEntries(
    Object.entries(t.tables).map(([key, rows]) => [key, rows.length]),
  );
  for (let n = 1; n <= 13; n++) {
    const seedModule = await import(
      `../../../convex/seed/seed_module_${n}_lessons.ts`
    );
    await invoke(seedModule[`seedModule${n}Lessons`], t.ctx, {});
  }
  expect(
    Object.fromEntries(
      Object.entries(t.tables).map(([key, rows]) => [key, rows.length]),
    ),
  ).toEqual(before);
  expect(t.tables.lessons).toHaveLength(96);
  expect(t.tables.activities).toHaveLength(96);
  expect(
    t.tables.phase_sections.filter(
      (section) => section.sectionType === "activity",
    ),
  ).toHaveLength(96);
});
it('creates an editable revision after publication without changing published content',async()=>{
 const t=database();const seed=await import('../../../convex/seed/seed_module_1_lessons');
 await invoke(seed.seedModule1Lessons,t.ctx,{});
 const published=t.tables.lesson_versions[0];published.status='published';
 const oldPhases=t.tables.phase_versions.filter(p=>p.lessonVersionId===published._id).map(p=>p._id);
 const oldSections=JSON.stringify(t.tables.phase_sections.filter(s=>oldPhases.some(id=>id===s.phaseVersionId)));
 await invoke(seed.seedModule1Lessons,t.ctx,{});
 const revisions=t.tables.lesson_versions.filter(v=>v.lessonId===published.lessonId);
 expect(revisions).toHaveLength(2);expect(revisions.find(v=>v.status==='draft')).toMatchObject({version:3});
 expect(JSON.stringify(t.tables.phase_sections.filter(s=>oldPhases.some(id=>id===s.phaseVersionId)))).toBe(oldSections);
 await invoke(seed.seedModule1Lessons,t.ctx,{});expect(t.tables.lesson_versions.filter(v=>v.lessonId===published.lessonId)).toHaveLength(2);
});
