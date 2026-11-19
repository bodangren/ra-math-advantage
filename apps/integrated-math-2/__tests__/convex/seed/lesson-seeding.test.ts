// @vitest-environment node
import { expect, it } from "vitest";
import { database, invoke } from "../../helpers/database";
const counts = [7, 6, 6, 8, 8, 9, 8, 7, 9, 7, 7, 9, 5];
it("seeds all 96 source lessons without local filesystem access and replays without duplicate rows", async () => {
  const t = database();
  for (let n = 1; n <= 13; n++) {
    const seedModule = await import(`../../../convex/seed/seed_module_${n}_lessons.ts`);
    const fn = seedModule[`seedModule${n}Lessons`];
    await invoke(fn, t.ctx, {});
    expect(t.tables.lessons.filter((l) => l.unitNumber === n)).toHaveLength(counts[n - 1]);
  }
  const before = Object.fromEntries(
    Object.entries(t.tables).map(([key, rows]) => [key, rows.length]),
  );
  for (let n = 1; n <= 13; n++) {
    const seedModule = await import(`../../../convex/seed/seed_module_${n}_lessons.ts`);
    await invoke(seedModule[`seedModule${n}Lessons`], t.ctx, {});
  }
  expect(
    Object.fromEntries(Object.entries(t.tables).map(([key, rows]) => [key, rows.length])),
  ).toEqual(before);
  expect(t.tables.lessons).toHaveLength(96);
  expect(t.tables.activities).toHaveLength(96);
  expect(
    t.tables.phase_sections.filter((section) => section.sectionType === "activity"),
  ).toHaveLength(96);
});
it("creates an editable revision after publication without changing published content", async () => {
  const t = database();
  const seed = await import("../../../convex/seed/seed_module_1_lessons");
  await invoke(seed.seedModule1Lessons, t.ctx, {});
  const published = t.tables.lesson_versions[0];
  published.status = "published";
  const oldPhases = t.tables.phase_versions
    .filter((p) => p.lessonVersionId === published._id)
    .map((p) => p._id);
  const oldSections = JSON.stringify(
    t.tables.phase_sections.filter((s) => oldPhases.some((id) => id === s.phaseVersionId)),
  );
  await invoke(seed.seedModule1Lessons, t.ctx, {});
  const revisions = t.tables.lesson_versions.filter((v) => v.lessonId === published.lessonId);
  expect(revisions).toHaveLength(2);
  expect(revisions.find((v) => v.status === "draft")).toMatchObject({
    version: 3,
  });
  expect(
    JSON.stringify(
      t.tables.phase_sections.filter((s) => oldPhases.some((id) => id === s.phaseVersionId)),
    ),
  ).toBe(oldSections);
  await invoke(seed.seedModule1Lessons, t.ctx, {});
  expect(t.tables.lesson_versions.filter((v) => v.lessonId === published.lessonId)).toHaveLength(2);
});
it("removes obsolete draft sections and phases during source replay", async () => {
  const t = database();
  const seed = await import("../../../convex/seed/seed_module_1_lessons");
  await invoke(seed.seedModule1Lessons, t.ctx, {});
  const version = t.tables.lesson_versions[0];
  const first = t.tables.phase_versions.find((p) => p.lessonVersionId === version._id)!;
  const section = t.tables.phase_sections.find((s) => s.phaseVersionId === first._id)!;
  section.sectionType = "activity";
  section.content = { activityId: t.tables.activities[0]._id };
  const extraSection = await t.db.insert("phase_sections", {
    phaseVersionId: first._id,
    sequenceOrder: 2,
    sectionType: "text",
    content: { markdown: "Obsolete draft text" },
  });
  const extraPhase = await t.db.insert("phase_versions", {
    lessonVersionId: version._id,
    phaseNumber: 99,
    title: "Obsolete draft phase",
  });
  const extraPhaseSection = await t.db.insert("phase_sections", {
    phaseVersionId: extraPhase,
    sequenceOrder: 1,
    sectionType: "text",
    content: { markdown: "Obsolete" },
  });
  await invoke(seed.seedModule1Lessons, t.ctx, {});
  expect(await t.db.get(section._id)).toMatchObject({ sectionType: "text" });
  expect(await t.db.get(extraSection)).toBeNull();
  expect(await t.db.get(extraPhaseSection)).toBeNull();
  expect(await t.db.get(extraPhase)).toBeNull();
});
it("does not rewrite a draft phase that already has student evidence", async () => {
  const t = database();
  const seed = await import("../../../convex/seed/seed_module_1_lessons");
  await invoke(seed.seedModule1Lessons, t.ctx, {});
  const phase = t.tables.phase_versions[0];
  const section = t.tables.phase_sections.find((s) => s.phaseVersionId === phase._id)!;
  section.content = { markdown: "Content attached to saved evidence" };
  await t.db.insert("student_progress", {
    userId: "legacy-student",
    phaseId: phase._id,
    status: "completed",
  });
  await expect(invoke(seed.seedModule1Lessons, t.ctx, {})).rejects.toThrow("draft_has_evidence");
  expect(section.content).toEqual({
    markdown: "Content attached to saved evidence",
  });
});

it.each(["activity_submissions", "activity_completions", "student_spreadsheet_responses"])(
  "preserves draft activity content referenced by %s",
  async (table) => {
    const t = database();
    const seed = await import("../../../convex/seed/seed_module_1_lessons");
    await invoke(seed.seedModule1Lessons, t.ctx, {});
    const activity = t.tables.activities[0];
    activity.props = { savedContent: "Must remain attached to evidence" };
    await t.db.insert(table, { activityId: activity._id });
    await expect(invoke(seed.seedModule1Lessons, t.ctx, {})).rejects.toThrow("draft_has_evidence");
    expect(activity.props).toEqual({
      savedContent: "Must remain attached to evidence",
    });
  },
);
