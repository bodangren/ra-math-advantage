import { describe, it, expect } from 'vitest';
import {
  comprehensionQuizSchema,
  fillInTheBlankSchema,
  graphingExplorerSchema,
  stepByStepSolverSchema,
  rateOfChangeCalculatorSchema,
  discriminantAnalyzerSchema,
  SCHEMA_REGISTRY,
  generateDistractors,
  normalizeExpression,
  checkEquivalence,
  getGlossaryTermBySlug,
  IM3_GLOSSARY,
  createActivitySeed,
  createPhaseSeed,
  IM3_PROBLEM_FAMILIES,
  IM2_PROBLEM_FAMILIES,
  PRECALC_PROBLEM_FAMILIES,
} from '../index';

describe('math-content package scaffold', () => {
  it('all 25 activity schemas are registered', () => {
    const keys = Object.keys(SCHEMA_REGISTRY);
    expect(keys).toHaveLength(25);
    expect(keys).toContain('concavity-from-rate-change');
    expect(keys).toContain('comprehension-quiz');
    expect(keys).toContain('fill-in-the-blank');
    expect(keys).toContain('graphing-explorer');
    expect(keys).toContain('step-by-step-solver');
    expect(keys).toContain('rate-of-change-calculator');
    expect(keys).toContain('discriminant-analyzer');
    expect(keys).toContain('interval-classification');
    expect(keys).toContain('physical-context-graph-choice');
    expect(keys).toContain('table-average-rate-choice');
    expect(keys).toContain('graph-average-rate-choice');
    expect(keys).toContain('negative-rate-context-choice');
    expect(keys).toContain('pointwise-least-rate-choice');
    expect(keys).toContain('pointwise-rate-ordering');
    expect(keys).toContain('quadratic-negative-rate-interval-choice');
    expect(keys).toContain('rate-pattern-classification');
    expect(keys).toContain('polynomial-degree-leading-coefficient');
    expect(keys).toContain('polynomial-extrema-from-graph');
    expect(keys).toContain('rate-sign-and-trend-from-graph');
  });

  it('comprehensionQuizSchema validates valid input', () => {
    const result = comprehensionQuizSchema.safeParse({
      questions: [{ id: 'q1', prompt: 'What is 2+2?', options: ['3', '4', '5'], correctAnswer: '4' }],
    });
    expect(result.success).toBe(true);
  });

  it('fillInTheBlankSchema validates template with matching blanks', () => {
    const result = fillInTheBlankSchema.safeParse({
      template: 'x = {{blank:answer}}',
      blanks: [{ id: 'answer', correctAnswer: '42' }],
    });
    expect(result.success).toBe(true);
  });

  it('graphingExplorerSchema validates with equation', () => {
    const result = graphingExplorerSchema.safeParse({
      equation: 'y = x^2',
    });
    expect(result.success).toBe(true);
  });

  it('stepByStepSolverSchema validates with problemType', () => {
    const result = stepByStepSolverSchema.safeParse({
      problemType: 'factoring',
      equation: 'x^2 + 5x + 6',
    });
    expect(result.success).toBe(true);
  });

  it('rateOfChangeCalculatorSchema validates table source', () => {
    const result = rateOfChangeCalculatorSchema.safeParse({
      sourceType: 'table',
      data: { x: [0, 1, 2], y: [0, 1, 4] },
      interval: { start: 0, end: 2 },
    });
    expect(result.success).toBe(true);
  });

  it('discriminantAnalyzerSchema validates quadratic equation', () => {
    const result = discriminantAnalyzerSchema.safeParse({
      equation: 'x^2 + 3x + 2 = 0',
    });
    expect(result.success).toBe(true);
  });

  it('generateDistractors returns 2 distractors', () => {
    const distractors = generateDistractors('x = 5', 'linear');
    expect(distractors).toHaveLength(2);
    expect(distractors).not.toContain('x = 5');
  });

  it('normalizeExpression handles whitespace and case', () => {
    expect(normalizeExpression('  X +  2  ')).toBe('x+2');
  });

  it('checkEquivalence detects identical expressions', () => {
    expect(checkEquivalence('x + 2', 'X + 2')).toBe(true);
  });

  it('glossary helpers work with IM3 data', () => {
    const term = getGlossaryTermBySlug(IM3_GLOSSARY, 'quadratic-function');
    expect(term).toBeDefined();
    expect(term?.courses).toContain('integrated-math-3');
  });

  it('problem families have correct counts', () => {
    expect(IM3_PROBLEM_FAMILIES.length).toBe(87);
    expect(IM2_PROBLEM_FAMILIES.length).toBe(71);
    expect(PRECALC_PROBLEM_FAMILIES.length).toBe(41);
  });

  it('seed helpers create valid structures', () => {
    const activity = createActivitySeed('step-by-step-solver', 'Test', { equation: 'x^2' });
    expect(activity.componentKey).toBe('step-by-step-solver');

    const phase = createPhaseSeed(1, 'learn', [{ sectionType: 'text', content: 'Hello' }]);
    expect(phase.phaseNumber).toBe(1);
  });
});
