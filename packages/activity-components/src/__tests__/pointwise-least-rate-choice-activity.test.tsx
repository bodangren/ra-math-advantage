import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { generateTopic12PointwiseLeastRateChoice } from '@math-platform/math-content/knowledge-space';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import type { PointwiseLeastRateChoiceProps } from '@math-platform/math-content';
import { PointwiseLeastRateChoiceActivity } from '../components/graph-choice/PointwiseLeastRateChoiceActivity';

const ANSWER_AUTHORITY_KEYS = /correctAnswer|answerKey|hidden|authority|steps|normalizedAnswer|correctOptionId|expectedAnswer|isCorrect|score|maxScore|gradingMetadata|solution|finalAnswer|slope|derivative/;

type WorkedProps = Extract<PointwiseLeastRateChoiceProps, { presentationMode: 'worked_example' }>;
type GuidedProps = Extract<PointwiseLeastRateChoiceProps, { presentationMode: 'guided_practice' }>;
type IndependentProps = Extract<PointwiseLeastRateChoiceProps, { presentationMode: 'independent_practice' }>;

function propsFor(seed: number, presentationMode: 'worked_example'): WorkedProps;
function propsFor(seed: number, presentationMode: 'guided_practice'): GuidedProps;
function propsFor(seed: number, presentationMode: 'independent_practice'): IndependentProps;
function propsFor(seed: number, presentationMode: PointwiseLeastRateChoiceProps['presentationMode']): PointwiseLeastRateChoiceProps {
  const variant = generateTopic12PointwiseLeastRateChoice(seed);
  const base = {
    prompt: variant.prompt,
    domain: [...variant.domain] as [number, number],
    range: [...variant.range] as [number, number],
    xLabel: variant.xLabel,
    yLabel: variant.yLabel,
    graphPoints: [...variant.graphPoints],
    labeledPoints: [...variant.labeledPoints],
    options: [...variant.options],
    presentationMode,
  };

  if (presentationMode === 'worked_example') {
    return {
      ...base,
      correctOptionId: variant.correctOptionId,
      steps: [...variant.solutionSteps],
      finalAnswer: 'Point D has the least rate of change (option D).',
    } as WorkedProps;
  }
  if (presentationMode === 'guided_practice') {
    return {
      ...base,
      guidedSteps: [
        'Compare whether the graph is rising or falling at each labeled point.',
        'Among the falling points, compare steepness and select the most negative rate.',
      ],
      fieldHelp: 'A steeper downward graph has a smaller rate of change.',
    } as GuidedProps;
  }
  return base as IndependentProps;
}

describe('PointwiseLeastRateChoiceActivity', () => {
  it('renders the source graph, exact labeled coordinates, four choices, and Worked answer', () => {
    const variant = generateTopic12PointwiseLeastRateChoice(0);
    const props = propsFor(0, 'worked_example');
    const onSubmit = vi.fn();

    render(
      <PointwiseLeastRateChoiceActivity
        activityId="topic-1-2.example-2.worked_example"
        mode="teaching"
        onSubmit={onSubmit}
        {...props}
      />,
    );

    expect(screen.getByText(variant.prompt)).toBeTruthy();
    const graph = screen.getByRole('img', { name: /least instantaneous rate of change/i });
    expect(graph).toBeTruthy();
    expect(screen.getByTitle('Graph of y with four labeled points.')).toBeTruthy();
    expect(screen.getByTestId('pointwise-axes').getAttribute('d')).toBe('M42 80H346M194 146V14');
    const xScale = (x: number) => 42 + ((x + 5) / 10) * 304;
    const yScale = (y: number) => 14 + ((4 - y) / 8) * 132;
    for (const point of variant.labeledPoints) {
      const label = screen.getByTestId(`point-label-${point.label}`);
      expect(label.textContent).toBe(point.label);
      expect(label.getAttribute('x')).toBe(String(xScale(point.x)));
      expect(label.getAttribute('y')).toBe(String(yScale(point.y)));
      expect(label.getAttribute('data-point-x')).toBe(String(point.x));
      expect(label.getAttribute('data-point-y')).toBe(String(point.y));
    }
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    for (const option of variant.options) {
      const point = variant.labeledPoints.find((candidate) => candidate.id === option.id)!;
      expect(screen.getByRole('radio', { name: new RegExp(`^${option.label}.*${point.x}`) })).toBeTruthy();
    }
    const correct = screen.getByRole('radio', { name: /^D/ }) as HTMLInputElement;
    expect(correct.checked).toBe(true);
    expect(correct.disabled).toBe(true);
    for (const step of props.steps) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(props.finalAnswer)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /submit/i })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows Guided help and submits only the raw selected option', () => {
    const props = propsFor(1, 'guided_practice');
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    render(
      <PointwiseLeastRateChoiceActivity
        activityId="topic-1-2.example-2.guided_practice"
        mode="guided"
        onSubmit={onSubmit}
        onComplete={onComplete}
        {...props}
      />,
    );

    expect(screen.getByText(props.guidedSteps[0]!)).toBeTruthy();
    expect(screen.getByText(props.fieldHelp)).toBeTruthy();
    const submit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getByRole('radio', { name: /^A/ }));
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: 'topic-1-2.example-2.guided_practice',
      mode: 'guided_practice',
      answers: { selectedOptionId: 'A' },
    });
    expect(payload.parts).toEqual([{ partId: 'selectedOptionId', rawAnswer: 'A' }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
    expect(JSON.stringify(props)).not.toMatch(ANSWER_AUTHORITY_KEYS);
    expect(JSON.stringify(payload)).not.toMatch(ANSWER_AUTHORITY_KEYS);
  });

  it('shows no Guided or Worked data in Independent mode and submits raw data only', () => {
    const props = propsFor(2, 'independent_practice');
    const onSubmit = vi.fn();

    render(
      <PointwiseLeastRateChoiceActivity
        activityId="topic-1-2.example-2.independent_practice"
        mode="practice"
        onSubmit={onSubmit}
        {...props}
      />,
    );

    expect(screen.queryByText(/Compare whether the graph is rising/i)).toBeNull();
    expect(screen.queryByText(/steeper downward graph/i)).toBeNull();
    expect(screen.queryByText(/least rate of change \(option/i)).toBeNull();
    const submit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getByRole('radio', { name: /^B/ }));
    fireEvent.click(submit);

    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.answers).toEqual({ selectedOptionId: 'B' });
    expect(payload.parts).toEqual([{ partId: 'selectedOptionId', rawAnswer: 'B' }]);
    expect(JSON.stringify(props)).not.toMatch(ANSWER_AUTHORITY_KEYS);
    expect(JSON.stringify(payload)).not.toMatch(ANSWER_AUTHORITY_KEYS);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
  });

  it('shows unavailable and prevents submission when runtime and props modes do not match', () => {
    const onSubmit = vi.fn();

    render(
      <PointwiseLeastRateChoiceActivity
        activityId="topic-1-2.example-2.guided_practice"
        mode="guided"
        onSubmit={onSubmit}
        {...propsFor(1, 'worked_example')}
      />,
    );

    expect(screen.getByRole('alert').textContent).toMatch(/unavailable/i);
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /submit/i })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
