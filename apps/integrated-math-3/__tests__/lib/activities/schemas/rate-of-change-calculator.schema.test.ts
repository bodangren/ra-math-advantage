import { describe, it, expect } from 'vitest';
import { rateOfChangeCalculatorSchema } from '@/lib/activities/schemas/rate-of-change-calculator.schema';

describe('rate-of-change-calculator.schema', () => {
  describe('valid props', () => {
    it('accepts minimal valid props with table data', () => {
      const props = {
        sourceType: 'table',
        data: {
          x: [0, 1, 2, 3],
          y: [0, 2, 4, 6],
        },
        interval: {
          start: 0,
          end: 3,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts props with function data', () => {
      const props = {
        sourceType: 'function',
        data: {
          expression: 'y = 2x + 3',
        },
        interval: {
          start: 0,
          end: 5,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts props with graph data', () => {
      const props = {
        sourceType: 'graph',
        data: {
          points: [
            [0, 1],
            [1, 3],
            [2, 5],
          ],
        },
        interval: {
          start: 0,
          end: 2,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts props with multiple intervals', () => {
      const props = {
        sourceType: 'table',
        data: {
          x: [0, 1, 2, 3, 4],
          y: [0, 2, 4, 6, 8],
        },
        interval: {
          start: 1,
          end: 3,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid props', () => {
    it('rejects props without sourceType', () => {
      const props = {
        data: {
          x: [0, 1, 2],
          y: [0, 2, 4],
        },
        interval: {
          start: 0,
          end: 2,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: { path: (string | number | symbol)[] }) => issue.path.includes('sourceType'))).toBe(
          true,
        );
      }
    });

    it('rejects invalid sourceType', () => {
      const props = {
        sourceType: 'invalid_type',
        data: {
          x: [0, 1, 2],
          y: [0, 2, 4],
        },
        interval: {
          start: 0,
          end: 2,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects props without data', () => {
      const props = {
        sourceType: 'table',
        interval: {
          start: 0,
          end: 2,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects table data without x values', () => {
      const props = {
        sourceType: 'table',
        data: {
          y: [0, 2, 4],
        },
        interval: {
          start: 0,
          end: 2,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects table data with mismatched array lengths', () => {
      const props = {
        sourceType: 'table',
        data: {
          x: [0, 1, 2],
          y: [0, 2],
        },
        interval: {
          start: 0,
          end: 2,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects function data without expression', () => {
      const props = {
        sourceType: 'function',
        data: {},
        interval: {
          start: 0,
          end: 2,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects graph data with invalid points', () => {
      const props = {
        sourceType: 'graph',
        data: {
          points: [[0], [1, 2]],
        },
        interval: {
          start: 0,
          end: 1,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects props without interval', () => {
      const props = {
        sourceType: 'table',
        data: {
          x: [0, 1, 2],
          y: [0, 2, 4],
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects interval without start', () => {
      const props = {
        sourceType: 'table',
        data: {
          x: [0, 1, 2],
          y: [0, 2, 4],
        },
        interval: {
          end: 2,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects interval without end', () => {
      const props = {
        sourceType: 'table',
        data: {
          x: [0, 1, 2],
          y: [0, 2, 4],
        },
        interval: {
          start: 0,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects interval with start > end', () => {
      const props = {
        sourceType: 'table',
        data: {
          x: [0, 1, 2],
          y: [0, 2, 4],
        },
        interval: {
          start: 3,
          end: 1,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects extra properties', () => {
      const props = {
        sourceType: 'table',
        data: {
          x: [0, 1, 2],
          y: [0, 2, 4],
        },
        interval: {
          start: 0,
          end: 2,
        },
        extraProperty: 'should not be here',
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('infers correct type from schema for table data', () => {
      const props = {
        sourceType: 'table' as const,
        data: {
          x: [0, 1, 2],
          y: [0, 2, 4],
        },
        interval: {
          start: 0,
          end: 2,
        },
      };

      const result = rateOfChangeCalculatorSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        const sourceType: string = result.data.sourceType;
        const data: { x: number[]; y: number[] } = result.data.data as { x: number[]; y: number[] };
        const interval: { start: number; end: number } = result.data.interval;

        expect(typeof sourceType).toBe('string');
        expect(Array.isArray(data.x)).toBe(true);
        expect(Array.isArray(data.y)).toBe(true);
        expect(typeof interval.start).toBe('number');
        expect(typeof interval.end).toBe('number');
      }
    });
  });
});
