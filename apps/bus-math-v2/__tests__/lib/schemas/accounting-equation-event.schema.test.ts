import { describe, expect, it } from 'vitest';

import { accountingEquationEventDrafts } from '@/lib/practice/drafts/accounting-equation-event';
import { accountingEquationEventPropsSchema } from '@/lib/schemas/accounting-equation-event.schema';

function copy<T>(value: T): T {
  return structuredClone(value);
}

describe('accountingEquationEventPropsSchema', () => {
  it.each(Object.entries(accountingEquationEventDrafts))('accepts the current %s draft', (_name, draft) => {
    expect(accountingEquationEventPropsSchema.safeParse(draft).success).toBe(true);
  });

  it.each([
    ['Independent worked solution', 'independent', 'workedSolution'],
    ['Independent hints', 'independent', 'guidedHints'],
    ['Independent category answer', 'independent', 'category'],
    ['Guided worked solution', 'guided', 'workedSolution'],
    ['Guided category answer', 'guided', 'category'],
  ] as const)('rejects %s', (_label, draftKey, leakedField) => {
    const draft = copy(accountingEquationEventDrafts[draftKey]);
    const eventCase = draft.cases[0] as unknown as Record<string, unknown>;
    if (leakedField === 'category') {
      (eventCase.accountRows as Array<Record<string, unknown>>)[0]!.category = 'Asset';
    } else if (leakedField === 'guidedHints') {
      eventCase.guidedHints = ['A leaked hint'];
    } else {
      eventCase.workedSolution = copy(accountingEquationEventDrafts.worked.cases[0].workedSolution);
    }
    expect(accountingEquationEventPropsSchema.safeParse(draft).success).toBe(false);
  });

  it('requires complete Worked categories and exact solution account references', () => {
    const missingCategory = copy(accountingEquationEventDrafts.worked);
    delete (missingCategory.cases[0]!.accountRows[0] as { category?: string }).category;
    expect(accountingEquationEventPropsSchema.safeParse(missingCategory).success).toBe(false);

    const missingEffect = copy(accountingEquationEventDrafts.worked);
    delete missingEffect.cases[0]!.workedSolution!.accountEffects.cash;
    expect(accountingEquationEventPropsSchema.safeParse(missingEffect).success).toBe(false);

    const extraEffect = copy(accountingEquationEventDrafts.worked);
    Object.assign(extraEffect.cases[0]!.workedSolution!.accountEffects, { inventory: 'increase' });
    expect(accountingEquationEventPropsSchema.safeParse(extraEffect).success).toBe(false);
  });

  it('rejects a second Worked case because the component shows one case', () => {
    const draft = copy(accountingEquationEventDrafts.worked);
    draft.cases.push({ ...copy(draft.cases[0]!), id: 'second_worked_case' });
    expect(accountingEquationEventPropsSchema.safeParse(draft).success).toBe(false);
  });

  it.each([
    ['negative event magnitude', (draft: ReturnType<typeof copy<typeof accountingEquationEventDrafts.guided>>) => {
      draft.cases[0]!.eventAmount = -1;
    }],
    ['nonfinite event magnitude', (draft: ReturnType<typeof copy<typeof accountingEquationEventDrafts.guided>>) => {
      draft.cases[0]!.eventAmount = Number.POSITIVE_INFINITY;
    }],
    ['nonfinite starting total', (draft: ReturnType<typeof copy<typeof accountingEquationEventDrafts.guided>>) => {
      draft.cases[0]!.startingTotals.assets = Number.NaN;
    }],
    ['empty case identifier', (draft: ReturnType<typeof copy<typeof accountingEquationEventDrafts.guided>>) => {
      draft.cases[0]!.id = ' ';
    }],
    ['duplicate case identifier', (draft: ReturnType<typeof copy<typeof accountingEquationEventDrafts.guided>>) => {
      draft.cases[1]!.id = draft.cases[0]!.id;
    }],
    ['empty account identifier', (draft: ReturnType<typeof copy<typeof accountingEquationEventDrafts.guided>>) => {
      draft.cases[0]!.accountRows[0]!.id = '';
    }],
    ['duplicate account identifier', (draft: ReturnType<typeof copy<typeof accountingEquationEventDrafts.guided>>) => {
      draft.cases[0]!.accountRows[1]!.id = draft.cases[0]!.accountRows[0]!.id;
    }],
  ])('rejects %s', (_label, alter) => {
    const draft = copy(accountingEquationEventDrafts.guided);
    alter(draft);
    expect(accountingEquationEventPropsSchema.safeParse(draft).success).toBe(false);
  });
});
