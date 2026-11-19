import { z } from "zod";

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: "Value must not be blank.",
});

const coefficientSchema = z
  .number()
  .int()
  .min(-9)
  .max(9)
  .refine((value) => value !== 0, {
    message: "The leading coefficient must be a nonzero integer from -9 through 9.",
  });
const exponentSchema = z.number().int().min(2).max(7);
const leadingTermSchema = z
  .object({
    coefficient: coefficientSchema,
    exponent: exponentSchema,
  })
  .strict();

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  functionName: z.literal("f"),
  leadingTerm: leadingTermSchema,
};

const correctAnswersSchema = z
  .object({
    leftEnd: z.enum(["positive_infinity", "negative_infinity"]),
    rightEnd: z.enum(["positive_infinity", "negative_infinity"]),
  })
  .strict();

const workedExampleSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("worked_example"),
    correctAnswers: correctAnswersSchema,
    steps: z.array(nonBlankString).length(6),
    finalAnswer: nonBlankString,
  })
  .strict();

const guidedPracticeSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("guided_practice"),
    guidedSteps: z.array(nonBlankString).length(3),
    fieldHelp: nonBlankString,
  })
  .strict();

const independentPracticeSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("independent_practice"),
  })
  .strict();

function expectedEnds(
  coefficient: number,
  exponent: number,
): {
  leftEnd: "positive_infinity" | "negative_infinity";
  rightEnd: "positive_infinity" | "negative_infinity";
} {
  const rightEnd = coefficient > 0 ? "positive_infinity" : "negative_infinity";
  const leftEnd =
    exponent % 2 === 0
      ? rightEnd
      : rightEnd === "positive_infinity"
        ? "negative_infinity"
        : "positive_infinity";
  return { leftEnd, rightEnd };
}

export const polynomialEndBehaviorSchema = z
  .discriminatedUnion("presentationMode", [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    if (value.presentationMode !== "worked_example") return;

    const expected = expectedEnds(value.leadingTerm.coefficient, value.leadingTerm.exponent);
    if (value.correctAnswers.leftEnd !== expected.leftEnd) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswers", "leftEnd"],
        message: "The left end answer must match the coefficient sign and degree parity.",
      });
    }
    if (value.correctAnswers.rightEnd !== expected.rightEnd) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswers", "rightEnd"],
        message: "The right end answer must match the coefficient sign.",
      });
    }
  });

export type PolynomialEndBehaviorProps = z.infer<typeof polynomialEndBehaviorSchema>;
