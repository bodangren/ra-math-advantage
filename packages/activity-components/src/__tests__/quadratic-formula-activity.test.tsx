import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import { QuadraticFormulaActivity } from '../index';

const base = {
  activityId: 'quadratic-formula:one',
  prompt: 'Solve by using the Quadratic Formula.',
  equation: 'x^2 + 4x - 17 = 0',
} as const;

async function enterRequiredAnswers() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Discriminant'), '84');
  await user.type(screen.getByLabelText('First root'), '-2 + sqrt(21)');
  return user;
}

describe('QuadraticFormulaActivity', () => {
  it('shows source steps only in Worked mode', () => {
    render(<QuadraticFormulaActivity {...base} mode="teaching" presentationMode="worked"
      workedSteps={[{ description: 'Substitute the coefficients.', expression: 'x = (-4 ± √84)/2' }]} />);
    expect(screen.getByText('Substitute the coefficients.')).toBeTruthy();
    expect(screen.queryByLabelText('Discriminant')).toBeNull();
  });

  it('always shows three labeled answer fields and hides hints before request', () => {
    render(<QuadraticFormulaActivity {...base} mode="guided" presentationMode="guided"
      fieldHelp={{ discriminant: 'Compute b squared minus 4ac.' }} />);
    expect(screen.getByLabelText('Discriminant')).toBeTruthy();
    expect(screen.getByLabelText('First root')).toBeTruthy();
    expect(screen.getByLabelText('Second root')).toBeTruthy();
    expect(screen.queryByText('Compute b squared minus 4ac.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show hint for Discriminant' }));
    expect(screen.getByText('Compute b squared minus 4ac.')).toBeTruthy();
  });

  it('does not submit blank required fields but permits a blank second root', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<QuadraticFormulaActivity {...base} mode="practice" presentationMode="independent" onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByRole('form', { name: 'Quadratic Formula response' }));
    expect(onSubmit).not.toHaveBeenCalled();
    await enterRequiredAnswers();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Submit answer' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    const envelope = onSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
    expect(envelope.parts.map((part) => [part.partId, part.rawAnswer])).toEqual([
      ['discriminant', '84'], ['x1', '-2 + sqrt(21)'], ['x2', ''],
    ]);
    for (const part of envelope.parts) {
      expect(part).not.toHaveProperty('isCorrect');
      expect(part).not.toHaveProperty('score');
      expect(part).not.toHaveProperty('maxScore');
    }
  });

  it('uses native Enter submission and prevents a same-event duplicate', async () => {
    let resolveSubmit!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => { resolveSubmit = resolve; }));
    render(<QuadraticFormulaActivity {...base} mode="practice" presentationMode="independent" onSubmit={onSubmit} />);
    const user = await enterRequiredAnswers();
    await user.type(screen.getByLabelText('Second root'), '-2 - sqrt(21)');
    fireEvent.submit(screen.getByRole('form', { name: 'Quadratic Formula response' }));
    fireEvent.submit(screen.getByRole('form', { name: 'Quadratic Formula response' }));
    expect(onSubmit).toHaveBeenCalledOnce();
    resolveSubmit();
    await waitFor(() => expect((screen.getByRole('button', { name: 'Answer saved' }) as HTMLButtonElement).disabled).toBe(true));
  });

  it('freezes one envelope across an ambiguous failure and retry', async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('lost response')).mockResolvedValueOnce(undefined);
    const onComplete = vi.fn();
    render(<QuadraticFormulaActivity {...base} mode="guided" presentationMode="guided"
      fieldHelp={{ discriminant: 'Compute the discriminant.' }} onSubmit={onSubmit} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show hint for Discriminant' }));
    const user = await enterRequiredAnswers();
    await user.type(screen.getByLabelText('Second root'), '-2 - sqrt(21)');
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: 'Submission failed' })).toBeTruthy();
    expect((screen.getByLabelText('First root') as HTMLInputElement).disabled).toBe(true);
    const first = onSubmit.mock.calls[0][0];
    await user.click(screen.getByRole('button', { name: 'Try submit again' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1][0]).toBe(first);
    expect((first as PracticeSubmissionEnvelope).parts[0].hintsUsed).toBe(1);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('does not report a save when no submission handler is connected', async () => {
    const onComplete = vi.fn();
    render(<QuadraticFormulaActivity {...base} mode="practice" presentationMode="independent" onComplete={onComplete} />);
    expect((screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement).disabled).toBe(true);
    expect(onComplete).not.toHaveBeenCalled();
  });


  it('gives two mounted activities unique input IDs and associates requested help', () => {
    render(<><QuadraticFormulaActivity {...base} activityId="one" mode="guided" presentationMode="guided" />
      <QuadraticFormulaActivity {...base} activityId="two" mode="guided" presentationMode="guided" /></>);
    const inputs = screen.getAllByLabelText('Discriminant') as HTMLInputElement[];
    expect(inputs[0].id).not.toBe(inputs[1].id);
    fireEvent.click(screen.getAllByRole('button', { name: 'Show hint for Discriminant' })[0]);
    const helpId = inputs[0].getAttribute('aria-describedby');
    expect(helpId).toBeTruthy();
    const describedIds = helpId!.split(' ');
    expect(describedIds.every((id) => document.getElementById(id))).toBe(true);
    expect(describedIds).toHaveLength(2);
    expect(inputs[1].getAttribute('aria-describedby')?.split(' ')).toHaveLength(1);
  });


  it('rejects a runtime mode that does not match the public presentation mode', () => {
    const onSubmit = vi.fn();
    render(<QuadraticFormulaActivity {...base} mode="practice" presentationMode="worked"
      workedSteps={[{ description: 'Private future step.', expression: 'x = 2' }]} onSubmit={onSubmit} />);
    expect(screen.getByRole('alert').textContent).toContain('not available');
    expect(screen.queryByText('Private future step.')).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables retry if the submission handler disappears', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('lost response'));
    const { rerender } = render(<QuadraticFormulaActivity {...base} mode="practice" presentationMode="independent" onSubmit={handler} />);
    const user = await enterRequiredAnswers();
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    await screen.findByRole('alert');
    rerender(<QuadraticFormulaActivity {...base} mode="practice" presentationMode="independent" />);
    expect((screen.getByRole('button', { name: 'Try submit again' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders the equation and Worked expressions as math', () => {
    const { container } = render(<QuadraticFormulaActivity {...base} mode="teaching" presentationMode="worked"
      workedSteps={[{ description: 'Substitute.', expression: 'x = (-4 \pm \sqrt{84})/2' }]} />);
    expect(container.querySelectorAll('.katex')).toHaveLength(2);
  });

});
