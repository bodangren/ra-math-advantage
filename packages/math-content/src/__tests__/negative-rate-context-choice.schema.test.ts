import { describe, expect, it } from 'vitest';

import {
  generateTopic12NegativeRateContextChoice,
  generateTopic12NegativeRateContextChoiceOutput,
} from '../knowledge-space/generators/topic12-negative-rate-context-choice';
import {
  getPropsSchema,
  negativeRateContextChoiceSchema,
} from '../schemas';

function baseProps(seed: number) {
  const variant = generateTopic12NegativeRateContextChoice(seed);
  return {
    prompt: variant.prompt,
    options: variant.options,
  };
}

function workedProps(seed = 0) {
  const output = generateTopic12NegativeRateContextChoiceOutput(seed);
  return {
    ...baseProps(seed),
    presentationMode: 'worked_example' as const,
    correctOptionId: output.expectedAnswer.selectedOptionId,
    steps: output.solutionSteps.map((step) => step.description),
    finalAnswer: seed === 0
      ? 'Option B is correct because x increases while y decreases.'
      : 'The selected option models an always-negative rate of change.',
  };
}

function guidedProps(seed = 1) {
  return {
    ...baseProps(seed),
    presentationMode: 'guided_practice' as const,
    guidedSteps: [
      'Determine how y changes as x increases in each option.',
      'Select the option in which y always decreases as x increases.',
    ],
    fieldHelp: 'A negative rate of change means y decreases as x increases.',
  };
}

function independentProps(seed = 2) {
  return {
    ...baseProps(seed),
    presentationMode: 'independent_practice' as const,
  };
}

function expectInvalid(value: unknown) {
  expect(negativeRateContextChoiceSchema.safeParse(value).success).toBe(false);
}

describe('negative-rate-context-choice schema', () => {
  it('accepts generator-derived Worked, Guided, and Independent props', () => {
    const worked = workedProps(0);

    expect(worked.correctOptionId).toBe('B');
    expect(negativeRateContextChoiceSchema.safeParse(worked).success).toBe(true);
    expect(negativeRateContextChoiceSchema.safeParse(guidedProps(1)).success).toBe(true);
    expect(negativeRateContextChoiceSchema.safeParse(independentProps(2)).success).toBe(true);
  });

  it('resolves the exact schema through the registry', () => {
    expect(getPropsSchema('negative-rate-context-choice')).toBe(negativeRateContextChoiceSchema);
  });

  it('rejects blank text, wrong option count, and duplicate definition pairs', () => {
    const valid = independentProps();

    expectInvalid({ ...valid, title: ' ' });
    expectInvalid({ ...valid, prompt: ' ' });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0
        ? { ...option, xDefinition: ' ' }
        : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0
        ? { ...option, yDefinition: '\t\n' }
        : option),
    });
    expectInvalid({ ...valid, options: valid.options.slice(0, 3) });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 1
        ? {
          ...option,
          xDefinition: valid.options[0]!.xDefinition,
          yDefinition: valid.options[0]!.yDefinition,
        }
        : option),
    });
  });

  it('requires exact A-D option identities', () => {
    const valid = independentProps();

    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0 ? { ...option, id: 'B' } : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0 ? { ...option, label: 'B' } : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0
        ? { ...option, id: 'B', label: 'B' }
        : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 0
        ? { ...option, id: 'A', label: 'B' }
        : option),
    });
    expectInvalid({
      ...valid,
      options: valid.options.map((option, index) => index === 3
        ? { ...option, id: 'A', label: 'A' }
        : option),
    });
  });

  it('keeps Worked authority strict and tied to a choice', () => {
    const valid = workedProps();

    expectInvalid({ ...valid, correctOptionId: 'E' });
    expectInvalid({ ...valid, steps: ['one'] });
    expectInvalid({ ...valid, steps: ['one', '  '] });
    expectInvalid({ ...valid, finalAnswer: ' ' });
    expectInvalid({ ...valid, unknownField: true });
  });

  it('rejects Guided and Independent authority, solution, grading, and extra fields', () => {
    const bannedKeys = [
      'correctOptionId',
      'correctAnswer',
      'answer',
      'expectedAnswer',
      'gradingMetadata',
      'score',
      'isCorrect',
      'steps',
      'solutionSteps',
      'solution',
      'finalAnswer',
      'relationship',
      'unknownField',
    ];

    for (const props of [guidedProps(), independentProps()]) {
      for (const key of bannedKeys) {
        expectInvalid({ ...props, [key]: key === 'steps' ? ['answer'] : 'answer' });
      }
    }
  });

  it('rejects mismatched modes and blank mode-specific fields', () => {
    const valid = independentProps();

    expectInvalid({
      ...valid,
      presentationMode: 'guided_practice',
      guidedSteps: ['one', 'two'],
      fieldHelp: 'help',
      unknownField: true,
    });
    expectInvalid({
      ...valid,
      presentationMode: 'worked_example',
      correctOptionId: 'B',
      steps: ['one', 'two'],
      finalAnswer: 'answer',
      extra: true,
    });
    expectInvalid({ ...guidedProps(), guidedSteps: ['one'] });
    expectInvalid({ ...guidedProps(), fieldHelp: ' ' });
  });
});
