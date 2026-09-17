import { z } from 'zod';

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: 'Value must not be blank.',
});

const readableNumber = z.number().finite().refine(
  (value) => Math.abs(value) <= 10_000,
  { message: 'Value must be finite and within the readable display range.' },
);

const intervalSchema = z.tuple([readableNumber, readableNumber]);
const pointSchema = z.object({
  x: readableNumber,
  y: readableNumber,
}).strict();

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  functionName: z.literal('h'),
  interval: intervalSchema,
  points: z.array(pointSchema).length(5),
};

const workedExampleSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('worked_example'),
  correctAnswers: z.object({
    rateSign: z.enum(['positive', 'negative']),
    rateTrend: z.enum(['increasing', 'decreasing']),
  }).strict(),
  steps: z.array(nonBlankString).min(1),
  finalAnswer: nonBlankString,
}).strict();

const guidedPracticeSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('guided_practice'),
  guidedSteps: z.array(nonBlankString).length(2),
  fieldHelp: nonBlankString,
}).strict();

const independentPracticeSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('independent_practice'),
}).strict();

type GraphProps = {
  readonly interval: readonly [number, number];
  readonly points: readonly { readonly x: number; readonly y: number }[];
};

function closeEnough(left: number, right: number): boolean {
  return Math.abs(left - right) <= 1e-9;
}

function rateSlopes(points: GraphProps['points']): number[] {
  return points.slice(1).map((point, index) => (
    (point.y - points[index]!.y) / (point.x - points[index]!.x)
  ));
}

function addGraphIssues(value: GraphProps, context: z.RefinementCtx): void {
  if (value.interval[0] >= value.interval[1]) {
    context.addIssue({
      code: 'custom',
      path: ['interval'],
      message: 'The interval must be in ascending order.',
    });
  }

  const expectedEnd = value.interval[0] + 4 * 0.25;
  if (!closeEnough(value.interval[1], expectedEnd)) {
    context.addIssue({
      code: 'custom',
      path: ['interval', 1],
      message: 'The interval must span four equal 0.25 steps.',
    });
  }

  value.points.forEach((point, index) => {
    const expectedX = value.interval[0] + index * 0.25;
    if (!closeEnough(point.x, expectedX)) {
      context.addIssue({
        code: 'custom',
        path: ['points', index, 'x'],
        message: 'Point x values must match the interval samples.',
      });
    }
  });

  const slopes = rateSlopes(value.points);
  const allPositive = slopes.every((slope) => slope > 0);
  const allNegative = slopes.every((slope) => slope < 0);
  if (!allPositive && !allNegative) {
    context.addIssue({
      code: 'custom',
      path: ['points'],
      message: 'Secant slopes must be nonzero and keep one sign.',
    });
  }

  const increasing = slopes.every(
    (slope, index) => index === 0 || slope > slopes[index - 1]!,
  );
  const decreasing = slopes.every(
    (slope, index) => index === 0 || slope < slopes[index - 1]!,
  );
  if (!increasing && !decreasing) {
    context.addIssue({
      code: 'custom',
      path: ['points'],
      message: 'Secant slopes must change strictly in one direction.',
    });
  }
}

function addWorkedAnswerIssues(
  value: z.infer<typeof workedExampleSchema>,
  context: z.RefinementCtx,
): void {
  const slopes = rateSlopes(value.points);
  const expectedSign = slopes[0]! > 0 ? 'positive' : 'negative';
  const expectedTrend = slopes.every(
    (slope, index) => index === 0 || slope > slopes[index - 1]!,
  ) ? 'increasing' : 'decreasing';

  if (value.correctAnswers.rateSign !== expectedSign) {
    context.addIssue({
      code: 'custom',
      path: ['correctAnswers', 'rateSign'],
      message: 'The rate sign must match the graph slopes.',
    });
  }
  if (value.correctAnswers.rateTrend !== expectedTrend) {
    context.addIssue({
      code: 'custom',
      path: ['correctAnswers', 'rateTrend'],
      message: 'The rate trend must match the graph slopes.',
    });
  }
}

export const rateSignAndTrendFromGraphSchema = z
  .discriminatedUnion('presentationMode', [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    addGraphIssues(value, context);
    if (value.presentationMode === 'worked_example') addWorkedAnswerIssues(value, context);
  });

export type RateSignAndTrendFromGraphProps = z.infer<
  typeof rateSignAndTrendFromGraphSchema
>;
