import { describe, it, expect } from 'vitest';
import { comprehensionQuizSchema } from '@/lib/activities/schemas/comprehension-quiz.schema';

describe('comprehension-quiz.schema', () => {
  describe('valid props', () => {
    it('accepts minimal valid props', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            text: 'What is the vertex form of a quadratic equation?',
          },
        ],
        choices: {
          q1: ['y = ax^2 + bx + c', 'y = a(x-h)^2 + k', 'y = a(x-r1)(x-r2)'],
        },
        correctAnswers: {
          q1: 1,
        },
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts props with multiple questions', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            text: 'What is the vertex form of a quadratic equation?',
          },
          {
            id: 'q2',
            text: 'What is the discriminant used for?',
          },
        ],
        choices: {
          q1: ['y = ax^2 + bx + c', 'y = a(x-h)^2 + k', 'y = a(x-r1)(x-r2)'],
          q2: ['Find x-intercepts', 'Determine number of solutions', 'Find the vertex'],
        },
        correctAnswers: {
          q1: 1,
          q2: 1,
        },
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.questions).toHaveLength(2);
      }
    });

    it('accepts questions with explanations', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            text: 'What is the vertex form of a quadratic equation?',
            explanation: 'The vertex form shows the vertex (h, k) directly.',
          },
        ],
        choices: {
          q1: ['y = ax^2 + bx + c', 'y = a(x-h)^2 + k', 'y = a(x-r1)(x-r2)'],
        },
        correctAnswers: {
          q1: 1,
        },
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.questions[0].explanation).toBeDefined();
      }
    });

    it('accepts true/false questions', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            text: 'The discriminant can be negative.',
            type: 'true_false',
          },
        ],
        choices: {
          q1: ['True', 'False'],
        },
        correctAnswers: {
          q1: 0,
        },
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid props', () => {
    it('rejects props without questions', () => {
      const props = {
        choices: {
          q1: ['Option A', 'Option B'],
        },
        correctAnswers: {
          q1: 0,
        },
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: { path: (string | number)[] }) => issue.path.includes('questions'))).toBe(
          true,
        );
      }
    });

    it('rejects empty questions array', () => {
      const props = {
        questions: [],
        choices: {},
        correctAnswers: {},
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects question without id', () => {
      const props = {
        questions: [
          {
            text: 'What is the vertex form?',
          },
        ],
        choices: {
          q1: ['Option A', 'Option B'],
        },
        correctAnswers: {
          q1: 0,
        },
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects question without text', () => {
      const props = {
        questions: [
          {
            id: 'q1',
          },
        ],
        choices: {
          q1: ['Option A', 'Option B'],
        },
        correctAnswers: {
          q1: 0,
        },
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects missing choices for a question', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            text: 'What is the vertex form?',
          },
        ],
        choices: {},
        correctAnswers: {
          q1: 0,
        },
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects empty choices array for a question', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            text: 'What is the vertex form?',
          },
        ],
        choices: {
          q1: [],
        },
        correctAnswers: {
          q1: 0,
        },
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects correct answer out of range', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            text: 'What is the vertex form?',
          },
        ],
        choices: {
          q1: ['Option A', 'Option B'],
        },
        correctAnswers: {
          q1: 5,
        },
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects missing correct answer for a question', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            text: 'What is the vertex form?',
          },
        ],
        choices: {
          q1: ['Option A', 'Option B'],
        },
        correctAnswers: {},
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects extra properties', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            text: 'What is the vertex form?',
          },
        ],
        choices: {
          q1: ['Option A', 'Option B'],
        },
        correctAnswers: {
          q1: 0,
        },
        extraProperty: 'should not be here',
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('infers correct type from schema', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            text: 'What is the vertex form?',
            explanation: 'Shows vertex directly',
          },
        ],
        choices: {
          q1: ['Option A', 'Option B', 'Option C'],
        },
        correctAnswers: {
          q1: 1,
        },
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        const questions: Array<{ id: string; text: string; explanation?: string; type?: string }> =
          result.data.questions;
        const choices: Record<string, string[]> = result.data.choices;
        const correctAnswers: Record<string, number> = result.data.correctAnswers;

        expect(Array.isArray(questions)).toBe(true);
        expect(typeof choices).toBe('object');
        expect(typeof correctAnswers).toBe('object');
      }
    });
  });
});
