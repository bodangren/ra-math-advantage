import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import katex from "katex";
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

it("does not leave TeX expressions in unsupported square-bracket delimiters", () => {
  for (const lesson of lessons) {
    for (const phase of lesson.phases) {
      expect(phase.markdown, lesson.slug).not.toMatch(/\[\s*\n\s*\\(?:frac|sqrt|sin|cos|tan|cdot|pi|theta)\b/);
      expect(phase.markdown, lesson.slug).not.toMatch(
        /(?<!!)\[[^\]\n]*\\(?:frac|sqrt|sin|cos|tan|left|cdot|pi|theta|neq)\b[^\]\n]*\](?!\()/,
      );
    }
  }
});

it("renders every marked math expression without a KaTeX error", () => {
  for (const lesson of lessons)
    for (const phase of lesson.phases) {
      const tree = unified()
        .use(remarkParse)
        .use(remarkMath)
        .parse(phase.markdown);
      const visit = (node: {
        type: string;
        value?: string;
        children?: typeof tree.children;
      }) => {
        if (node.type === "math" || node.type === "inlineMath")
          expect(
            () =>
              katex.renderToString(node.value!, {
                throwOnError: true,
                strict: "ignore",
              }),
            `${lesson.slug}: ${phase.title}`,
          ).not.toThrow();
        node.children?.forEach(visit);
      };
      visit(tree);
    }
});
