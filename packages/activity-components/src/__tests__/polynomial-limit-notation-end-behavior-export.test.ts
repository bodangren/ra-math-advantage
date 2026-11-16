import { describe, expect, it } from 'vitest';

import {
  PolynomialLimitNotationEndBehaviorActivity,
  type PolynomialLimitNotationEndBehaviorActivityProps,
} from '../index';
import { PolynomialLimitNotationEndBehaviorActivity as TablePolynomialLimitNotationEndBehaviorActivity } from '../components/table';
import { PolynomialLimitNotationEndBehaviorActivity as DirectPolynomialLimitNotationEndBehaviorActivity } from '../components/table/PolynomialLimitNotationEndBehaviorActivity';

const workedProps: PolynomialLimitNotationEndBehaviorActivityProps = {
  activityId: 'topic-1-6.example-4.worked_example',
  mode: 'teaching',
  prompt: 'Write limit statements for the end behavior of the following polynomials.',
  items: [
    { id: 'a', functionName: 'f', expression: '-3x^4' },
    { id: 'b', functionName: 'g', expression: '5x^3 + 2x^2 - 7' },
  ],
  presentationMode: 'worked_example',
  correctAnswers: {
    a_leftLimit: 'negative_infinity',
    a_rightLimit: 'negative_infinity',
    b_leftLimit: 'negative_infinity',
    b_rightLimit: 'positive_infinity',
  },
  steps: [
    'a) The leading term is -3x^4. The degree is even and the leading coefficient is negative, so lim(x to -infinity) f(x) = -infinity and lim(x to infinity) f(x) = -infinity.',
    'b) The leading term is 5x^3. The degree is odd and the leading coefficient is positive, so lim(x to -infinity) g(x) = -infinity and lim(x to infinity) g(x) = infinity.',
  ],
  finalAnswer: 'The four polynomial end-behavior limit statements are shown above.',
};

describe('PolynomialLimitNotationEndBehaviorActivity public export', () => {
  it('exports the direct component from the package root and table index', () => {
    expect(PolynomialLimitNotationEndBehaviorActivity).toBe(
      DirectPolynomialLimitNotationEndBehaviorActivity,
    );
    expect(TablePolynomialLimitNotationEndBehaviorActivity).toBe(
      DirectPolynomialLimitNotationEndBehaviorActivity,
    );
    expect(workedProps.mode).toBe('teaching');
    expect(workedProps.presentationMode).toBe('worked_example');
    expect(workedProps.items.map((item) => item.expression)).toEqual([
      '-3x^4',
      '5x^3 + 2x^2 - 7',
    ]);
  });
});
