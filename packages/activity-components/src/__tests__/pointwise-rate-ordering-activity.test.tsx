import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  generateTopic12PointwiseRateOrdering,
  generateTopic12PointwiseRateOrderingOutput,
} from '@math-platform/math-content/knowledge-space';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import type { PointwiseRateOrderingProps } from '@math-platform/math-content';
import { PointwiseRateOrderingActivity } from '../index';

type WorkedProps = Extract<PointwiseRateOrderingProps, { presentationMode: 'worked_example' }>;
type GuidedProps = Extract<PointwiseRateOrderingProps, { presentationMode: 'guided_practice' }>;
type IndependentProps = Extract<PointwiseRateOrderingProps, { presentationMode: 'independent_practice' }>;

function propsFor(seed: number, presentationMode: 'worked_example'): WorkedProps;
function propsFor(seed: number, presentationMode: 'guided_practice'): GuidedProps;
function propsFor(seed: number, presentationMode: 'independent_practice'): IndependentProps;
function propsFor(seed: number, presentationMode: PointwiseRateOrderingProps['presentationMode']): PointwiseRateOrderingProps {
  const variant = generateTopic12PointwiseRateOrdering(seed);
  const base = {
    prompt: variant.prompt,
    domain: [...variant.domain] as [number, number],
    range: [...variant.range] as [number, number],
    xLabel: variant.xLabel,
    yLabel: variant.yLabel,
    graphPoints: [...variant.graphPoints],
    labeledPoints: [...variant.labeledPoints],
    presentationMode,
  };

  if (presentationMode === 'worked_example') {
    const output = generateTopic12PointwiseRateOrderingOutput(seed);
    const expected = output.expectedAnswer as { orderedPointIds: string[] };
    return {
      ...base,
      orderedPointIds: expected.orderedPointIds,
      steps: [...variant.solutionSteps],
      finalAnswer: 'The least-to-greatest order is B, C, A.',
    } as WorkedProps;
  }
  if (presentationMode === 'guided_practice') {
    return {
      ...base,
      guidedSteps: [
        'Compare the local direction and steepness at each labeled point.',
        'Order the rates from least to greatest.',
      ],
      fieldHelp: 'A steeper downward graph has a smaller rate of change.',
    } as GuidedProps;
  }
  return base as IndependentProps;
}

describe('PointwiseRateOrderingActivity', () => {
  it('renders the source graph, centered axes, exact labels, and Worked ranking', () => {
    const variant = generateTopic12PointwiseRateOrdering(0);
    const props = propsFor(0, 'worked_example');
    const onSubmit = vi.fn();

    render(
      <PointwiseRateOrderingActivity
        activityId="topic-1-2.example-1.worked_example"
        mode="teaching"
        onSubmit={onSubmit}
        {...props}
      />,
    );

    expect(screen.getByText(variant.prompt)).toBeTruthy();
    expect(screen.getByRole('img', { name: /least to greatest/i })).toBeTruthy();
    expect(screen.getByTestId('pointwise-ordering-axes').getAttribute('d')).toBe('M42 80H346M194 146V14');
    expect(screen.getByText('x')).toBeTruthy();
    expect(screen.getByText('y')).toBeTruthy();

    const xScale = (x: number) => 42 + ((x + 5) / 10) * 304;
    const yScale = (y: number) => 14 + ((4 - y) / 8) * 132;
    const curveSegments = screen.getByTestId('pointwise-ordering-graph-curve').getAttribute('d')!.split(' C').slice(1);
    variant.graphPoints.slice(1).forEach((point, index) => {
      expect(curveSegments[index]?.endsWith(`${xScale(point.x)} ${yScale(point.y)}`)).toBe(true);
    });
    expect(Array.from(screen.getByTestId('pointwise-ordering-x-ticks').querySelectorAll('text'), (tick) => tick.textContent))
      .toEqual(['-5', '-3', '-1', '2.3', '5']);
    expect(Array.from(screen.getByTestId('pointwise-ordering-y-ticks').querySelectorAll('text'), (tick) => tick.textContent))
      .toEqual(['-4', '-2', '0', '2', '4']);
    for (const point of variant.labeledPoints) {
      const label = screen.getByTestId(`pointwise-ordering-label-${point.label}`);
      expect(label.textContent).toBe(point.label);
      expect(label.getAttribute('x')).toBe(String(xScale(point.x)));
      expect(label.getAttribute('y')).toBe(String(yScale(point.y)));
      expect(label.getAttribute('data-point-x')).toBe(String(point.x));
      expect(label.getAttribute('data-point-y')).toBe(String(point.y));
    }
    expect(screen.getByText('Least to greatest: B, C, A')).toBeTruthy();
    for (const step of props.steps) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(props.finalAnswer)).toBeTruthy();
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /submit/i })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a raw ordered array from Guided ranking controls', () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    render(
      <PointwiseRateOrderingActivity
        activityId="topic-1-2.example-1.guided_practice"
        mode="guided"
        onSubmit={onSubmit}
        onComplete={onComplete}
        {...propsFor(1, 'guided_practice')}
      />,
    );

    const least = screen.getByRole('combobox', { name: 'Least rate of change' }) as HTMLSelectElement;
    const middle = screen.getByRole('combobox', { name: 'Middle rate of change' }) as HTMLSelectElement;
    const greatest = screen.getByRole('combobox', { name: 'Greatest rate of change' }) as HTMLSelectElement;
    const submit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(screen.getAllByRole('combobox')).toHaveLength(3);
    expect(submit.disabled).toBe(true);

    fireEvent.change(least, { target: { value: 'A' } });
    expect(Array.from(middle.options).find((option) => option.value === 'A')?.disabled).toBe(true);
    expect(submit.disabled).toBe(true);
    fireEvent.change(middle, { target: { value: 'B' } });
    fireEvent.change(greatest, { target: { value: 'C' } });
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: 'topic-1-2.example-1.guided_practice',
      mode: 'guided_practice',
      answers: { orderedPointIds: ['A', 'B', 'C'] },
    });
    expect(payload.parts).toEqual([{ partId: 'orderedPointIds', rawAnswer: ['A', 'B', 'C'] }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
    for (const key of ['correctOptionId', 'correctAnswer', 'expectedAnswer', 'gradingMetadata', 'solution', 'slope', 'derivative']) {
      expect(payload).not.toHaveProperty(key);
    }
    expect(JSON.stringify(payload)).not.toMatch(/correct|expected|grading|score|solution|slope|derivative/i);
  });

  it('keeps Independent free of Worked or Guided data and submits a raw array', () => {
    const onSubmit = vi.fn();

    render(
      <PointwiseRateOrderingActivity
        activityId="topic-1-2.example-1.independent_practice"
        mode="practice"
        onSubmit={onSubmit}
        {...propsFor(2, 'independent_practice')}
      />,
    );

    expect(screen.queryByText(/Compare the local direction/i)).toBeNull();
    expect(screen.queryByText(/steeper downward graph/i)).toBeNull();
    expect(screen.queryByText(/Least to greatest:/i)).toBeNull();
    const submit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.change(screen.getByRole('combobox', { name: 'Least rate of change' }), { target: { value: 'C' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Middle rate of change' }), { target: { value: 'A' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Greatest rate of change' }), { target: { value: 'B' } });
    fireEvent.click(submit);

    const payload = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.answers).toEqual({ orderedPointIds: ['C', 'A', 'B'] });
    expect(payload.parts).toEqual([{ partId: 'orderedPointIds', rawAnswer: ['C', 'A', 'B'] }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
    expect(JSON.stringify(payload)).not.toMatch(/correct|expected|grading|score|solution|slope|derivative/i);
  });

  it('blocks a mismatched runtime mode', () => {
    const onSubmit = vi.fn();

    render(
      <PointwiseRateOrderingActivity
        activityId="topic-1-2.example-1.guided_practice"
        mode="guided"
        onSubmit={onSubmit}
        {...propsFor(1, 'independent_practice')}
      />,
    );

    expect(screen.getByRole('alert').textContent).toMatch(/unavailable/i);
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /submit/i })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
