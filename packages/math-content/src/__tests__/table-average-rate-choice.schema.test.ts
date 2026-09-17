import { describe, expect, it } from 'vitest';

import {
  SCHEMA_REGISTRY,
  tableAverageRateChoiceSchema,
} from '../index';

const rows = [
  { input: 0, output: 10 },
  { input: 2, output: 14 },
  { input: 5, output: 19 },
  { input: 8, output: 25 },
  { input: 10, output: 30 },
];

const options = [
  { id: 'A', label: 'From 0 to 2', startInput: 0, endInput: 2 },
  { id: 'B', label: 'From 2 to 5', startInput: 2, endInput: 5 },
  { id: 'C', label: 'From 5 to 8', startInput: 5, endInput: 8 },
  { id: 'D', label: 'From 8 to 10', startInput: 8, endInput: 10 },
];

const baseProps = {
  title: 'Compare average rates of change',
  prompt: 'Use the table to compare average rates of change.',
  inputLabel: 'Input',
  outputLabel: 'Output',
  rows,
  options,
};

const workedProps = {
  ...baseProps,
  presentationMode: 'worked_example' as const,
  correctOptionId: 'A',
  steps: ['Read the endpoints.', 'Compare the output change with the input change.'],
  finalAnswer: 'Option A has the greatest average rate of change.',
};

const guidedProps = {
  ...baseProps,
  presentationMode: 'guided_practice' as const,
  guidedSteps: ['Choose an interval.', 'Compare its changes.'],
  fieldHelp: 'Select the interval with the requested average rate.',
};

const independentProps = {
  ...baseProps,
  presentationMode: 'independent_practice' as const,
};

describe('tableAverageRateChoiceSchema', () => {
  it('accepts strict Worked, Guided, and Independent props', () => {
    expect(tableAverageRateChoiceSchema.safeParse(workedProps).success).toBe(true);
    expect(tableAverageRateChoiceSchema.safeParse(guidedProps).success).toBe(true);
    expect(tableAverageRateChoiceSchema.safeParse(independentProps).success).toBe(true);
    expect(SCHEMA_REGISTRY['table-average-rate-choice']).toBe(tableAverageRateChoiceSchema);
  });

  it('requires five ordered unique-input rows and four valid options', () => {
    expect(tableAverageRateChoiceSchema.safeParse({ ...independentProps, rows: rows.slice(0, 4) }).success).toBe(false);
    expect(tableAverageRateChoiceSchema.safeParse({
      ...independentProps,
      rows: rows.map((row, index) => index === 1 ? { ...row, input: 0 } : row),
    }).success).toBe(false);
    expect(tableAverageRateChoiceSchema.safeParse({
      ...independentProps,
      rows: rows.map((row, index) => index === 1 ? { ...row, input: -1 } : row),
    }).success).toBe(false);
    expect(tableAverageRateChoiceSchema.safeParse({ ...independentProps, options: options.slice(0, 3) }).success).toBe(false);
    expect(tableAverageRateChoiceSchema.safeParse({
      ...independentProps,
      options: options.map((option, index) => index === 1 ? { ...option, id: 'A' } : option),
    }).success).toBe(false);
    expect(tableAverageRateChoiceSchema.safeParse({
      ...independentProps,
      options: options.map((option, index) => index === 1 ? { ...option, startInput: 10 } : option),
    }).success).toBe(false);
    expect(tableAverageRateChoiceSchema.safeParse({
      ...independentProps,
      options: options.map((option, index) => index === 1 ? { ...option, endInput: 9 } : option),
    }).success).toBe(false);
  });

  it('requires each option endpoint to match a row input and start before end', () => {
    expect(tableAverageRateChoiceSchema.safeParse({
      ...independentProps,
      options: options.map((option, index) => index === 0 ? { ...option, startInput: 1 } : option),
    }).success).toBe(false);
    expect(tableAverageRateChoiceSchema.safeParse({
      ...independentProps,
      options: options.map((option, index) => index === 0 ? { ...option, endInput: 0 } : option),
    }).success).toBe(false);
  });

  it('requires a matching Worked answer and rejects solution fields in other modes', () => {
    expect(tableAverageRateChoiceSchema.safeParse({ ...workedProps, correctOptionId: 'E' }).success).toBe(false);
    for (const field of ['correctOptionId', 'finalAnswer', 'steps', 'expectedAnswer', 'gradingMetadata', 'isCorrect', 'correctAnswer']) {
      expect(tableAverageRateChoiceSchema.safeParse({ ...guidedProps, [field]: field === 'steps' ? ['A', 'B'] : 'forbidden' }).success).toBe(false);
      expect(tableAverageRateChoiceSchema.safeParse({ ...independentProps, [field]: field === 'steps' ? ['A', 'B'] : 'forbidden' }).success).toBe(false);
    }
  });

  it('rejects non-finite values and unknown fields', () => {
    expect(tableAverageRateChoiceSchema.safeParse({ ...independentProps, rows: rows.map((row, index) => index === 0 ? { ...row, output: Number.NaN } : row) }).success).toBe(false);
    expect(tableAverageRateChoiceSchema.safeParse({ ...independentProps, unexpected: true }).success).toBe(false);
  });
});
