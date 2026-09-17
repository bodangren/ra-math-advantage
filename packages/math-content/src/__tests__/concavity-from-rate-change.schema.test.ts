import { describe, expect, it } from 'vitest';

import { getPropsSchema } from '../schemas';
import { concavityFromRateChangeSchema } from '../schemas/concavity-from-rate-change.schema';
import {
  generateTopic13ConcavityFromRateChange,
  generateTopic13ConcavityFromRateChangeOutput,
} from '../knowledge-space/generators/topic13-concavity-from-rate-change';

const SOURCE_VARIANT = generateTopic13ConcavityFromRateChange(0);
const SOURCE_OUTPUT = generateTopic13ConcavityFromRateChangeOutput(0);
const SOURCE_PUBLIC_PROPS = {
  prompt: SOURCE_VARIANT.prompt,
  functionName: SOURCE_VARIANT.functionName,
  xValues: SOURCE_VARIANT.xValues,
  yValues: SOURCE_VARIANT.yValues,
};
const GUIDED_STEPS = [
  'Compute the first differences.',
  'Decide whether the first differences increase or decrease.',
];
const FIELD_HELP = 'Increasing first differences indicate concave up; decreasing first differences indicate concave down.';

function workedProps(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...SOURCE_PUBLIC_PROPS,
    presentationMode: 'worked_example',
    correctClassification: SOURCE_OUTPUT.expectedAnswer.classification,
    steps: SOURCE_OUTPUT.solutionSteps.map((step) => step.description),
    finalAnswer: 'The first differences increase, so k is concave up.',
    ...overrides,
  };
}

function guidedProps(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...SOURCE_PUBLIC_PROPS,
    presentationMode: 'guided_practice',
    guidedSteps: GUIDED_STEPS,
    fieldHelp: FIELD_HELP,
    ...overrides,
  };
}

function independentProps(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...SOURCE_PUBLIC_PROPS,
    presentationMode: 'independent_practice',
    ...overrides,
  };
}

function expectRejected(props: Record<string, unknown>): void {
  expect(concavityFromRateChangeSchema.safeParse(props).success).toBe(false);
}

describe('concavity-from-rate-change schema', () => {
  it('accepts exact source Independent, Worked, and Guided props', () => {
    expect(concavityFromRateChangeSchema.safeParse(independentProps()).success).toBe(true);
    expect(concavityFromRateChangeSchema.safeParse(workedProps()).success).toBe(true);
    expect(concavityFromRateChangeSchema.safeParse(guidedProps()).success).toBe(true);
  });

  it('accepts all generator public props and rejects public authority', () => {
    for (let seed = 0; seed < 1000; seed += 1) {
      const output = generateTopic13ConcavityFromRateChangeOutput(seed);
      const props = output.data.rendererProps;
      expect(concavityFromRateChangeSchema.safeParse(props).success).toBe(true);
      expect(Object.keys(props as Record<string, unknown>).sort()).toEqual([
        'functionName',
        'presentationMode',
        'prompt',
        'xValues',
        'yValues',
      ]);
    }

    for (const modeProps of [independentProps(), guidedProps()]) {
      for (const key of [
        'correctClassification',
        'correctAnswer',
        'expectedAnswer',
        'steps',
        'solutionSteps',
        'finalAnswer',
        'gradingMetadata',
        'score',
        'correctness',
        'differences',
        'secondDifferences',
        'unexpected',
      ]) {
        expectRejected({ ...modeProps, [key]: key === 'steps' ? ['step'] : 'authority' });
      }
    }
  });

  it('resolves the exact registered schema and enforces strict mode objects', () => {
    expect(getPropsSchema('concavity-from-rate-change')).toBe(concavityFromRateChangeSchema);
    for (const props of [
      independentProps({ unexpected: true }),
      guidedProps({ unexpected: true }),
      workedProps({ unexpected: true }),
    ]) {
      expectRejected(props);
    }
  });

  it('rejects malformed base text, lengths, numbers, and x geometry', () => {
    expectRejected(independentProps({ prompt: ' ' }));
    expectRejected(independentProps({ title: ' ' }));
    expectRejected(independentProps({ functionName: '' }));
    expectRejected(independentProps({ xValues: [1, 2, 3] }));
    expectRejected(independentProps({ yValues: [4, 1, -1] }));
    expectRejected(independentProps({ xValues: [1, 2, 3, Number.NaN] }));
    expectRejected(independentProps({ yValues: [4, 1, Number.POSITIVE_INFINITY, -2] }));
    expectRejected(independentProps({ xValues: [1, 1, 1.2, 1.3] }));
    expectRejected(independentProps({ xValues: [0, 1, 3, 6] }));
  });

  it('validates Worked classification and required mode fields', () => {
    expectRejected(workedProps({ correctClassification: 'concave_down' }));
    expectRejected(workedProps({ correctClassification: 'linear' }));
    expectRejected(workedProps({ correctClassification: 'neither' }));
    expectRejected(workedProps({ steps: ['one', 'two'] }));
    expectRejected(workedProps({ steps: ['one', ' ', 'three'] }));
    expectRejected(workedProps({ finalAnswer: ' ' }));
    expectRejected(guidedProps({ guidedSteps: ['one'] }));
    expectRejected(guidedProps({ guidedSteps: ['one', ' '] }));
    expectRejected(guidedProps({ fieldHelp: ' ' }));
    expectRejected(independentProps({ presentationMode: 'worked_example' }));
  });

  it('accepts only neither for constant-rate and reversing-rate tables', () => {
    const common = {
      prompt: 'Determine concavity.',
      functionName: 'k',
      xValues: [0, 1, 2, 3],
      presentationMode: 'worked_example' as const,
      steps: ['One.', 'Two.', 'Three.'],
      finalAnswer: 'Neither.',
    };
    const constant = { ...common, yValues: [1, 3, 5, 7], correctClassification: 'neither' };
    const reversal = { ...common, yValues: [0, 1, 4, 5], correctClassification: 'neither' };
    expect(concavityFromRateChangeSchema.safeParse(constant).success).toBe(true);
    expect(concavityFromRateChangeSchema.safeParse(reversal).success).toBe(true);
    expectRejected({ ...constant, correctClassification: 'concave_up' });
    expectRejected({ ...reversal, correctClassification: 'concave_down' });
  });
});
