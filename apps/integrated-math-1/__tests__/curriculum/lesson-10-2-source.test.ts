import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const app = resolve(import.meta.dirname, "../..");
const lesson = readFileSync(resolve(app, "curriculum/modules/module-10-lesson-2"), "utf8");
const source = resolve(app, "curriculum/source-materials/practice-worksheet-student-bundle/Int1_1002_practice.docx");

describe("Lesson 10-2 exact source", () => {
  it("preserves all source groups, numbered prompts, and explicit subparts", () => {
    expect(lesson).toContain("# Points, Lines, and Planes ⸱ Practice");
    for (const heading of ["Example 1", "Example 2", "Example 3", "Example 4", "Example 5", "Mixed Exercises"]) {
      expect(lesson).toContain(`## ${heading}`);
    }
    for (let number = 1; number <= 50; number += 1) {
      expect(lesson).toContain(`### Problem ${number}\n`);
    }
    expect(lesson).toContain("a. Where do the receding lines and horizon lines intersect?");
    expect(lesson).toContain("b. Identify examples of planes within this picture.");
    expect(lesson).toContain("**WRITE** A finite plane is a plane that has boundaries, or does not extend indefinitely.");
  });

  it("preserves critical notation and source conditions", () => {
    expect(lesson).toContain("Does line 𝓃 intersect line 𝓆? Explain.");
    expect(lesson).toContain("Name a point contained in line 𝓃.");
    expect(lesson).toContain("line 𝓋 does not intersect either one");
    expect(lesson).toContain("does not contain point H");
    expect(lesson).toContain("greatest number of planes determined using any three");
    expect(lesson).toContain("Segments form upper triangle F-E-D-F");
    expect(lesson).toContain("Segments A-B and B-C are visible, and segment A-C is dashed");
    expect(lesson).toContain("Segments F-A, E-B, and D-C connect the two triangles");
    expect(lesson).toContain("Visible segments connect A-B, A-G, A-H, B-H, G-F, H-F, B-C, H-D, F-E, C-D, and D-E");
    expect(lesson).toContain("vertical building faces and side faces bounded by vertical and receding lines");
    expect(lesson).toContain("flat ground surface below the buildings");
    expect(lesson).not.toContain("A vertical plane and plane W intersect in line AB");
    expect(lesson).not.toContain("The vertical plane contains F, E, D, and B");
    expect(lesson).not.toContain("Answer:");
  });

  it("preserves all fourteen native image bytes", () => {
    for (let number = 1; number <= 14; number += 1) {
      const extension = number === 7 ? "jpg" : "png";
      const name = `image${number}.${extension}`;
      const native = execFileSync("unzip", ["-p", source, `word/media/${name}`]);
      const published = readFileSync(resolve(app, "public/curriculum/module-10-lesson-2", name));
      expect(published.equals(native)).toBe(true);
      expect(lesson).toContain(`/curriculum/module-10-lesson-2/${name}`);
    }
  });
});
