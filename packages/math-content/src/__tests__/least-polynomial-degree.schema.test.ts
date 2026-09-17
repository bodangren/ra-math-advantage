import {
  generateTopic15LeastPolynomialDegreeOutput,
} from '../knowledge-space';
import {
  getPropsSchema,
  leastPolynomialDegreeSchema,
} from '../schemas';
import { describe, expect, it } from 'vitest';

const SOURCE_PROPS = generateTopic15LeastPolynomialDegreeOutput(0).data.rendererProps as Record<string, unknown>;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function workedProps(): Record<string, unknown> {
  return {
    ...SOURCE_PROPS,
    presentationMode: 'worked_example',
    correctAnswer: 5,
    steps: [
      'Identify the conjugate zero.',
      'Count the nonreal and real zeros.',
    ],
    finalAnswer: 'The least possible degree is 5.',
  };
}

function guidedProps(): Record<string, unknown> {
  return {
    ...SOURCE_PROPS,
    presentationMode: 'guided_practice',
    guidedSteps: [
      'Identify the conjugate zero.',
      'Count the nonreal and real zeros.',
    ],
    fieldHelp: 'Enter the least possible degree.',
  };
}

function independentProps(): Record<string, unknown> {
  return { ...SOURCE_PROPS, presentationMode: 'independent_practice' };
}

function expectRejected(value: unknown): void {
  expect(leastPolynomialDegreeSchema.safeParse(value).success).toBe(false);
}

describe('least polynomial degree schema', () => {
  it('accepts live seed-0 and positive-seed Independent props', () => {
    expect(leastPolynomialDegreeSchema.safeParse(SOURCE_PROPS).success).toBe(true);

    for (let seed = 1; seed <= 50; seed += 1) {
      const props = generateTopic15LeastPolynomialDegreeOutput(seed).data.rendererProps;
      expect(leastPolynomialDegreeSchema.safeParse(props).success).toBe(true);
    }
  });

  it('accepts valid Worked and Guided forms and resolves the exact registry entry', () => {
    expect(leastPolynomialDegreeSchema.safeParse(workedProps()).success).toBe(true);
    expect(leastPolynomialDegreeSchema.safeParse(guidedProps()).success).toBe(true);
    expect(getPropsSchema('least-polynomial-degree')).toBe(leastPolynomialDegreeSchema);
  });

  it('accepts the source Worked answer and rejects a mismatched answer', () => {
    expect(leastPolynomialDegreeSchema.safeParse({
      ...workedProps(),
      correctAnswer: 5,
    }).success).toBe(true);
    expectRejected({ ...workedProps(), correctAnswer: 4 });
    expectRejected({ ...workedProps(), correctAnswer: Number.NaN });
    expectRejected({ ...workedProps(), correctAnswer: 1.5 });
  });

  it('rejects blank text, a zero without i, and invalid real-zero counts', () => {
    for (const field of ['title', 'prompt', 'givenNonrealZero']) {
      const value = independentProps();
      value[field] = '   ';
      expectRejected(value);
    }
    expectRejected({ ...independentProps(), givenNonrealZero: '3 + 2' });

    for (const realZeroCount of [0, 6, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1, '3']) {
      expectRejected({ ...independentProps(), realZeroCount });
    }
  });

  it('rejects short or missing mode-specific content', () => {
    const shortWorked = clone(workedProps());
    shortWorked.steps = ['one'];
    expectRejected(shortWorked);

    const missingWorked = workedProps();
    delete missingWorked.correctAnswer;
    expectRejected(missingWorked);
    const missingWorkedSteps = workedProps();
    delete missingWorkedSteps.steps;
    expectRejected(missingWorkedSteps);
    const missingWorkedFinalAnswer = workedProps();
    delete missingWorkedFinalAnswer.finalAnswer;
    expectRejected(missingWorkedFinalAnswer);

    const shortGuided = guidedProps();
    shortGuided.guidedSteps = ['one'];
    expectRejected(shortGuided);
    const missingGuidedSteps = guidedProps();
    delete missingGuidedSteps.guidedSteps;
    expectRejected(missingGuidedSteps);
    const missingFieldHelp = guidedProps();
    delete missingFieldHelp.fieldHelp;
    expectRejected(missingFieldHelp);
  });

  it('rejects authority and cross-mode fields in practice props', () => {
    for (const field of ['correctAnswer', 'steps', 'finalAnswer', 'guidedSteps', 'fieldHelp']) {
      const independent = independentProps();
      independent[field] = field === 'steps' || field === 'guidedSteps' ? ['hidden', 'content'] : 'hidden';
      expectRejected(independent);
    }

    for (const field of ['correctAnswer', 'steps', 'finalAnswer']) {
      const guided = guidedProps();
      guided[field] = field === 'steps' || field === 'guidedSteps' ? ['hidden', 'content'] : 'hidden';
      expectRejected(guided);
    }

    expectRejected({ ...workedProps(), guidedSteps: ['hidden', 'content'], fieldHelp: 'hidden' });
    expectRejected({ ...guidedProps(), correctAnswer: 5, steps: ['hidden', 'content'], finalAnswer: 'hidden' });
    expectRejected({ ...independentProps(), presentationMode: 'worked_example' });
  });

  it('rejects unknown keys at the root in every mode', () => {
    for (const props of [workedProps(), guidedProps(), independentProps()]) {
      expectRejected({ ...props, extra: true });
    }
  });
});
