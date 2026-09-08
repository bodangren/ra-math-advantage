import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PhaseRenderer, type PhaseSection } from '@/components/lesson/PhaseRenderer';

vi.mock('@/components/practice-timing', () => ({ usePracticeTiming: () => ({ getTiming: () => undefined }) }));

const sections: PhaseSection[] = [{
  id: 'quadratic-section', sequenceOrder: 1, sectionType: 'activity',
  content: {
    activityId: 'quadratic-activity', componentKey: 'quadratic-formula',
    activityProps: { presentationMode: 'independent', prompt: 'Solve.', equation: 'x^2 - 4 = 0' },
  },
}];

describe('PhaseRenderer quadratic submission', () => {
  it('keeps saving pending, exposes failure, and retries the same request before completion', async () => {
    let rejectSave!: (error: Error) => void;
    const pending = new Promise<void>((_, reject) => { rejectSave = reject; });
    // Observe rejection even in the broken phase, which discards this promise.
    void pending.catch(() => undefined);
    const save = vi.fn().mockReturnValueOnce(pending).mockResolvedValueOnce(undefined);
    const complete = vi.fn();
    render(<PhaseRenderer phaseType="independent_practice" sections={sections} mode="practice"
      onActivitySubmit={save} onActivityComplete={complete} />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Discriminant'), '16');
    await user.type(screen.getByLabelText('First root'), '2');
    await user.type(screen.getByLabelText('Second root'), '-2');
    const submitButton = screen.getByRole('button', { name: 'Submit answer' });
    await user.click(submitButton);
    expect(submitButton).toHaveTextContent('Saving answer…');
    expect(submitButton).toBeDisabled();
    expect(complete).not.toHaveBeenCalled();
    await act(async () => { rejectSave(new Error('network response lost')); });
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be saved');
    expect(complete).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Try submit again' }));
    await waitFor(() => expect(complete).toHaveBeenCalledWith('quadratic-activity'));
    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[0][0]).toBe('quadratic-activity');
    expect(save.mock.calls[1][1]).toBe(save.mock.calls[0][1]);
    expect(screen.getByRole('button', { name: 'Answer saved' })).toBeDisabled();
  });

  it('keeps submission disabled when the phase has no save handler', async () => {
    render(<PhaseRenderer phaseType="independent_practice" sections={sections} mode="practice" />);
    expect(await screen.findByRole('button', { name: 'Submit answer' })).toBeDisabled();
  });
});
