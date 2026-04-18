import { describe, it, expect } from 'vitest';
import { discriminantAnalyzerSchema } from '@/lib/activities/schemas/discriminant-analyzer.schema';

describe('discriminant-analyzer.schema', () => {
  describe('valid props', () => {
    it('accepts minimal valid props with equation', () => {
      const props = {
        equation: 'x^2 - 4x + 3 = 0',
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts props with explicit coefficients', () => {
      const props = {
        equation: 'x^2 - 4x + 3 = 0',
        coefficients: {
          a: 1,
          b: -4,
          c: 3,
        },
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts equation with negative coefficients', () => {
      const props = {
        equation: '-x^2 - 4x - 3 = 0',
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(true);
    });

    it('accepts equation with fractional coefficients', () => {
      const props = {
        equation: '0.5x^2 + 2.5x + 1 = 0',
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(true);
    });

    it('accepts equation in standard form without zero', () => {
      const props = {
        equation: 'x^2 - 4x + 3',
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid props', () => {
    it('rejects props without equation', () => {
      const props = {
        coefficients: {
          a: 1,
          b: -4,
          c: 3,
        },
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: { path: (string | number | symbol)[] }) => issue.path.includes('equation'))).toBe(
          true,
        );
      }
    });

    it('rejects empty string equation', () => {
      const props = {
        equation: '',
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects non-quadratic equation (missing x^2 term)', () => {
      const props = {
        equation: 'x + 3 = 0',
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects equation with a = 0', () => {
      const props = {
        equation: '0x^2 - 4x + 3 = 0',
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid coefficients (missing a)', () => {
      const props = {
        equation: 'x^2 - 4x + 3 = 0',
        coefficients: {
          b: -4,
          c: 3,
        },
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid coefficients (missing b)', () => {
      const props = {
        equation: 'x^2 - 4x + 3 = 0',
        coefficients: {
          a: 1,
          c: 3,
        },
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid coefficients (missing c)', () => {
      const props = {
        equation: 'x^2 - 4x + 3 = 0',
        coefficients: {
          a: 1,
          b: -4,
        },
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects coefficients with a = 0', () => {
      const props = {
        equation: 'x^2 - 4x + 3 = 0',
        coefficients: {
          a: 0,
          b: -4,
          c: 3,
        },
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects extra properties', () => {
      const props = {
        equation: 'x^2 - 4x + 3 = 0',
        extraProperty: 'should not be here',
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('infers correct type from schema', () => {
      const props = {
        equation: 'x^2 - 4x + 3 = 0',
        coefficients: {
          a: 1,
          b: -4,
          c: 3,
        },
      };

      const result = discriminantAnalyzerSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        const equation: string = result.data.equation;
        const coefficients: { a: number; b: number; c: number } | undefined = result.data.coefficients;

        expect(typeof equation).toBe('string');
        if (coefficients) {
          expect(typeof coefficients.a).toBe('number');
          expect(typeof coefficients.b).toBe('number');
          expect(typeof coefficients.c).toBe('number');
        }
      }
    });
  });
});
