import { describe, it, expect } from 'vitest';
import { comprehensionQuizSchema } from '@/lib/activities/schemas/comprehension-quiz.schema';

describe('comprehension-quiz.schema', () => {
  describe('valid props', () => {
    it('accepts minimal valid props with multiple choice', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            prompt: 'What is the vertex form of a quadratic equation?',
            options: ['y = ax^2 + bx + c', 'y = a(x-h)^2 + k', 'y = a(x-r1)(x-r2)'],
            correctAnswer: 'y = a(x-h)^2 + k',
          },
        ],
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
            prompt: 'What is the vertex form of a quadratic equation?',
            options: ['y = ax^2 + bx + c', 'y = a(x-h)^2 + k', 'y = a(x-r1)(x-r2)'],
            correctAnswer: 'y = a(x-h)^2 + k',
          },
          {
            id: 'q2',
            prompt: 'What is the discriminant used for?',
            options: ['Find x-intercepts', 'Determine number of solutions', 'Find the vertex'],
            correctAnswer: 'Determine number of solutions',
          },
        ],
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
            prompt: 'What is the vertex form of a quadratic equation?',
            options: ['y = ax^2 + bx + c', 'y = a(x-h)^2 + k', 'y = a(x-r1)(x-r2)'],
            correctAnswer: 'y = a(x-h)^2 + k',
            explanation: 'The vertex form shows the vertex (h, k) directly.',
          },
        ],
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
            type: 'true_false',
            prompt: 'The discriminant can be negative.',
            options: ['True', 'False'],
            correctAnswer: 'True',
          },
        ],
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(true);
    });

    it('accepts short_answer questions without options', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            type: 'short_answer',
            prompt: 'What is the quadratic formula?',
            correctAnswer: 'x = (-b ± √(b²-4ac)) / 2a',
          },
        ],
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(true);
    });

    it('accepts select_all questions with array correctAnswer', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            type: 'select_all',
            prompt: 'Which of the following are quadratic functions?',
            options: ['y = x^2', 'y = 2x + 1', 'y = x^3 - x', 'y = -x^2'],
            correctAnswer: ['y = x^2', 'y = -x^2'],
          },
        ],
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(true);
    });

    it('accepts activityId', () => {
      const props = {
        activityId: 'activity-123',
        questions: [
          {
            id: 'q1',
            prompt: 'What is the vertex form?',
            options: ['A', 'B', 'C'],
            correctAnswer: 'B',
          },
        ],
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid props', () => {
    it('rejects props without questions', () => {
      const props = {};

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects empty questions array', () => {
      const props = {
        questions: [],
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects question without id', () => {
      const props = {
        questions: [
          {
            prompt: 'What is the vertex form?',
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ],
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects question without prompt', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ],
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });



    it('rejects options with fewer than 2 choices', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            prompt: 'What is the vertex form?',
            options: ['Only one'],
            correctAnswer: 'Only one',
          },
        ],
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects question without correctAnswer', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            prompt: 'What is the vertex form?',
            options: ['A', 'B'],
          },
        ],
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects empty string correctAnswer', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            prompt: 'What is the vertex form?',
            options: ['A', 'B'],
            correctAnswer: '',
          },
        ],
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects extra properties', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            prompt: 'What is the vertex form?',
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ],
        extraProperty: 'should not be here',
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects invalid question type', () => {
      const props = {
        questions: [
          {
            id: 'q1',
            type: 'invalid_type',
            prompt: 'What is the vertex form?',
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ],
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
            type: 'multiple_choice',
            prompt: 'What is the vertex form?',
            options: ['A', 'B', 'C'],
            correctAnswer: 'B',
            explanation: 'Shows vertex directly',
          },
        ],
      };

      const result = comprehensionQuizSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        const questions = result.data.questions;
        expect(Array.isArray(questions)).toBe(true);
        expect(questions[0].prompt).toBe('What is the vertex form?');
      }
    });
  });
});