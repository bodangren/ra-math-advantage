import { z } from "zod";

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: "Value must not be blank.",
});
const finiteNumber = z.number().finite();
const classification = z.enum(["concave_up", "concave_down", "neither"]);

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  functionName: nonBlankString,
  xValues: z.array(finiteNumber).length(4),
  yValues: z.array(finiteNumber).length(4),
};

const workedExampleSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal("worked_example"),
    correctClassification: classification,
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

const WIDTH_TOLERANCE = 1e-9;
const RATE_TOLERANCE = 1e-9;

function differences(values: readonly number[]): number[] {
  return values.slice(1).map((value, index) => value - values[index]!);
}

function classifyTable(
  xValues: readonly number[],
  yValues: readonly number[],
): z.infer<typeof classification> {
  const firstDifferences = differences(yValues);
  const isNonDecreasing = firstDifferences.every(
    (difference, index) =>
      index === 0 || difference >= firstDifferences[index - 1]! - RATE_TOLERANCE,
  );
  const hasIncrease = firstDifferences.some(
    (difference, index) => index > 0 && difference > firstDifferences[index - 1]! + RATE_TOLERANCE,
  );
  if (isNonDecreasing && hasIncrease) return "concave_up";

  const isNonIncreasing = firstDifferences.every(
    (difference, index) =>
      index === 0 || difference <= firstDifferences[index - 1]! + RATE_TOLERANCE,
  );
  const hasDecrease = firstDifferences.some(
    (difference, index) => index > 0 && difference < firstDifferences[index - 1]! - RATE_TOLERANCE,
  );
  if (isNonIncreasing && hasDecrease) return "concave_down";

  return "neither";
}

export const concavityFromRateChangeSchema = z
  .discriminatedUnion("presentationMode", [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    const widths = differences(value.xValues);
    if (!value.xValues.slice(1).every((x, index) => x > value.xValues[index]!)) {
      context.addIssue({
        code: "custom",
        path: ["xValues"],
        message: "x values must be strictly increasing.",
      });
    }
    if (!widths.every((width) => Math.abs(width - widths[0]!) <= WIDTH_TOLERANCE)) {
      context.addIssue({
        code: "custom",
        path: ["xValues"],
        message: "x values must have equal input widths.",
      });
    }

    if (value.presentationMode === "worked_example") {
      const expectedClassification = classifyTable(value.xValues, value.yValues);
      if (value.correctClassification !== expectedClassification) {
        context.addIssue({
          code: "custom",
          path: ["correctClassification"],
          message: "Worked classification does not match the table values.",
        });
      }
    }
  });

export type ConcavityFromRateChangeProps = z.infer<typeof concavityFromRateChangeSchema>;
