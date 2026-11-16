import { describe, expect, it } from 'vitest';
import {
  getPropsSchema,
  polynomialExtremaFromGraphSchema,
} from '..';
import {
  generateTopic14PolynomialExtremaFromGraphOutput,
} from '../knowledge-space';
import type { Topic14PolynomialExtremaFromGraphVariant } from '../knowledge-space';

const guidedSteps = [
  'Check the input widths.',
  'Read the graph direction.',
  'Classify the extrema.',
];

type PublicProps = Omit<Topic14PolynomialExtremaFromGraphVariant, 'seed'> & {
  readonly presentationMode: 'independent_practice';
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function publicProps(seed: number): PublicProps {
  return clone<PublicProps>(
    generateTopic14PolynomialExtremaFromGraphOutput(seed).data.rendererProps as PublicProps,
  );
}

function guidedProps(seed = 1) {
  return {
    ...publicProps(seed),
    presentationMode: 'guided_practice' as const,
    guidedSteps,
    fieldHelp: 'Use the graph direction to identify each turning point.',
  };
}

function workedProps() {
  const output = generateTopic14PolynomialExtremaFromGraphOutput(0);
  return {
    ...publicProps(0),
    presentationMode: 'worked_example' as const,
    correctAnswers: clone(output.expectedAnswer),
    steps: output.solutionSteps.map((step) => step.description),
    finalAnswer: 'The absolute minimum is g(1).',
  };
}

function expectRejected(value: unknown): void {
  expect(polynomialExtremaFromGraphSchema.safeParse(value).success).toBe(false);
}

function expectNoAuthority(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) expectNoAuthority(item);
    return;
  }
  if (value === null || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    expect([
      'correctAnswers',
      'solutionSteps',
      'steps',
      'gradingMetadata',
      'score',
      'finalAnswer',
      'relative_minimum_x',
      'relative_maximum_x',
      'absolute_minimum_x',
    ]).not.toContain(key);
    expectNoAuthority(child);
  }
}

describe('polynomialExtremaFromGraphSchema', () => {
  it('accepts live source, guided, worked, and generated public props', () => {
    const source = publicProps(0);
    expect(source).toMatchObject({
      prompt: 'Use the graph of polynomial g to identify its extrema.',
      functionName: 'g',
      coefficients: [3, -44, 204, -288, 125],
      domain: [-1, 5],
      presentationMode: 'independent_practice',
    });
    expect(polynomialExtremaFromGraphSchema.safeParse(source).success).toBe(true);
    expect(polynomialExtremaFromGraphSchema.safeParse(guidedProps()).success).toBe(true);
    expect(polynomialExtremaFromGraphSchema.safeParse(workedProps()).success).toBe(true);
    expectNoAuthority(source);
    expectNoAuthority(guidedProps());

    for (let seed = 0; seed < 1000; seed += 1) {
      expect(polynomialExtremaFromGraphSchema.safeParse(publicProps(seed)).success).toBe(true);
    }
  });

  it('resolves the exact registered schema', () => {
    expect(getPropsSchema('polynomial-extrema-from-graph')).toBe(polynomialExtremaFromGraphSchema);
  });

  it('rejects malformed graph geometry and unknown fields', () => {
    const base = publicProps(0);
    const cases = [
      { ...base, coefficients: base.coefficients.slice(1) },
      { ...base, coefficients: [3, -44, 204, -288, '125'] },
      { ...base, coefficients: [0, -44, 204, -288, 125] },
      { ...base, coefficients: [-3, -44, 204, -288, 125] },
      { ...base, coefficients: [Number.NaN, -44, 204, -288, 125] },
      { ...base, coefficients: [Number.MAX_SAFE_INTEGER + 1, -44, 204, -288, 125] },
      { ...base, domain: [5, -1] },
      { ...base, domain: [-1] },
      { ...base, points: base.points.slice(1) },
      { ...base, points: base.points.map((point, index) => index === 2 ? { ...point, x: point.x + 0.1 } : point) },
      { ...base, points: base.points.map((point, index) => index === 3 ? { ...point, x: base.points[2]!.x } : point) },
      { ...base, points: [base.points[0]!, base.points[2]!, base.points[1]!, ...base.points.slice(3)] },
      { ...base, points: base.points.map((point, index) => index === 2 ? { ...point, y: point.y + 1 } : point) },
      { ...base, points: base.points.map((point, index) => index === 1 ? { ...point, x: Infinity } : point) },
      { ...base, points: base.points.map((point, index) => index === 1 ? { ...point, y: Number.MAX_SAFE_INTEGER + 1 } : point) },
      { ...base, points: [{ ...base.points[0], extra: true }, ...base.points.slice(1)] },
      { ...base, extra: true },
      { ...base, prompt: ' ' },
      { ...base, title: ' ' },
      { ...base, functionName: 'f' },
    ];
    for (const value of cases) expectRejected(value);
  });

  it('rejects authority in practice modes and malformed guided props', () => {
    expectRejected({ ...publicProps(0), correctAnswers: generateTopic14PolynomialExtremaFromGraphOutput(0).expectedAnswer });
    expectRejected({ ...publicProps(0), steps: ['a', 'b', 'c'] });
    expectRejected({ ...publicProps(0), gradingMetadata: {} });
    expectRejected({ ...publicProps(0), score: 1 });
    expectRejected({ ...guidedProps(), guidedSteps: ['one', 'two'] });
    expectRejected({ ...guidedProps(), guidedSteps: ['one', '', 'three'] });
    expectRejected({ ...guidedProps(), fieldHelp: ' ' });
    expectRejected({ ...guidedProps(), correctAnswers: {} });
  });

  it('validates Worked extrema authority and rejects wrong answers', () => {
    const base = workedProps();
    const { correctAnswers, ...missingAuthority } = base;
    void correctAnswers;
    expectRejected(missingAuthority);
    expectRejected({ ...base, correctAnswers: { ...base.correctAnswers, relative_minimum_x: -1 } });
    expectRejected({ ...base, correctAnswers: { ...base.correctAnswers, relative_maximum_x: 1 } });
    expectRejected({ ...base, correctAnswers: { ...base.correctAnswers, absolute_minimum_x: 4 } });
    expectRejected({ ...base, correctAnswers: { ...base.correctAnswers, absolute_minimum_x: 2 } });
    expectRejected({ ...base, correctAnswers: { ...base.correctAnswers, relative_minimum_x: 1, extra: 2 } });
    expectRejected({ ...base, correctAnswers: { ...base.correctAnswers, relative_minimum_x: 1.5 } });
    expectRejected({ ...base, steps: ['one', 'two'] });
    expectRejected({ ...base, finalAnswer: ' ' });

    const constant: PublicProps = {
      ...publicProps(0),
      coefficients: [0, 0, 0, 0, 4],
      points: publicProps(0).points.map((point) => ({ ...point, y: 4 })),
    };
    const constantWorked = {
      ...constant,
      presentationMode: 'worked_example' as const,
      correctAnswers: { relative_minimum_x: 1, relative_maximum_x: 4, absolute_minimum_x: 1 },
      steps: ['one', 'two', 'three'],
      finalAnswer: 'neither',
    };
    expectRejected(constantWorked);
  });
});
