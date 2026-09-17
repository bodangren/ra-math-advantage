import { describe, expect, it } from 'vitest';

import { generateTopic16EquationEndBehaviorOutput } from '../knowledge-space/generators/topic16-equation-end-behavior';
import { polynomialEquationEndBehaviorSchema } from '../schemas/polynomial-equation-end-behavior.schema';

type Props = Record<string, unknown>;

const SOURCE_OUTPUT = generateTopic16EquationEndBehaviorOutput(0);
const WORKED_PROPS: Props = {
  ...(SOURCE_OUTPUT.data.rendererProps as Props),
  presentationMode: 'worked_example',
  correctAnswers: SOURCE_OUTPUT.expectedAnswer,
  steps: SOURCE_OUTPUT.solutionSteps.map((step) => step.description),
  finalAnswer: 'The six polynomial end behaviors are listed above.',
};
const GUIDED_PROPS: Props = {
  ...(generateTopic16EquationEndBehaviorOutput(1).data.rendererProps as Props),
  presentationMode: 'guided_practice',
  guidedSteps: [
    'Identify the leading term.',
    'Use degree parity and the leading coefficient.',
    'Record the left and right end behavior.',
  ],
  fieldHelp: 'Use the degree and leading coefficient to choose up or down for each end.',
};
const INDEPENDENT_PROPS: Props = {
  ...(generateTopic16EquationEndBehaviorOutput(2).data.rendererProps as Props),
};

function clone(value: Props): Props {
  return JSON.parse(JSON.stringify(value)) as Props;
}

function itemsOf(value: Props): Array<Props> {
  return value.items as Array<Props>;
}

describe('polynomial equation end-behavior schema', () => {
  it('accepts valid Worked, Guided, and Independent props', () => {
    expect(polynomialEquationEndBehaviorSchema.safeParse(WORKED_PROPS).success).toBe(true);
    expect(polynomialEquationEndBehaviorSchema.safeParse(GUIDED_PROPS).success).toBe(true);
    expect(polynomialEquationEndBehaviorSchema.safeParse(INDEPENDENT_PROPS).success).toBe(true);
  });

  it('rejects malformed item lists and mode-specific fields', () => {
    const fewerItems = clone(INDEPENDENT_PROPS);
    fewerItems.items = itemsOf(fewerItems).slice(0, 5);

    const duplicateIds = clone(INDEPENDENT_PROPS);
    itemsOf(duplicateIds)[1] = { ...itemsOf(duplicateIds)[1], id: 'a' };

    const reorderedIds = clone(INDEPENDENT_PROPS);
    reorderedIds.items = itemsOf(reorderedIds).slice().reverse();

    const wrongFunctionName = clone(INDEPENDENT_PROPS);
    itemsOf(wrongFunctionName)[0] = { ...itemsOf(wrongFunctionName)[0], functionName: 'g' };

    const blankExpression = clone(INDEPENDENT_PROPS);
    itemsOf(blankExpression)[0] = { ...itemsOf(blankExpression)[0], expression: '   ' };

    const invalidWorkedEnd = clone(WORKED_PROPS);
    invalidWorkedEnd.correctAnswers = {
      ...(invalidWorkedEnd.correctAnswers as Props),
      a_leftEnd: 'sideways',
    };

    const shortWorkedSteps = clone(WORKED_PROPS);
    shortWorkedSteps.steps = (shortWorkedSteps.steps as string[]).slice(0, 5);

    const independentCorrectAnswers = clone(INDEPENDENT_PROPS);
    independentCorrectAnswers.correctAnswers = SOURCE_OUTPUT.expectedAnswer;

    const guidedCorrectAnswers = clone(GUIDED_PROPS);
    guidedCorrectAnswers.correctAnswers = SOURCE_OUTPUT.expectedAnswer;

    const independentGuidedFields = clone(INDEPENDENT_PROPS);
    independentGuidedFields.guidedSteps = ['one', 'two', 'three'];
    independentGuidedFields.fieldHelp = 'hidden';

    const hiddenItemField = clone(INDEPENDENT_PROPS);
    itemsOf(hiddenItemField)[0] = {
      ...itemsOf(hiddenItemField)[0],
      leadingTerm: { coefficient: 1, exponent: 5 },
    };

    for (const value of [
      fewerItems,
      duplicateIds,
      reorderedIds,
      wrongFunctionName,
      blankExpression,
      invalidWorkedEnd,
      shortWorkedSteps,
      independentCorrectAnswers,
      guidedCorrectAnswers,
      independentGuidedFields,
      hiddenItemField,
    ]) {
      expect(polynomialEquationEndBehaviorSchema.safeParse(value).success).toBe(false);
    }
  });
});
