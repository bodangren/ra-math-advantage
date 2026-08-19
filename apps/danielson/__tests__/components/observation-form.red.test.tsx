import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ObservationForm } from '../../components/observation-form';

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
  it('uses native grouped controls, visible labels, text status, and keyboard actions', () => {
    render(<ObservationForm draft={draft} onSave={vi.fn()} onSubmit={vi.fn()} />);

    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(3);
    expect(groups[0]).toHaveAccessibleName(/Double Plan.*1e: Planning Coherent Instruction/i);
    expect(screen.getAllByRole('radio')).toHaveLength(15);
    expect(screen.getAllByRole('radio', { name: /^Rating 1$/ })[0]).toHaveAttribute('type', 'radio');
    expect(screen.getAllByRole('radio', { name: /^Not enough evidence$/ })[0]).toHaveAttribute('type', 'radio');
    expect(screen.getByLabelText('Evidence note for Double Plan')).toBeVisible();
    expect(screen.getByText('Evidence gap')).toBeVisible();

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

    for (const group of screen.getAllByRole('group')) {
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
});
