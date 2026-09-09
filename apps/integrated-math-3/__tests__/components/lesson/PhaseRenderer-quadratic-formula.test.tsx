import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PhaseRenderer, type PhaseSection } from '@/components/lesson/PhaseRenderer';
import { LessonRenderer } from '@/components/lesson/LessonRenderer';
import { checkQuadraticFormulaDiscriminant, createServerOwnedActivitySubmission } from '@/lib/activities/submission';

vi.mock('@/lib/activities/submission', () => ({
  createServerOwnedActivitySubmission: vi.fn(),
  checkQuadraticFormulaDiscriminant: vi.fn(),
  submitActivity: vi.fn(),
  getSelectedWorkedAcknowledgement: vi.fn().mockResolvedValue(false),
  getQuadraticFormulaAttempt: vi.fn().mockImplementation(async (activityId: string, mode: string) => ({ state: 'pending', pendingSubmissionId: 'qf', activityId, mode, attemptOrdinal: 1, idempotencyKey: 'qf:qf', props: { presentationMode: 'independent', prompt: 'Solve.', equation: 'x=0' } })),
  startQuadraticFormulaAttempt: vi.fn(),
}));

const strictSubmit = vi.mocked(createServerOwnedActivitySubmission);
const checkDiscriminant = vi.mocked(checkQuadraticFormulaDiscriminant);

vi.mock('@/components/practice-timing', () => ({ usePracticeTiming: () => ({ getTiming: () => undefined }) }));

const sections: PhaseSection[] = [{
  id: 'quadratic-section', sequenceOrder: 1, sectionType: 'activity',
  content: {
    activityId: 'quadratic-activity', componentKey: 'quadratic-formula',
    stableActivityId: 'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations.independent_practice',
    masteryNodeId: 'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
    learningEvidenceMode: 'independent_practice', srsEligible: false,
    activityProps: { presentationMode: 'independent', prompt: 'Solve.', equation: 'x^2 - 4 = 0' },
  },
}];
const allocatedPending = (activityId: string, mode: 'guided_practice' | 'independent_practice' = 'independent_practice') => ({ state: 'pending' as const, pendingSubmissionId: `pending:${activityId}`, activityId, mode, attemptOrdinal: 2, idempotencyKey: `qf:pending:${activityId}`, props: mode === 'guided_practice' ? { presentationMode: 'guided' as const, prompt: 'Selected.', equation: 'x^2 - 4 = 0', fieldHelp: { discriminant: 'd', x1: 'x1', x2: 'x2' } } : { presentationMode: 'independent' as const, prompt: 'Selected.', equation: 'x^2 - 4 = 0' } });

describe('PhaseRenderer quadratic submission', () => {
  it('keeps saving pending, exposes failure, and retries the same request before completion', async () => {
    let rejectSave!: (error: Error) => void;
    const pending = new Promise<void>((_, reject) => { rejectSave = reject; });
    // Observe rejection even in the broken phase, which discards this promise.
    void pending.catch(() => undefined);
    const save = vi.fn().mockReturnValueOnce(pending).mockResolvedValueOnce(undefined);
    const complete = vi.fn();
    render(<PhaseRenderer phaseType="independent_practice" sections={sections} mode="practice"
      quadraticFormulaAttempt={allocatedPending('quadratic-activity')} onActivitySubmit={save} onActivityComplete={complete} />);
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
    render(<PhaseRenderer phaseType="independent_practice" sections={sections} mode="practice" quadraticFormulaAttempt={allocatedPending('quadratic-activity')} />);
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

  it.each(['no_attempt', 'exhausted', 'unavailable'] as const)('does not mount editable controls for %s', async (state) => {
    render(<PhaseRenderer phaseType="independent_practice" sections={[selectedSection('independent_practice')]} quadraticFormulaAttempt={{ state }} />);
    expect(screen.queryByLabelText('Discriminant')).toBeNull();
  });

  it('renders authoritative final parts and keeps saved-awaiting-details free of fake correctness', () => {
    const common = { ...allocatedPending('activities:independent_practice'), props: { presentationMode: 'independent' as const, prompt: 'Selected.', equation: 'selected = 0' }, answers: { discriminant: 0, x1: 0, x2: '' }, submissionId: 'pending:activities:independent_practice', score: 2, maxScore: 2 };
    const { rerender } = render(<PhaseRenderer phaseType="independent_practice" sections={[selectedSection('independent_practice')]} quadraticFormulaAttempt={{ ...common, state: 'saved-awaiting-details' }} />);
    expect(screen.getByText('selected = 0')).toBeInTheDocument();
    expect(screen.queryByText(/Correct/)).toBeNull();
    rerender(<PhaseRenderer phaseType="independent_practice" sections={[selectedSection('independent_practice')]} quadraticFormulaAttempt={{ ...common, state: 'final', parts: [{ partId: 'discriminant', rawAnswer: 0, isCorrect: true, score: 1, maxScore: 1 }, { partId: 'x1', rawAnswer: 0, isCorrect: true, score: 1, maxScore: 1 }, { partId: 'x2', rawAnswer: '', isCorrect: true, score: 0, maxScore: 0 }] }} />);
    expect(screen.getAllByText(/Correct/)).toHaveLength(3);
  });

  it('renders the exact Guided section in Guided mode under a normal lesson', async () => {
    checkDiscriminant.mockResolvedValue(true);
    const save = vi.fn().mockResolvedValue(undefined);
    render(<PhaseRenderer phaseType="independent_practice" sections={[selectedSection('guided_practice')]}
      mode="practice" quadraticFormulaAttempt={allocatedPending('activities:guided_practice', 'guided_practice')} onActivitySubmit={save} />);
    expect(await screen.findByRole('button', { name: 'Show hint for Discriminant' })).toBeInTheDocument();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Discriminant'), '16');
    await user.click(screen.getByRole('button', { name: 'Check discriminant' }));
    await screen.findByText('The discriminant is correct. Enter the roots.');
    expect(checkDiscriminant).toHaveBeenCalledWith({ activityId: 'activities:guided_practice', pendingSubmissionId: 'pending:activities:guided_practice', rawAnswer: '16' });
    await user.type(screen.getByLabelText('First root'), '2');
    await user.type(screen.getByLabelText('Second root'), '-2');
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect((save.mock.calls[0][1] as { mode: string }).mode).toBe('guided_practice');
  });

  it('renders the exact Independent section in Independent mode', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    render(<PhaseRenderer phaseType="guided_practice" sections={[selectedSection('independent_practice')]}
      mode="guided" quadraticFormulaAttempt={allocatedPending('activities:independent_practice')} onActivitySubmit={save} />);
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

  it('does not apply a pending check to a changed activity', async () => {
    let resolve!: (value: boolean) => void;
    checkDiscriminant.mockImplementation(() => new Promise<boolean>((done) => { resolve = done; }));
    const first = selectedSection('guided_practice');
    const second = selectedSection('guided_practice');
    if (second.sectionType !== 'activity') throw new Error('Expected an activity section');
    second.content.activityId = 'activities:guided_practice:new';
    const { rerender } = render(<PhaseRenderer phaseType="guided_practice" sections={[first]} mode="guided" quadraticFormulaAttempt={allocatedPending('activities:guided_practice', 'guided_practice')} />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Discriminant'), '16');
    await user.click(screen.getByRole('button', { name: 'Check discriminant' }));
    rerender(<PhaseRenderer phaseType="guided_practice" sections={[second]} mode="guided" quadraticFormulaAttempt={allocatedPending('activities:guided_practice:new', 'guided_practice')} />);
    resolve(true);
    await waitFor(() => expect((screen.getByLabelText('First root') as HTMLInputElement).disabled).toBe(true));
    expect(screen.queryByText('The discriminant is correct. Enter the roots.')).toBeNull();
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
