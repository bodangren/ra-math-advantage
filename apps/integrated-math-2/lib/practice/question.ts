import { z } from "zod";
export const questionSchema = z
  .discriminatedUnion("kind", [
    z.object({
      kind: z.literal("numeric"),
      prompt: z.string().min(1),
      answer: z.number().finite(),
      tolerance: z.number().nonnegative().max(0.1).optional(),
      explanation: z.string().min(1),
      hint: z.string().optional(),
    }),
    z.object({
      kind: z.literal("choice"),
      prompt: z.string().min(1),
      choices: z.array(z.object({ id: z.string().min(1), text: z.string().min(1) })).min(2),
      answer: z.string().min(1),
      explanation: z.string().min(1),
      hint: z.string().optional(),
    }),
  ])
  .refine(
    (question) =>
      question.kind !== "choice" ||
      (new Set(question.choices.map((choice) => choice.id)).size === question.choices.length &&
        question.choices.some((choice) => choice.id === question.answer)),
    { message: "Choice IDs must be unique. The answer must name a choice." },
  );
export type Question = z.infer<typeof questionSchema>;
export function gradeQuestion(question: Question, answer: string) {
  let correct = false;
  if (question.kind === "choice")
    correct = question.choices.some((choice) => choice.id === answer) && answer === question.answer;
  else if (
    /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\/[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(answer.trim())
  ) {
    const values = answer.trim().split("/").map(Number);
    const value = values.length === 2 ? values[0] / values[1] : values[0];
    correct =
      Number.isFinite(value) && Math.abs(value - question.answer) <= (question.tolerance ?? 1e-9);
  }
  return {
    score: correct ? 1 : 0,
    maxScore: 1,
    feedback: correct ? `Correct. ${question.explanation}` : "Check your answer and try again.",
  };
}
