import { describe, expect, it } from 'vitest';

import { gradeAccountingEquationEventSubmission } from '@/lib/practice/grading/accounting-equation-event';

const guidedAnswers = {
  'cash_purchase.account_effects': { cash: 'decrease', equipment: 'increase' },
  'cash_purchase.account_amounts': { cash: 2000, equipment: 2000 },
  'cash_purchase.ending_assets': 7000,
  'cash_purchase.ending_liabilities': 2000,
  'cash_purchase.ending_equity': 5000,
  'cash_purchase.equation_difference': 0,
  'credit_purchase.account_effects': { equipment: 'increase', payable: 'increase' },
  'credit_purchase.account_amounts': { equipment: 2000, payable: 2000 },
  'credit_purchase.ending_assets': 7000,
  'credit_purchase.ending_liabilities': 2000,
  'credit_purchase.ending_equity': 5000,
  'credit_purchase.equation_difference': 0,
  explanation: 'Each event changes two accounts by the same amount.',
};

function submission(mode: 'guided_practice' | 'independent_practice', answers: Record<string, unknown>) {
  return {
    contractVersion: 'practice.v1',
    activityId: `draft-${mode}`,
    mode,
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: '2026-09-07T00:00:00.000Z',
    answers,
    parts: Object.entries(answers).map(([partId, rawAnswer]) => ({
      partId,
      rawAnswer,
      ...(mode === 'guided_practice' && partId.startsWith('cash_purchase.') ? { hintsUsed: 1 } : {}),
    })),
  };
}

describe('gradeAccountingEquationEventSubmission', () => {
  it('grades the two literal Guided cases and keeps the explanation manual', () => {
    const value = submission('guided_practice', guidedAnswers);
    value.parts.filter((part) => part.partId.startsWith('credit_purchase.'))
      .forEach((part) => { part.hintsUsed = 2; });
    const result = gradeAccountingEquationEventSubmission(value);
    expect(result).toMatchObject({ automaticScore: 16, automaticMaxScore: 16, hintsUsed: 3 });
    expect(result.manualReview).toEqual({
      partId: 'explanation',
      rawAnswer: guidedAnswers.explanation,
      rubric: 'Verify that the learner explains how equal account changes keep Assets equal to Liabilities plus Equity.',
      status: 'manual_review_required',
    });
    expect(result.parts.every((part) => part.isCorrect)).toBe(true);
  });

  it('grades the literal Independent owner investment without exposing an answer table', () => {
    const answers = {
      'owner_investment.account_effects': {
        cash: 'increase', owner_equity: 'increase', bank_loan: 'no-effect', equipment: 'no-effect',
      },
      'owner_investment.account_amounts': { cash: 1000, owner_equity: 1000, bank_loan: 0, equipment: 0 },
      'owner_investment.ending_assets': 6000,
      'owner_investment.ending_liabilities': 1000,
      'owner_investment.ending_equity': 5000,
      'owner_investment.equation_difference': 0,
      explanation: 'Cash and equity increase by the same amount.',
    };
    expect(gradeAccountingEquationEventSubmission(submission('independent_practice', answers)))
      .toMatchObject({ automaticScore: 12, automaticMaxScore: 12, hintsUsed: 0 });
  });

  it('preserves a valid wrong response as scored evidence', () => {
    const answers = {
      ...guidedAnswers,
      'cash_purchase.account_effects': { cash: 'increase', equipment: 'decrease' },
      'cash_purchase.ending_assets': 9000,
      'cash_purchase.equation_difference': -100,
    };
    const result = gradeAccountingEquationEventSubmission(submission('guided_practice', answers));
    expect(result.automaticScore).toBe(12);
    expect(result.automaticMaxScore).toBe(16);
    expect(result.parts.filter((part) => !part.isCorrect).map((part) => part.partId)).toEqual([
      'cash_purchase.account_effects',
      'cash_purchase.ending_assets',
      'cash_purchase.equation_difference',
    ]);
  });

  it.each([
    ['missing part', () => {
      const value = submission('guided_practice', guidedAnswers);
      value.parts.pop();
      return value;
    }],
    ['extra part', () => {
      const value = submission('guided_practice', { ...guidedAnswers, extra: 1 });
      return value;
    }],
    ['unknown case', () => submission('guided_practice', {
      ...guidedAnswers,
      'unknown.ending_assets': 1,
    })],
    ['client grade', () => {
      const value = submission('guided_practice', guidedAnswers);
      Object.assign(value.parts[0]!, { isCorrect: true, score: 1, maxScore: 1 });
      return value;
    }],
  ])('rejects %s', (_label, makeValue) => {
    expect(() => gradeAccountingEquationEventSubmission(makeValue())).toThrow();
  });

  it.each([
    ['negative amount', 'cash_purchase.account_amounts', { cash: -1, equipment: 2000 }],
    ['NaN total', 'cash_purchase.ending_assets', Number.NaN],
    ['infinite total', 'cash_purchase.ending_assets', Number.POSITIVE_INFINITY],
  ])('rejects %s', (_label, partId, rawAnswer) => {
    const answers = { ...guidedAnswers, [partId]: rawAnswer };
    expect(() => gradeAccountingEquationEventSubmission(submission('guided_practice', answers))).toThrow();
  });

  it('preserves a finite negative ending total as a scored sign error', () => {
    const answers = { ...guidedAnswers, 'cash_purchase.ending_assets': -7000 };
    const result = gradeAccountingEquationEventSubmission(submission('guided_practice', answers));
    expect(result.automaticScore).toBe(15);
    expect(result.parts.find((part) => part.partId === 'cash_purchase.ending_assets'))
      .toMatchObject({ rawAnswer: -7000, isCorrect: false, score: 0, maxScore: 1 });
  });

  it('accepts reordered logical record keys but rejects changed record values', () => {
    const reordered = submission('guided_practice', guidedAnswers);
    const effectsPart = reordered.parts.find((part) => part.partId === 'cash_purchase.account_effects')!;
    effectsPart.rawAnswer = { equipment: 'increase', cash: 'decrease' };
    expect(() => gradeAccountingEquationEventSubmission(reordered)).not.toThrow();

    effectsPart.rawAnswer = { equipment: 'decrease', cash: 'decrease' };
    expect(() => gradeAccountingEquationEventSubmission(reordered)).toThrow(/conflicts/i);
  });

  it('rejects Independent assistance and accepts nonnegative Guided hint counts', () => {
    const independent = submission('independent_practice', {
      'owner_investment.account_effects': {
        cash: 'increase', owner_equity: 'increase', bank_loan: 'no-effect', equipment: 'no-effect',
      },
      'owner_investment.account_amounts': { cash: 1000, owner_equity: 1000, bank_loan: 0, equipment: 0 },
      'owner_investment.ending_assets': 6000,
      'owner_investment.ending_liabilities': 1000,
      'owner_investment.ending_equity': 5000,
      'owner_investment.equation_difference': 0,
      explanation: 'Balanced.',
    });
    Object.assign(independent.parts[0]!, { hintsUsed: 1 });
    expect(() => gradeAccountingEquationEventSubmission(independent)).toThrow(/assistance/i);
    expect(() => gradeAccountingEquationEventSubmission(submission('guided_practice', guidedAnswers))).not.toThrow();
  });
});
