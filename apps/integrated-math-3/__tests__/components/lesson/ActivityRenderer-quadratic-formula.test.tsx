import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivityRenderer } from '@/components/lesson/ActivityRenderer';
import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';

const getTiming = vi.fn(() => ({
  startedAt: '2026-09-09T00:00:00.000Z',
  submittedAt: '2026-09-09T00:01:00.000Z',
  wallClockMs: 60000,
  activeMs: 55000,
  idleMs: 5000,
  pauseCount: 0,
  focusLossCount: 0,
  visibilityHiddenCount: 0,
  confidence: 'high' as const,
}));
vi.mock('@/components/practice-timing', () => ({ usePracticeTiming: () => ({ getTiming }) }));

async function answer(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText('Discriminant'), '84');
  await user.type(screen.getByLabelText('First root'), '-2 + sqrt(21)');
  await user.type(screen.getByLabelText('Second root'), '-2 - sqrt(21)');
}

describe('ActivityRenderer quadratic-formula callback boundary', () => {
  beforeEach(() => { getTiming.mockClear(); });
  it('awaits failure and retries the exact first timing envelope', async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('lost response')).mockResolvedValueOnce(undefined);
    const onComplete = vi.fn();
    render(<ActivityRenderer componentKey="quadratic-formula" activityId="trusted-id" mode="practice"
      activityProps={{ presentationMode: 'independent', prompt: 'Solve.', equation: 'x^2 + 4x - 17 = 0' }}
      onSubmit={onSubmit} onComplete={onComplete} />);
    const user = userEvent.setup();
    await answer(user);
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    await screen.findByRole('alert');
    expect(onComplete).not.toHaveBeenCalled();
    const first = onSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
    expect(first.timing).toEqual(getTiming.mock.results[0].value);
    await user.click(screen.getByRole('button', { name: 'Try submit again' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1][0]).toBe(first);
    expect(getTiming).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('keeps trusted ID, mode, and callback after hostile activity props', async () => {
    const trusted = vi.fn().mockResolvedValue(undefined);
    const untrusted = vi.fn();
    render(<ActivityRenderer componentKey="quadratic-formula" activityId="trusted-id" mode="practice"
      activityProps={{ activityId: 'wrong-id', mode: 'teaching', onSubmit: untrusted,
        presentationMode: 'independent', prompt: 'Solve.', equation: 'x^2 + 4x - 17 = 0' }} onSubmit={trusted} />);
    const user = userEvent.setup();
    await answer(user);
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    await waitFor(() => expect(trusted).toHaveBeenCalledOnce());
    expect((trusted.mock.calls[0][0] as PracticeSubmissionEnvelope).activityId).toBe('trusted-id');
    expect((trusted.mock.calls[0][0] as PracticeSubmissionEnvelope).mode).toBe('independent_practice');
    expect(untrusted).not.toHaveBeenCalled();
  });

  it('passes no submission handler when none is connected', async () => {
    render(<ActivityRenderer componentKey="quadratic-formula" activityId="preview" mode="practice"
      activityProps={{ presentationMode: 'independent', prompt: 'Solve.', equation: 'x^2 = 0' }} />);
    expect(((await screen.findByRole('button', { name: 'Submit answer' })) as HTMLButtonElement).disabled).toBe(true);
  });

  it('freezes the first envelope when timing is unavailable', async () => {
    getTiming.mockImplementationOnce(() => undefined as never);
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('lost response')).mockResolvedValueOnce(undefined);
    render(<ActivityRenderer componentKey="quadratic-formula" activityId="no-timing" mode="practice"
      activityProps={{ presentationMode: 'independent', prompt: 'Solve.', equation: 'x^2 + 4x - 17 = 0' }} onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await answer(user);
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    await screen.findByRole('alert');
    const first = onSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
    expect(first.timing).toBeUndefined();
    await user.click(screen.getByRole('button', { name: 'Try submit again' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1][0]).toBe(first);
    expect(getTiming).toHaveBeenCalledTimes(1);
  });

  it('remounts the quadratic activity for a new activity identity', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const props = { presentationMode: 'independent', prompt: 'Solve.', equation: 'x^2 + 4x - 17 = 0' } as const;
    const { rerender } = render(<ActivityRenderer componentKey="quadratic-formula" activityId="first" mode="practice" activityProps={props} onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await answer(user);
    expect((screen.getByLabelText('First root') as HTMLInputElement).value).not.toBe('');
    rerender(<ActivityRenderer componentKey="quadratic-formula" activityId="second" mode="practice" activityProps={props} onSubmit={onSubmit} />);
    await waitFor(() => expect((screen.getByLabelText('First root') as HTMLInputElement).value).toBe(''));
    expect(screen.getByRole('button', { name: 'Submit answer' })).toBeTruthy();
  });

});
