import { z } from "zod";

const finiteNumber = z.number().finite();

const baseShape = {
  title: z.string().min(1).optional(),
  prompt: z.string().min(1),
  domain: z.tuple([finiteNumber, finiteNumber]),
  changePoints: z.tuple([finiteNumber, finiteNumber]),
  points: z
    .array(
      z
        .object({
          x: finiteNumber,
          y: finiteNumber,
        })
        .strict(),
    )
    .length(4),
};

const workedStepSchema = z
  .object({
    description: z.string().min(1),
    expression: z.string().min(1),
    result: z.string().min(1).optional(),
    explanation: z.string().min(1).optional(),
  })
  .strict();

const workedExampleSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("worked_example"),
    steps: z.array(workedStepSchema).min(1),
    finalAnswer: z.string().min(1),
  })
  .strict();

const guidedPracticeSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("guided_practice"),
    guidedSteps: z.array(z.string().min(1)).min(1),
    fieldHelp: z
      .object({
        increasingIntervals: z.string().min(1),
        decreasingIntervals: z.string().min(1),
        constantIntervals: z.string().min(1),
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

export const intervalClassificationSchema = z
  .discriminatedUnion("presentationMode", [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    const [domainStart, domainEnd] = value.domain;
    const [firstChange, secondChange] = value.changePoints;

    if (!(domainStart < domainEnd)) {
      context.addIssue({ code: "custom", path: ["domain"], message: "Domain must increase." });
    }
    if (!(domainStart < firstChange && firstChange < secondChange && secondChange < domainEnd)) {
      context.addIssue({
        code: "custom",
        path: ["changePoints"],
        message: "Change points must be ordered inside the domain.",
      });
    }

    const expectedX = [domainStart, firstChange, secondChange, domainEnd];
    if (!value.points.every((point, index) => point.x === expectedX[index])) {
      context.addIssue({
        code: "custom",
        path: ["points"],
        message: "Point x values must match the domain and change points.",
      });
    }

    if (value.points.length !== 4) return;

    const hasChange = value.points.some(
      (point, index) => index > 0 && point.y !== value.points[index - 1]!.y,
    );
    if (!hasChange) {
      context.addIssue({
        code: "custom",
        path: ["points"],
        message: "The graph must contain at least one nonconstant segment.",
      });
    }
  });

export type IntervalClassificationProps = z.infer<typeof intervalClassificationSchema>;
