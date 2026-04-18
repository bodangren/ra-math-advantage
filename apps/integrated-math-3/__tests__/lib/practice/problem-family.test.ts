import { describe, it, expect } from 'vitest';
import {
  problemFamilySchema,
  difficultySchema,
  type ProblemFamilyInput,
} from '@/lib/practice/problem-family';

function makeValidInput(): ProblemFamilyInput {
  return {
    problemFamilyId: 'graphing-explorer:quadratic-transformations',
    componentKey: 'graphing-explorer',
    displayName: 'Quadratic Transformations',
    description: 'Explore how a, h, and k transform the graph of a quadratic.',
    objectiveIds: ['std-1', 'std-2'],
    difficulty: 'standard',
    metadata: { domain: 'algebra' },
  };
}

describe('difficultySchema', () => {
  it('accepts introductory', () => {
    expect(difficultySchema.parse('introductory')).toBe('introductory');
  });

  it('accepts standard', () => {
    expect(difficultySchema.parse('standard')).toBe('standard');
  });

  it('accepts challenging', () => {
    expect(difficultySchema.parse('challenging')).toBe('challenging');
  });

  it('rejects invalid difficulty', () => {
    expect(() => difficultySchema.parse('easy')).toThrow();
  });
});

describe('problemFamilySchema', () => {
  it('passes with valid data', () => {
    const input = makeValidInput();
    const result = problemFamilySchema.parse(input);
    expect(result.problemFamilyId).toBe(input.problemFamilyId);
    expect(result.difficulty).toBe('standard');
  });

  it('rejects empty problemFamilyId', () => {
    const input = { ...makeValidInput(), problemFamilyId: '  ' };
    expect(() => problemFamilySchema.parse(input)).toThrow();
  });

  it('rejects empty componentKey', () => {
    const input = { ...makeValidInput(), componentKey: '' };
    expect(() => problemFamilySchema.parse(input)).toThrow();
  });

  it('rejects empty displayName', () => {
    const input = { ...makeValidInput(), displayName: '   ' };
    expect(() => problemFamilySchema.parse(input)).toThrow();
  });

  it('rejects empty description', () => {
    const input = { ...makeValidInput(), description: '' };
    expect(() => problemFamilySchema.parse(input)).toThrow();
  });

  it('accepts empty objectiveIds array', () => {
    const input = { ...makeValidInput(), objectiveIds: [] };
    const result = problemFamilySchema.parse(input);
    expect(result.objectiveIds).toEqual([]);
  });

  it('rejects objectiveIds with empty strings', () => {
    const input = { ...makeValidInput(), objectiveIds: ['std-1', ''] };
    expect(() => problemFamilySchema.parse(input)).toThrow();
  });

  it('rejects invalid difficulty', () => {
    const input = { ...makeValidInput(), difficulty: 'hard' };
    expect(() => problemFamilySchema.parse(input)).toThrow();
  });

  it('accepts empty metadata object', () => {
    const input = { ...makeValidInput(), metadata: {} };
    const result = problemFamilySchema.parse(input);
    expect(result.metadata).toEqual({});
  });

  it('rejects missing required fields', () => {
    const input = { problemFamilyId: 'pf-1' };
    expect(() => problemFamilySchema.parse(input)).toThrow();
  });
});
