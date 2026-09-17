import { describe, it, expect } from 'vitest';
import {
  SCHEMA_REGISTRY,
  getPropsSchema,
  comprehensionQuizSchema,
  fillInTheBlankSchema,
  graphingExplorerSchema,
  stepByStepSolverSchema,
  rateOfChangeCalculatorSchema,
  discriminantAnalyzerSchema,
} from '../index';
import type {
  ActivityComponentKey,
  ComprehensionQuizProps,
  FillInTheBlankProps,
  GraphingExplorerSchemaProps,
  StepByStepSolverProps,
  RateOfChangeCalculatorProps,
  DiscriminantAnalyzerProps,
} from '../index';

const validComprehensionQuiz: ComprehensionQuizProps = {
  activityId: 'act-1',
  questions: [
    { id: 'q1', type: 'multiple_choice', prompt: 'What is 2+2?', options: ['3', '4', '5'], correctAnswer: '4', explanation: 'Basic addition' },
    { id: 'q2', type: 'true_false', prompt: '2+2=5', correctAnswer: 'false' },
    { id: 'q3', type: 'short_answer', prompt: 'Name a prime number', correctAnswer: '2' },
    { id: 'q4', type: 'select_all', prompt: 'Which are even?', options: ['2', '3', '4'], correctAnswer: ['2', '4'] },
  ],
};

const validFillInTheBlank: FillInTheBlankProps = {
  activityId: 'act-2',
  template: 'The {{blank:q1}} of a quadratic is x = {{blank:q2}}',
  blanks: [
    { id: 'q1', correctAnswer: 'vertex', isMath: false },
    { id: 'q2', correctAnswer: '-b/2a', isMath: true },
  ],
  wordBank: [{ id: 'w1', text: 'vertex' }, { id: 'w2', text: '-b/2a' }],
};

const validGraphingExplorer: GraphingExplorerSchemaProps = {
  variant: 'plot_from_equation',
  equation: 'y = x^2 + 2x + 1',
  domain: [-10, 10],
  range: [-5, 15],
};

const validStepByStepSolver: StepByStepSolverProps = {
  problemType: 'quadratic_formula',
  equation: 'x^2 - 5x + 6 = 0',
  steps: [{ id: 's1', description: 'Apply quadratic formula', expression: 'x = (-b ± √(b² - 4ac)) / 2a', explanation: 'Standard form' }],
  hints: ['Identify a, b, c'],
};

const validRateOfChange: RateOfChangeCalculatorProps = {
  sourceType: 'table',
  data: { x: [1, 2, 3], y: [4, 6, 8] },
  interval: { start: 1, end: 3 },
};

const validDiscriminantAnalyzer: DiscriminantAnalyzerProps = {
  equation: 'x^2 - 4x + 4 = 0',
  coefficients: { a: 1, b: -4, c: 4 },
};

describe('Schema round-trip validation', () => {
  it('comprehensionQuizSchema accepts valid multi-question input', () => {
    const result = comprehensionQuizSchema.parse(validComprehensionQuiz);
    expect(result.questions).toHaveLength(4);
    expect(result.activityId).toBe('act-1');
  });

  it('comprehensionQuizSchema accepts select_all with array correctAnswer', () => {
    const data: ComprehensionQuizProps = {
      questions: [{ id: 'q1', type: 'select_all', prompt: 'Even numbers', options: ['1', '2', '3', '4'], correctAnswer: ['2', '4'] }],
    };
    const result = comprehensionQuizSchema.parse(data);
    expect(Array.isArray(result.questions[0].correctAnswer)).toBe(true);
  });

  it('fillInTheBlankSchema accepts valid template with matching blanks', () => {
    const result = fillInTheBlankSchema.parse(validFillInTheBlank);
    expect(result.blanks).toHaveLength(2);
    expect(result.template).toContain('{{blank:q1}}');
  });

  it('fillInTheBlankSchema accepts minimal valid input', () => {
    const data: FillInTheBlankProps = {
      template: 'Hello {{blank:name}}',
      blanks: [{ id: 'name', correctAnswer: 'World' }],
    };
    const result = fillInTheBlankSchema.parse(data);
    expect(result.blanks[0].id).toBe('name');
  });

  it('graphingExplorerSchema accepts valid equation', () => {
    const result = graphingExplorerSchema.parse(validGraphingExplorer);
    expect(result.equation).toBe('y = x^2 + 2x + 1');
    expect(result.variant).toBe('plot_from_equation');
  });

  it('graphingExplorerSchema accepts symmetry graph props', () => {
    const symmetryGraph = {
      equation: 'g(x) = -3x^2 + 6x - 1',
      variant: 'plot_from_equation',
      responseVariant: 'symmetry_graph',
      vertex: [1, 2],
      yIntercept: [0, -1],
      domain: [-3, 5],
      range: [-10, 5],
    };

    expect(graphingExplorerSchema.parse(symmetryGraph)).toEqual(symmetryGraph);
    expect(() => graphingExplorerSchema.parse({ ...symmetryGraph, vertex: ['1', 2] })).toThrow();
    expect(() => graphingExplorerSchema.parse({ ...symmetryGraph, yIntercept: [0, '-1'] })).toThrow();
  });

  it('graphingExplorerSchema accepts two-real-solutions props', () => {
    const twoRealSolutions = {
      equation: 'f(x) = x^2 - 24x + 143',
      variant: 'plot_from_equation',
      responseVariant: 'two_real_solutions',
      originalEquation: 'x(24 - x) = 143',
      points: [[10, 3], [11, 0], [12, -1], [13, 0], [14, 3]],
      domain: [8, 16],
      range: [-2, 8],
      sum: 24,
      product: 143,
    };

    expect(graphingExplorerSchema.parse(twoRealSolutions)).toEqual(twoRealSolutions);
    expect(() => graphingExplorerSchema.parse({ ...twoRealSolutions, sum: '24' })).toThrow();
    expect(() => graphingExplorerSchema.parse({ ...twoRealSolutions, product: '143' })).toThrow();
    expect(() => graphingExplorerSchema.parse({ ...twoRealSolutions, responseVariant: 'two_real_solution' })).toThrow();
    expect(() => graphingExplorerSchema.parse({ ...twoRealSolutions, unrelatedField: true })).toThrow();
  });

  it('graphingExplorerSchema accepts atomic one-real-solution props', () => {
    const atomicGraphing = {
      ...validGraphingExplorer,
      equation: 'f(x) = x^2 + 4x + 4',
      variant: 'plot_from_equation',
      responseVariant: 'one_real_solution',
      originalEquation: '10 - x^2 = 4x + 14',
      domain: [-5, 1],
      range: [0, 10],
    };
    const result = graphingExplorerSchema.parse(atomicGraphing);

    expect(result).toEqual(atomicGraphing);
    expect((result as typeof atomicGraphing).originalEquation).toBe('10 - x^2 = 4x + 14');
    expect(() => graphingExplorerSchema.parse({ ...atomicGraphing, originalEquation: '' })).toThrow();
    expect(() => graphingExplorerSchema.parse({ ...atomicGraphing, responseVariant: 'one_real_solutions' })).toThrow();
  });

  it('graphingExplorerSchema accepts both response variants and omission', () => {
    expect(graphingExplorerSchema.parse({ ...validGraphingExplorer, responseVariant: 'quadratic_features' }).responseVariant)
      .toBe('quadratic_features');
    expect(graphingExplorerSchema.parse({ ...validGraphingExplorer, responseVariant: 'table_graph' }).responseVariant)
      .toBe('table_graph');
    expect(graphingExplorerSchema.parse({ ...validGraphingExplorer, responseVariant: 'domain_range' }).responseVariant)
      .toBe('domain_range');
    expect(graphingExplorerSchema.parse({ ...validGraphingExplorer, responseVariant: 'maximum_value' }).responseVariant)
      .toBe('maximum_value');
    expect(graphingExplorerSchema.parse({ ...validGraphingExplorer, responseVariant: 'compare_maximums' }).responseVariant)
      .toBe('compare_maximums');
    expect(graphingExplorerSchema.parse(validGraphingExplorer).responseVariant).toBeUndefined();
  });

  it('graphingExplorerSchema rejects an unrelated response variant', () => {
    expect(() => graphingExplorerSchema.parse({ ...validGraphingExplorer, responseVariant: 'client_graded' })).toThrow();
  });

  it('graphingExplorerSchema accepts comparison mode', () => {
    const data: GraphingExplorerSchemaProps = {
      variant: 'compare_functions',
      equation: 'y = x^2',
      comparisonEquation: 'y = 2x + 1',
      comparisonQuestion: 'Which grows faster?',
      comparisonAnswer: 'second',
    };
    const result = graphingExplorerSchema.parse(data);
    expect(result.variant).toBe('compare_functions');
  });

  it('stepByStepSolverSchema accepts all problem types', () => {
    const problemTypes = ['quadratic_formula', 'factoring', 'completing_the_square', 'square_root_property', 'graphing'] as const;
    for (const type of problemTypes) {
      const data: StepByStepSolverProps = { problemType: type, equation: 'x^2 - 1 = 0' };
      const result = stepByStepSolverSchema.parse(data);
      expect(result.problemType).toBe(type);
    }
  });

  it('stepByStepSolverSchema accepts a rate_of_change solver', () => {
    const result = stepByStepSolverSchema.parse({
      problemType: 'rate_of_change',
      equation: 'f(x) = x^2 + 3x - 4',
      steps: [{
        id: 'rate-of-change-step-1',
        description: 'Evaluate the function at the endpoints.',
        expression: 'f(1) = 0, f(3) = 14',
      }],
    });

    expect(result.problemType).toBe('rate_of_change');
  });

  it('rateOfChangeCalculatorSchema accepts table source', () => {
    const result = rateOfChangeCalculatorSchema.parse(validRateOfChange);
    expect(result.sourceType).toBe('table');
    expect(result.interval.start).toBeLessThan(result.interval.end);
  });

  it('rateOfChangeCalculatorSchema accepts function source', () => {
    const data: RateOfChangeCalculatorProps = {
      sourceType: 'function',
      data: { expression: 'x^2' },
      interval: { start: 0, end: 5 },
    };
    const result = rateOfChangeCalculatorSchema.parse(data);
    expect(result.sourceType).toBe('function');
  });

  it('rateOfChangeCalculatorSchema accepts graph source', () => {
    const data: RateOfChangeCalculatorProps = {
      sourceType: 'graph',
      data: { points: [[0, 0], [1, 1], [2, 4]] as [number, number][] },
      interval: { start: 0, end: 2 },
    };
    const result = rateOfChangeCalculatorSchema.parse(data);
    expect(result.sourceType).toBe('graph');
  });

  it('discriminantAnalyzerSchema accepts valid quadratic', () => {
    const result = discriminantAnalyzerSchema.parse(validDiscriminantAnalyzer);
    expect(result.equation).toContain('x^2');
    expect(result.coefficients!.a).toBe(1);
  });

  it('discriminantAnalyzerSchema accepts equation-only (no coefficients)', () => {
    const data: DiscriminantAnalyzerProps = { equation: '2x^2 + 3x + 1 = 0' };
    const result = discriminantAnalyzerSchema.parse(data);
    expect(result.coefficients).toBeUndefined();
  });
});

describe('Schema rejections (invalid inputs)', () => {
  it('comprehensionQuizSchema rejects missing questions', () => {
    expect(() => comprehensionQuizSchema.parse({})).toThrow();
  });

  it('comprehensionQuizSchema rejects empty questions array', () => {
    expect(() => comprehensionQuizSchema.parse({ questions: [] })).toThrow();
  });

  it('fillInTheBlankSchema rejects empty blanks', () => {
    expect(() => fillInTheBlankSchema.parse({ template: 'hello', blanks: [] })).toThrow();
  });

  it('fillInTheBlankSchema rejects template with missing blank placeholder', () => {
    expect(() => fillInTheBlankSchema.parse({
      template: 'Hello',
      blanks: [{ id: 'name', correctAnswer: 'World' }],
    })).toThrow(/Template must contain/);
  });

  it('graphingExplorerSchema rejects missing equation', () => {
    expect(() => graphingExplorerSchema.parse({})).toThrow();
  });

  it('stepByStepSolverSchema rejects invalid problem type', () => {
    expect(() => stepByStepSolverSchema.parse({ problemType: 'invalid_type', equation: 'x^2' })).toThrow();
  });

  it('rateOfChangeCalculatorSchema rejects equal interval start and end', () => {
    expect(() => rateOfChangeCalculatorSchema.parse({
      sourceType: 'function',
      data: { expression: 'x' },
      interval: { start: 5, end: 5 },
    })).toThrow();
  });

  it('rateOfChangeCalculatorSchema rejects reversed interval', () => {
    expect(() => rateOfChangeCalculatorSchema.parse({
      sourceType: 'function',
      data: { expression: 'x' },
      interval: { start: 10, end: 1 },
    })).toThrow();
  });

  it('discriminantAnalyzerSchema rejects non-quadratic equation', () => {
    expect(() => discriminantAnalyzerSchema.parse({ equation: '2x + 1 = 0' })).toThrow();
  });

  it('discriminantAnalyzerSchema rejects zero coefficient a', () => {
    expect(() => discriminantAnalyzerSchema.parse({
      equation: 'x^2',
      coefficients: { a: 0, b: 1, c: 0 },
    })).toThrow();
  });
});

describe('SCHEMA_REGISTRY dispatch', () => {
  const allKeys: ActivityComponentKey[] = [
    'concavity-from-rate-change',
    'graphing-explorer',
    'step-by-step-solver',
    'comprehension-quiz',
    'fill-in-the-blank',
    'rate-of-change-calculator',
    'discriminant-analyzer',
    'physical-context-graph-choice',
    'table-average-rate-choice',
    'graph-average-rate-choice',
    'pointwise-least-rate-choice',
    'pointwise-rate-ordering',
    'negative-rate-context-choice',
    'quadratic-negative-rate-interval-choice',
    'rate-pattern-classification',
    'polynomial-degree-leading-coefficient',
    'polynomial-extrema-from-graph',
    'rate-sign-and-trend-from-graph',
  ];

  it('SCHEMA_REGISTRY maps all ActivityComponentKey values', () => {
    for (const key of allKeys) {
      const schema = SCHEMA_REGISTRY[key];
      expect(schema).toBeDefined();
      expect(typeof schema.parse).toBe('function');
      expect(typeof schema.safeParse).toBe('function');
    }
  });

  it('getPropsSchema returns correct schemas', () => {
    for (const key of allKeys) {
      const schema = getPropsSchema(key);
      expect(schema).toBeDefined();
      expect(schema).toBe(SCHEMA_REGISTRY[key]);
    }
  });

  it('getPropsSchema returns undefined for unknown key', () => {
    expect(getPropsSchema('unknown-component')).toBeUndefined();
  });

  it('SCHEMA_REGISTRY has exactly twenty-five entries', () => {
    expect(Object.keys(SCHEMA_REGISTRY)).toHaveLength(25);
  });
});
