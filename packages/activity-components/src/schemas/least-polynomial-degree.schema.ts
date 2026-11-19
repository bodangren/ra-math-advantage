import { z } from "zod";

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: "Value must not be blank.",
});

const safeInteger = z.number().finite().int().refine(Number.isSafeInteger, {
  message: "Value must be a safe integer.",
});

const realZeroCount = safeInteger.min(1).max(5);
const givenNonrealZero = nonBlankString.refine((value) => value.includes("i"), {
  message: "The nonreal zero must contain i.",
});

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  givenNonrealZero,
  realZeroCount,
};

const workedExampleSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("worked_example"),
    correctAnswer: safeInteger,
    steps: z.array(nonBlankString).min(2),
    finalAnswer: nonBlankString,
  })
  .strict();

const guidedPracticeSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("guided_practice"),
    guidedSteps: z.array(nonBlankString).min(2),
    fieldHelp: nonBlankString,
  })
  .strict();

const independentPracticeSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("independent_practice"),
  })
  .strict();

export const leastPolynomialDegreeSchema = z
  .discriminatedUnion("presentationMode", [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    if (
      value.presentationMode === "worked_example" &&
      value.correctAnswer !== value.realZeroCount + 2
    ) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: "The correctAnswer must equal realZeroCount + 2.",
      });
    }
  });

export type LeastPolynomialDegreeProps = z.infer<typeof leastPolynomialDegreeSchema>;
