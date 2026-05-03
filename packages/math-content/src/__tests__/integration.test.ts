import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  IM3_PROBLEM_FAMILIES,
  IM2_PROBLEM_FAMILIES,
  PRECALC_PROBLEM_FAMILIES,
  SCHEMA_REGISTRY,
  comprehensionQuizSchema,
  fillInTheBlankSchema,
  graphingExplorerSchema,
  stepByStepSolverSchema,
  rateOfChangeCalculatorSchema,
  discriminantAnalyzerSchema,
  glossaryTermSchema,
  IM3_GLOSSARY,
  getGlossaryTermBySlug,
  getGlossaryTermsByCourse,
  getGlossaryTermsByModule,
  getAllGlossaryCourses,
  getAllGlossaryModules,
  getAllGlossaryTopics,
  generateDistractors,
  normalizeExpression,
  checkEquivalence,
} from '../index';
import { problemFamilySchema } from '@math-platform/practice-core';

describe('Problem Families Integration', () => {
  const allFamilies = [
    ...IM3_PROBLEM_FAMILIES,
    ...IM2_PROBLEM_FAMILIES,
    ...PRECALC_PROBLEM_FAMILIES,
  ];

  it('has correct total count (87 + 71 + 41 = 199)', () => {
    expect(IM3_PROBLEM_FAMILIES).toHaveLength(87);
    expect(IM2_PROBLEM_FAMILIES).toHaveLength(71);
    expect(PRECALC_PROBLEM_FAMILIES).toHaveLength(41);
    expect(allFamilies).toHaveLength(199);
  });

  it('every problem family validates against ProblemFamilyInput schema', () => {
    const results = allFamilies.map((family) => ({
      id: family.problemFamilyId,
      valid: problemFamilySchema.safeParse(family).success,
    }));
    const failures = results.filter((r) => !r.valid);
    expect(failures).toEqual([]);
  });

  it('every problem family has a non-empty problemFamilyId', () => {
    for (const family of allFamilies) {
      expect(family.problemFamilyId.length).toBeGreaterThan(0);
    }
  });

  it('every problem family references a valid componentKey', () => {
    const validKeys = Object.keys(SCHEMA_REGISTRY);
    for (const family of allFamilies) {
      expect(validKeys).toContain(family.componentKey);
    }
  });

  it('every problem family has at least one objectiveId', () => {
    for (const family of allFamilies) {
      expect(family.objectiveIds.length).toBeGreaterThan(0);
    }
  });

  it('problemFamilyIds have minimal duplication across apps', () => {
    const ids = allFamilies.map((f) => f.problemFamilyId);
    const uniqueIds = new Set(ids);
    const duplicateCount = ids.length - uniqueIds.size;
    // Allow some cross-module duplication within apps but flag if excessive
    expect(duplicateCount).toBeLessThan(10);
  });
});

describe('Activity Schemas Integration', () => {
  it('comprehensionQuizSchema round-trips valid input', () => {
    const input = {
      questions: [
        {
          id: 'q1',
          prompt: 'What is 2+2?',
          options: ['3', '4', '5'],
          correctAnswer: '4',
        },
        {
          id: 'q2',
          prompt: 'Select all even numbers',
          type: 'select_all' as const,
          options: ['1', '2', '3', '4'],
          correctAnswer: ['2', '4'],
        },
      ],
    };
    const parsed = comprehensionQuizSchema.parse(input);
    expect(parsed).toEqual(input);
  });

  it('fillInTheBlankSchema round-trips valid input', () => {
    const input = {
      template: 'The answer is {{blank:a}} and {{blank:b}}',
      blanks: [
        { id: 'a', correctAnswer: '42' },
        { id: 'b', correctAnswer: '7' },
      ],
    };
    const parsed = fillInTheBlankSchema.parse(input);
    expect(parsed).toEqual(input);
  });

  it('graphingExplorerSchema round-trips valid input', () => {
    const input = {
      equation: 'y = x^2 - 4',
    };
    const parsed = graphingExplorerSchema.parse(input);
    expect(parsed.equation).toBe('y = x^2 - 4');
  });

  it('stepByStepSolverSchema round-trips valid input', () => {
    const input = {
      problemType: 'factoring' as const,
      equation: 'x^2 + 5x + 6',
      steps: [
        { id: 's1', description: 'Find factors', expression: '(x+2)(x+3)' },
      ],
    };
    const parsed = stepByStepSolverSchema.parse(input);
    expect(parsed.problemType).toBe('factoring');
  });

  it('rateOfChangeCalculatorSchema round-trips valid input', () => {
    const input = {
      sourceType: 'table' as const,
      data: { x: [0, 1, 2], y: [0, 1, 4] },
      interval: { start: 0, end: 2 },
    };
    const parsed = rateOfChangeCalculatorSchema.parse(input);
    expect(parsed.sourceType).toBe('table');
  });

  it('discriminantAnalyzerSchema round-trips valid input', () => {
    const input = {
      equation: 'x^2 + 3x + 2 = 0',
    };
    const parsed = discriminantAnalyzerSchema.parse(input);
    expect(parsed.equation).toBe('x^2 + 3x + 2 = 0');
  });

  it('schema registry has all 6 keys', () => {
    const keys = Object.keys(SCHEMA_REGISTRY);
    expect(keys).toHaveLength(6);
    expect(keys.sort()).toEqual([
      'comprehension-quiz',
      'discriminant-analyzer',
      'fill-in-the-blank',
      'graphing-explorer',
      'rate-of-change-calculator',
      'step-by-step-solver',
    ]);
  });

  it('invalid input is rejected by each schema', () => {
    expect(comprehensionQuizSchema.safeParse({}).success).toBe(false);
    expect(fillInTheBlankSchema.safeParse({}).success).toBe(false);
    expect(graphingExplorerSchema.safeParse({}).success).toBe(false);
    expect(stepByStepSolverSchema.safeParse({}).success).toBe(false);
    expect(rateOfChangeCalculatorSchema.safeParse({}).success).toBe(false);
    expect(discriminantAnalyzerSchema.safeParse({}).success).toBe(false);
  });
});

describe('Glossary Helpers Integration', () => {
  it('getGlossaryTermBySlug finds known term', () => {
    const term = getGlossaryTermBySlug(IM3_GLOSSARY, 'quadratic-function');
    expect(term).toBeDefined();
    expect(term?.term).toBe('Quadratic Function');
    expect(term?.courses).toContain('integrated-math-3');
  });

  it('getGlossaryTermBySlug returns undefined for unknown slug', () => {
    const term = getGlossaryTermBySlug(IM3_GLOSSARY, 'nonexistent-term');
    expect(term).toBeUndefined();
  });

  it('getGlossaryTermsByCourse filters correctly', () => {
    const terms = getGlossaryTermsByCourse(IM3_GLOSSARY, 'integrated-math-3');
    expect(terms.length).toBeGreaterThan(0);
    for (const term of terms) {
      expect(term.courses).toContain('integrated-math-3');
    }
  });

  it('getGlossaryTermsByModule filters correctly', () => {
    const terms = getGlossaryTermsByModule(IM3_GLOSSARY, 1);
    expect(terms.length).toBeGreaterThan(0);
    for (const term of terms) {
      expect(term.modules).toContain(1);
    }
  });

  it('getAllGlossaryCourses returns sorted unique courses', () => {
    const courses = getAllGlossaryCourses(IM3_GLOSSARY);
    expect(courses).toContain('integrated-math-3');
    expect(courses).toEqual([...courses].sort());
  });

  it('getAllGlossaryModules returns sorted unique module numbers', () => {
    const modules = getAllGlossaryModules(IM3_GLOSSARY);
    expect(modules.length).toBeGreaterThan(0);
    expect(modules).toEqual([...modules].sort((a, b) => a - b));
  });

  it('getAllGlossaryTopics returns sorted unique topics', () => {
    const topics = getAllGlossaryTopics(IM3_GLOSSARY);
    expect(topics.length).toBeGreaterThan(0);
    expect(topics).toEqual([...topics].sort());
  });

  it('all glossary terms validate against glossaryTermSchema', () => {
    for (const term of IM3_GLOSSARY) {
      const result = glossaryTermSchema.safeParse(term);
      if (!result.success) {
        console.error(`Failed validation for term: ${term.slug}`, result.error);
      }
      expect(result.success).toBe(true);
    }
  });
});

describe('Algebraic Distractors Integration', () => {
  const allTypes = [
    'factoring',
    'linear',
    'quadratic_formula',
    'complex',
    'completing_square',
    'discriminant',
    'system',
  ] as const;

  it('generates distractors for all 7 problem types', () => {
    for (const type of allTypes) {
      const distractors = generateDistractors('x = 5', type);
      expect(Array.isArray(distractors)).toBe(true);
    }
  });

  it('distractors never contain the correct answer', () => {
    const correctAnswer = 'x = 5';
    for (const type of allTypes) {
      const distractors = generateDistractors(correctAnswer, type);
      expect(distractors).not.toContain(correctAnswer);
    }
  });

  it('factoring distractors are valid strings', () => {
    const distractors = generateDistractors('(x+2)(x+3)', 'factoring');
    expect(distractors.length).toBeGreaterThan(0);
    for (const d of distractors) {
      expect(typeof d).toBe('string');
      expect(d.length).toBeGreaterThan(0);
    }
  });

  it('linear distractors are valid strings', () => {
    const distractors = generateDistractors('x = 3', 'linear');
    expect(distractors.length).toBeGreaterThan(0);
    for (const d of distractors) {
      expect(typeof d).toBe('string');
    }
  });
});

describe('Equivalence Checker Integration', () => {
  it('normalizes expressions consistently', () => {
    expect(normalizeExpression('X + 2')).toBe('x+2');
    expect(normalizeExpression('  x  +  2  ')).toBe('x+2');
    expect(normalizeExpression('x+2')).toBe(normalizeExpression('X + 2'));
  });

  it('detects equivalent expressions', () => {
    expect(checkEquivalence('x + 2', 'X + 2')).toBe(true);
    expect(checkEquivalence('x + 2', '2 + x')).toBe(true);
  });

  it('detects non-equivalent expressions', () => {
    expect(checkEquivalence('x + 2', 'x + 3')).toBe(false);
    expect(checkEquivalence('x + 2', 'x * 2')).toBe(false);
  });

  it('handles empty strings', () => {
    expect(normalizeExpression('')).toBe('');
    expect(normalizeExpression('   ')).toBe('');
  });
});
