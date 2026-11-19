import { expect, it } from "vitest";
import module2 from "@/lib/practice-tests/modules/module-2";
import module3 from "@/lib/practice-tests/modules/module-3";
it("keys the remainder using substitution at the divisor zero", () => {
  const q = module2.questions.find((q) => q.id === "m2-l4-q3")!;
  const x = -3;
  expect(Number(q.correctAnswer)).toBe(2 * x ** 3 + 5 * x ** 2 - 4 * x - 10);
});
it("keys the parameter that makes x + 1 a factor", () => {
  const q = module3.questions.find((q) => q.id === "m3-l4-q3")!;
  const k = Number(q.correctAnswer);
  expect(2 * (-1) ** 3 + k * (-1) ** 2 - 5 * -1 + 1).toBe(0);
});
it("offers only one correct factor in the factor question", () => {
  const q = module3.questions.find((q) => q.id === "m3-l4-q4")!;
  const valid = [q.correctAnswer, ...q.distractors].filter((answer) => {
    const m = answer.match(/^\(x ([+-]) (\d+)\)$/)!;
    const root = Number(m[2]) * (m[1] === "+" ? -1 : 1);
    return root ** 3 - 3 * root ** 2 - 4 * root + 12 === 0;
  });
  expect(valid).toEqual([q.correctAnswer]);
});

it("derives practice-test totals from answers and rejects repeated questions", async () => {
  const { gradePracticeTest } = await import("@/lib/practice-tests/question-banks");
  const q = module2.questions[0];
  const answers = [{ questionId: q.id, answer: q.correctAnswer }];
  expect(gradePracticeTest(2, answers)).toMatchObject({
    score: 1,
    questionCount: 1,
    perLessonBreakdown: [expect.objectContaining({ correct: 1, total: 1 })],
  });
  expect(() => gradePracticeTest(2, [...answers, ...answers])).toThrow();
  expect(() => gradePracticeTest(3, answers)).toThrow();
});
