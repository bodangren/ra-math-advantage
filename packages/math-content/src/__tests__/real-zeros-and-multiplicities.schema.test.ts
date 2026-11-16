import { describe, expect, it } from 'vitest';

import {
  generateTopic15RealZerosAndMultiplicitiesOutput,
} from '../knowledge-space';
import {
  getPropsSchema,
  realZerosAndMultiplicitiesSchema,
} from '../schemas';

const baseProps = generateTopic15RealZerosAndMultiplicitiesOutput(0).data.rendererProps as Record<string, unknown>;
const seedZeroOutput = generateTopic15RealZerosAndMultiplicitiesOutput(0);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function workedProps(): Record<string, unknown> {
  return {
    ...clone(baseProps),
    presentationMode: 'worked_example',
    correctAnswers: clone(seedZeroOutput.expectedAnswer),
    steps: seedZeroOutput.solutionSteps.map((step) => step.description),
    finalAnswer: 'Find the real zeros and the multiplicity of each zero for both expressions.',
  };
}

function guidedProps(): Record<string, unknown> {
  return {
    ...clone(baseProps),
    presentationMode: 'guided_practice',
    guidedSteps: [
      'Factor each expression completely.',
      'Read each zero and its multiplicity from the factors.',
    ],
    fieldHelp: 'Enter the real zeros and the multiplicity of each zero.',
  };
}

describe('real zeros and multiplicities schema', () => {
  it('accepts the live seed-0 independent renderer props', () => {
    expect(realZerosAndMultiplicitiesSchema.safeParse(baseProps).success).toBe(true);
  });

  it('accepts valid Worked, Guided, and Independent forms', () => {
    expect(realZerosAndMultiplicitiesSchema.safeParse(workedProps()).success).toBe(true);
    expect(realZerosAndMultiplicitiesSchema.safeParse(guidedProps()).success).toBe(true);
    expect(realZerosAndMultiplicitiesSchema.safeParse(baseProps).success).toBe(true);
  });

  it('resolves the exact schema from the registry', () => {
    expect(getPropsSchema('real-zeros-and-multiplicities')).toBe(realZerosAndMultiplicitiesSchema);
  });

  it('rejects duplicate or missing item IDs and blank text', () => {
    const duplicateIds = clone(baseProps) as Record<string, unknown> & { items: Array<Record<string, unknown>> };
    duplicateIds.items[1] = { ...duplicateIds.items[1], id: 'a' };
    const missingId = clone(baseProps) as Record<string, unknown> & { items: Array<Record<string, unknown>> };
    missingId.items[1] = { ...missingId.items[1], id: 'c' };
    const missingItem = clone(baseProps) as Record<string, unknown> & { items: unknown[] };
    missingItem.items = missingItem.items.slice(0, 1);
    const blankText = clone(baseProps) as Record<string, unknown> & { items: Array<Record<string, unknown>> };
    blankText.prompt = ' ';
    blankText.items[0] = { ...blankText.items[0], expression: '' };

    expect(realZerosAndMultiplicitiesSchema.safeParse(duplicateIds).success).toBe(false);
    expect(realZerosAndMultiplicitiesSchema.safeParse(missingId).success).toBe(false);
    expect(realZerosAndMultiplicitiesSchema.safeParse(missingItem).success).toBe(false);
    expect(realZerosAndMultiplicitiesSchema.safeParse({ ...baseProps, title: ' ' }).success).toBe(false);
    expect(realZerosAndMultiplicitiesSchema.safeParse(blankText).success).toBe(false);
  });

  it('rejects invalid pair ranges, duplicate zeros, and nonascending zeros', () => {
    const cases = [
      { zero: Number.POSITIVE_INFINITY, multiplicity: 1 },
      { zero: 1.5, multiplicity: 1 },
      { zero: Number.MAX_SAFE_INTEGER + 1, multiplicity: 1 },
      { zero: 1, multiplicity: 0 },
      { zero: 1, multiplicity: 7 },
      { zero: 1, multiplicity: 1.5 },
    ];
    for (const pair of cases) {
      const props = workedProps() as Record<string, unknown> & { correctAnswers: Record<string, unknown> };
      props.correctAnswers.a = [pair, { zero: 2, multiplicity: 1 }];
      expect(realZerosAndMultiplicitiesSchema.safeParse(props).success).toBe(false);
    }

    const duplicate = workedProps() as Record<string, unknown> & { correctAnswers: Record<string, unknown> };
    duplicate.correctAnswers.a = [
      { zero: 1, multiplicity: 1 },
      { zero: 1, multiplicity: 2 },
    ];
    const descending = workedProps() as Record<string, unknown> & { correctAnswers: Record<string, unknown> };
    descending.correctAnswers.a = [
      { zero: 2, multiplicity: 1 },
      { zero: 1, multiplicity: 2 },
    ];
    expect(realZerosAndMultiplicitiesSchema.safeParse(duplicate).success).toBe(false);
    expect(realZerosAndMultiplicitiesSchema.safeParse(descending).success).toBe(false);

    const itemExtra = clone(baseProps) as Record<string, unknown> & { items: Array<Record<string, unknown>> };
    itemExtra.items[0] = { ...itemExtra.items[0], extra: true };
    const pairExtra = workedProps() as Record<string, unknown> & { correctAnswers: Record<string, unknown> };
    pairExtra.correctAnswers.a = [
      { zero: 1, multiplicity: 1, extra: true },
      { zero: 2, multiplicity: 2 },
    ];
    expect(realZerosAndMultiplicitiesSchema.safeParse(itemExtra).success).toBe(false);
    expect(realZerosAndMultiplicitiesSchema.safeParse(pairExtra).success).toBe(false);
  });

  it('rejects unknown fields and authority or solution content in practice modes', () => {
    for (const modeProps of [guidedProps(), clone(baseProps)]) {
      for (const field of ['correctAnswers', 'steps', 'finalAnswer', 'answer', 'gradingMetadata']) {
        expect(realZerosAndMultiplicitiesSchema.safeParse({ ...modeProps, [field]: [] }).success).toBe(false);
      }
      expect(realZerosAndMultiplicitiesSchema.safeParse({ ...modeProps, unexpected: true }).success).toBe(false);
    }

    const invalidGuided = guidedProps();
    delete invalidGuided.guidedSteps;
    expect(realZerosAndMultiplicitiesSchema.safeParse(invalidGuided).success).toBe(false);
    expect(realZerosAndMultiplicitiesSchema.safeParse({
      ...guidedProps(),
      guidedSteps: ['Only one step'],
    }).success).toBe(false);
    expect(realZerosAndMultiplicitiesSchema.safeParse({
      ...guidedProps(),
      fieldHelp: ' ',
    }).success).toBe(false);
    expect(realZerosAndMultiplicitiesSchema.safeParse({
      ...workedProps(),
      finalAnswer: ' ',
    }).success).toBe(false);
    expect(realZerosAndMultiplicitiesSchema.safeParse({
      ...workedProps(),
      steps: [' ', 'A valid step'],
    }).success).toBe(false);
    expect(realZerosAndMultiplicitiesSchema.safeParse({
      ...baseProps,
      presentationMode: 'unsupported',
    }).success).toBe(false);
    expect(realZerosAndMultiplicitiesSchema.safeParse({
      ...workedProps(),
      steps: ['One step', 'Two steps'],
    }).success).toBe(true);
    expect(realZerosAndMultiplicitiesSchema.safeParse({
      ...workedProps(),
      correctAnswers: { ...seedZeroOutput.expectedAnswer, extra: [] },
    }).success).toBe(false);
  });
});
