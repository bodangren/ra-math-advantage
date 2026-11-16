import { z } from 'zod';

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: 'Value must not be blank.',
});
const safeInteger = z.number().finite().int().refine(Number.isSafeInteger, {
  message: 'Value must be a finite safe integer.',
});
const multiplicity = z.number().int().min(1).max(6).refine(Number.isSafeInteger, {
  message: 'Multiplicity must be a safe integer from 1 through 6.',
});
const pairSchema = z.object({
  zero: safeInteger,
  multiplicity,
}).strict();
const pairArraySchema = z.array(pairSchema).min(2).max(3);
const itemASchema = z.object({
  id: z.literal('a'),
  functionName: z.literal('f'),
  expression: nonBlankString,
}).strict();
const itemBSchema = z.object({
  id: z.literal('b'),
  functionName: z.literal('g'),
  expression: nonBlankString,
}).strict();

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  items: z.tuple([itemASchema, itemBSchema]),
};

const correctAnswersSchema = z.object({
  a: pairArraySchema,
  b: pairArraySchema,
}).strict();

const workedExampleSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('worked_example'),
  correctAnswers: correctAnswersSchema,
  steps: z.array(nonBlankString).min(2),
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

export const realZerosAndMultiplicitiesSchema = z
  .discriminatedUnion('presentationMode', [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    if (value.presentationMode !== 'worked_example') return;

    for (const id of ['a', 'b'] as const) {
      const pairs = value.correctAnswers[id];
      for (let index = 1; index < pairs.length; index += 1) {
        if (pairs[index]!.zero <= pairs[index - 1]!.zero) {
          context.addIssue({
            code: 'custom',
            path: ['correctAnswers', id, index, 'zero'],
            message: 'Zeros must be distinct and in ascending order.',
          });
        }
      }
    }
  });

export type RealZerosAndMultiplicitiesProps = z.infer<
  typeof realZerosAndMultiplicitiesSchema
>;
