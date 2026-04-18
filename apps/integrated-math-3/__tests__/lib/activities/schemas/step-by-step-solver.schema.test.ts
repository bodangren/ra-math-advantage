import { describe, it, expect } from 'vitest';
import { stepByStepSolverSchema } from '@/lib/activities/schemas/step-by-step-solver.schema';

describe('step-by-step-solver.schema', () => {
  describe('valid props', () => {
    it('accepts minimal valid props', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts props with steps', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
        steps: [
          {
            id: 'step-1',
            description: 'Identify coefficients',
            expression: 'a = 1, b = -4, c = 3',
          },
          {
            id: 'step-2',
            description: 'Apply quadratic formula',
            expression: 'x = (-b ± √(b²-4ac)) / 2a',
          },
        ],
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts props with hints', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
        hints: [
          'First, identify the values of a, b, and c',
          'Calculate the discriminant: b² - 4ac',
          'Take the square root of the discriminant',
        ],
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts complete valid props', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
        steps: [
          {
            id: 'step-1',
            description: 'Identify coefficients',
            expression: 'a = 1, b = -4, c = 3',
          },
          {
            id: 'step-2',
            description: 'Apply quadratic formula',
            expression: 'x = (-b ± √(b²-4ac)) / 2a',
          },
        ],
        hints: [
          'First, identify the values of a, b, and c',
          'Calculate the discriminant: b² - 4ac',
        ],
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts various problem types', () => {
      const problemTypes = [
        'quadratic_formula',
        'factoring',
        'completing_the_square',
        'quadratic_formula',
      ];

      problemTypes.forEach(problemType => {
        const props = {
          problemType,
          equation: 'x^2 - 4x + 3 = 0',
        };
        const result = stepByStepSolverSchema.safeParse(props);
        expect(result.success).toBe(true);
      });
    });

    it('accepts step with optional explanation', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
        steps: [
          {
            id: 'step-1',
            description: 'Identify coefficients',
            expression: 'a = 1, b = -4, c = 3',
            explanation: 'Compare the equation to ax² + bx + c = 0',
          },
        ],
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid props', () => {
    it('rejects props without problemType', () => {
      const props = {
        equation: 'x^2 - 4x + 3 = 0',
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: { path: (string | number | symbol)[] }) => issue.path.includes('problemType'))).toBe(
          true,
        );
      }
    });

    it('rejects props without equation', () => {
      const props = {
        problemType: 'quadratic_formula',
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects empty string problemType', () => {
      const props = {
        problemType: '',
        equation: 'x^2 - 4x + 3 = 0',
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects empty string equation', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: '',
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid problemType', () => {
      const props = {
        problemType: 'invalid_type',
        equation: 'x^2 - 4x + 3 = 0',
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid steps (not an array)', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
        steps: 'invalid',
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid steps (missing id)', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
        steps: [
          {
            description: 'Identify coefficients',
            expression: 'a = 1, b = -4, c = 3',
          },
        ],
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid steps (missing description)', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
        steps: [
          {
            id: 'step-1',
            expression: 'a = 1, b = -4, c = 3',
          },
        ],
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid steps (missing expression)', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
        steps: [
          {
            id: 'step-1',
            description: 'Identify coefficients',
          },
        ],
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid hints (not an array)', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
        hints: 'invalid',
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid hints (non-string elements)', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
        hints: [123, 'valid hint'],
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects extra properties', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
        extraProperty: 'should not be here',
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('infers correct type from schema', () => {
      const props = {
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
        steps: [
          {
            id: 'step-1',
            description: 'Identify coefficients',
            expression: 'a = 1, b = -4, c = 3',
            explanation: 'Compare to ax² + bx + c = 0',
          },
        ],
        hints: ['First, identify a, b, c'],
      };

      const result = stepByStepSolverSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        // TypeScript should infer the correct types
        const problemType: string = result.data.problemType;
        const equation: string = result.data.equation;
        const steps: Array<{ id: string; description: string; expression: string; explanation?: string }> | undefined =
          result.data.steps;
        const hints: string[] | undefined = result.data.hints;

        expect(typeof problemType).toBe('string');
        expect(typeof equation).toBe('string');
        expect(Array.isArray(steps)).toBe(true);
        expect(Array.isArray(hints)).toBe(true);
      }
    });
  });
});
