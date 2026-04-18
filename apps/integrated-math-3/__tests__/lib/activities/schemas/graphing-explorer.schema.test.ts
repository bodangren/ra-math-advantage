import { describe, it, expect } from 'vitest';
import { graphingExplorerSchema } from '@/lib/activities/schemas/graphing-explorer.schema';

describe('graphing-explorer.schema', () => {
  describe('valid props', () => {
    it('accepts minimal valid props', () => {
      const props = {
        equation: 'y = x^2',
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts props with domain and range', () => {
      const props = {
        equation: 'y = x^2',
        domain: [-10, 10],
        range: [-10, 10],
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts props with points', () => {
      const props = {
        equation: 'y = x^2',
        points: [
          [0, 0],
          [1, 1],
          [-1, 1],
        ],
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts complete valid props', () => {
      const props = {
        equation: 'y = x^2',
        domain: [-10, 10],
        range: [-10, 10],
        points: [
          [0, 0],
          [1, 1],
          [-1, 1],
        ],
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts various equation formats', () => {
      const equations = [
        'y = x^2',
        'y = 2x + 3',
        'y = x^2 - 4x + 3',
        'y = (x - 2)^2',
      ];

      equations.forEach(equation => {
        const props = { equation };
        const result = graphingExplorerSchema.safeParse(props);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('invalid props', () => {
    it('rejects props without equation', () => {
      const props = {
        domain: [-10, 10],
        range: [-10, 10],
      };

      const result = graphingExplorerSchema.safeParse(props);
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

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects non-string equation', () => {
      const props = {
        equation: 123,
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid domain (not an array)', () => {
      const props = {
        equation: 'y = x^2',
        domain: 'invalid',
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid domain (wrong length)', () => {
      const props = {
        equation: 'y = x^2',
        domain: [-10],
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid domain (non-numeric values)', () => {
      const props = {
        equation: 'y = x^2',
        domain: [-10, 'invalid'],
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid range (not an array)', () => {
      const props = {
        equation: 'y = x^2',
        range: 'invalid',
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid range (wrong length)', () => {
      const props = {
        equation: 'y = x^2',
        range: [-10],
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid range (non-numeric values)', () => {
      const props = {
        equation: 'y = x^2',
        range: [-10, 'invalid'],
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid points (not an array)', () => {
      const props = {
        equation: 'y = x^2',
        points: 'invalid',
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid points (non-array elements)', () => {
      const props = {
        equation: 'y = x^2',
        points: ['invalid'],
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid points (wrong element length)', () => {
      const props = {
        equation: 'y = x^2',
        points: [[0]],
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid points (non-numeric coordinates)', () => {
      const props = {
        equation: 'y = x^2',
        points: [[0, 'invalid']],
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects extra properties', () => {
      const props = {
        equation: 'y = x^2',
        extraProperty: 'should not be here',
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('infers correct type from schema', () => {
      const props = {
        equation: 'y = x^2',
        domain: [-10, 10],
        range: [-10, 10],
        points: [[0, 0], [1, 1]],
      };

      const result = graphingExplorerSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        // TypeScript should infer the correct types
        const equation: string = result.data.equation;
        const domain: number[] | undefined = result.data.domain;
        const range: number[] | undefined = result.data.range;
        const points: number[][] | undefined = result.data.points;

        expect(typeof equation).toBe('string');
        expect(Array.isArray(domain)).toBe(true);
        expect(Array.isArray(range)).toBe(true);
        expect(Array.isArray(points)).toBe(true);
      }
    });
  });
});
