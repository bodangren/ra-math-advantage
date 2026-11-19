import { z } from "zod";

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: "Value must not be blank.",
});

const safeRoot = z
  .number()
  .finite()
  .int()
  .refine(Number.isSafeInteger, {
    message: "Root must be a finite safe integer.",
  })
  .min(-5)
  .max(5);

const intervalSign = z.enum(["+", "-"]);
const operator = z.enum(["<", "<=", ">", ">="]);
const distinctRootCount = z.union([z.literal(2), z.literal(3)]);

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  expression: nonBlankString,
  operator,
  distinctRootCount,
};

const correctAnswersSchema = z
  .object({
    roots: z.array(safeRoot),
    intervalSigns: z.array(intervalSign),
    solution: nonBlankString,
  })
  .strict();

const workedExampleSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("worked_example"),
    correctAnswers: correctAnswersSchema,
    steps: z.array(nonBlankString).min(4),
    finalAnswer: nonBlankString,
  })
  .strict();

const guidedPracticeSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("guided_practice"),
    guidedSteps: z.array(nonBlankString).min(3),
    fieldHelp: z
      .object({
        roots: nonBlankString,
        intervalSigns: nonBlankString,
        solution: nonBlankString,
      })
      .strict(),
  })
  .strict();

const independentPracticeSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("independent_practice"),
  })
  .strict();

export const polynomialInequalitySignChartSchema = z
  .discriminatedUnion("presentationMode", [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    if (value.presentationMode !== "worked_example") return;

    const { roots, intervalSigns } = value.correctAnswers;
    if (roots.length !== value.distinctRootCount) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswers", "roots"],
        message: "The root count must equal distinctRootCount.",
      });
    }
    for (let index = 1; index < roots.length; index += 1) {
      if (roots[index]! <= roots[index - 1]!) {
        context.addIssue({
          code: "custom",
          path: ["correctAnswers", "roots", index],
          message: "Roots must be distinct and in ascending order.",
        });
      }
    }
    if (intervalSigns.length !== value.distinctRootCount + 1) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswers", "intervalSigns"],
        message: "The interval-sign count must equal distinctRootCount + 1.",
      });
    }
  });

export type PolynomialInequalitySignChartProps = z.infer<
  typeof polynomialInequalitySignChartSchema
>;
