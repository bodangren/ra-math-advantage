import { describe, it, expect } from 'vitest';
import { fillInTheBlankSchema } from '@/lib/activities/schemas/fill-in-the-blank.schema';

describe('fill-in-the-blank.schema', () => {
  describe('valid props', () => {
    it('accepts minimal valid props', () => {
      const props = {
        template: 'The vertex form of a quadratic is {{blank:blank1}}',
        blanks: [
          {
            id: 'blank1',
            correctAnswer: 'y = a(x-h)^2 + k',
          },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(props);
      }
    });

    it('accepts multiple blanks', () => {
      const props = {
        template: 'The {{blank:blank1}} form of a quadratic is {{blank:blank2}}',
        blanks: [
          {
            id: 'blank1',
            correctAnswer: 'vertex',
          },
          {
            id: 'blank2',
            correctAnswer: 'y = a(x-h)^2 + k',
          },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blanks).toHaveLength(2);
      }
    });

    it('accepts blanks with isMath flag', () => {
      const props = {
        template: 'The vertex form is {{blank:blank1}}',
        blanks: [
          {
            id: 'blank1',
            correctAnswer: 'y = a(x-h)^2 + k',
            isMath: true,
          },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blanks[0].isMath).toBe(true);
      }
    });

    it('accepts props with wordBank', () => {
      const props = {
        template: 'The {{blank:blank1}} form is {{blank:blank2}}',
        blanks: [
          {
            id: 'blank1',
            correctAnswer: 'vertex',
          },
          {
            id: 'blank2',
            correctAnswer: 'y = a(x-h)^2 + k',
          },
        ],
        wordBank: [
          { id: 'word1', text: 'vertex' },
          { id: 'word2', text: 'standard' },
          { id: 'word3', text: 'factored' },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.wordBank).toHaveLength(3);
      }
    });

    it('accepts activityId', () => {
      const props = {
        activityId: 'activity-123',
        template: 'The vertex form is {{blank:blank1}}',
        blanks: [
          {
            id: 'blank1',
            correctAnswer: 'y = a(x-h)^2 + k',
          },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid props', () => {
    it('rejects props without template', () => {
      const props = {
        blanks: [
          {
            id: 'blank1',
            correctAnswer: 'answer',
          },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects empty template', () => {
      const props = {
        template: '',
        blanks: [],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects template without blank placeholders', () => {
      const props = {
        template: 'The vertex form of a quadratic is complete',
        blanks: [
          {
            id: 'blank1',
            correctAnswer: 'answer',
          },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: { path: (string | number | symbol)[] }) => issue.path.includes('template'))).toBe(
          true,
        );
      }
    });

    it('rejects template with mismatched blank IDs', () => {
      const props = {
        template: 'The vertex form is {{blank:blank1}}',
        blanks: [
          {
            id: 'differentId',
            correctAnswer: 'answer',
          },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects blank without id', () => {
      const props = {
        template: 'The form is {{blank:blank1}}',
        blanks: [
          {
            correctAnswer: 'answer',
          },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects blank without correctAnswer', () => {
      const props = {
        template: 'The form is {{blank:blank1}}',
        blanks: [
          {
            id: 'blank1',
          },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects blank with empty correctAnswer', () => {
      const props = {
        template: 'The form is {{blank:blank1}}',
        blanks: [
          {
            id: 'blank1',
            correctAnswer: '',
          },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects empty blanks array', () => {
      const props = {
        template: 'The form is {{blank:blank1}}',
        blanks: [],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects extra properties', () => {
      const props = {
        template: 'The form is {{blank:blank1}}',
        blanks: [
          {
            id: 'blank1',
            correctAnswer: 'answer',
          },
        ],
        extraProperty: 'should not be here',
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects wordBank item without id', () => {
      const props = {
        template: 'The form is {{blank:blank1}}',
        blanks: [
          {
            id: 'blank1',
            correctAnswer: 'answer',
          },
        ],
        wordBank: [
          { text: 'word' },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });

    it('rejects wordBank item without text', () => {
      const props = {
        template: 'The form is {{blank:blank1}}',
        blanks: [
          {
            id: 'blank1',
            correctAnswer: 'answer',
          },
        ],
        wordBank: [
          { id: 'word1' },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('infers correct type from schema', () => {
      const props = {
        template: 'The {{blank:blank1}} form is {{blank:blank2}}',
        blanks: [
          {
            id: 'blank1',
            correctAnswer: 'vertex',
            isMath: false,
          },
          {
            id: 'blank2',
            correctAnswer: 'y = a(x-h)^2 + k',
            isMath: true,
          },
        ],
      };

      const result = fillInTheBlankSchema.safeParse(props);
      expect(result.success).toBe(true);
      if (result.success) {
        const template: string = result.data.template;
        const blanks = result.data.blanks;
        expect(typeof template).toBe('string');
        expect(Array.isArray(blanks)).toBe(true);
        expect(blanks[0].correctAnswer).toBe('vertex');
        expect(blanks[1].isMath).toBe(true);
      }
    });
  });
});