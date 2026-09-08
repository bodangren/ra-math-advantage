import { describe, it, expect } from 'vitest';
import {
  comprehensionQuizSchema,
  fillInTheBlankSchema,
  rateOfChangeCalculatorSchema,
  discriminantAnalyzerSchema,
  getPropsSchema,
  SCHEMA_REGISTRY,
  ActivityComponentKey,
} from '../schemas';

describe('comprehensionQuizSchema', () => {
  it('should validate a valid quiz', () => {
    const result = comprehensionQuizSchema.safeParse({
      questions: [
        {
          id: 'q1',
          prompt: 'What is 2+2?',
          correctAnswer: '4',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty questions array', () => {
    const result = comprehensionQuizSchema.safeParse({ questions: [] });
    expect(result.success).toBe(false);
  });

  it('should reject question without prompt', () => {
    const result = comprehensionQuizSchema.safeParse({
      questions: [{ id: 'q1', correctAnswer: '4' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('fillInTheBlankSchema', () => {
  it('should validate a valid template with matching blanks', () => {
    const result = fillInTheBlankSchema.safeParse({
      template: 'Hello {{blank:name}}, you are {{blank:age}} years old.',
      blanks: [
        { id: 'name', correctAnswer: 'World' },
        { id: 'age', correctAnswer: '25' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should reject template without matching blank markers', () => {
    const result = fillInTheBlankSchema.safeParse({
      template: 'Hello world',
      blanks: [{ id: 'name', correctAnswer: 'World' }],
    });
    expect(result.success).toBe(false);
  });

  it('should reject blank without correctAnswer', () => {
    const result = fillInTheBlankSchema.safeParse({
      template: 'Hello {{blank:name}}',
      blanks: [{ id: 'name' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('rateOfChangeCalculatorSchema', () => {
  it('should validate table data with matching arrays', () => {
    const result = rateOfChangeCalculatorSchema.safeParse({
      sourceType: 'table',
      data: { x: [1, 2, 3], y: [4, 5, 6] },
      interval: { start: 1, end: 3 },
    });
    expect(result.success).toBe(true);
  });

  it('should reject interval where start >= end', () => {
    const result = rateOfChangeCalculatorSchema.safeParse({
      sourceType: 'table',
      data: { x: [1, 2], y: [3, 4] },
      interval: { start: 5, end: 3 },
    });
    expect(result.success).toBe(false);
  });

  it('should reject table data with mismatched array lengths', () => {
    const result = rateOfChangeCalculatorSchema.safeParse({
      sourceType: 'table',
      data: { x: [1, 2, 3], y: [4, 5] },
      interval: { start: 1, end: 3 },
    });
    expect(result.success).toBe(false);
  });
});

describe('discriminantAnalyzerSchema', () => {
  it('should validate a quadratic equation', () => {
    const result = discriminantAnalyzerSchema.safeParse({
      equation: '2x^2 + 3x - 5 = 0',
    });
    expect(result.success).toBe(true);
  });

  it('should reject non-quadratic equation', () => {
    const result = discriminantAnalyzerSchema.safeParse({
      equation: '3x + 5 = 0',
    });
    expect(result.success).toBe(false);
  });

  it('should reject equation with zero x^2 coefficient', () => {
    const result = discriminantAnalyzerSchema.safeParse({
      equation: '0x^2 + 3x - 5 = 0',
    });
    expect(result.success).toBe(false);
  });
});

describe('SCHEMA_REGISTRY', () => {
  it('should contain all 7 activity keys', () => {
    expect(Object.keys(SCHEMA_REGISTRY).length).toBe(7);
  });

  it('should have zod schemas for each key', () => {
    const keys: ActivityComponentKey[] = [
      'graphing-explorer',
      'step-by-step-solver',
      'comprehension-quiz',
      'fill-in-the-blank',
      'rate-of-change-calculator',
      'discriminant-analyzer',
      'quadratic-formula',
    ];
    keys.forEach((key) => {
      expect(SCHEMA_REGISTRY[key]).toBeDefined();
      expect(typeof SCHEMA_REGISTRY[key].safeParse).toBe('function');
    });
  });
});

describe('getPropsSchema', () => {
  it('should return schema for valid key', () => {
    const schema = getPropsSchema('comprehension-quiz');
    expect(schema).toBeDefined();
  });

  it('should return undefined for invalid key', () => {
    const schema = getPropsSchema('nonexistent');
    expect(schema).toBeUndefined();
  });
});
