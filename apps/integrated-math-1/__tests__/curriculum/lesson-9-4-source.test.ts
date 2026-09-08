import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
const app = resolve(import.meta.dirname, "../..");
const text = readFileSync(
  resolve(app, "curriculum/modules/module-9-lesson-4"),
  "utf8",
);
const problem = (n: number) =>
  text.split(`### Problem ${n}\n`)[1]?.split(/\n### Problem |\n## /)[0] ?? "";
describe("Lesson 9-4 source restoration", () => {
  it("restores all 30 prompts and four headings", () => {
    expect(
      [...text.matchAll(/^### Problem (\d+)$/gm)].map((m) => Number(m[1])),
    ).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    for (let i = 1; i <= 4; i++) expect(text).toContain(`## Example ${i}`);
  });
  it("preserves complete source arrays", () => {
    for (const v of [
      "12, 27, 43, 52, 43, 18, 45, 53, 26",
      "| 30 | 35 | 25 | 28 | 40 | 38 |\n| 36 | 29 | 34 | 45 | 42 | 39 |",
      "36.1, 35.8, 35.2, 36.5, 36.0, 36.2, 35.7, 35.8, 35.9, 36.4, 35.6",
      "108, 88, 119, 75, 96, 88, 100, 99, 125, 81",
      "67, 62, 65, 38, 69, 67, 59, 41, 43, 36, 45, 22, 69, 68, 18, 15, 9, 60, 64",
      "6, 8, 8.5, 10, 12, 6.5, 7, 8, 8.5, 7.5, 9, 11.5, 10, 13, 5.5, 6.5, 5, 9.5",
    ])
      expect(text).toContain(v);
  });
  it("preserves compound tasks and authentic conditions", () => {
    expect(problem(23)).toContain("a. Determine the five-number summary");
    expect(problem(23)).toContain("b. Draw a box plot");
    expect(text).toContain(
      "Find the range, five number summary, interquartile range, and standard deviation for each data set. Then draw a box plot of the data.",
    );
    expect(problem(29)).toContain(
      "collect data about your question from 8 classmates",
    );
    expect(problem(29)).toContain("Then draw a box plot");
  });
  it("gives accessible text for all three figures", () => {
    expect(problem(5)).toContain("Number of Minutes of Exercise");
    expect(problem(22)).toContain("2006 | 31");
    expect(problem(22)).toContain("2010 | 162");
    expect(problem(27)).toContain(
      "Jennifer: “Remove the outliers from the data set.”",
    );
    expect(problem(27)).toContain(
      "Megan: “Add data values to the data set that are equal to the mean.”",
    );
  });
  it("preserves the complete source contexts", () => {
    for (const context of [
      "Kent tracked his daily number of minutes of exercise.",
      "prices in dollars of smartphones:",
      "attendance at an event for the last nine years:",
      "books a student checks out of the library:",
      "ounces of soda dispensed into 36-ounce cups:",
      "ages of riders on a roller coaster:",
      "A nurse tracked the heart rates of several patients.",
      "He counts the number of cars parked on Main Street each weekday:",
      "A hockey team keeps track of how many goals it scores each game:",
      "a running back had over a number of years.",
      "The manager at a movie theater kept track of the age of each person in a matinee movie:",
      "Renee is planning a road trip to her aunt’s house.",
      "Jorja collected the following number of seashells for the last nine trips to the beach:",
      "shoe sizes of students at a high school were randomly recorded for one hour:",
      "Is either correct? Explain your reasoning.",
      "is sometimes, always, or never true. Justify your argument.",
      "Write your own survey question and collect data about your question from 8 classmates.",
      "around the median of the data?",
    ])
      expect(text).toContain(context);
  });
  it("preserves convention and reasoning prompts without answers", () => {
    expect(problem(21)).toContain("Find and interpret the standard deviation");
    expect(problem(28)).toContain(
      "Two random samples taken from the same population",
    );
    expect(problem(30)).toContain("clusters around the median");
    for (const v of [
      "The answer is",
      "Answer key",
      "population standard deviation",
      "sample standard deviation",
    ])
      expect(text).not.toContain(v);
  });
  it("uses all three original assets", () => {
    for (let i = 1; i <= 3; i++)
      expect(
        readFileSync(
          resolve(
            app,
            `public/curriculum/module-9-lesson-4/source-image-${i}.png`,
          ),
        ).length,
      ).toBeGreaterThan(500);
  });
});
