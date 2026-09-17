import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { IntervalClassificationActivity } from '../components/intervals/IntervalClassificationActivity';

const commonProps = {
  prompt: 'The graph of f is shown on 0 <= x <= 9. Find all intervals where f is increasing.',
  domain: [0, 9] as [number, number],
  changePoints: [3, 7] as [number, number],
  points: [
    { x: 0, y: 1 },
    { x: 3, y: 5 },
    { x: 7, y: 2 },
    { x: 9, y: 6 },
  ],
};

const workedProps = {
  ...commonProps,
  presentationMode: 'worked_example' as const,
  steps: [
    { description: 'Read the graph from left to right.', expression: 'x = 0 to x = 9', result: 'Track each segment.' },
    { description: 'The graph rises from x=0 to x=3.', expression: '0 to 3', result: 'Increasing.' },
  ],
  finalAnswer: '[0,3] U [7,9]',
};

const titledWorkedProps = {
  ...workedProps,
  title: 'Worked Example: Find Increasing Intervals',
};

const guidedProps = {
  ...commonProps,
  presentationMode: 'guided_practice' as const,
  guidedSteps: [
    'Mark the domain endpoints and the change points x=3 and x=7.',
    'Read each graph segment from left to right and decide whether it rises, falls, or stays flat.',
    'Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.',
  ],
  fieldHelp: {
    increasingIntervals: 'Find every segment that rises.',
    decreasingIntervals: 'Find every segment that falls.',
    constantIntervals: 'Check whether any segment stays flat.',
  },
};

const independentProps = {
  ...commonProps,
  presentationMode: 'independent_practice' as const,
};

describe('IntervalClassificationActivity', () => {
  it('describes actual points without stating the Independent classification', () => {
    render(<IntervalClassificationActivity activityId="constant" mode="practice"
      {...independentProps} domain={[0, 8]} changePoints={[2, 4]}
      points={[{ x: 0, y: 5 }, { x: 2, y: 8 }, { x: 4, y: 8 }, { x: 8, y: 6 }]} />);
    const graph = screen.getByRole('img');
    expect(graph.textContent).toContain('(0, 5), (2, 8), (4, 8), (8, 6)');
    expect(graph.textContent).not.toMatch(/increases|decreases|changes direction/);
  });

  it('waits for persistence, prevents duplicate submission, and retains answers after failure', async () => {
    let rejectSave!: (error: Error) => void;
    const save = new Promise<void>((_resolve, reject) => { rejectSave = reject; });
    const onSubmit = vi.fn().mockReturnValueOnce(save).mockResolvedValueOnce(undefined);
    const onComplete = vi.fn();
    render(<IntervalClassificationActivity activityId="durable" mode="practice"
      {...independentProps} onSubmit={onSubmit} onComplete={onComplete} />);
    const input = screen.getByRole('textbox', { name: 'Increasing intervals' });
    fireEvent.change(input, { target: { value: '[0,3]' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
    expect(input.hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => { rejectSave(new Error('Network error')); });
    expect(screen.getByRole('alert').textContent).toMatch(/could not be saved/i);
    expect((input as HTMLInputElement).value).toBe('[0,3]');
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders a completed Worked example with the graph before steps and no inputs', () => {
    render(
      <IntervalClassificationActivity
        activityId="topic-1-1.worked_example"
        mode="teaching"
        {...workedProps}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Worked Example: Classify Graph Intervals' })).toBeTruthy();
    const graph = screen.getByRole('img', { name: /interval graph/i });
    const finalAnswer = screen.getByText('[0,3] U [7,9]');
    expect(graph).toBeTruthy();
    for (const step of workedProps.steps) {
      expect(screen.getByText(step.description)).toBeTruthy();
      expect(screen.getByText(step.expression)).toBeTruthy();
    }
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(graph.compareDocumentPosition(screen.getByText(workedProps.steps[0]!.description))
      & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText(workedProps.steps.at(-1)!.expression).compareDocumentPosition(finalAnswer)
      & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders Guided inputs and submits a grade-free guided envelope', async () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    render(
      <IntervalClassificationActivity
        activityId="topic-1-1.guided_practice"
        mode="guided"
        onSubmit={onSubmit}
        onComplete={onComplete}
        {...guidedProps}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Guided Practice: Classify Graph Intervals' })).toBeTruthy();
    expect(screen.getByText(guidedProps.guidedSteps[0])).toBeTruthy();
    expect(screen.getByText('Find every segment that rises.')).toBeTruthy();
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    expect(
      screen.getByRole('img').compareDocumentPosition(screen.getAllByRole('textbox')[0]!)
        & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    fireEvent.change(screen.getByRole('textbox', { name: 'Increasing intervals' }), {
      target: { value: '[0,3] U [7,9]' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Decreasing intervals' }), {
      target: { value: '[3,7]' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Constant intervals' }), {
      target: { value: 'none' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, any>;
    expect(payload).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: 'topic-1-1.guided_practice',
      mode: 'guided_practice',
      status: 'submitted',
    });
    expect(payload.answers).toEqual({
      increasingIntervals: '[0,3] U [7,9]',
      decreasingIntervals: '[3,7]',
      constantIntervals: 'none',
    });
    expect(payload.parts.map((part: Record<string, unknown>) => ({
      partId: part.partId,
      rawAnswer: part.rawAnswer,
    }))).toEqual([
      { partId: 'increasingIntervals', rawAnswer: '[0,3] U [7,9]' },
      { partId: 'decreasingIntervals', rawAnswer: '[3,7]' },
      { partId: 'constantIntervals', rawAnswer: 'none' },
    ]);
    expect(JSON.stringify(payload)).not.toMatch(/score|isCorrect|maxScore/);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });

  it('renders the optional source-faithful Worked title', () => {
    render(
      <IntervalClassificationActivity
        activityId="topic-1-1.worked_example"
        mode="teaching"
        {...titledWorkedProps}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Worked Example: Find Increasing Intervals' })).toBeTruthy();
  });

  it('renders Practice inputs without Guided scaffolding and maps the mode to Independent practice', () => {
    const onSubmit = vi.fn();

    render(
      <IntervalClassificationActivity
        activityId="topic-1-1.independent_practice"
        mode="practice"
        onSubmit={onSubmit}
        {...independentProps}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Independent Practice: Classify Graph Intervals' })).toBeTruthy();
    expect(screen.queryByText(guidedProps.guidedSteps[0])).toBeNull();
    expect(screen.queryByText('Find every segment that rises.')).toBeNull();
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, any>;
    expect(payload.activityId).toBe('topic-1-1.independent_practice');
    expect(payload.mode).toBe('independent_practice');
  });

  it('shows an unavailable alert without a solution or inputs when presentation mode does not match', () => {
    render(
      <IntervalClassificationActivity
        activityId="topic-1-1.guided_practice"
        mode="guided"
        {...workedProps}
      />,
    );

    expect(screen.getByRole('alert').textContent).toMatch(/unavailable/);
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryByText(workedProps.finalAnswer)).toBeNull();
  });
});
