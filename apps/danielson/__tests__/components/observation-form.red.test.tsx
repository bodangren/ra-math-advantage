import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ObservationForm } from '../../components/observation-form';
import { ObservationAmendmentForm } from '../../components/observation-amendment-form';
import { ObservationDraftClient } from '../../components/observation-draft-client';
import { ObservationStartForm } from '../../components/observation-start-form';

const draft = {
  draftId: 'observation_records:draft-1',
  revision: 1,
  teacherDisplayName: 'Teacher One',
  items: [
    {
      itemId: 'item-a',
      skillId: 'danielson.tlac.skill.double-plan',
      skillTitle: 'Double Plan',
      componentId: 'danielson.framework.component.1e',
      componentTitle: '1e: Planning Coherent Instruction',
      priorityReason: 'evidence_gap',
      outcome: null,
      evidenceNote: null,
    },
    {
      itemId: 'item-b',
      skillId: 'danielson.tlac.skill.change-the-pace',
      skillTitle: 'Change the Pace',
      componentId: 'danielson.framework.component.1e',
      componentTitle: '1e: Planning Coherent Instruction',
      priorityReason: 'due',
      outcome: null,
      evidenceNote: null,
    },
    {
      itemId: 'item-c',
      skillId: 'danielson.tlac.skill.engineer-efficiency',
      skillTitle: 'Engineer Efficiency',
      componentId: 'danielson.framework.component.1e',
      componentTitle: '1e: Planning Coherent Instruction',
      priorityReason: 'overdue',
      outcome: null,
      evidenceNote: null,
    },
  ],
};

describe('observation form accessibility', () => {
  it('shows the matching FFT 2022 component summary beside a rating', () => {
    render(<ObservationForm draft={draft} onSave={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getAllByText('FFT 2022 component summary')).toHaveLength(3);
    expect(screen.getAllByText('Learning activities are sequenced and connected so they build toward the intended outcomes.')).toHaveLength(3);
    expect(screen.getAllByText(/This summary is not a rating descriptor/)).toHaveLength(3);
  });

  it('matches component guidance to each target and omits unknown components', () => {
    render(<ObservationForm draft={{ ...draft, items: [
      { ...draft.items[0], componentId: 'danielson.framework.component.3b' },
      { ...draft.items[1], componentId: 'danielson.framework.component.4e' },
      { ...draft.items[2], componentId: 'unknown' },
    ] }} onSave={vi.fn()} onSubmit={vi.fn()} />);
    const groups = screen.getAllByRole('group').filter((element) => element.tagName === 'FIELDSET');
    expect(within(groups[0]).getByText('Questions and discussion techniques promote reasoning, evidence, and student-to-student talk.')).toBeInTheDocument();
    expect(within(groups[1]).getByText('Teachers seek professional learning and apply it to improve practice.')).toBeInTheDocument();
    expect(within(groups[2]).queryByText('FFT 2022 component summary')).not.toBeInTheDocument();
  });

  it('uses native grouped controls, visible labels, text status, and keyboard actions', () => {
    render(<ObservationForm draft={draft} onSave={vi.fn()} onSubmit={vi.fn()} />);

    const groups = screen.getAllByRole('group').filter((element) => element.tagName === 'FIELDSET');
    expect(groups).toHaveLength(3);
    expect(groups[0]).toHaveAccessibleName(/Double Plan.*1e: Planning Coherent Instruction/i);
    expect(screen.getAllByRole('radio')).toHaveLength(15);
    expect(screen.getAllByRole('radio', { name: /^Rating 1 — Unsatisfactory$/ })[0]).toHaveAttribute('type', 'radio');
    expect(screen.getAllByRole('radio', { name: /^Not enough evidence$/ })[0]).toHaveAttribute('type', 'radio');
    expect(screen.getByLabelText('Evidence note for Double Plan')).toBeVisible();
    expect(screen.getByText('Evidence gap')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Learn Double Plan' })).toHaveAttribute(
      'href',
      '/learn/double-plan',
    );

    for (const action of [
      screen.getByRole('button', { name: 'Save draft' }),
      screen.getByRole('button', { name: 'Submit observation' }),
    ]) {
      expect(action.tagName).toBe('BUTTON');
      expect(action).not.toHaveAttribute('tabindex', '-1');
    }
  });

  it('focuses the error summary and links each missing outcome to its fieldset', () => {
    const onSubmit = vi.fn();
    render(<ObservationForm draft={draft} onSave={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit observation' }));

    const summary = screen.getByRole('alert');
    expect(summary).toHaveFocus();
    expect(summary).toHaveAttribute('tabindex', '-1');
    expect(summary).toHaveTextContent('Select an outcome for each target.');
    expect(onSubmit).not.toHaveBeenCalled();

    for (const group of screen.getAllByRole('group').filter((element) => element.tagName === 'FIELDSET')) {
      const errorId = group.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(document.getElementById(String(errorId))).toHaveTextContent('Select an outcome.');
    }
  });

  it('keeps an unset draft outcome unset when the observer saves', () => {
    const onSave = vi.fn();
    render(<ObservationForm draft={draft} onSave={onSave} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));

    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith({
      draftId: draft.draftId,
      expectedRevision: draft.revision,
      items: draft.items.map((item) => ({
        itemId: item.itemId,
        outcome: null,
        evidenceNote: null,
      })),
    });
    expect(onSave.mock.calls[0][0].items).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ outcome: { kind: 'not_enough_evidence' } }),
    ]));
  });

  it('shows only permitted observation types and sends all selected formal components', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ draft: { draftId: 'observation_records:formal' } }),
    }));
    render(<ObservationStartForm
      teacherProfileId="teacher_profiles:teacher"
      components={[
        { value: 'component-1a', label: '1a' },
        { value: 'component-1b', label: '1b' },
        { value: 'component-1c', label: '1c' },
      ]}
      permittedTypes={['walkthrough', 'formal_q1']}
    />);

    expect(screen.queryByRole('option', { name: 'Quarter 4 formal' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Observation type'), { target: { value: 'formal_q1' } });
    const componentSelect = screen.getByLabelText('Danielson components') as HTMLSelectElement;
    componentSelect.options[0].selected = true;
    componentSelect.options[1].selected = true;
    fireEvent.change(componentSelect);
    fireEvent.change(screen.getByLabelText('Observation time'), { target: { value: '2026-09-15T07:45' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Start observation' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const request = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({
      observationType: 'formal_q1',
      componentIds: ['component-1a', 'component-1b'],
    });
  });

  it('focuses a server error after a draft save fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'The server rejected the draft.' }),
    }));
    render(<ObservationDraftClient draft={draft} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The server rejected the draft.');
    expect(alert).toHaveFocus();
  });

  it('focuses a server error after an amendment fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'The server rejected the amendment.' }),
    }));
    render(<ObservationAmendmentForm
      observationId="observation_records:one"
      expectedVersion={0}
      items={[{ itemId: 'item-a', label: 'Double Plan', evidenceNote: null }]}
    />);
    fireEvent.change(screen.getByLabelText('Reason for amendment'), {
      target: { value: 'Correct the rating.' },
    });
    fireEvent.change(screen.getByLabelText('Outcome change'), { target: { value: '3' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Save amendment' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The server rejected the amendment.');
    expect(alert).toHaveFocus();
  });

  it('retries the same submission without another save when the first response is lost', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ draft: { revision: 2 } }) })
      .mockRejectedValueOnce(new Error('The committed response was lost.'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ receipt: { observationId: 'observation_records:one' } }),
      }));
    render(<ObservationDraftClient draft={draft} />);
    for (const option of screen.getAllByRole('radio', { name: 'Not enough evidence' })) {
      fireEvent.click(option);
    }

    fireEvent.click(screen.getByRole('button', { name: 'Submit observation' }));
    expect(await screen.findByText('The committed response was lost.')).toBeVisible();
    const firstRatingOne = screen.getAllByRole('radio', { name: 'Rating 1 — Unsatisfactory' })[0];
    const firstNoEvidence = screen.getAllByRole('radio', { name: 'Not enough evidence' })[0];
    expect(firstRatingOne).toBeDisabled();
    expect(firstNoEvidence).toBeDisabled();
    expect(firstNoEvidence).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Retry submission' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    expect(vi.mocked(fetch).mock.calls.map(([url]) => String(url))).toEqual([
      '/api/observations/drafts/observation_records%3Adraft-1',
      '/api/observations/drafts/observation_records%3Adraft-1/submit',
      '/api/observations/drafts/observation_records%3Adraft-1/submit',
    ]);
  });

  it('unlocks the draft after a known submission rejection', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ draft: { revision: 2 } }) })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'The server rejected the submission.' }),
      }));
    render(<ObservationDraftClient draft={draft} />);
    for (const option of screen.getAllByRole('radio', { name: 'Not enough evidence' })) {
      fireEvent.click(option);
    }

    fireEvent.click(screen.getByRole('button', { name: 'Submit observation' }));

    expect(await screen.findByText('The server rejected the submission.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Submit observation' })).toBeEnabled();
    expect(screen.getAllByRole('radio', { name: 'Rating 1 — Unsatisfactory' })[0]).toBeEnabled();
  });

  it('locks the observation controls while the first save is in flight', async () => {
    let resolveSave: ((value: unknown) => void) | undefined;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise((resolve) => {
      resolveSave = resolve;
    })));
    render(<ObservationDraftClient draft={draft} />);
    for (const option of screen.getAllByRole('radio', { name: 'Not enough evidence' })) {
      fireEvent.click(option);
    }

    fireEvent.click(screen.getByRole('button', { name: 'Submit observation' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Submitting…' })).toBeDisabled());
    expect(screen.getAllByRole('radio', { name: 'Rating 1 — Unsatisfactory' })[0]).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    resolveSave?.({ ok: false, json: async () => ({ error: 'Stop test.' }) });
  });
});


it('opens training in a separate tab so the observation form retains unsaved evidence', () => {
  render(<ObservationForm draft={draft} onSave={vi.fn()} onSubmit={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Evidence note for Double Plan'), { target: { value: 'Unsaved evidence' } });
  expect(screen.getByRole('link', { name: 'Learn Double Plan' })).toHaveAttribute('target', '_blank');
  expect(screen.getByLabelText('Evidence note for Double Plan')).toHaveValue('Unsaved evidence');
});

it('warns before closing a form with unsaved edits and stops warning after save', async () => {
  render(<ObservationForm draft={draft} onSave={async () => ({ revision: 2 })} onSubmit={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Evidence note for Double Plan'), { target: { value: 'Evidence' } });
  const dirtyEvent = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(dirtyEvent);
  expect(dirtyEvent.defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  await waitFor(() => {
    const savedEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(savedEvent);
    expect(savedEvent.defaultPrevented).toBe(false);
  });
});
