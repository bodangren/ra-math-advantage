import { describe, it, expect } from 'vitest';
import { fillInTheBlankSchema } from '@/lib/activities/schemas/fill-in-the-blank.schema';

describe('fill-in-the-blank.schema', () => {
  describe('valid props', () => {
    it('accepts minimal valid props', () => {
      const props = {
        template: 'The vertex form of a quadratic is ___',
        blanks: [
          {
            id: 'blank1',
            position: 34,
            length: 3,
          },
        ],
        answers: {
          blank1: ['a(x-h)^2+k', 'a(x-h)²+k'],
        },
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts multiple blanks', () => {
      const props = {
        template: 'The ___ form of a quadratic is ___',
        blanks: [
          {
            id: 'blank1',
            position: 4,
            length: 3,
          },
          {
            id: 'blank2',
            position: 31,
            length: 3,
          },
        ],
        answers: {
          blank1: ['vertex', 'standard', 'factored'],
          blank2: ['a(x-h)^2+k', 'ax^2+bx+c'],
        },
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blanks).toHaveLength(2);
      }
    });

    it('accepts blanks with hints', () => {
      const props = {
        template: 'The vertex form is ___',
        blanks: [
          {
            id: 'blank1',
            position: 19,
            length: 3,
            hint: 'Think about (h, k)',
          },
        ],
        answers: {
          blank1: ['a(x-h)^2+k'],
        },
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blanks[0].hint).toBeDefined();
      }
    });

    it('accepts multiple correct answers per blank', () => {
      const props = {
        template: 'The vertex is ___',
        blanks: [
          {
            id: 'blank1',
            position: 15,
            length: 3,
          },
        ],
        answers: {
          blank1: ['(h,k)', '(h, k)', '<h,k>'],
        },
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.answers.blank1).toHaveLength(3);
      }
    });
  });

  describe('invalid props', () => {
    it('rejects props without template', () => {
      const props = {
        blanks: [
          {
            id: 'blank1',
            position: 0,
            length: 3,
          },
        ],
        answers: {
          blank1: ['answer'],
        },
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: { path: (string | number)[] }) => issue.path.includes('template'))).toBe(
          true,
        );
      }
    });

    it('rejects empty template', () => {
      const props = {
        template: '',
        blanks: [],
        answers: {},
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects template without blank placeholders', () => {
      const props = {
        template: 'The vertex form of a quadratic is a(x-h)^2+k',
        blanks: [],
        answers: {},
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects blank without id', () => {
      const props = {
        template: 'The form is ___',
        blanks: [
          {
            position: 12,
            length: 3,
          },
        ],
        answers: {
          blank1: ['answer'],
        },
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects blank without position', () => {
      const props = {
        template: 'The form is ___',
        blanks: [
          {
            id: 'blank1',
            length: 3,
          },
        ],
        answers: {
          blank1: ['answer'],
        },
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects blank without length', () => {
      const props = {
        template: 'The form is ___',
        blanks: [
          {
            id: 'blank1',
            position: 12,
          },
        ],
        answers: {
          blank1: ['answer'],
        },
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects blank position out of range', () => {
      const props = {
        template: 'The form is ___',
        blanks: [
          {
            id: 'blank1',
            position: 100,
            length: 3,
          },
        ],
        answers: {
          blank1: ['answer'],
        },
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects missing answers for a blank', () => {
      const props = {
        template: 'The form is ___',
        blanks: [
          {
            id: 'blank1',
            position: 12,
            length: 3,
          },
        ],
        answers: {},
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects empty answers array for a blank', () => {
      const props = {
        template: 'The form is ___',
        blanks: [
          {
            id: 'blank1',
            position: 12,
            length: 3,
          },
        ],
        answers: {
          blank1: [],
        },
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects extra properties', () => {
      const props = {
        template: 'The form is ___',
        blanks: [
          {
            id: 'blank1',
            position: 12,
            length: 3,
          },
        ],
        answers: {
          blank1: ['answer'],
        },
        extraProperty: 'should not be here',
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('infers correct type from schema', () => {
      const props = {
        template: 'The ___ form is ___',
        blanks: [
          {
            id: 'blank1',
            position: 4,
            length: 3,
            hint: 'Type of form',
          },
        ],
        answers: {
          blank1: ['vertex', 'standard'],
        },
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        const template: string = result.data.template;
        const blanks: Array<{ id: string; position: number; length: number; hint?: string }> = result.data.blanks;
        const answers: Record<string, string[]> = result.data.answers;

        expect(typeof template).toBe('string');
        expect(Array.isArray(blanks)).toBe(true);
        expect(typeof answers).toBe('object');
      }
    });
  });
});
