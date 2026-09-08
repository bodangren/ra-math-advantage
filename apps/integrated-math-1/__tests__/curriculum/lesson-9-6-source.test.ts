import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const app = resolve(import.meta.dirname, "../..");
const lessonPath = resolve(app, "curriculum/modules/module-9-lesson-6");
const sourcePath = resolve(app, "curriculum/source-materials/practice-worksheet-student-bundle/Int1_0906_practice.docx");
const text = readFileSync(lessonPath, "utf8");
const problem = (number: number) => text.split(`### Problem ${number}\n`)[1]?.split(/\n### Problem |\n## /)[0] ?? "";

describe("Lesson 9-6 source restoration", () => {
  it("restores all 33 prompts, subparts, and native headings", () => {
    expect([...text.matchAll(/^### Problem (\d+)$/gm)].map((match) => Number(match[1]))).toEqual(
      Array.from({ length: 33 }, (_, index) => index + 1),
    );
    for (const heading of ["## Example 1", "## Example 2", "## Examples 3 and 4", "## Mixed Exercises"]) {
      expect(text).toContain(heading);
    }
    for (const number of [9, 10, 21, 22, 23, 25, 26, 28]) {
      expect(problem(number)).toContain("a.");
      expect(problem(number)).toContain("b.");
    }
    expect(problem(24)).toContain("c.");
  });

  it("preserves exact transformation data, symbols, and operation order", () => {
    expect(problem(5)).toContain("11, 7, 3, 13, 16, 8, 3, 11, 17, 3; × 4");
    expect(problem(8)).toContain("1, 5, 4, 2, 1, 3, 6, 2, 5, 1; × 6.5");
    expect(problem(15)).toContain("12, 15, 16, 12, 12, 15, 17, 19, 22, 27, 42, 42; + 5");
    expect(problem(16)).toContain("49, 43, 26, 39, 40, 30, 33, 64, 26, 45, 23, 26; × 3, + (–8)");
    expect(problem(19)).toContain("57, 38, 42, 51, 39, 44, 33, 55; + (–7), × 2");
    expect(problem(20)).toContain("55, 50, 58, 52, 56, 57, 50, 55, 50; × 2, + 5");
    expect(problem(23)).toContain("C = (5/9)(F – 32)");
  });

  it("preserves native contexts and accessible data tables", () => {
    for (const value of [
      "the first 17 seasons of the Marlins",
      "64, 51, 67, 80, 92, 54, 64, 79, 76, 79, 91, 83, 83, 78, 71, 84, 87",
      "84, 49, 73, 76, 68, 90, 67, 65, 88, 67, 88, 89, 79, 66, 85, 97, 83",
      "Northville Health Club randomly chooses 8 patrons",
      "| 30 | 20 |\n| 30 | 30 |\n| 45 | 45 |\n| 20 | 45 |\n| 60 | 30 |\n| 30 | 60 |\n| 30 | 50 |\n| 45 | 45 |",
      "211, 123, 183, 176, 224, 115, 109, 136, 152, 177, 127, 196, 143, 166, 170",
      "96, 94, 114, 85, 96, 109, 90, 109, 67, 82, 98, 79, 69, 70, 106, 96, 112, 84",
      "40, 45, 55, 65, 74, 82, 86, 85, 78, 67, 55, 44",
      "109, 99, 121, 137, 131, 141, 77, 83, 139, 92, 42, 133, 98, 153, 124, 102, 113, 117, 112, 128, 107, 147",
      "113, 121, 98, 104, 106, 123, 175, 141, 109, 129, 49, 110, 112, 144, 106, 119, 127, 88, 132, 93, 137, 123",
      "Saeed’s Price Data ($)",
      "| 14.99 | 4.49 | 9.99 |\n| 18.49 | 12.99 | 6.99 |\n| 8.49 | 21.99 | 13.49 |\n| 13.99 | 9.99 | 10.99 |\n| 12.49 | 4.49 | 12.99 |",
      "| 45 | 35 | 37 |\n| 40 | 42 | 40 |\n| 28 | 38 | 31 |",
      "| 26 | 44 | 40 |\n| 27 | 35 | 28 |\n| 26 | 39 | 31 |",
      "| 71 | 69 | 67 |\n| 68 | 69 | 70 |\n| 72 | 74 | 68 |\n| 71 | 69 | 72 |",
      "| 67 | 62 | 69 |\n| 65 | 71 | 66 |\n| 63 | 65 | 68 |\n| 66 | 63 | 70 |",
      "| 5 | 0 |\n| 7 | 6 |\n| 5 | 6 |\n| 6 | 6 |\n| 3 | 2 |",
      "| 4 | 4 |\n| 6 | 5 |\n| 3 | 7 |\n| 4 | 3 |\n| 5 | 7 |",
      "Francisca is planning a two-week vacation",
    ]) expect(text).toContain(value);
  });

  it("references and copies all 10 native figures exactly", () => {
    for (let number = 1; number <= 10; number++) {
      expect(text).toContain(`](/curriculum/module-9-lesson-6/source-image-${number}.png)`);
      const native = execFileSync("unzip", ["-p", sourcePath, `word/media/image${number}.png`]);
      const published = readFileSync(resolve(app, `public/curriculum/module-9-lesson-6/source-image-${number}.png`));
      expect(published.equals(native)).toBe(true);
    }
  });

  it("states the correct negative-multiplier rule without inventing answers", () => {
    expect(text).toContain("Multiply the mean, median, and each mode by k.");
    expect(text).toContain("Multiply the range and standard deviation by |k|.");
    expect(text).not.toContain("scales all measures of center and spread by [ |k| ]");
    expect(text).not.toMatch(/answer key|the answer is/i);
  });
});
