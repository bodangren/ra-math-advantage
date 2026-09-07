// @vitest-environment node
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import lessons from "../../curriculum/lessons.json";
it("uses supported math delimiters in the exponent lesson", () => {
  const source = readFileSync(
    path.resolve(
      import.meta.dirname,
      "../../curriculum/modules/module-10-lesson-1",
    ),
    "utf8",
  );
  expect(source).not.toMatch(/^\[\s*$/m);
  expect(source).not.toContain("[a^m");
  expect(source).toContain("$a^m \\cdot a^n = a^{m+n}$");
});
it("does not repeat the phase title in its body", () => {
  for (const lesson of lessons)
    for (const phase of lesson.phases)
      expect(
        phase.markdown.startsWith(`## ${phase.title}\n`),
        lesson.slug,
      ).toBe(false);
});
