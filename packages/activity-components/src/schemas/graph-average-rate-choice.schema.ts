import { z } from "zod";

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: "Value must not be blank.",
});
const finiteNumber = z.number().finite();
const intervalSchema = z.tuple([finiteNumber, finiteNumber]);

const pointSchema = z
  .object({
    x: finiteNumber,
    y: finiteNumber,
  })
  .strict();

const optionSchema = z
  .object({
    id: nonBlankString,
    label: nonBlankString,
    startInput: finiteNumber,
    endInput: finiteNumber,
  })
  .strict();

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  domain: intervalSchema,
  range: intervalSchema,
  xLabel: nonBlankString,
  yLabel: nonBlankString,
  graphPoints: z.array(pointSchema).min(6),
  options: z.array(optionSchema).length(4),
};

const workedExampleSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("worked_example"),
    correctOptionId: nonBlankString,
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

export const graphAverageRateChoiceSchema = z
  .discriminatedUnion("presentationMode", [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    if (!(value.domain[0] < value.domain[1])) {
      context.addIssue({
        code: "custom",
        path: ["domain"],
        message: "Domain start must be less than domain end.",
      });
    }
    if (!(value.range[0] < value.range[1])) {
      context.addIssue({
        code: "custom",
        path: ["range"],
        message: "Range minimum must be less than range maximum.",
      });
    }

    const pointXs = value.graphPoints.map((point) => point.x);
    if (new Set(pointXs).size !== pointXs.length) {
      context.addIssue({
        code: "custom",
        path: ["graphPoints"],
        message: "Graph point x values must be unique.",
      });
    }
    if (pointXs.some((x, index) => index > 0 && x <= pointXs[index - 1]!)) {
      context.addIssue({
        code: "custom",
        path: ["graphPoints"],
        message: "Graph point x values must be strictly increasing.",
      });
    }
    for (const [index, point] of value.graphPoints.entries()) {
      if (point.x < value.domain[0] || point.x > value.domain[1]) {
        context.addIssue({
          code: "custom",
          path: ["graphPoints", index, "x"],
          message: "Graph point x must be inside the domain.",
        });
      }
      if (point.y < value.range[0] || point.y > value.range[1]) {
        context.addIssue({
          code: "custom",
          path: ["graphPoints", index, "y"],
          message: "Graph point y must be inside the range.",
        });
      }
    }

    const optionIds = value.options.map((option) => option.id);
    if (new Set(optionIds).size !== optionIds.length) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "Option IDs must be unique.",
      });
    }
    for (const [index, option] of value.options.entries()) {
      if (!(option.startInput < option.endInput)) {
        context.addIssue({
          code: "custom",
          path: ["options", index],
          message: "Option startInput must be less than endInput.",
        });
      }
      if (!pointXs.includes(option.startInput)) {
        context.addIssue({
          code: "custom",
          path: ["options", index, "startInput"],
          message: "Option startInput must match a graph point x value.",
        });
      }
      if (!pointXs.includes(option.endInput)) {
        context.addIssue({
          code: "custom",
          path: ["options", index, "endInput"],
          message: "Option endInput must match a graph point x value.",
        });
      }
    }
    if (value.presentationMode === "worked_example" && !optionIds.includes(value.correctOptionId)) {
      context.addIssue({
        code: "custom",
        path: ["correctOptionId"],
        message: "The correct option ID must match an option.",
      });
    }
  });

export type GraphAverageRateChoiceProps = z.infer<typeof graphAverageRateChoiceSchema>;
