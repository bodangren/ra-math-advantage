// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import lessons from "../../curriculum/lessons.json";
const root = path.resolve(import.meta.dirname, "../..");
const source = path.join(root, "curriculum/modules");
const sourceFiles = readdirSync(source).filter((name) =>
  /^module-\d+-lesson-\d+$/.test(name),
);
function markdown(slug: string) {
  const file = path.join(source, slug);
  return readFileSync(
    statSync(file).isDirectory() ? path.join(file, "index.md") : file,
    "utf8",
  );
}
describe("current source curriculum", () => {
  it("checks every source lesson and requires exact bundle coverage", () => {
    expect(sourceFiles).toHaveLength(96);
    expect(lessons.map((lesson) => lesson.slug).sort()).toEqual(
      [...sourceFiles].sort(),
    );
    expect(new Set(lessons.map((lesson) => lesson.slug)).size).toBe(
      lessons.length,
    );
  });
  it("gives explicit problems and solutions for every worked example", () => {
    const examples = lessons.flatMap((lesson) => lesson.phases.filter((phase) => phase.phaseType === "worked_example"));
    expect(examples).toHaveLength(403);
    for (const example of examples) {
      expect(example.markdown, example.title).toMatch(/^### Problem$/m);
      expect(example.markdown, example.title).toMatch(/^### Solution$/m);
    }
  });
  it.each(sourceFiles)(
    "%s has goals, examples, valid phases, and accessible local images",
    (slug) => {
      const content = markdown(slug);
      const lesson = lessons.find((lesson) => lesson.slug === slug)!;
      expect(content).toMatch(/Goals/);
      expect(content).toMatch(/Example/);
      expect(lesson.phases.length).toBeGreaterThan(0);
      expect(lesson.phases.map((phase) => phase.phaseNumber)).toEqual(
        lesson.phases.map((_, index) => index + 1),
      );
      for (const match of content.matchAll(/!\[[^\]]*\]\(([^\s)]+)/g)) {
        expect(match[1]).toMatch(/^\/curriculum\//);
        expect(existsSync(path.join(root, "public", match[1]))).toBe(true);
      }
      const [unit, number] = slug.match(/\d+/g)!;
      expect(
        existsSync(
          path.join(
            root,
            "public/curriculum/worksheets",
            `Int2_${unit.padStart(2, "0")}${number.padStart(2, "0")}_practice.pdf`,
          ),
        ),
      ).toBe(true);
    },
  );
});
