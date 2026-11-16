import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AccountingEquationEventActivity } from '@/components/activities/accounting/AccountingEquationEventActivity';
import {
  accountingEquationEventDrafts,
  independentAccountingEquationEventDraft,
} from '@/lib/practice/drafts/accounting-equation-event';

describe('AccountingEquationEventActivity', () => {
  it('shows the source loan sequence and sends only a Worked acknowledgement', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onComplete = vi.fn();
    render(<AccountingEquationEventActivity {...accountingEquationEventDrafts.worked} onSubmit={onSubmit} onComplete={onComplete} />);

    expect(screen.getByText('5000 = 0 + 5000')).toBeInTheDocument();
    expect(screen.getByText('Cash (Asset): increase by 3000')).toBeInTheDocument();
    expect(screen.getByText('Bank Loan (Liability): increase by 3000')).toBeInTheDocument();
    expect(screen.getByText('8000 = 3000 + 5000')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      mode: 'worked_example', answers: {}, parts: [],
      artifact: { kind: 'accounting-equation-event-acknowledgement' },
    });
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('records Guided hint assistance for both laptop cases without client grades', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AccountingEquationEventActivity {...accountingEquationEventDrafts.guided} onSubmit={onSubmit} />);

    expect(screen.getByText(/buys a 2000 laptop with cash/i)).toBeInTheDocument();
    expect(screen.getByText(/buys the same laptop on credit/i)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Use hint' })[0]!);
    expect(screen.getByText('Identify how TechStart pays for the laptop.')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Cash: Increase' })).not.toHaveAttribute('aria-describedby');

    fireEvent.click(screen.getByRole('radio', { name: 'Cash: Asset' }));
    fireEvent.click(screen.getAllByRole('radio', { name: 'Equipment: Asset' })[0]!);
    fireEvent.click(screen.getAllByRole('radio', { name: 'Equipment: Asset' })[1]!);
    fireEvent.click(screen.getByRole('radio', { name: 'Amount Owed: Liability' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Cash: Decrease' }));
    fireEvent.click(screen.getAllByRole('radio', { name: 'Equipment: Increase' })[0]!);
    fireEvent.click(screen.getAllByRole('radio', { name: 'Equipment: Increase' })[1]!);
    fireEvent.click(screen.getByRole('radio', { name: 'Amount Owed: Increase' }));
    fireEvent.change(screen.getByLabelText('cash_purchase Cash amount'), { target: { value: '2000' } });
    fireEvent.change(screen.getByLabelText('cash_purchase Equipment amount'), { target: { value: '2000' } });
    fireEvent.change(screen.getByLabelText('credit_purchase Equipment amount'), { target: { value: '2000' } });
    fireEvent.change(screen.getByLabelText('credit_purchase Amount Owed amount'), { target: { value: '2000' } });
    const assets = screen.getAllByLabelText('Ending Assets amount');
    const liabilities = screen.getAllByLabelText('Ending Liabilities amount');
    const equity = screen.getAllByLabelText('Ending Equity amount');
    fireEvent.change(assets[0]!, { target: { value: '7000' } });
    fireEvent.change(liabilities[0]!, { target: { value: '2000' } });
    fireEvent.change(equity[0]!, { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('cash_purchase equation difference'), { target: { value: '0' } });
    fireEvent.change(assets[2]!, { target: { value: '7000' } });
    fireEvent.change(liabilities[2]!, { target: { value: '2000' } });
    fireEvent.change(equity[2]!, { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('credit_purchase equation difference'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Explanation'), { target: { value: 'Each event changes two accounts by the same amount.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit event analysis' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());

    const envelope = onSubmit.mock.calls[0][0];
    expect(envelope.mode).toBe('guided_practice');
    expect(envelope.answers).toHaveProperty('cash_purchase.account_effects');
    expect(envelope.answers).toHaveProperty('cash_purchase.account_categories', { cash: 'Asset', equipment: 'Asset' });
    expect(envelope.artifact.cases[0]).toHaveProperty('accountCategories', { cash: 'Asset', equipment: 'Asset' });
    expect(envelope.answers).toHaveProperty('cash_purchase.account_amounts', { cash: 2000, equipment: 2000 });
    expect(envelope.answers).toHaveProperty('credit_purchase.ending_assets', 7000);
    expect(envelope.parts.some((part: { hintsUsed?: number }) => part.hintsUsed === 1)).toBe(true);
    expect(JSON.stringify(envelope)).not.toMatch(/"isCorrect"|"score"|"maxScore"/);
    expect(screen.getAllByRole('button', { name: 'Use hint' }).every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
  });

  it('conceals all answers in the Independent draft', () => {
    expect(independentAccountingEquationEventDraft).not.toHaveProperty('workedSolution');
    expect(independentAccountingEquationEventDraft).not.toHaveProperty('guidedHints');
    expect(JSON.stringify(independentAccountingEquationEventDraft)).not.toMatch(/endingTotals|correct|expected|category/i);
    expect(JSON.stringify(accountingEquationEventDrafts.guided)).not.toMatch(/"category"/i);
  });

  it('requires nonnegative change amounts and accepts a corrected amount', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AccountingEquationEventActivity {...accountingEquationEventDrafts.independent} onSubmit={onSubmit} />);

    expect(screen.getByText('Enter a positive change amount or zero. Choose the direction separately.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Cash: Asset' }));
    fireEvent.click(screen.getByRole('radio', { name: "Owner's Equity: Equity" }));
    fireEvent.click(screen.getByRole('radio', { name: 'Bank Loan: Liability' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Equipment: Asset' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Cash: Increase' }));
    fireEvent.click(screen.getByRole('radio', { name: "Owner's Equity: Increase" }));
    fireEvent.click(screen.getByRole('radio', { name: 'Bank Loan: No effect' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Equipment: No effect' }));
    fireEvent.change(screen.getByLabelText('owner_investment Cash amount'), { target: { value: '-1000' } });
    fireEvent.change(screen.getByLabelText("owner_investment Owner's Equity amount"), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('owner_investment Bank Loan amount'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('owner_investment Equipment amount'), { target: { value: '0' } });
    fireEvent.change(screen.getAllByLabelText('Ending Assets amount')[0]!, { target: { value: '-6000' } });
    fireEvent.change(screen.getAllByLabelText('Ending Liabilities amount')[0]!, { target: { value: '1000' } });
    fireEvent.change(screen.getAllByLabelText('Ending Equity amount')[0]!, { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('owner_investment equation difference'), { target: { value: '-12000' } });
    fireEvent.change(screen.getByLabelText('Explanation'), { target: { value: 'The signs are part of my current answer.' } });

    const submit = screen.getByRole('button', { name: 'Submit event analysis' });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText('owner_investment Cash amount'), { target: { value: '1000' } });
    expect(submit).toBeEnabled();
  });

  it('blocks double submission and retries the same envelope after a save error', async () => {
    let rejectFirst: ((error: Error) => void) | undefined;
    const onSubmit = vi.fn()
      .mockImplementationOnce(() => new Promise<void>((_resolve, reject) => { rejectFirst = reject; }))
      .mockResolvedValueOnce(undefined);
    const onComplete = vi.fn();
    render(<AccountingEquationEventActivity {...accountingEquationEventDrafts.independent} onSubmit={onSubmit} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Cash: Asset' }));
    fireEvent.click(screen.getByRole('radio', { name: "Owner's Equity: Equity" }));
    fireEvent.click(screen.getByRole('radio', { name: 'Bank Loan: Liability' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Equipment: Asset' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Cash: Increase' }));
    fireEvent.click(screen.getByRole('radio', { name: "Owner's Equity: Increase" }));
    fireEvent.click(screen.getByRole('radio', { name: 'Bank Loan: No effect' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Equipment: No effect' }));
    fireEvent.change(screen.getByLabelText('owner_investment Cash amount'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText("owner_investment Owner's Equity amount"), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('owner_investment Bank Loan amount'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('owner_investment Equipment amount'), { target: { value: '0' } });
    fireEvent.change(screen.getAllByLabelText('Ending Assets amount')[0]!, { target: { value: '6000' } });
    fireEvent.change(screen.getAllByLabelText('Ending Liabilities amount')[0]!, { target: { value: '1000' } });
    fireEvent.change(screen.getAllByLabelText('Ending Equity amount')[0]!, { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('owner_investment equation difference'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Explanation'), { target: { value: 'Cash and equity increase by the same amount.' } });

    const submit = screen.getByRole('button', { name: 'Submit event analysis' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledOnce();
    const firstEnvelope = onSubmit.mock.calls[0][0];
    rejectFirst?.(new Error('network'));
    await screen.findByText('Your response could not be saved. Try again.');
    expect(screen.getByLabelText('Explanation')).toBeDisabled();
    expect(screen.getByLabelText('owner_investment Cash amount')).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1][0]).toEqual(firstEnvelope);
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  });
});
