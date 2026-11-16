// @vitest-environment node
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import lessons from "../../curriculum/lessons.json";
import { questionSchema, gradeQuestion } from "../../lib/practice/question";
it("provides a valid scored checkpoint for every source lesson", () => {
  const questions = JSON.parse(
    readFileSync(
      path.resolve(import.meta.dirname, "../../curriculum/questions.json"),
      "utf8",
    ),
  );
  expect(Object.keys(questions).sort()).toEqual(
    lessons.map((lesson) => lesson.slug).sort(),
  );
  for (const [slug, raw] of Object.entries(questions)) {
    const result = questionSchema.safeParse(raw);
    expect(result.success, slug).toBe(true);
    if (!result.success) continue;
    expect(
      gradeQuestion(result.data, String(result.data.answer)).score,
      slug,
    ).toBe(1);
    expect(gradeQuestion(result.data, "invalid").score, slug).toBe(0);
  }
});
