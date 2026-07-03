import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransferCreditPrompt } from '@/components/student/transfer-credit/TransferCreditPrompt';

describe('TransferCreditPrompt', () => {
  const baseProps = {
    skillId: 'math.im3.skill.solve-quadratic',
    sourceCourse: 'math.im2',
    seededMastery: 0.72,
    onSkip: vi.fn(),
    onConfirmCheck: vi.fn(),
    onRevert: vi.fn(),
  };

  it('renders the mastered-in copy and both action buttons when eligible', () => {
    render(<TransferCreditPrompt {...baseProps} skipped={false} />);

    expect(screen.getByText(/already mastered this in IM2/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /take confirmation check/i }),
    ).toBeInTheDocument();
  });

  it('fires onSkip with a reversible record when Skip is clicked', async () => {
    const onSkip = vi.fn();
    render(<TransferCreditPrompt {...baseProps} onSkip={onSkip} skipped={false} />);

    await userEvent.click(screen.getByRole('button', { name: /skip/i }));

    expect(onSkip).toHaveBeenCalledTimes(1);
    const record = onSkip.mock.calls[0][0];
    expect(record.skillId).toBe(baseProps.skillId);
    expect(record.sourceCourse).toBe(baseProps.sourceCourse);
    expect(record.seededMastery).toBe(baseProps.seededMastery);
    expect(record.reversible).toBe(true);
    expect(record.skippedAt).toBeDefined();
  });

  it('fires onConfirmCheck when the confirmation-check button is clicked', async () => {
    const onConfirmCheck = vi.fn();
    render(
      <TransferCreditPrompt
        {...baseProps}
        onConfirmCheck={onConfirmCheck}
        skipped={false}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /take confirmation check/i }));

    expect(onConfirmCheck).toHaveBeenCalledTimes(1);
  });

  it('renders an Undo skip control when skipped and fires onRevert on click', async () => {
    const onRevert = vi.fn();
    render(<TransferCreditPrompt {...baseProps} onRevert={onRevert} skipped={true} />);

    const undoButton = screen.getByRole('button', { name: /undo skip/i });
    expect(undoButton).toBeInTheDocument();

    await userEvent.click(undoButton);

    expect(onRevert).toHaveBeenCalledTimes(1);
    const record = onRevert.mock.calls[0][0];
    expect(record.skillId).toBe(baseProps.skillId);
  });

  it('has an accessible name for the card region', () => {
    render(<TransferCreditPrompt {...baseProps} skipped={false} />);

    expect(
      screen.getByRole('region', { name: /transfer credit/i }),
    ).toBeInTheDocument();
  });
});
