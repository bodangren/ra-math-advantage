import { z } from 'zod';

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: 'Value must not be blank.',
});
const safeInteger = z.number().int().refine(Number.isSafeInteger, {
  message: 'Value must be a safe integer.',
});
const finiteSafeRangeNumber = z.number().finite().refine(
  (value) => Math.abs(value) <= Number.MAX_SAFE_INTEGER,
  { message: 'Value must be finite and within the safe numeric range.' },
);

const coefficientsSchema = z.tuple([
  safeInteger,
  safeInteger,
  safeInteger,
  safeInteger,
  safeInteger,
]);
const domainSchema = z.tuple([safeInteger, safeInteger]);
const pointSchema = z.object({
  x: finiteSafeRangeNumber,
  y: finiteSafeRangeNumber,
}).strict();

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  functionName: z.literal('g'),
  coefficients: coefficientsSchema,
  domain: domainSchema,
  points: z.array(pointSchema).min(1),
};

const correctAnswersSchema = z.object({
  relative_minimum_x: safeInteger,
  relative_maximum_x: safeInteger,
  absolute_minimum_x: safeInteger,
}).strict();

const workedExampleSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('worked_example'),
  correctAnswers: correctAnswersSchema,
  steps: z.array(nonBlankString).length(3),
  finalAnswer: nonBlankString,
}).strict();

const guidedPracticeSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('guided_practice'),
  guidedSteps: z.array(nonBlankString).length(3),
  fieldHelp: nonBlankString,
}).strict();

const independentPracticeSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('independent_practice'),
}).strict();

type GraphPoint = z.infer<typeof pointSchema>;
type GraphProps = {
  readonly coefficients: z.infer<typeof coefficientsSchema>;
  readonly domain: z.infer<typeof domainSchema>;
  readonly points: readonly GraphPoint[];
};

const SAMPLE_TOLERANCE = 1e-9;

function closeEnough(left: number, right: number): boolean {
  return Math.abs(left - right) <= SAMPLE_TOLERANCE * Math.max(1, Math.abs(left), Math.abs(right));
}

function evaluateQuartic(coefficients: GraphProps['coefficients'], x: number): number {
  return coefficients[0] * x ** 4
    + coefficients[1] * x ** 3
    + coefficients[2] * x ** 2
    + coefficients[3] * x
    + coefficients[4];
}

function pointIndexAtX(points: readonly GraphPoint[], x: number): number {
  return points.findIndex((point) => closeEnough(point.x, x));
}

function addGeometryIssues(
  value: GraphProps,
  context: z.RefinementCtx,
): void {
  if (value.coefficients[0] <= 0) {
    context.addIssue({
      code: 'custom',
      path: ['coefficients', 0],
      message: 'The leading coefficient must be positive.',
    });
  }

  if (value.domain[0] >= value.domain[1]) {
    context.addIssue({
      code: 'custom',
      path: ['domain'],
      message: 'The domain must be in ascending order.',
    });
  }

  const { points } = value;
  if (points.length === 0) return;

  if (!closeEnough(points[0]!.x, value.domain[0])) {
    context.addIssue({
      code: 'custom',
      path: ['points', 0, 'x'],
      message: 'The first point must start at the domain minimum.',
    });
  }

  if (!closeEnough(points[points.length - 1]!.x, value.domain[1])) {
    context.addIssue({
      code: 'custom',
      path: ['points', points.length - 1, 'x'],
      message: 'The last point must end at the domain maximum.',
    });
  }

  for (const [index, point] of points.entries()) {
    const expectedY = evaluateQuartic(value.coefficients, point.x);
    if (!closeEnough(point.y, expectedY)) {
      context.addIssue({
        code: 'custom',
        path: ['points', index, 'y'],
        message: 'The point y value must match the quartic.',
      });
    }

    if (index > 0 && !closeEnough(point.x - points[index - 1]!.x, 0.25)) {
      context.addIssue({
        code: 'custom',
        path: ['points', index, 'x'],
        message: 'Point x values must advance by 0.25.',
      });
    }
  }
}

function addWorkedAnswerIssues(
  value: z.infer<typeof workedExampleSchema>,
  context: z.RefinementCtx,
): void {
  const minimumIndex = pointIndexAtX(value.points, value.correctAnswers.relative_minimum_x);
  const maximumIndex = pointIndexAtX(value.points, value.correctAnswers.relative_maximum_x);
  const absoluteMinimumIndex = pointIndexAtX(value.points, value.correctAnswers.absolute_minimum_x);

  if (
    minimumIndex <= 0
    || minimumIndex >= value.points.length - 1
    || !(value.points[minimumIndex]!.y < value.points[minimumIndex - 1]!.y)
    || !(value.points[minimumIndex]!.y < value.points[minimumIndex + 1]!.y)
  ) {
    context.addIssue({
      code: 'custom',
      path: ['correctAnswers', 'relative_minimum_x'],
      message: 'The relative minimum must be an interior lower point.',
    });
  }

  if (
    maximumIndex <= 0
    || maximumIndex >= value.points.length - 1
    || !(value.points[maximumIndex]!.y > value.points[maximumIndex - 1]!.y)
    || !(value.points[maximumIndex]!.y > value.points[maximumIndex + 1]!.y)
  ) {
    context.addIssue({
      code: 'custom',
      path: ['correctAnswers', 'relative_maximum_x'],
      message: 'The relative maximum must be an interior higher point.',
    });
  }

  const minimumY = Math.min(...value.points.map((point) => point.y));
  if (
    absoluteMinimumIndex < 0
    || !closeEnough(value.points[absoluteMinimumIndex]!.y, minimumY)
    || value.correctAnswers.absolute_minimum_x !== value.correctAnswers.relative_minimum_x
  ) {
    context.addIssue({
      code: 'custom',
      path: ['correctAnswers', 'absolute_minimum_x'],
      message: 'The absolute minimum must be the displayed global minimum and match the relative minimum.',
    });
  }
}

export const polynomialExtremaFromGraphSchema = z
  .discriminatedUnion('presentationMode', [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    addGeometryIssues(value, context);
    if (value.presentationMode === 'worked_example') {
      addWorkedAnswerIssues(value, context);
    }
  });

export type PolynomialExtremaFromGraphProps = z.infer<
  typeof polynomialExtremaFromGraphSchema
>;
