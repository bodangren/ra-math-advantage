import { z } from "zod";

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: "Value must not be blank.",
});
const choiceLabel = z.enum(["A", "B", "C", "D"]);

const optionSchema = z
  .object({
    id: choiceLabel,
    label: choiceLabel,
    xDefinition: nonBlankString,
    yDefinition: nonBlankString,
  })
  .strict();

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  options: z.array(optionSchema).length(4),
};

const workedExampleSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("worked_example"),
    correctOptionId: choiceLabel,
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

function hasExactlyLabels(values: readonly string[]): boolean {
  return (
    values.length === 4 &&
    new Set(values).size === 4 &&
    ["A", "B", "C", "D"].every((label) => values.includes(label))
  );
}

export const negativeRateContextChoiceSchema = z
  .discriminatedUnion("presentationMode", [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    const optionIds = value.options.map((option) => option.id);
    const optionLabels = value.options.map((option) => option.label);

    if (!hasExactlyLabels(optionIds)) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "Option IDs must contain A, B, C, and D exactly once.",
      });
    }
    if (!hasExactlyLabels(optionLabels)) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "Option labels must contain A, B, C, and D exactly once.",
      });
    }
    for (const [index, option] of value.options.entries()) {
      if (option.id !== option.label) {
        context.addIssue({
          code: "custom",
          path: ["options", index, "label"],
          message: "Option ID must match its label.",
        });
      }
    }

    const definitionPairs = value.options.map(
      (option) => `${option.xDefinition}\u0000${option.yDefinition}`,
    );
    if (new Set(definitionPairs).size !== definitionPairs.length) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "Option definition pairs must be unique.",
      });
    }

    if (value.presentationMode === "worked_example" && !optionIds.includes(value.correctOptionId)) {
      context.addIssue({
        code: "custom",
        path: ["correctOptionId"],
        message: "The correct option ID must match an option.",
      });
    }
  });

export type NegativeRateContextChoiceProps = z.infer<typeof negativeRateContextChoiceSchema>;
