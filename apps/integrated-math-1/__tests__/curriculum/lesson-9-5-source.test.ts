import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const app = resolve(import.meta.dirname, "../..");
const lessonPath = resolve(app, "curriculum/modules/module-9-lesson-5");
const sourcePath = resolve(
  app,
  "curriculum/source-materials/practice-worksheet-student-bundle/Int1_0905_practice.docx",
);
const text = readFileSync(lessonPath, "utf8");
const problem = (number: number) =>
  text.split(`### Problem ${number}\n`)[1]?.split(/\n### Problem |\n## /)[0] ?? "";

describe("Lesson 9-5 source restoration", () => {
  it("restores all 27 prompts, all subparts, and four example headings", () => {
    expect(
      [...text.matchAll(/^### Problem (\d+)$/gm)].map((match) => Number(match[1])),
    ).toEqual(Array.from({ length: 27 }, (_, index) => index + 1));
    for (let number = 1; number <= 4; number++) {
      expect(text).toContain(`## Example ${number}`);
    }
    for (const number of [7, 8, 17, 18, 19, 23]) {
      expect(problem(number)).toContain("a.");
      expect(problem(number)).toContain("b.");
    }
    for (const number of [7, 8, 18, 23]) {
      expect(problem(number)).toContain("c.");
    }
  });

  it("preserves all nine complete 36-value lists", () => {
    for (const values of [
      "55, 65, 70, 73, 25, 36, 33, 47, 52, 54, 55, 60, 45, 39, 48, 55, 46, 38, 50, 54, 63, 31, 49, 54, 68, 35, 27, 45, 53, 62, 47, 41, 50, 76, 67, 49",
      "42, 48, 51, 39, 47, 50, 48, 51, 54, 46, 49, 36, 50, 55, 51, 43, 46, 37, 50, 52, 43, 40, 33, 51, 45, 53, 44, 40, 52, 54, 48, 51, 47, 43, 50, 46",
      "32, 44, 50, 49, 21, 12, 27, 41, 48, 30, 50, 23, 37, 16, 49, 53, 33, 25, 35, 40, 48, 39, 50, 24, 15, 29, 37, 50, 36, 43, 49, 44, 46, 27, 42, 47",
      "82, 86, 74, 90, 70, 81, 89, 88, 75, 72, 69, 91, 96, 82, 80, 78, 74, 94, 85, 77, 80, 67, 76, 84, 80, 83, 88, 92, 87, 79, 84, 96, 85, 73, 82, 83",
      "47, 16, 70, 80, 28, 33, 91, 55, 60, 45, 86, 54, 30, 98, 34, 87, 44, 35, 64, 58, 27, 67, 72, 68, 31, 95, 37, 41, 97, 56, 49, 71, 84, 66, 45, 93",
      "64, 36, 32, 65, 41, 38, 50, 44, 39, 34, 47, 35, 46, 36, 53, 35, 68, 40, 36, 62, 34, 38, 59, 46, 63, 38, 67, 39, 59, 43, 39, 36, 60, 47, 52, 45",
      "14, 71, 63, 42, 24, 76, 34, 77, 37, 69, 54, 64, 47, 74, 59, 43, 76, 56, 78, 52, 18, 54, 39, 28, 56, 74, 68, 36, 20, 49, 67, 47, 69, 68, 72, 69",
      "53, 34, 36, 38, 43, 49, 52, 36, 39, 37, 58, 45, 37, 38, 46, 52, 45, 39, 55, 39, 40, 55, 38, 40, 42, 38, 45, 36, 46, 39, 35, 41, 49, 43, 52, 34",
      "51, 19, 46, 64, 29, 51, 58, 30, 55, 31, 34, 31, 50, 37, 40, 39, 40, 41, 42, 32, 24, 48, 43, 45, 38, 43, 58, 47, 34, 36, 50, 54, 46, 28, 60, 22",
    ]) {
      expect(text).toContain(values);
    }
  });

  it("preserves exact source contexts and names", () => {
    for (const context of [
      "The various prices of a flight from Los Angeles to New York are shown.",
      "Yoshiko tracked her minutes of exercise each day for 10 days as shown.",
      "Daryn recorded the number of laps he walked around the track each week.",
      "Mr. Swatsky’s geometry class’s miniature golf scores are shown below.",
      "Ruth recorded the lengths, in centimeters, of hair of students in her school.",
      "A service station tracks the number of cars they service per day.",
      "The number of miles that Armando drove each week during a 15-week period is shown.",
      "Armando visited four colleges during this period",
      "The table contains data about 10 elevations in the United States.",
      "sample boxes of two brands of pasta",
      "sending astronauts up in the Space Shuttle since 1981",
      "Gerardo live streams with 15 of his friends.",
      "ages of the current Supreme Court Justices in 2017",
    ]) {
      expect(text).toContain(context);
    }
  });

  it("preserves accessible tables for all native data figures", () => {
    for (const value of [
      "| Scores |",
      "36, 38, 38, 39, 40, 42, 44, 46, 46, 47, 48, 48, 50, 52, 52, 53, 54, 55, 56, 56, 56, 60, 57, 58, 63",
      "| Ages of Presidents |",
      "57, 61, 57, 57, 58, 57, 61, 54, 68, 51, 49, 64, 50, 48, 65, 52, 56, 46, 54, 49, 51, 47, 55, 55, 54, 42, 51, 56, 55, 51, 54, 51, 60, 62, 43, 55, 56, 61, 52, 69, 64, 46, 54, 47",
      "40, 47, 37, 42, 46, 31, 50, 41, 17, 43, 36, 45, 21, 43, 45, 23, 49, 50, 48, 26, 42, 46, 35, 52, 27, 51, 31, 44, 35, 27, 46, 39, 33, 50, 45, 50",
      "62, 110, 92, 430, 73, 84, 525, 123, 86, 290, 114, 98, 103, 312, 71",
      "| Mt McKinley, AK | 20,237 |",
      "| Wheeler Peak NM | 13,161 |",
      "| Granite Peak, MT | 12,799 |",
      "2, 2, 8, 7, 5, 5, 6, 6, 10, 8, 7, 6, 8, 8, 3, 7, 7, 7, 8, 7, 4, 7, 7",
      "14, 13, 12, 13, 14, 13, 15, 13, 16, 14, 15, 13, 13, 16, 14, 11, 14, 15, 12, 13, 16, 13",
      "| Neil Gorsuch | 49 |",
      "| John G. Roberts Jr. | 62 |",
    ]) {
      expect(text).toContain(value);
    }
  });

  it("references and describes all 11 native figures", () => {
    for (let number = 1; number <= 11; number++) {
      expect(text).toContain(
        `](/curriculum/module-9-lesson-5/source-image-${number}.png)`,
      );
    }
    expect(text).toContain("Cucina Leonardo");
    expect(text).toContain("Rafaello Pasta");
    expect(text).toContain("upper box plot");
    expect(text).toContain("Box plots i, ii, and iii");
    expect(text).toContain("Histograms A, B, and C");
    expect(problem(18)).toContain("| Mountain | Elevation |");
    expect(problem(18)).not.toContain("Elevation (ft)");
    expect(problem(19)).toContain("horizontal axes run from 200 to 250 grams and from 210 to 260 grams");
    expect(problem(19)).toContain("vertical axes run from 0 to 60");
    expect(problem(19)).toContain("Both smooth curves peak near 225 to 230 grams");
    expect(problem(22)).toContain("The upper median is left of the lower median");
    expect(problem(22)).toContain("larger range and interquartile range");
    expect(problem(22)).toContain("upper plot, the median is closer to the right side of the box");
    expect(problem(24)).toContain("Plot i:");
    expect(problem(24)).toContain("Plot ii:");
    expect(problem(24)).toContain("Plot iii:");
    expect(problem(24)).toContain("A. The bars reach their maximum near the left");
    expect(problem(24)).toContain("B. The bars rise toward the right");
    expect(problem(24)).toContain("C. The bars rise to a central maximum");
    expect(problem(24)).toContain("The histograms are A, B, and C from left to right.");
  });

  it("copies all 11 native image bytes exactly", () => {
    for (let number = 1; number <= 11; number++) {
      const native = execFileSync("unzip", [
        "-p",
        sourcePath,
        `word/media/image${number}.png`,
      ]);
      const published = readFileSync(
        resolve(
          app,
          `public/curriculum/module-9-lesson-5/source-image-${number}.png`,
        ),
      );
      expect(published.equals(native)).toBe(true);
    }
  });

  it("preserves open prompts without answers or invented conventions", () => {
    expect(problem(21)).toContain("Most of his streams have lasted 10-15 days");
    expect(problem(21)).not.toMatch(/mean|median|quartile|standard deviation/i);
    expect(problem(25)).toContain("Research and write a definition");
    expect(problem(26)).toContain("Give an example");
    expect(problem(27)).toContain("Explain why");
    for (const forbidden of [
      "The answer is",
      "Answer key",
      "population standard deviation",
      "sample standard deviation",
      "include the median",
      "exclude the median",
    ]) {
      expect(text).not.toContain(forbidden);
    }
  });
});
