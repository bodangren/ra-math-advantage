import { describe, it, expect } from 'vitest';
import {
  practiceItemSchema,
  type PracticeItemInput,
} from '@/lib/practice/practice-item';

function makeValidInput(): PracticeItemInput {
  return {
    practiceItemId: 'item-001',
    activityId: 'act-123',
    problemFamilyId: 'graphing-explorer:quadratic-transformations',
    variantLabel: 'Set A',
  };
}

describe('practiceItemSchema', () => {
  it('passes with valid data', () => {
    const input = makeValidInput();
    const result = practiceItemSchema.parse(input);
    expect(result.practiceItemId).toBe('item-001');
    expect(result.variantLabel).toBe('Set A');
  });

  it('rejects empty practiceItemId', () => {
    const input = { ...makeValidInput(), practiceItemId: '' };
    expect(() => practiceItemSchema.parse(input)).toThrow();
  });

  it('rejects whitespace-only practiceItemId', () => {
    const input = { ...makeValidInput(), practiceItemId: '   ' };
    expect(() => practiceItemSchema.parse(input)).toThrow();
  });

  it('rejects empty activityId', () => {
    const input = { ...makeValidInput(), activityId: '' };
    expect(() => practiceItemSchema.parse(input)).toThrow();
  });

  it('rejects empty problemFamilyId', () => {
    const input = { ...makeValidInput(), problemFamilyId: '  ' };
    expect(() => practiceItemSchema.parse(input)).toThrow();
  });

  it('rejects empty variantLabel', () => {
    const input = { ...makeValidInput(), variantLabel: '' };
    expect(() => practiceItemSchema.parse(input)).toThrow();
  });

  it('rejects whitespace-only variantLabel', () => {
    const input = { ...makeValidInput(), variantLabel: '\t\n' };
    expect(() => practiceItemSchema.parse(input)).toThrow();
  });

  it('rejects missing required fields', () => {
    const input = { practiceItemId: 'item-001' };
    expect(() => practiceItemSchema.parse(input)).toThrow();
  });
});
