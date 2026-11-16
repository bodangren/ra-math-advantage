export type AccountingEquationEventMode = 'worked_example' | 'guided_practice' | 'independent_practice';

export interface AccountingEquationEventCase {
  id: string;
  eventNarrative: string;
  eventAmount: number;
  startingTotals: { assets: number; liabilities: number; equity: number };
  accountRows: Array<{ id: string; label: string; category?: 'Asset' | 'Liability' | 'Equity' }>;
  guidedHints?: string[];
  workedSolution?: {
    accountEffects: Record<string, 'increase' | 'decrease' | 'no-effect'>;
    endingTotals: { assets: number; liabilities: number; equity: number };
    equation: string;
    explanation: string;
  };
}

export interface AccountingEquationEventDraft {
  activityId: string;
  mode: AccountingEquationEventMode;
  title: string;
  description: string;
  cases: AccountingEquationEventCase[];
}

const workedAccountingEquationEventDraft: AccountingEquationEventDraft = {
  activityId: 'draft-bm2-accounting-equation-worked',
  mode: 'worked_example',
  title: 'Worked example: Add a bank loan',
  description: 'Trace the event and verify the accounting equation before and after it.',
  cases: [{
    id: 'bank_loan',
    eventNarrative: 'TechStart borrows 3000 from a bank. The cash enters the business.',
    eventAmount: 3000,
    startingTotals: { assets: 5000, liabilities: 0, equity: 5000 },
    accountRows: [
      { id: 'cash', label: 'Cash', category: 'Asset' },
      { id: 'bank_loan', label: 'Bank Loan', category: 'Liability' },
    ],
    workedSolution: {
      accountEffects: { cash: 'increase', bank_loan: 'increase' },
      endingTotals: { assets: 8000, liabilities: 3000, equity: 5000 },
      equation: '8000 = 3000 + 5000',
      explanation: 'Cash and the bank loan increase by the same amount. Both sides stay equal.',
    },
  }],
};

const guidedAccountingEquationEventDraft: AccountingEquationEventDraft = {
  activityId: 'draft-bm2-accounting-equation-guided',
  mode: 'guided_practice',
  title: 'Guided practice: Buy a laptop',
  description: 'Compare a cash purchase with a credit purchase.',
  cases: [
    {
      id: 'cash_purchase',
      eventNarrative: 'TechStart buys a 2000 laptop with cash.',
      eventAmount: 2000,
      startingTotals: { assets: 7000, liabilities: 2000, equity: 5000 },
      accountRows: [
        { id: 'cash', label: 'Cash' },
        { id: 'equipment', label: 'Equipment' },
      ],
      guidedHints: [
        'Identify how TechStart pays for the laptop.',
        'Cash decreases. Equipment increases by the same amount.',
        'An exchange between two assets does not change total Assets.',
      ],
    },
    {
      id: 'credit_purchase',
      eventNarrative: 'TechStart buys the same laptop on credit.',
      eventAmount: 2000,
      startingTotals: { assets: 5000, liabilities: 0, equity: 5000 },
      accountRows: [
        { id: 'equipment', label: 'Equipment' },
        { id: 'payable', label: 'Amount Owed' },
      ],
      guidedHints: [
        'Identify what TechStart receives and what it now owes.',
        'Equipment and Liabilities increase by the same amount.',
        'Add 2000 to Assets and Liabilities. Equity does not change.',
      ],
    },
  ],
};

export const independentAccountingEquationEventDraft: AccountingEquationEventDraft = {
  activityId: 'draft-bm2-accounting-equation-independent',
  mode: 'independent_practice',
  title: 'Independent practice: Record an owner investment',
  description: 'Analyze the event and verify the ending accounting equation.',
  cases: [{
    id: 'owner_investment',
    eventNarrative: 'Sarah invests 1000 cash in TechStart. Before the event, TechStart has Assets of 5000, Liabilities of 1000, and Equity of 4000.',
    eventAmount: 1000,
    startingTotals: { assets: 5000, liabilities: 1000, equity: 4000 },
    accountRows: [
      { id: 'cash', label: 'Cash' },
      { id: 'owner_equity', label: "Owner's Equity" },
      { id: 'bank_loan', label: 'Bank Loan' },
      { id: 'equipment', label: 'Equipment' },
    ],
  }],
};

export const accountingEquationEventDrafts = {
  worked: workedAccountingEquationEventDraft,
  guided: guidedAccountingEquationEventDraft,
  independent: independentAccountingEquationEventDraft,
} as const;
