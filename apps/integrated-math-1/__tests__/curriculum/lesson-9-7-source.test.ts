import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const app = resolve(import.meta.dirname, "../..");
const lesson = readFileSync(resolve(app, "curriculum/modules/module-9-lesson-7"), "utf8");
const source = resolve(app, "curriculum/source-materials/practice-worksheet-student-bundle/Int1_0907_practice.docx");
const problem = (number: number) => lesson.split(`### Problem ${number}\n`)[1]?.split(/\n### Problem |\n## /)[0] ?? "";

describe("Lesson 9-7 source restoration", () => {
  it("restores all 38 prompts, subparts, and native headings", () => {
    expect([...lesson.matchAll(/^### Problem (\d+)$/gm)].map((match) => Number(match[1])))
      .toEqual(Array.from({ length: 38 }, (_, index) => index + 1));
    for (const heading of ["## Example 1", "## Example 2", "## Example 3", "## Mixed Exercises"])
      expect(lesson).toContain(heading);
    expect(problem(10)).toContain("How is this different");
    expect(problem(29)).toContain("Complete the table");
    expect(problem(38)).toContain("Magdalena claims");
    expect(problem(38)).toContain("Ben claims");
  });

  it("preserves the exact verbal totals and percentage clues", () => {
    expect(lesson).toContain("125 snow cones in all");
    expect(lesson).toContain("40% were large snow cones, 32% were grape, and 12% were small watermelon");
    expect(lesson).toContain("145 male students");
    expect(lesson).toContain("Out of 139 female students, 89");
    expect(lesson).toContain("a total of 40 birds");
    expect(lesson).toContain("45% were male, 37.5% were cardinals, and 12.5% were male tree swallows");
    expect(lesson).toContain("There are 215 vehicles in the lot");
    expect(lesson).not.toMatch(/90\.3 vehicles|exact integer counts/i);
  });

  it("preserves every native table value, label, and blank input", () => {
    for (const value of [
      "| Spanish | 18 | 20 | 38 |\n| French | 16 | 12 | 28 |\n| German | 6 | 8 | 14 |\n| Total | 40 | 40 | 80 |",
      "| Exam | 12 | 5 | 17 |\n| Shots | 6 | 3 | 9 |\n| Grooming | 7 | 2 | 9 |\n| Total | 25 | 10 | 35 |",
      "| Freshmen | 48 | 60 | 108 |\n| Sophomores | 60 | 72 | 132 |\n| Juniors | 51 | 69 | 120 |\n| Seniors | 57 | 63 | 120 |\n| Total | 216 | 264 | 480 |",
      "School Mascot Vote Results",
      "| Panthers | 30 | 36 | 66 |\n| Hornets | 17 | 33 | 50 |\n| Lions | 28 | 31 | 59 |\n| Total | 75 | 100 | 175 |",
      "| West | 77 | 4 | 13 |  |\n| Midwest | 32 |  | 54 |  |\n| South |  | 63 | 24 |  |\n| Northeast | 92 | 2 |  |  |\n| Total | 213 | 75 | 117 |  |",
      "| Vehicle Type | 2WD | AWD | Totals |",
      "| Hatchbacks | 42% | 4% |  |\n| Sedans | 28% | 6% |  |\n| SUVs | 1% | 19% |  |\n| Total |  |  | 215 |",
      "$1.75–$3.24 per gallon",
      "$3.25–$4.74 per gallon",
      "| Less than 250 miles | 109 | 255 | 364 |\n| More than 250 miles | 329 | 86 | 415 |\n| No vacation travel | 34 | 187 | 221 |\n| Total | 472 | 528 | 1000 |",
      "Favorite Snack Vote Results",
      "| Fruit Snack | 65 | 61 | 126 |\n| Granola | 27 | 21 | 48 |\n| Yogurt | 21 | 18 | 39 |\n| Total | 113 | 100 | 213 |",
    ]) expect(lesson).toContain(value);
    expect(lesson).not.toContain("Exactly 250 miles");
  });

  it("references and copies all eight native figures exactly", () => {
    for (let number = 1; number <= 8; number += 1) {
      expect(lesson).toContain(`](/curriculum/module-9-lesson-7/image${number}.png)`);
      const native = execFileSync("unzip", ["-p", source, `word/media/image${number}.png`]);
      const published = readFileSync(resolve(app, `public/curriculum/module-9-lesson-7/image${number}.png`));
      expect(published.equals(native)).toBe(true);
    }
  });

  it("does not publish completed source inputs or an answer key", () => {
    expect(lesson).not.toMatch(/answer key|the answer is/i);
    expect(problem(33)).toContain("Construct a table to show the joint and marginal frequencies");
    expect(problem(33)).not.toMatch(/round|approximately|90\.3/);
  });
});
