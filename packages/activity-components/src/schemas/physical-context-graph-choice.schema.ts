import { z } from "zod";

const optionSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    shape: z.enum([
      "linear-increasing",
      "slope-increases-then-decreases",
      "rise-fall-rise",
      "steep-gentle-steep",
    ]),
    accessibleDescription: z.string().min(1),
  })
  .strict();

const baseShape = {
  title: z.string().min(1).optional(),
  prompt: z.string().min(1),
  contextDescription: z.string().min(1),
  xLabel: z.string().min(1),
  yLabel: z.string().min(1),
  containerProfile: z.enum(["constant-width", "wide-narrow-wide", "narrow-wide-narrow"]),
  options: z.array(optionSchema).length(4),
};

const workedExampleSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("worked_example"),
    correctOptionId: z.string().min(1),
    steps: z.array(z.string().min(1)).min(2),
    finalAnswer: z.string().min(1),
  })
  .strict();

const guidedPracticeSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("guided_practice"),
    guidedSteps: z.array(z.string().min(1)).min(2),
    fieldHelp: z.string().min(1),
  })
  .strict();

const independentPracticeSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("independent_practice"),
  })
  .strict();

export const physicalContextGraphChoiceSchema = z
  .discriminatedUnion("presentationMode", [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    const optionIds = value.options.map((option) => option.id);
    if (new Set(optionIds).size !== optionIds.length) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "Option IDs must be unique.",
      });
    }

    const optionShapes = value.options.map((option) => option.shape);
    if (new Set(optionShapes).size !== optionShapes.length) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "Option shapes must be unique.",
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

export type PhysicalContextGraphChoiceProps = z.infer<typeof physicalContextGraphChoiceSchema>;
