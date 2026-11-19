import { z } from "zod";

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: "Value must not be blank.",
});
const finiteNonzeroNumber = z
  .number()
  .finite()
  .refine((value) => value !== 0, {
    message: "Value must be finite and nonzero.",
  });
const safeNonnegativeInteger = z
  .number()
  .int()
  .refine(Number.isSafeInteger, {
    message: "Value must be a nonnegative safe integer.",
  })
  .nonnegative();
const itemId = z.enum(["a", "b", "c"]);
const polynomialTermSchema = z
  .object({
    coefficient: finiteNonzeroNumber,
    exponent: safeNonnegativeInteger,
  })
  .strict();
const polynomialItemSchema = z
  .object({
    id: itemId,
    functionName: nonBlankString,
    terms: z.array(polynomialTermSchema).min(1),
  })
  .strict();

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  items: z.array(polynomialItemSchema).length(3),
};

const correctAnswersSchema = z
  .object({
    a_degree: safeNonnegativeInteger,
    a_leading_coefficient: finiteNonzeroNumber,
    b_degree: safeNonnegativeInteger,
    b_leading_coefficient: finiteNonzeroNumber,
    c_degree: safeNonnegativeInteger,
    c_leading_coefficient: finiteNonzeroNumber,
  })
  .strict();

const workedExampleSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("worked_example"),
    correctAnswers: correctAnswersSchema,
    steps: z.array(nonBlankString).length(3),
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

function expectedAnswer(item: z.infer<typeof polynomialItemSchema>): {
  readonly degree: number;
  readonly leadingCoefficient: number;
} {
  let leadingTerm = item.terms[0]!;
  for (const term of item.terms.slice(1)) {
    if (term.exponent > leadingTerm.exponent) leadingTerm = term;
  }
  return { degree: leadingTerm.exponent, leadingCoefficient: leadingTerm.coefficient };
}

export const polynomialDegreeLeadingCoefficientSchema = z
  .discriminatedUnion("presentationMode", [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    const ids = value.items.map((item) => item.id);
    if (new Set(ids).size !== 3 || !(["a", "b", "c"] as const).every((id) => ids.includes(id))) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message: "Item IDs must be exactly a, b, and c.",
      });
    }

    for (const [index, item] of value.items.entries()) {
      const exponents = item.terms.map((term) => term.exponent);
      if (new Set(exponents).size !== exponents.length) {
        context.addIssue({
          code: "custom",
          path: ["items", index, "terms"],
          message: "Term exponents must be unique within each item.",
        });
      }
    }

    if (value.presentationMode === "worked_example") {
      for (const id of ["a", "b", "c"] as const) {
        const item = value.items.find((candidate) => candidate.id === id);
        if (!item) continue;
        const answer = expectedAnswer(item);
        if (
          value.correctAnswers[`${id}_degree`] !== answer.degree ||
          value.correctAnswers[`${id}_leading_coefficient`] !== answer.leadingCoefficient
        ) {
          context.addIssue({
            code: "custom",
            path: ["correctAnswers", `${id}_degree`],
            message: "Worked answer does not match the item terms.",
          });
        }
      }
    }
  });

export type PolynomialDegreeLeadingCoefficientProps = z.infer<
  typeof polynomialDegreeLeadingCoefficientSchema
>;
