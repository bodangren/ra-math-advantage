import { describe, expect, it } from 'vitest';

import {
  generateTopic14RateSignAndTrendOutput,
} from '../knowledge-space';
import {
  getPropsSchema,
  rateSignAndTrendFromGraphSchema,
} from '../schemas';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

type PublicProps = {
  prompt: string;
  functionName: 'h';
  interval: readonly [number, number];
  points: readonly { x: number; y: number }[];
  presentationMode: 'independent_practice';
};

function publicProps(seed: number): PublicProps {
  return clone(generateTopic14RateSignAndTrendOutput(seed).data.rendererProps) as PublicProps;
}

function guidedProps(seed = 1) {
  return {
    ...publicProps(seed),
    presentationMode: 'guided_practice' as const,
    guidedSteps: ['Read the interval.', 'Compare the rate changes.'],
    fieldHelp: 'Use the graph direction and how it changes.',
  };
}

function workedProps() {
  const output = generateTopic14RateSignAndTrendOutput(0);
  return {
    ...publicProps(0),
    presentationMode: 'worked_example' as const,
    correctAnswers: clone(output.expectedAnswer),
    steps: output.solutionSteps.map((step) => step.description),
    finalAnswer: 'The rate is positive and decreasing.',
  };
}

function expectRejected(value: unknown): void {
  expect(rateSignAndTrendFromGraphSchema.safeParse(value).success).toBe(false);
}

describe('rateSignAndTrendFromGraphSchema', () => {
  it('accepts live Independent, Guided, and Worked props', () => {
    expect(rateSignAndTrendFromGraphSchema.safeParse(publicProps(0)).success).toBe(true);
    expect(rateSignAndTrendFromGraphSchema.safeParse({ ...publicProps(0), title: 'Rate sign and trend' }).success).toBe(true);
    expect(rateSignAndTrendFromGraphSchema.safeParse(guidedProps()).success).toBe(true);
    expect(rateSignAndTrendFromGraphSchema.safeParse(workedProps()).success).toBe(true);

    for (let seed = 0; seed < 1000; seed += 1) {
      expect(rateSignAndTrendFromGraphSchema.safeParse(publicProps(seed)).success).toBe(true);
    }
  });

  it('resolves the exact schema from the registry', () => {
    expect(getPropsSchema('rate-sign-and-trend-from-graph')).toBe(rateSignAndTrendFromGraphSchema);
  });

  it('rejects malformed graph geometry, values, and unknown fields', () => {
    const base = publicProps(0) as Record<string, unknown> & {
      interval: readonly [number, number];
      points: readonly { x: number; y: number }[];
    };
    const cases = [
      { ...base, interval: [4, 3] },
      { ...base, interval: [3, 3] },
      { ...base, interval: [3, 4.5] },
      { ...base, points: base.points.slice(1) },
      { ...base, points: [...base.points, { x: 4.25, y: 10 }] },
      { ...base, points: base.points.map((point, index) => index === 2 ? { ...point, x: 3.1 } : point) },
      { ...base, points: base.points.map((point, index) => index === 2 ? { ...point, x: 3.25 } : point) },
      { ...base, points: [base.points[0], base.points[2], base.points[1], ...base.points.slice(3)] },
      { ...base, points: base.points.map((point, index) => index === 2 ? { ...point, y: point.y - 5.5 } : point) },
      { ...base, points: base.points.map((point, index) => index === 1 ? { ...point, y: Number.POSITIVE_INFINITY } : point) },
      { ...base, points: base.points.map((point, index) => index === 1 ? { ...point, y: Number.MAX_SAFE_INTEGER } : point) },
      { ...base, points: base.points.map((point) => ({ ...point, extra: true })) },
      { ...base, extra: true },
      { ...base, title: ' ' },
      { ...base, prompt: ' ' },
      { ...base, functionName: 'g' },
    ];
    for (const value of cases) expectRejected(value);
  });

  it('rejects flat, zero, and sign-changing rate patterns', () => {
    const base = publicProps(0) as Record<string, unknown> & {
      points: readonly { x: number; y: number }[];
    };
    expectRejected({
      ...base,
      points: base.points.map((point, index) => index === 2 ? { ...point, y: base.points[1]!.y } : point),
    });
    expectRejected({
      ...base,
      points: base.points.map((point, index) => index >= 2 ? { ...point, y: point.y - 20 } : point),
    });
    expectRejected({
      ...base,
      points: base.points.map((point, index) => ({ ...point, y: index })),
    });
  });

  it('rejects authority and malformed mode-specific props', () => {
    expectRejected({ ...publicProps(0), correctAnswers: { rateSign: 'positive', rateTrend: 'decreasing' } });
    expectRejected({ ...publicProps(0), guidedSteps: ['one', 'two'], fieldHelp: 'help' });
    expectRejected({ ...guidedProps(), steps: ['one'] });
    expectRejected({ ...guidedProps(), guidedSteps: ['one'] });
    expectRejected({ ...guidedProps(), guidedSteps: ['one', ''] });
    expectRejected({ ...guidedProps(), fieldHelp: ' ' });
  });

  it('validates Worked answers against the live graph slopes', () => {
    const base = workedProps();
    expectRejected({ ...base, correctAnswers: { rateSign: 'negative', rateTrend: 'decreasing' } });
    expectRejected({ ...base, correctAnswers: { rateSign: 'positive', rateTrend: 'increasing' } });
    expectRejected({ ...base, correctAnswers: { rateSign: 'positive', rateTrend: 'decreasing', extra: true } });
    expectRejected({ ...base, correctAnswers: { rateSign: 'positive' } });
    expectRejected({ ...base, finalAnswer: ' ' });
    expectRejected({ ...base, steps: [] });
  });
});
