import { describe, expect, it } from 'vitest';

import {
  generateTopic12QuadraticNegativeRateIntervalChoice,
  generateTopic12QuadraticNegativeRateIntervalChoiceOutput,
} from '../knowledge-space/generators/topic12-quadratic-negative-rate-interval-choice';
import { getPropsSchema } from '../index';

const SOURCE_STEPS = [
  'The quadratic opens downward.',
  'The vertex is at x = 2.470.',
  'The rate is negative to the right of the vertex, so option D is correct.',
] as const;

function sourceBase() {
  const variant = generateTopic12QuadraticNegativeRateIntervalChoice(0);
  return {
    prompt: variant.prompt,
    functionName: variant.functionName,
    constantTerm: variant.constantTerm,
    linearCoefficient: variant.linearCoefficient,
    quadraticCoefficient: variant.quadraticCoefficient,
    domain: [...variant.domain] as [number, number],
    options: variant.options.map((option) => ({ ...option })),
  };
}

function workedProps() {
  return {
    ...sourceBase(),
    presentationMode: 'worked_example' as const,
    correctOptionId: 'D' as const,
    steps: [...SOURCE_STEPS],
    finalAnswer: 'Option D is correct because the rate is negative to the right of the vertex.',
  };
}

function guidedProps() {
  return {
    ...sourceBase(),
    presentationMode: 'guided_practice' as const,
    guidedSteps: [
      'Find the vertex of the downward-opening quadratic.',
      'Select the interval where the rate is negative.',
    ],
    fieldHelp: 'Use the vertex to identify where the rate changes sign.',
  };
}

function independentProps() {
  return {
    ...sourceBase(),
    presentationMode: 'independent_practice' as const,
  };
}

function isTrueStatement(
  props: ReturnType<typeof independentProps>,
  option: ReturnType<typeof independentProps>['options'][number],
): boolean {
  const vertexX = -props.linearCoefficient / (2 * props.quadraticCoefficient);
  const tolerance = 0.001;
  if (option.rateSign === 'negative') {
    return option.startInput >= vertexX - tolerance && option.endInput > vertexX;
  }
  return option.startInput < vertexX && option.endInput <= vertexX + tolerance;
}

function expectRejected(value: unknown) {
  expect(getPropsSchema('quadratic-negative-rate-interval-choice')?.safeParse(value).success).toBe(false);
}

describe('quadratic-negative-rate-interval-choice schema', () => {
  it('accepts the F1 seed-0 Independent renderer props', () => {
    const output = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(0);
    const rendererProps = (output.data as { rendererProps: unknown }).rendererProps;

    expect(getPropsSchema('quadratic-negative-rate-interval-choice')?.safeParse(rendererProps).success).toBe(true);
  });

  it('accepts strict Worked and Guided source forms', () => {
    expect(getPropsSchema('quadratic-negative-rate-interval-choice')?.safeParse(workedProps()).success).toBe(true);
    expect(getPropsSchema('quadratic-negative-rate-interval-choice')?.safeParse(guidedProps()).success).toBe(true);
  });

  it('resolves the exact schema from the public registry', () => {
    const schema = getPropsSchema('quadratic-negative-rate-interval-choice');
    expect(schema).toBeDefined();
    expect(schema).toBe(getPropsSchema('quadratic-negative-rate-interval-choice'));
  });

  it('accepts all generated Independent props for seeds 0 through 999', () => {
    for (let seed = 0; seed < 1000; seed += 1) {
      const output = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(seed);
      const rendererProps = (output.data as { rendererProps: unknown }).rendererProps;
      expect(getPropsSchema('quadratic-negative-rate-interval-choice')?.safeParse(rendererProps).success).toBe(true);
    }
  });

  it('rejects unknown keys and answer authority outside Worked', () => {
    expectRejected({ ...independentProps(), unexpected: true });
    expectRejected({ ...guidedProps(), correctOptionId: 'D' });
    expectRejected({ ...guidedProps(), expectedAnswer: { selectedOptionId: 'D' } });
    expectRejected({ ...guidedProps(), gradingMetadata: {} });
    expectRejected({ ...guidedProps(), solutionSteps: ['step one', 'step two'] });
    expectRejected({ ...independentProps(), correctOptionId: 'D' });
    expectRejected({ ...independentProps(), steps: ['step one', 'step two'] });
    expectRejected({ ...independentProps(), finalAnswer: 'The answer is D.' });
  });

  it('rejects invalid coefficients, bounds, and vertex placement', () => {
    expectRejected({ ...independentProps(), constantTerm: Number.NaN });
    expectRejected({ ...independentProps(), linearCoefficient: Number.POSITIVE_INFINITY });
    expectRejected({ ...independentProps(), quadraticCoefficient: 0.1 });
    expectRejected({ ...independentProps(), domain: [10, -10] });
    expectRejected({ ...independentProps(), domain: [-1, 1], linearCoefficient: 20 });
    expectRejected({ ...independentProps(), options: independentProps().options.map((option, index) => index === 0 ? { ...option, startInput: Number.POSITIVE_INFINITY } : option) });
  });

  it('rejects duplicate or mismatched A-D option identity', () => {
    expectRejected({ ...independentProps(), options: independentProps().options.map((option, index) => index === 1 ? { ...option, id: 'A' } : option) });
    expectRejected({ ...independentProps(), options: independentProps().options.map((option, index) => index === 1 ? { ...option, label: 'A' } : option) });
    expectRejected({ ...independentProps(), options: independentProps().options.map((option, index) => index === 1 ? { ...option, id: 'C', label: 'C' } : option) });
  });

  it('rejects unordered, out-of-domain, and duplicate intervals', () => {
    expectRejected({ ...independentProps(), options: independentProps().options.map((option, index) => index === 0 ? { ...option, startInput: option.endInput } : option) });
    expectRejected({ ...independentProps(), options: independentProps().options.map((option, index) => index === 0 ? { ...option, startInput: -11 } : option) });
    expectRejected({ ...independentProps(), options: independentProps().options.map((option, index) => index === 0 ? { ...option, startInput: -10, endInput: 11 } : option) });
    expectRejected({ ...independentProps(), options: independentProps().options.map((option, index) => index === 1 ? { ...option, startInput: -10, endInput: 8.348 } : option) });
  });

  it('requires exactly one mathematically true interval statement', () => {
    const zeroTrue = independentProps();
    zeroTrue.options[3]!.rateSign = 'positive';
    expectRejected(zeroTrue);

    const multipleTrue = independentProps();
    multipleTrue.options[2]!.rateSign = 'negative';
    multipleTrue.options[2]!.startInput = 2.470;
    multipleTrue.options[2]!.endInput = 9;
    expectRejected(multipleTrue);

    const truthCount = independentProps().options.filter((option) => isTrueStatement(independentProps(), option)).length;
    expect(truthCount).toBe(1);
  });

  it('requires the Worked answer and required Worked text', () => {
    expectRejected({ ...workedProps(), correctOptionId: 'A' });
    expectRejected({ ...workedProps(), correctOptionId: 'C' });
    expectRejected({ ...workedProps(), steps: ['one'] });
    expectRejected({ ...workedProps(), steps: ['one', '  '] });
    expectRejected({ ...workedProps(), finalAnswer: ' ' });
  });

  it('requires the Guided scaffold and field help', () => {
    expectRejected({ ...guidedProps(), guidedSteps: ['one'] });
    expectRejected({ ...guidedProps(), guidedSteps: ['one', '  '] });
    expectRejected({ ...guidedProps(), fieldHelp: ' ' });
  });
});
