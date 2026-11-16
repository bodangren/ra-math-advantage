import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ActivityRenderer } from '@/components/lesson/ActivityRenderer';
import { accountingEquationEventDrafts } from '@/lib/practice/drafts/accounting-equation-event';

const mockFetch = vi.fn();
const mockCompletePhase = vi.fn();

global.fetch = mockFetch as unknown as typeof fetch;

vi.mock('@/hooks/usePhaseCompletion', () => ({
  usePhaseCompletion: () => ({ completePhase: mockCompletePhase, isCompleting: false, error: null }),
}));

function activity(mode: keyof typeof accountingEquationEventDrafts) {
  const props = accountingEquationEventDrafts[mode];
  return {
    id: props.activityId,
    componentKey: 'accounting-equation-event',
    displayName: props.title,
    description: props.description,
    props,
    gradingConfig: null,
    standardId: null,
    createdAt: new Date('2026-09-07T00:00:00.000Z'),
    updatedAt: new Date('2026-09-07T00:00:00.000Z'),
  };
}

function chooseIndependentResponse() {
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
  fireEvent.change(screen.getByLabelText('Explanation'), {
    target: { value: 'Cash and equity increase by the same amount.' },
  });
}

describe('ActivityRenderer accounting equation event integration', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockCompletePhase.mockReset();
    mockCompletePhase.mockResolvedValue(undefined);
  });

  it('passes direct Independent props and waits for the durable save before completion', async () => {
    let finishSave: ((value: unknown) => void) | undefined;
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => activity('independent') })
      .mockImplementationOnce(() => new Promise((resolve) => { finishSave = resolve; }));

    render(<ActivityRenderer activityId={accountingEquationEventDrafts.independent.activityId} lessonId="lesson-1" phaseNumber={2} />);
    await screen.findByText(accountingEquationEventDrafts.independent.cases[0].eventNarrative);
    chooseIndependentResponse();
    fireEvent.click(screen.getByRole('button', { name: 'Submit event analysis' }));

    expect(screen.getByRole('button', { name: 'Submit event analysis' })).toBeDisabled();
    expect(mockCompletePhase).not.toHaveBeenCalled();
    finishSave?.({
      ok: true,
      json: async () => ({ score: 16, maxScore: 16, percentage: 100, manualReview: true }),
    });
    await waitFor(() => expect(mockCompletePhase).toHaveBeenCalledOnce());

    const request = mockFetch.mock.calls[1]!;
    const envelope = JSON.parse(request[1].body as string);
    expect(envelope).toMatchObject({
      activityId: accountingEquationEventDrafts.independent.activityId,
      mode: 'independent_practice',
      answers: {
        'owner_investment.account_categories': {
          cash: 'Asset', owner_equity: 'Equity', bank_loan: 'Liability', equipment: 'Asset',
        },
        'owner_investment.ending_assets': 6000,
      },
    });
  });

  it('turns a false durable result into a component save failure and retries the same request', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => activity('independent') })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Durable save failed' }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ score: 16, maxScore: 16, percentage: 100, manualReview: true }),
      });
    render(<ActivityRenderer activityId={accountingEquationEventDrafts.independent.activityId} lessonId="lesson-1" phaseNumber={2} />);
    await screen.findByText(accountingEquationEventDrafts.independent.cases[0].eventNarrative);
    chooseIndependentResponse();
    fireEvent.click(screen.getByRole('button', { name: 'Submit event analysis' }));

    await screen.findByText('Your response could not be saved. Try again.');
    expect(mockCompletePhase).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole('button', { name: 'Try again' })[0]!);
    await waitFor(() => expect(mockCompletePhase).toHaveBeenCalledOnce());
    expect(mockFetch.mock.calls[2]).toEqual(mockFetch.mock.calls[1]);
  });

  it('persists a Worked acknowledgement without showing a score', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => activity('worked') })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ acknowledged: true }) });
    render(<ActivityRenderer activityId={accountingEquationEventDrafts.worked.activityId} lessonId="lesson-1" phaseNumber={1} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(mockCompletePhase).toHaveBeenCalledOnce());

    const envelope = JSON.parse(mockFetch.mock.calls[1]![1].body as string);
    expect(envelope).toMatchObject({
      mode: 'worked_example',
      answers: {},
      parts: [],
      artifact: { kind: 'accounting-equation-event-acknowledgement' },
    });
    expect(screen.queryByText('Work saved')).not.toBeInTheDocument();
    expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();
  });

  it('does not exempt a Worked acknowledgement for a different activity identifier', async () => {
    const storedActivity = structuredClone(activity('worked'));
    storedActivity.props.activityId = 'different-worked-activity';
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => storedActivity });
    render(<ActivityRenderer activityId={accountingEquationEventDrafts.worked.activityId} lessonId="lesson-1" phaseNumber={1} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await screen.findByText('Your response could not be saved. Try again.');
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockCompletePhase).not.toHaveBeenCalled();
  });
});
