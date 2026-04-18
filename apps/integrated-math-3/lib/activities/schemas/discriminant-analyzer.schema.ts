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
      // Validate that the equation appears to be quadratic (contains x^2 or x²)
      return /x\^2|x²/i.test(data.equation);
    },
    {
      message: 'Equation must be quadratic (must contain x^2 or x² term)',
      path: ['equation'],
    },
  )
  .refine(
    data => {
      // If coefficients are provided, validate a ≠ 0
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
      // Check if the coefficient of x^2 is explicitly zero in the equation
      const equation = data.equation.replace(/\s/g, '');
      // Match patterns like: 0x^2, -0x^2, +0x^2, 0.0x^2, -0.0x^2, +0.0x^2
      // But not: 0.5x^2, 1x^2, etc.
      const zeroCoeffPattern = /(^|[-+])0+(?:\.0+)?\*?x\^2/i;
      return !zeroCoeffPattern.test(equation);
    },
    {
      message: 'Coefficient of x^2 cannot be zero',
      path: ['equation'],
    },
  );

export type DiscriminantAnalyzerProps = z.infer<typeof discriminantAnalyzerSchema>;
