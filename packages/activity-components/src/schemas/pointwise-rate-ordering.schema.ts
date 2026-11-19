import { z } from "zod";

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: "Value must not be blank.",
});
const finiteNumber = z.number().finite();
const finiteIndex = finiteNumber.int();
const intervalSchema = z.tuple([finiteNumber, finiteNumber]);
const pointLabel = z.enum(["A", "B", "C"]);

const graphPointSchema = z
  .object({
    x: finiteNumber,
    y: finiteNumber,
  })
  .strict();

const labeledPointSchema = z
  .object({
    id: pointLabel,
    label: pointLabel,
    pointIndex: finiteIndex,
    x: finiteNumber,
    y: finiteNumber,
  })
  .strict();

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  domain: intervalSchema,
  range: intervalSchema,
  xLabel: nonBlankString,
  yLabel: nonBlankString,
  graphPoints: z.array(graphPointSchema).min(6),
  labeledPoints: z.array(labeledPointSchema).length(3),
};

const orderedPointIdsSchema = z.array(pointLabel).length(3);

const workedExampleSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("worked_example"),
    orderedPointIds: orderedPointIdsSchema,
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
    values.length === 3 &&
    new Set(values).size === 3 &&
    ["A", "B", "C"].every((label) => values.includes(label))
  );
}

export const pointwiseRateOrderingSchema = z
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

    const graphPoints = value.graphPoints;
    const pointXs = graphPoints.map((point) => point.x);
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
    for (const [index, point] of graphPoints.entries()) {
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

    const labeledPoints = value.labeledPoints;
    const labeledIds = labeledPoints.map((point) => point.id);
    const labeledLabels = labeledPoints.map((point) => point.label);
    if (!hasExactlyLabels(labeledIds)) {
      context.addIssue({
        code: "custom",
        path: ["labeledPoints"],
        message: "Labeled point IDs must be exactly A, B, and C.",
      });
    }
    if (!hasExactlyLabels(labeledLabels)) {
      context.addIssue({
        code: "custom",
        path: ["labeledPoints"],
        message: "Labeled point labels must be exactly A, B, and C.",
      });
    }
    for (const [index, point] of labeledPoints.entries()) {
      if (point.id !== point.label) {
        context.addIssue({
          code: "custom",
          path: ["labeledPoints", index, "label"],
          message: "Each labeled point ID must match its label.",
        });
      }
      if (point.pointIndex <= 0 || point.pointIndex >= graphPoints.length - 1) {
        context.addIssue({
          code: "custom",
          path: ["labeledPoints", index, "pointIndex"],
          message: "Labeled points must reference interior graph points.",
        });
      }
      const referencedPoint = graphPoints[point.pointIndex];
      if (!referencedPoint || referencedPoint.x !== point.x || referencedPoint.y !== point.y) {
        context.addIssue({
          code: "custom",
          path: ["labeledPoints", index],
          message: "Labeled point coordinates must match the referenced graph point.",
        });
      }
    }
    if (new Set(labeledPoints.map((point) => point.pointIndex)).size !== labeledPoints.length) {
      context.addIssue({
        code: "custom",
        path: ["labeledPoints"],
        message: "Labeled point indices must be unique.",
      });
    }

    if (value.presentationMode === "worked_example" && !hasExactlyLabels(value.orderedPointIds)) {
      context.addIssue({
        code: "custom",
        path: ["orderedPointIds"],
        message: "Ordered point IDs must be one permutation of A, B, and C.",
      });
    }
  });

export type PointwiseRateOrderingProps = z.infer<typeof pointwiseRateOrderingSchema>;
