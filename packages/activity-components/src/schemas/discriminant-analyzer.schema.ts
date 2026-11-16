import { z } from 'zod';

const coefficientsSchema = z.object({
  a: z.number().refine(val => val !== 0, { message: 'Coefficient a cannot be zero (not a quadratic equation)' }),
  b: z.number(),
  c: z.number(),
});

export const discriminantAnalyzerSchema = z
  .object({
    equation: z.string().min(1),
    coefficients: coefficientsSchema.optional(),
  })
  .strict()
  .refine(
    data => {
      return /x\^2|x²/i.test(data.equation);
    },
    {
      message: 'Equation must be quadratic (must contain x^2 or x² term)',
      path: ['equation'],
    },
  )
  .refine(
    data => {
      if (data.coefficients && data.coefficients.a === 0) {
        return false;
      }
      return true;
    },
    {
      message: 'Coefficient a cannot be zero',
      path: ['coefficients'],
    },
  )
  .refine(
    data => {
      const equation = data.equation.replace(/\s/g, '');
      const zeroCoeffPattern = /(^|[-+])0+(?:\.0+)?\*?x\^2/i;
      return !zeroCoeffPattern.test(equation);
    },
    {
      message: 'Coefficient of x^2 cannot be zero',
      path: ['equation'],
    },
  );

export type DiscriminantAnalyzerProps = z.infer<typeof discriminantAnalyzerSchema>;
