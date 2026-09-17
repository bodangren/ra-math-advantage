import { z } from 'zod';

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: 'Value must not be blank.',
});
const finiteNumber = z.number().finite();
const caseId = z.enum(['a', 'b', 'c']);
const classification = z.enum(['linear', 'quadratic', 'neither', 'cannot_determine']);

const tableCaseSchema = z.object({
  id: caseId,
  functionName: nonBlankString,
  xValues: z.array(finiteNumber).length(4),
  yValues: z.array(finiteNumber).length(4),
}).strict();

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  cases: z.array(tableCaseSchema).length(3),
};

const workedExampleSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('worked_example'),
  correctClassifications: z.object({
    a: classification,
    b: classification,
    c: classification,
  }).strict(),
  steps: z.array(nonBlankString).length(3),
  finalAnswer: nonBlankString,
}).strict();

const guidedPracticeSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('guided_practice'),
  guidedSteps: z.array(nonBlankString).min(2),
  fieldHelp: nonBlankString,
}).strict();

const independentPracticeSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('independent_practice'),
}).strict();

function equalWithin(left: number, right: number): boolean {
  return Math.abs(left - right) <= 1e-9;
}

function differences(values: readonly number[]): number[] {
  return values.slice(1).map((value, index) => value - values[index]!);
}

function classifyTableCase(tableCase: z.infer<typeof tableCaseSchema>): z.infer<typeof classification> {
  const widths = differences(tableCase.xValues);
  if (widths.some((width) => width <= 0)) return 'cannot_determine';

  const firstDifferences = differences(tableCase.yValues).map((change, index) => change / widths[index]!);
  if (firstDifferences.every((difference) => equalWithin(difference, firstDifferences[0]!))) {
    return 'linear';
  }

  const secondDifferences = differences(firstDifferences).map((change, index) => change / (tableCase.xValues[index + 2]! - tableCase.xValues[index]!));
  if (secondDifferences.every((difference) => equalWithin(difference, secondDifferences[0]!))) {
    return 'quadratic';
  }
  return 'neither';
}

export const ratePatternClassificationSchema = z
  .discriminatedUnion('presentationMode', [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    const ids = value.cases.map((tableCase) => tableCase.id);
    if (new Set(ids).size !== 3 || !(['a', 'b', 'c'] as const).every((id) => ids.includes(id))) {
      context.addIssue({
        code: 'custom',
        path: ['cases'],
        message: 'Case IDs must be exactly a, b, and c.',
      });
    }

    const signatures = value.cases.map((tableCase) => JSON.stringify({
      functionName: tableCase.functionName,
      xValues: tableCase.xValues,
      yValues: tableCase.yValues,
    }));
    if (new Set(signatures).size !== signatures.length) {
      context.addIssue({
        code: 'custom',
        path: ['cases'],
        message: 'Public table cases must be unique.',
      });
    }

    for (const [index, tableCase] of value.cases.entries()) {
      if (!tableCase.xValues.slice(1).every((x, xIndex) => x > tableCase.xValues[xIndex]!)) {
        context.addIssue({
          code: 'custom',
          path: ['cases', index, 'xValues'],
          message: 'Case x values must be strictly increasing.',
        });
      }
    }

    if (value.presentationMode === 'worked_example') {
      for (const id of ['a', 'b', 'c'] as const) {
        const tableCase = value.cases.find((candidate) => candidate.id === id);
        if (tableCase && value.correctClassifications[id] !== classifyTableCase(tableCase)) {
          context.addIssue({
            code: 'custom',
            path: ['correctClassifications', id],
            message: 'Worked classification does not match the table values.',
          });
        }
      }
    }
  });

export type RatePatternClassificationProps = z.infer<typeof ratePatternClassificationSchema>;
