import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const app = resolve(import.meta.dirname, "../..");
const lesson = readFileSync(resolve(app, "curriculum/modules/module-10-lesson-1"), "utf8");
const source = resolve(app, "curriculum/source-materials/practice-worksheet-student-bundle/Int1_1001_practice.docx");
const problem = (number: number) => lesson.split(`### Problem ${number}\n`)[1]?.split(/\n### Problem |\n## /)[0] ?? "";

describe("Lesson 10-1 source restoration", () => {
  it("restores all 23 prompts and native headings", () => {
    expect(lesson).toContain("# The Geometric System ⸱ Practice");
    expect([...lesson.matchAll(/^### Problem (\d+)$/gm)].map((match) => Number(match[1])))
      .toEqual(Array.from({ length: 23 }, (_, index) => index + 1));
    for (const heading of ["## Example 1", "## Example 2", "## Mixed Exercises"])
      expect(lesson).toContain(heading);
    expect(problem(1)).toContain("Use the axioms to make three conclusions");
    expect(problem(2)).toContain("Use the axioms to make four conclusions");
    expect(problem(2)).toContain("customized short sleeve Tshirts, long sleeve T-shirts, and sweatshirts");
    expect(problem(2)).toContain("Short sleeve and long sleeve Tshirts can be made in any color except navy or black");
    expect(problem(3)).toContain("On average, it takes Tom 25 minutes");
    expect(problem(4)).toContain("Use the axioms to make two conclusions");
  });

  it("preserves the complete route and model constraints", () => {
    expect(problem(17)).toContain("Every stop other than Downtown is visited by at most two routes");
    expect(problem(17)).toContain("ROUTE 1: Downtown, King St, Stadium District, State St, Downtown");
    expect(problem(17)).toContain("ROUTE 2: Stadium District, State St, Grace Blvd, Maxwell Ave, Downtown, Stadium District");
    expect(problem(17)).toContain("ROUTE 3: King St, Stadium District, Downtown, Maxwell Ave, Stadium District, King St");
    expect(problem(17)).toContain("Are the following three routes a model for the axiomatic system?");
  });

  it("preserves open responses without an answer key or invented geometry rules", () => {
    expect(problem(11)).toContain("Grilled chicken can be added to any salad for an additional $2.00");
    expect(problem(20)).toContain("Each line contains only these five points");
    expect(problem(21)).toContain("Each pair of distinct points are on exactly one line");
    expect(problem(22)).toContain("he can collect all 40 keys in the game");
    expect(problem(23)).toContain("Using your understanding of analytic and synthetic geometry");
    expect(lesson).not.toMatch(/answer key|matching price identifies|lines must be straight/i);
  });

  it("publishes all 17 native figures with exact bytes and accessible descriptions", () => {
    for (let number = 1; number <= 17; number += 1) {
      const extension = number >= 9 && number <= 11 ? "jpg" : "png";
      expect(lesson).toContain(`](/curriculum/module-10-lesson-1/image${number}.${extension})`);
      const native = execFileSync("unzip", ["-p", source, `word/media/image${number}.${extension}`]);
      const published = readFileSync(resolve(app, `public/curriculum/module-10-lesson-1/image${number}.${extension}`));
      expect(published.equals(native)).toBe(true);
    }
    expect(lesson).toContain("Segments P-Q and P′-Q′");
    expect(problem(8)).toContain("P(-3, -1), Q(0, 6), P′(-3, 3), and Q′(0, 10)");
    expect(lesson).toContain("two straight sides and one curved side");
    expect(lesson).toContain("T(0, 0), V(5, 0), and U(5, 3)");
  });
});
