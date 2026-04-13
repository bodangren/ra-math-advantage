import { describe, it, expect } from 'vitest';
import { getPropsSchema, type ActivityComponentKey } from '@/lib/activities/schemas';
import { z } from 'zod';

describe('schemas index', () => {
  describe('getPropsSchema', () => {
    it('returns graphing-explorer schema for correct key', () => {
      const schema = getPropsSchema('graphing-explorer');
      expect(schema).toBeDefined();

      const result = schema!.safeParse({
        equation: 'y = x^2',
      });
      expect(result.success).toBe(true);
    });

    it('returns step-by-step-solver schema for correct key', () => {
      const schema = getPropsSchema('step-by-step-solver');
      expect(schema).toBeDefined();

      const result = schema!.safeParse({
        problemType: 'quadratic_formula',
        equation: 'x^2 - 4x + 3 = 0',
      });
      expect(result.success).toBe(true);
    });

    it('returns comprehension-quiz schema for correct key', () => {
      const schema = getPropsSchema('comprehension-quiz');
      expect(schema).toBeDefined();

      const result = schema!.safeParse({
        questions: [
          {
            id: 'q1',
            prompt: 'What is the vertex form?',
            options: ['Option A', 'Option B'],
            correctAnswer: 'Option A',
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('returns fill-in-the-blank schema for correct key', () => {
      const schema = getPropsSchema('fill-in-the-blank');
      expect(schema).toBeDefined();

      const result = schema!.safeParse({
        template: 'The form is ___',
        blanks: [
          {
            id: 'blank1',
            position: 10,
            length: 3,
          },
        ],
        answers: {
          blank1: ['answer'],
        },
      });
      expect(result.success).toBe(true);
    });

    it('returns rate-of-change-calculator schema for correct key', () => {
      const schema = getPropsSchema('rate-of-change-calculator');
      expect(schema).toBeDefined();

      const result = schema!.safeParse({
        sourceType: 'table',
        data: {
          x: [0, 1, 2],
          y: [0, 2, 4],
        },
        interval: {
          start: 0,
          end: 2,
        },
      });
      expect(result.success).toBe(true);
    });

    it('returns discriminant-analyzer schema for correct key', () => {
      const schema = getPropsSchema('discriminant-analyzer');
      expect(schema).toBeDefined();

      const result = schema!.safeParse({
        equation: 'x^2 - 4x + 3 = 0',
      });
      expect(result.success).toBe(true);
    });

    it('returns undefined for unknown key', () => {
      const schema = getPropsSchema('unknown-activity' as ActivityComponentKey);
      expect(schema).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const schema = getPropsSchema('' as ActivityComponentKey);
      expect(schema).toBeUndefined();
    });

    it('returns undefined for null', () => {
      const schema = getPropsSchema(null as unknown as ActivityComponentKey);
      expect(schema).toBeUndefined();
    });

    it('returns undefined for undefined', () => {
      const schema = getPropsSchema(undefined as unknown as ActivityComponentKey);
      expect(schema).toBeUndefined();
    });
  });

  describe('schema validation behavior', () => {
    it('graphing-explorer schema rejects invalid props', () => {
      const schema = getPropsSchema('graphing-explorer');
      expect(schema).toBeDefined();

      const result = schema!.safeParse({
        equation: '', // Invalid: empty string
      });
      expect(result.success).toBe(false);
    });

    it('step-by-step-solver schema rejects invalid problem type', () => {
      const schema = getPropsSchema('step-by-step-solver');
      expect(schema).toBeDefined();

      const result = schema!.safeParse({
        problemType: 'invalid_type' as 'quadratic_formula' | 'factoring' | 'completing_the_square' | 'square_root_property' | 'graphing',
        equation: 'x^2 - 4x + 3 = 0',
      });
      expect(result.success).toBe(false);
    });

    it('comprehension-quiz schema rejects missing questions', () => {
      const schema = getPropsSchema('comprehension-quiz');
      expect(schema).toBeDefined();

      const result = schema!.safeParse({
        questions: [],
        choices: {},
        correctAnswers: {},
      });
      expect(result.success).toBe(false);
    });

    it('fill-in-the-blank schema rejects template without placeholders', () => {
      const schema = getPropsSchema('fill-in-the-blank');
      expect(schema).toBeDefined();

      const result = schema!.safeParse({
        template: 'The form is complete',
        blanks: [],
        answers: {},
      });
      expect(result.success).toBe(false);
    });

    it('rate-of-change-calculator schema rejects invalid interval', () => {
      const schema = getPropsSchema('rate-of-change-calculator');
      expect(schema).toBeDefined();

      const result = schema!.safeParse({
        sourceType: 'table',
        data: {
          x: [0, 1, 2],
          y: [0, 2, 4],
        },
        interval: {
          start: 5,
          end: 2, // Invalid: start > end
        },
      });
      expect(result.success).toBe(false);
    });

    it('discriminant-analyzer schema rejects non-quadratic equation', () => {
      const schema = getPropsSchema('discriminant-analyzer');
      expect(schema).toBeDefined();

      const result = schema!.safeParse({
        equation: 'x + 3 = 0', // Invalid: not quadratic
      });
      expect(result.success).toBe(false);
    });
  });

  describe('type safety', () => {
    it('ActivityComponentKey type includes all 6 keys', () => {
      const keys: ActivityComponentKey[] = [
        'graphing-explorer',
        'step-by-step-solver',
        'comprehension-quiz',
        'fill-in-the-blank',
        'rate-of-change-calculator',
        'discriminant-analyzer',
      ];
      expect(keys).toHaveLength(6);
    });

    it('getPropsSchema returns Zod schema', () => {
      const schema = getPropsSchema('graphing-explorer');
      expect(schema).toBeInstanceOf(z.ZodObject);
    });
  });
});
