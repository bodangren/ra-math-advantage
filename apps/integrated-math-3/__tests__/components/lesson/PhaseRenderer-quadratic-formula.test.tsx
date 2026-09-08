import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PhaseRenderer, type PhaseSection } from '@/components/lesson/PhaseRenderer';
import { LessonRenderer } from '@/components/lesson/LessonRenderer';
import { createServerOwnedActivitySubmission } from '@/lib/activities/submission';

vi.mock('@/lib/activities/submission', () => ({
  createServerOwnedActivitySubmission: vi.fn(),
  submitActivity: vi.fn(),
  getSelectedWorkedAcknowledgement: vi.fn().mockResolvedValue(false),
}));

const strictSubmit = vi.mocked(createServerOwnedActivitySubmission);

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

describe('PhaseRenderer selected quadratic-formula mode', () => {
  const nodeId = 'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations';
  const selectedSection = (mode: 'guided_practice' | 'independent_practice'): PhaseSection => ({
    id: mode,
    sequenceOrder: 1,
    sectionType: 'activity',
    content: {
      activityId: `activities:${mode}`,
      componentKey: 'quadratic-formula',
      stableActivityId: `${nodeId}.${mode}`,
      masteryNodeId: nodeId,
      learningEvidenceMode: mode,
      srsEligible: false,
      activityProps: {
        presentationMode: mode === 'guided_practice' ? 'guided' : 'independent',
        prompt: 'Solve.',
        equation: 'x^2 - 4 = 0',
      },
    },
  });

  it('renders the exact Guided section in Guided mode under a normal lesson', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    render(<PhaseRenderer phaseType="independent_practice" sections={[selectedSection('guided_practice')]}
      mode="practice" onActivitySubmit={save} />);
    expect(await screen.findByRole('button', { name: 'Show hint for Discriminant' })).toBeInTheDocument();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Discriminant'), '16');
    await user.type(screen.getByLabelText('First root'), '2');
    await user.type(screen.getByLabelText('Second root'), '-2');
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect((save.mock.calls[0][1] as { mode: string }).mode).toBe('guided_practice');
  });

  it('renders the exact Independent section in Independent mode', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    render(<PhaseRenderer phaseType="guided_practice" sections={[selectedSection('independent_practice')]}
      mode="guided" onActivitySubmit={save} />);
    expect(await screen.findByRole('button', { name: 'Submit answer' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show hint for Discriminant' })).not.toBeInTheDocument();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Discriminant'), '16');
    await user.type(screen.getByLabelText('First root'), '2');
    await user.type(screen.getByLabelText('Second root'), '-2');
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect((save.mock.calls[0][1] as { mode: string }).mode).toBe('independent_practice');
  });

  it('shows retry feedback through the real lesson and activity callback chain', async () => {
    strictSubmit.mockResolvedValue({ success: false, error: 'not saved' });
    render(<LessonRenderer
      lessonId="lesson:qf"
      lessonTitle="Quadratic Formula"
      moduleLabel="Module 1"
      lessonNumber={6}
      phases={[{
        phaseId: 'phase:qf',
        phaseNumber: 1,
        phaseType: 'independent_practice',
        title: 'Independent Practice',
        sections: [selectedSection('independent_practice')],
        status: 'current',
        completed: false,
      }]}
      mode="practice"
    />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Discriminant'), '16');
    await user.type(screen.getByLabelText('First root'), '2');
    await user.type(screen.getByLabelText('Second root'), '-2');
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be saved');
    expect(screen.getByRole('button', { name: 'Try submit again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark Complete' })).toBeDisabled();
  });
});
