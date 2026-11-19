import { z } from "zod";

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: "Value must not be blank.",
});
const finiteNumber = z.number().finite();
const pointLabel = z.enum(["A", "B", "C", "D"]);
const rateSign = z.enum(["positive", "negative"]);
const intervalSchema = z.tuple([finiteNumber, finiteNumber]);

const optionSchema = z
  .object({
    id: pointLabel,
    label: pointLabel,
    rateSign,
    startInput: finiteNumber,
    endInput: finiteNumber,
  })
  .strict();

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  functionName: nonBlankString,
  constantTerm: finiteNumber,
  linearCoefficient: finiteNumber,
  quadraticCoefficient: finiteNumber,
  domain: intervalSchema,
  options: z.array(optionSchema).length(4),
};

const workedExampleSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("worked_example"),
    correctOptionId: pointLabel,
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

function isMathematicallyTrue(option: z.infer<typeof optionSchema>, vertexX: number): boolean {
  const tolerance = 0.001;
  if (option.rateSign === "negative") {
    return option.startInput >= vertexX - tolerance && option.endInput > vertexX;
  }
  return option.startInput < vertexX && option.endInput <= vertexX + tolerance;
}

export const quadraticNegativeRateIntervalChoiceSchema = z
  .discriminatedUnion("presentationMode", [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    if (!(value.quadraticCoefficient < 0)) {
      context.addIssue({
        code: "custom",
        path: ["quadraticCoefficient"],
        message: "Quadratic coefficient must be negative.",
      });
    }
    if (!(value.domain[0] < value.domain[1])) {
      context.addIssue({
        code: "custom",
        path: ["domain"],
        message: "Domain start must be less than domain end.",
      });
    }

    const vertexX = -value.linearCoefficient / (2 * value.quadraticCoefficient);
    if (!(vertexX > value.domain[0] && vertexX < value.domain[1])) {
      context.addIssue({
        code: "custom",
        path: ["domain"],
        message: "The vertex must be strictly inside the domain.",
      });
    }

    const options = value.options;
    const optionIds = options.map((option) => option.id);
    const optionLabels = options.map((option) => option.label);
    if (!hasExactlyLabels(optionIds)) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "Option IDs must be exactly A, B, C, and D.",
      });
    }
    if (!hasExactlyLabels(optionLabels)) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "Option labels must be exactly A, B, C, and D.",
      });
    }
    for (const [index, option] of options.entries()) {
      if (option.id !== option.label) {
        context.addIssue({
          code: "custom",
          path: ["options", index, "label"],
          message: "Each option ID must match its label.",
        });
      }
      if (!(option.startInput < option.endInput)) {
        context.addIssue({
          code: "custom",
          path: ["options", index],
          message: "Option startInput must be less than endInput.",
        });
      }
      if (option.startInput < value.domain[0] || option.endInput > value.domain[1]) {
        context.addIssue({
          code: "custom",
          path: ["options", index],
          message: "Option interval must stay inside the domain.",
        });
      }
    }
    if (
      new Set(options.map((option) => `${option.startInput}|${option.endInput}`)).size !==
      options.length
    ) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "Option intervals must be unique.",
      });
    }

    const trueOptions = options.filter((option) => isMathematicallyTrue(option, vertexX));
    if (trueOptions.length !== 1) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "Exactly one option must describe the rate behavior.",
      });
    }
    if (value.presentationMode === "worked_example") {
      if (!optionIds.includes(value.correctOptionId)) {
        context.addIssue({
          code: "custom",
          path: ["correctOptionId"],
          message: "The correct option ID must match an option.",
        });
      }
      if (trueOptions.length === 1 && value.correctOptionId !== trueOptions[0]!.id) {
        context.addIssue({
          code: "custom",
          path: ["correctOptionId"],
          message: "The correct option ID must identify the true option.",
        });
      }
    }
  });

export type QuadraticNegativeRateIntervalChoiceProps = z.infer<
  typeof quadraticNegativeRateIntervalChoiceSchema
>;
