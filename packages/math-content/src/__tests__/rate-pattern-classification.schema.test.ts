import { describe, expect, it } from 'vitest';

import {
  getPropsSchema,
  ratePatternClassificationSchema,
} from '../index';
import {
  generateTopic13RatePatternClassification,
  generateTopic13RatePatternClassificationOutput,
  TOPIC13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
} from '../knowledge-space/generators/topic13-rate-pattern-classification';
import { getGenerator } from '../knowledge-space/generators/registry';

const SOURCE_PROMPT = 'Could each function be linear, quadratic, or neither?';
const SOURCE_CASES = [
  { id: 'a', functionName: 'f', xValues: [1, 2, 3, 4], yValues: [0, 1, 4, 9] },
  { id: 'b', functionName: 'g', xValues: [1, 2, 5, 10], yValues: [0, 1, 4, 9] },
  { id: 'c', functionName: 'p', xValues: [1, 1.1, 1.2, 1.3], yValues: [1, 7, 11, 13] },
] as const;
const GUIDED_STEPS = [
  'Check whether the input widths are equal.',
  'Find the first differences.',
  'Compare the first and second differences.',
  'Classify each function.',
];
const GUIDED_HELP = 'Use equal input widths before comparing differences.';
const SOURCE_OUTPUT = generateTopic13RatePatternClassificationOutput(0);
const WORKED_STEPS = SOURCE_OUTPUT.solutionSteps
  .map((step) => step.description);

function sourceProps(presentationMode: 'independent_practice' | 'worked_example' | 'guided_practice' = 'independent_practice'): Record<string, unknown> {
  return {
    prompt: SOURCE_PROMPT,
    cases: SOURCE_CASES,
    presentationMode,
  };
}

function workedProps(): Record<string, unknown> {
  return {
    ...sourceProps('worked_example'),
    correctClassifications: SOURCE_OUTPUT.expectedAnswer,
    steps: WORKED_STEPS,
    finalAnswer: 'a) quadratic; b) linear; c) quadratic.',
  };
}

function guidedProps(): Record<string, unknown> {
  const variant = generateTopic13RatePatternClassification(1);
  return {
    prompt: variant.prompt,
    cases: variant.cases,
    presentationMode: 'guided_practice',
    guidedSteps: GUIDED_STEPS,
    fieldHelp: GUIDED_HELP,
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function expectRejected(value: unknown): void {
  expect(ratePatternClassificationSchema.safeParse(value).success).toBe(false);
}

function publicProps(seed: number): unknown {
  return generateTopic13RatePatternClassificationOutput(seed).data.rendererProps;
}

describe('rate-pattern-classification schema', () => {
  it('accepts exact source Independent, Worked, and Guided props', () => {
    expect(ratePatternClassificationSchema.safeParse({
      ...sourceProps(),
      seed: 0,
    }).success).toBe(false);
    expect(ratePatternClassificationSchema.safeParse(publicProps(0)).success).toBe(true);
    expect(ratePatternClassificationSchema.safeParse(workedProps()).success).toBe(true);
    expect(ratePatternClassificationSchema.safeParse(guidedProps()).success).toBe(true);
  });

  it('pins the authored source data and server-derived Worked authority', () => {
    const variant = generateTopic13RatePatternClassification(0);
    const output = generateTopic13RatePatternClassificationOutput(0);

    expect(variant.prompt).toBe(SOURCE_PROMPT);
    expect(variant.cases).toEqual(SOURCE_CASES);
    expect(output.expectedAnswer).toEqual(SOURCE_OUTPUT.expectedAnswer);
    expect(output.expectedAnswer).toEqual({ a: 'quadratic', b: 'linear', c: 'quadratic' });
    expect(WORKED_STEPS).toEqual([
      'Equal input widths of 1 and constant second differences of 2 show that f could be quadratic (concave up).',
      'The input widths are 1, 3, and 5. The output changes are also 1, 3, and 5. Each average rate is 1, so g could be linear: g(x) = x - 1.',
      'Equal input widths of 0.1 and differences 6, 4, 2 with constant second differences of -2 show that p could be quadratic (concave down).',
    ]);
    expect(ratePatternClassificationSchema.safeParse(workedProps()).success).toBe(true);
  });

  it('resolves the exact registry key and node', () => {
    expect(getPropsSchema('rate-pattern-classification')).toBe(ratePatternClassificationSchema);
    expect(getGenerator('topic13-rate-pattern-classification')).toMatchObject({
      key: 'topic13-rate-pattern-classification',
      nodeIds: [TOPIC13_RATE_PATTERN_CLASSIFICATION_NODE_ID],
    });
  });

  it('accepts all generated Independent renderer props for seeds 0 through 999', () => {
    for (let seed = 0; seed < 1000; seed += 1) {
      expect(ratePatternClassificationSchema.safeParse(publicProps(seed)).success).toBe(true);
    }
  });

  it('rejects unknown and authority fields outside Worked mode', () => {
    for (const mode of ['guided_practice', 'independent_practice'] as const) {
      for (const key of [
        'correctClassifications',
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
        'unknown',
      ]) {
        const value = mode === 'guided_practice' ? guidedProps() : publicProps(0);
        expectRejected({ ...(value as object), [key]: key === 'steps' ? ['step'] : 'authority' });
      }
    }
    expectRejected({ ...workedProps(), unknown: true });
  });

  it('rejects malformed case identity, count, names, values, and duplicate tables', () => {
    const base = sourceProps();
    expectRejected({ ...base, cases: SOURCE_CASES.slice(0, 2) });
    expectRejected({ ...base, cases: [{ ...SOURCE_CASES[0], id: 'd' }, SOURCE_CASES[1], SOURCE_CASES[2]] });
    expectRejected({ ...base, cases: [{ functionName: 'f', xValues: [1, 2, 3, 4], yValues: [0, 1, 4, 9] }, SOURCE_CASES[1], SOURCE_CASES[2]] });
    expectRejected({ ...base, cases: [SOURCE_CASES[0], { ...SOURCE_CASES[1], id: 'a' }, SOURCE_CASES[2]] });
    expectRejected({ ...base, cases: [SOURCE_CASES[0], { ...SOURCE_CASES[1], functionName: ' ' }, SOURCE_CASES[2]] });
    expectRejected({ ...base, cases: [SOURCE_CASES[0], { ...SOURCE_CASES[1], xValues: [1, 2, 3, Number.NaN] }, SOURCE_CASES[2]] });
    expectRejected({ ...base, cases: [SOURCE_CASES[0], { ...SOURCE_CASES[1], yValues: [0, 1, 4] }, SOURCE_CASES[2]] });
    expectRejected({ ...base, cases: [SOURCE_CASES[0], { ...SOURCE_CASES[1], xValues: [1, 2, 2, 4] }, SOURCE_CASES[2]] });
    expectRejected({ ...base, cases: [SOURCE_CASES[0], { ...SOURCE_CASES[0], id: 'b' }, SOURCE_CASES[2]] });
  });

  it('rejects invalid Worked authority and text', () => {
    expectRejected({ ...workedProps(), correctClassifications: { a: 'linear', b: 'cannot_determine', c: 'quadratic' } });
    expectRejected({ ...workedProps(), correctClassifications: { a: 'quadratic', b: 'cannot_determine', c: 'wrong' } });
    expectRejected({ ...workedProps(), steps: undefined });
    expectRejected({ ...workedProps(), steps: WORKED_STEPS.slice(0, 2) });
    expectRejected({ ...workedProps(), steps: [...WORKED_STEPS.slice(0, 2), ' '] });
    expectRejected({ ...workedProps(), finalAnswer: undefined });
    expectRejected({ ...workedProps(), finalAnswer: ' ' });
    expectRejected({ ...workedProps(), correctClassifications: undefined });
  });

  it('rejects invalid Guided scaffolds and help', () => {
    expectRejected({ ...guidedProps(), guidedSteps: undefined });
    expectRejected({ ...guidedProps(), guidedSteps: ['one'] });
    expectRejected({ ...guidedProps(), guidedSteps: ['one', ' '] });
    expectRejected({ ...guidedProps(), fieldHelp: undefined });
    expectRejected({ ...guidedProps(), fieldHelp: ' ' });
    expectRejected({ ...guidedProps(), presentationMode: 'independent_practice', guidedSteps: GUIDED_STEPS, fieldHelp: GUIDED_HELP });
  });

  it('accepts a custom nonblank title and rejects blank shared text', () => {
    expect(ratePatternClassificationSchema.safeParse({ ...(publicProps(0) as object), title: 'Rate patterns' }).success).toBe(true);
    expectRejected({ ...(publicProps(0) as object), title: ' ' });
    expectRejected({ ...(publicProps(0) as object), prompt: ' ' });
  });

  it('keeps the public renderer data free of authority fields', () => {
    const banned = new Set([
      'correctClassifications',
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
    ]);
    const keys = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.flatMap(keys);
      if (!value || typeof value !== 'object') return [];
      return Object.entries(value).flatMap(([key, child]) => [key, ...keys(child)]);
    };
    for (const seed of [0, 1, 2]) {
      expect(keys(publicProps(seed)).some((key) => banned.has(key))).toBe(false);
    }
    expect(clone(publicProps(0))).toEqual(publicProps(0));
  });
});
