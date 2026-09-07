import { describe, it, expect } from "vitest";
import {
  gradeQuestion,
  questionSchema,
  type Question,
} from "../../lib/practice/question";
const numeric: Question = {
  kind: "numeric",
  prompt: "Find one half.",
  answer: 0.5,
  explanation: "1 divided by 2 is 0.5.",
};
describe("question validation and scoring", () => {
  it("accepts decimal and fraction answers", () => {
    for (const answer of [".5", "1/2", "-1/-2", " 0.5 "])
      expect(gradeQuestion(numeric, answer).score).toBe(1);
  });
  it("rejects malformed and nonfinite answers", () => {
    for (const answer of [
      "",
      "1/0",
      "Infinity",
      "NaN",
      "0.5abc",
      "1/2/3",
      "1e999",
    ])
      expect(gradeQuestion(numeric, answer).score).toBe(0);
  });
  it("rejects duplicate choice IDs and missing answer choices", () => {
    const base = {
      kind: "choice",
      prompt: "Choose 2.",
      choices: [
        { id: "a", text: "1" },
        { id: "b", text: "2" },
      ],
      answer: "b",
      explanation: "2 is the requested number.",
    };
    expect(questionSchema.safeParse(base).success).toBe(true);
    expect(questionSchema.safeParse({ ...base, answer: "c" }).success).toBe(
      false,
    );
    expect(
      questionSchema.safeParse({
        ...base,
        choices: [
          { id: "b", text: "1" },
          { id: "b", text: "2" },
        ],
      }).success,
    ).toBe(false);
  });
});
