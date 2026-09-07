// @vitest-environment node
import { it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import lessons from "../../curriculum/lessons.json";
const root = path.resolve(import.meta.dirname, "../../curriculum");
it("uses one 180-period calendar with exact source lesson coverage", () => {
  const calendar = JSON.parse(
    readFileSync(path.join(root, "calendar.json"), "utf8"),
  );
  expect(calendar.periods).toHaveLength(180);
  const counts: Record<string, number> = {};
  const taught = new Set<string>();
  for (const [index, period] of calendar.periods.entries()) {
    expect(period.number).toBe(index + 1);
    counts[period.dayType] = (counts[period.dayType] ?? 0) + 1;
    if (period.dayType === "instruction") {
      const lesson = lessons.find(
        (lesson) => lesson.slug === period.sourceLesson,
      );
      expect(lesson, period.periodId).toBeDefined();
      taught.add(period.sourceLesson);
      expect(period.objective.length).toBeGreaterThan(10);
      expect(period.workedExamples.length).toBeGreaterThan(0);
      expect(period.workedExamples.length).toBeLessThanOrEqual(3);
      for (const title of period.workedExamples)
        expect(lesson?.phases.some((phase) => phase.title === title)).toBe(
          true,
        );
    }
  }
  expect(counts).toEqual({
    instruction: 108,
    mastery: 36,
    jigsaw: 18,
    review: 9,
    test: 9,
  });
  expect([...taught].sort()).toEqual(
    lessons.map((lesson) => lesson.slug).sort(),
  );
});
it("removes the conflicting legacy period packages", () => {
  const names = readdirSync(
    path.join(root, "implementation/class-period-packages"),
  ).filter((name) => name.endsWith(".json"));
  expect(names).toHaveLength(13);
  const all = names.flatMap(
    (name) =>
      JSON.parse(
        readFileSync(
          path.join(root, "implementation/class-period-packages", name),
          "utf8",
        ),
      ).periods,
  );
  expect(all).toHaveLength(180);
  expect(new Set(all.map((period) => period.periodId)).size).toBe(180);
});
