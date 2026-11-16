import { z } from 'zod';

const nonBlankString = z.string().refine((value) => value.trim().length > 0, {
  message: 'Value must not be blank.',
});

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

const itemsSchema = z.tuple([itemASchema, itemBSchema]).readonly();

const baseShape = {
  title: nonBlankString.optional(),
  prompt: nonBlankString,
  items: itemsSchema,
};

const correctAnswersSchema = z.object({
  a_leftLimit: z.enum(['positive_infinity', 'negative_infinity']),
  a_rightLimit: z.enum(['positive_infinity', 'negative_infinity']),
  b_leftLimit: z.enum(['positive_infinity', 'negative_infinity']),
  b_rightLimit: z.enum(['positive_infinity', 'negative_infinity']),
}).strict();

const workedExampleSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('worked_example'),
  correctAnswers: correctAnswersSchema,
  steps: z.array(nonBlankString).length(2),
  finalAnswer: nonBlankString,
}).strict();

const guidedPracticeSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('guided_practice'),
  guidedSteps: z.array(nonBlankString).length(3).readonly(),
  fieldHelp: nonBlankString,
}).strict();

const independentPracticeSchema = z.object({
  ...baseShape,
  presentationMode: z.literal('independent_practice'),
}).strict();

export const polynomialLimitNotationEndBehaviorSchema = z.discriminatedUnion('presentationMode', [
  workedExampleSchema,
  guidedPracticeSchema,
  independentPracticeSchema,
]);

export type PolynomialLimitNotationEndBehaviorProps = z.infer<
  typeof polynomialLimitNotationEndBehaviorSchema
>;
