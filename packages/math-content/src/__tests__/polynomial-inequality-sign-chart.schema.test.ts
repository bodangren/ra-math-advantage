import {
  generateTopic15PolynomialInequalityOutput,
} from '../knowledge-space';
import {
  getPropsSchema,
  polynomialInequalitySignChartSchema,
} from '../schemas';
import { describe, expect, it } from 'vitest';

const COMPONENT_KEY = 'polynomial-inequality-sign-chart';
const SOURCE_OUTPUT = generateTopic15PolynomialInequalityOutput(0);
const SOURCE_PROPS = SOURCE_OUTPUT.data.rendererProps as Record<string, unknown>;
const SOURCE_WORKED_ANSWERS = {
  roots: [-4, -1, 3],
  intervalSigns: ['-', '+', '-', '+'],
  solution: '(-4, -1) ∪ (3, ∞)',
};
const SOURCE_WORKED_STEPS = [
  'Identify the roots x = -4, x = -1, and x = 3 as the critical points.',
  'Test x = -5, x = -2, x = 0, and x = 4 to get signs -, +, -, + from left to right.',
  'Because the inequality is strict, do not include the roots.',
  'Write the solution as (-4, -1) ∪ (3, ∞).',
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function workedProps(): Record<string, unknown> {
  return {
    ...SOURCE_PROPS,
    presentationMode: 'worked_example',
    correctAnswers: clone(SOURCE_WORKED_ANSWERS),
    steps: [...SOURCE_WORKED_STEPS],
    finalAnswer: 'The solution is (-4, -1) ∪ (3, ∞).',
  };
}

function guidedProps(): Record<string, unknown> {
  return {
    ...SOURCE_PROPS,
    presentationMode: 'guided_practice',
    guidedSteps: [
      'Find and sort the distinct real roots.',
      'Test one value in each interval and record the sign.',
      'Use the inequality operator to write the interval union.',
    ],
    fieldHelp: {
      roots: 'Enter the sorted distinct real roots.',
      intervalSigns: 'Enter one sign for each interval from left to right.',
      solution: 'Write the solution as an interval union.',
    },
  };
}

function independentProps(): Record<string, unknown> {
  return { ...SOURCE_PROPS };
}

function expectRejected(value: unknown): void {
  expect(polynomialInequalitySignChartSchema.safeParse(value).success).toBe(false);
}

describe('polynomial inequality sign-chart schema', () => {
  it('resolves the exact registered schema and accepts live Independent props for seeds 0 through 50', () => {
    expect(getPropsSchema(COMPONENT_KEY)).toBe(polynomialInequalitySignChartSchema);

    for (let seed = 0; seed <= 50; seed += 1) {
      const props = generateTopic15PolynomialInequalityOutput(seed).data.rendererProps as Record<string, unknown>;
      expect(Object.keys(props).sort()).toEqual([
        'distinctRootCount',
        'expression',
        'operator',
        'presentationMode',
        'prompt',
      ]);
      expect(polynomialInequalitySignChartSchema.safeParse(props).success).toBe(true);
    }
  });

  it('accepts strict Worked and Guided shapes with the three evidence fields', () => {
    expect(polynomialInequalitySignChartSchema.safeParse(workedProps()).success).toBe(true);
    expect(polynomialInequalitySignChartSchema.safeParse(guidedProps()).success).toBe(true);
  });

  it('requires valid Worked roots, interval signs, and answer structure', () => {
    const props = workedProps();
    const answers = props.correctAnswers as Record<string, unknown>;
    const roots = answers.roots as number[];
    const signs = answers.intervalSigns as string[];

    expect(Object.keys(answers).sort()).toEqual(['intervalSigns', 'roots', 'solution']);
    expect(roots).toHaveLength(props.distinctRootCount as number);
    expect(roots.every((root) => Number.isSafeInteger(root) && root >= -5 && root <= 5)).toBe(true);
    expect(new Set(roots).size).toBe(roots.length);
    expect(roots).toEqual([...roots].sort((left, right) => left - right));
    expect(signs).toHaveLength((props.distinctRootCount as number) + 1);
    expect(signs.every((sign) => sign === '+' || sign === '-')).toBe(true);

    for (const field of ['roots', 'intervalSigns', 'solution']) {
      const missing = clone(props);
      delete (missing.correctAnswers as Record<string, unknown>)[field];
      expectRejected(missing);
    }
    for (const field of ['correctAnswers', 'steps', 'finalAnswer']) {
      const missing = clone(props);
      delete missing[field];
      expectRejected(missing);
    }
    expectRejected({ ...props, steps: ['one', 'two', 'three'] });
    expectRejected({ ...props, steps: ['one', 'two', '   ', 'four'] });
    expectRejected({ ...props, finalAnswer: '   ' });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, extra: 'authority' },
    });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, roots: [...roots, 4] },
    });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, roots: [-4, 3, -1] },
    });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, roots: [-4, -1, 3.5] },
    });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, roots: [-6, -1, 3] },
    });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, roots: [-4, -1, 6] },
    });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, roots: [-4, -1, -1] },
    });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, roots: [-4, -1, Number.NaN] },
    });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, roots: [-4, -1, Number.MAX_SAFE_INTEGER + 1] },
    });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, intervalSigns: [...signs, '+'] },
    });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, intervalSigns: signs.slice(0, -1) },
    });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, intervalSigns: ['-', 'wrong', '-', '+'] },
    });
    expectRejected({
      ...props,
      correctAnswers: { ...answers, solution: '   ' },
    });
  });

  it('requires the exact base fields and strict mode-specific fields', () => {
    for (const field of ['title', 'prompt', 'expression']) {
      const value = independentProps();
      value[field] = '   ';
      expectRejected(value);
    }
    for (const operator of ['=', '!=', '≤', '']) {
      expectRejected({ ...independentProps(), operator });
    }
    for (const distinctRootCount of [0, 1, 4, 2.5, Number.NaN, Number.POSITIVE_INFINITY, '2']) {
      expectRejected({ ...independentProps(), distinctRootCount });
    }

    expectRejected({ ...independentProps(), presentationMode: 'unknown' });
    expectRejected({ ...independentProps(), extra: true });
    expectRejected({ ...independentProps(), roots: [-4, -1, 3] });
    expectRejected({ ...independentProps(), intervalSigns: ['-', '+', '-', '+'] });
    expectRejected({ ...independentProps(), solution: '(-4, -1)' });
    expectRejected({ ...independentProps(), correctAnswers: clone(SOURCE_WORKED_ANSWERS) });
    expectRejected({ ...independentProps(), steps: [...SOURCE_WORKED_STEPS] });
    expectRejected({ ...independentProps(), finalAnswer: 'hidden' });
  });

  it('requires Guided help and rejects cross-mode or malformed mode fields', () => {
    const guided = guidedProps();
    const help = guided.fieldHelp as Record<string, unknown>;
    expect(Object.keys(help).sort()).toEqual(['intervalSigns', 'roots', 'solution']);
    expect(Object.values(help).every((value) => typeof value === 'string' && value.trim().length > 0)).toBe(true);
    expect((guided.guidedSteps as string[]).length).toBeGreaterThanOrEqual(3);

    for (const field of ['roots', 'intervalSigns', 'solution']) {
      const missing = clone(guided);
      delete (missing.fieldHelp as Record<string, unknown>)[field];
      expectRejected(missing);
      expectRejected({
        ...guided,
        fieldHelp: { ...help, extra: 'hidden' },
      });
    }
    expectRejected({ ...guided, guidedSteps: ['one', 'two'] });
    expectRejected({ ...guided, guidedSteps: [...(guided.guidedSteps as string[]), '   '] });
    expectRejected({
      ...guided,
      fieldHelp: { ...help, roots: '   ' },
    });
    const missingGuidedSteps = clone(guided);
    delete missingGuidedSteps.guidedSteps;
    expectRejected(missingGuidedSteps);
    const missingGuidedHelp = clone(guided);
    delete missingGuidedHelp.fieldHelp;
    expectRejected(missingGuidedHelp);
    expectRejected({ ...guided, correctAnswers: clone(SOURCE_WORKED_ANSWERS) });
    expectRejected({ ...guided, steps: [...SOURCE_WORKED_STEPS] });
    expectRejected({ ...guided, finalAnswer: 'hidden' });
    expectRejected({ ...workedProps(), guidedSteps: ['one', 'two', 'three'], fieldHelp: help });
    expectRejected({ ...workedProps(), roots: [-4, -1, 3] });
  });
});
