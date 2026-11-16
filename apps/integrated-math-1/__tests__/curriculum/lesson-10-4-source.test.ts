import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const app = resolve(import.meta.dirname, "../..");
const lesson = readFileSync(
  resolve(app, "curriculum/modules/module-10-lesson-4"),
  "utf8",
);
const source = resolve(
  app,
  "curriculum/source-materials/practice-worksheet-student-bundle/Int1_1004_practice.docx",
);

describe("Lesson 10-4 exact source", () => {
  it("preserves all headings and 54 numbered prompts", () => {
    expect(lesson).toContain("# Distance ⸱ Practice");
    for (const heading of [
      "Example 1",
      "Example 2",
      "Example 3",
      "Example 4",
      "Mixed Exercises",
    ])
      expect(lesson).toContain(`## ${heading}`);
    for (let number = 1; number <= 54; number += 1)
      expect(lesson).toContain(`### Problem ${number}\n`);
  });
  it("preserves critical source wording and response boundaries", () => {
    for (const text of [
      "Determine whether the given segments are congruent. Write yes or no.",
      "Round to the nearest tenth, if necessary.",
      "will Mariah have cycled at least $\\frac{2}{3}$ of that distance",
      "Name the point(s) that satisfy the given condition.",
      "explain how to use the Distance Formula to find the y-coordinate of point",
      "Plot points $Y$ and $Z$ on a coordinate plane. Then use the Distance Formula to find $YZ$.",
    ])
      expect(lesson).toContain(text);
    expect(lesson).not.toContain("Answer:");
    expect(lesson).not.toContain("y = 9");
    expect(lesson).not.toContain("150 feet");
  });
  it("describes the corrected native geometry without inferred answers", () => {
    expect(lesson).toContain("endpoint at (2, −4)");
    expect(lesson).toContain(
      "30 feet beyond first base on the extension from home plate through first base",
    );
    expect(lesson).toContain(
      "VO is labeled 2a, OT is labeled 3a, OS is labeled 4a, and OU is labeled a",
    );
    expect(lesson).not.toContain("first-to-second-base direction");
    expect(lesson).not.toContain("V = (−2a, 0)");
    expect(lesson).toContain(String.raw`point $U$ is on $\overline{QR}$`);
    expect(lesson).toContain(String.raw`point $V$ is on $\overline{RS}$`);
    for (const segment of [
      "AB",
      "EF",
      "BD",
      "DF",
      "AC",
      "CD",
      "DE",
      "BE",
      "CF",
      "SV",
      "UX",
      "VT",
      "SU",
      "QR",
      "RS",
      "QU",
      "RV",
    ]) {
      expect(lesson).toContain(`\\overline{${segment}}`);
    }
    expect(lesson).toContain(String.raw`$QR = ST = 4$`);
    expect(lesson).toContain(String.raw`$RS = QT = 2$`);
  });
  it("preserves all 15 native image bytes", () => {
    for (let number = 1; number <= 15; number += 1) {
      const name = `image${number}.png`;
      const native = execFileSync("unzip", [
        "-p",
        source,
        `word/media/${name}`,
      ]);
      const published = readFileSync(
        resolve(app, "public/curriculum/module-10-lesson-4", name),
      );
      expect(published.equals(native)).toBe(true);
      expect(lesson).toContain(`/curriculum/module-10-lesson-4/${name}`);
    }
  });
});
