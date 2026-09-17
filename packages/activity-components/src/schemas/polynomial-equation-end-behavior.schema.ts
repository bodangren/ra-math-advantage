import { z } from 'zod';

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: 'Value must not be blank.',
});

const studentItemSchema = z.object({
  id: z.enum(['a', 'b', 'c', 'd', 'e', 'f']),
  functionName: z.enum(['f', 'g', 'y', 'h', 'k', 'm']),
  expression: nonBlankString,
}).strict();

const correctAnswersSchema = z.object({
  a_leftEnd: z.enum(['up', 'down']),
  a_rightEnd: z.enum(['up', 'down']),
  b_leftEnd: z.enum(['up', 'down']),
  b_rightEnd: z.enum(['up', 'down']),
  c_leftEnd: z.enum(['up', 'down']),
  c_rightEnd: z.enum(['up', 'down']),
  d_leftEnd: z.enum(['up', 'down']),
  d_rightEnd: z.enum(['up', 'down']),
  e_leftEnd: z.enum(['up', 'down']),
  e_rightEnd: z.enum(['up', 'down']),
  f_leftEnd: z.enum(['up', 'down']),
  f_rightEnd: z.enum(['up', 'down']),
}).strict();

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  items: z.array(studentItemSchema).length(6),
};

const workedExampleSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('worked_example'),
  correctAnswers: correctAnswersSchema,
  steps: z.array(nonBlankString).length(6),
  finalAnswer: nonBlankString,
}).strict();

const guidedPracticeSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('guided_practice'),
  guidedSteps: z.array(nonBlankString).min(3),
  fieldHelp: nonBlankString,
}).strict();

const independentPracticeSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('independent_practice'),
}).strict();

const expectedIds = ['a', 'b', 'c', 'd', 'e', 'f'] as const;
const expectedFunctionNames = ['f', 'g', 'y', 'h', 'k', 'm'] as const;

export const polynomialEquationEndBehaviorSchema = z
  .discriminatedUnion('presentationMode', [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    for (let index = 0; index < value.items.length; index += 1) {
      const item = value.items[index]!;
      if (item.id !== expectedIds[index]) {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'id'],
          message: 'Items must use the expected IDs in order.',
        });
      }
      if (item.functionName !== expectedFunctionNames[index]) {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'functionName'],
          message: 'Items must use the expected function names in order.',
        });
      }
    }
  });

export type PolynomialEquationEndBehaviorProps = z.infer<
  typeof polynomialEquationEndBehaviorSchema
>;
