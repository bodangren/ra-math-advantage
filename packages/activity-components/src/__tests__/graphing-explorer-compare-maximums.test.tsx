import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GraphingExplorerActivityProps } from '../components/graphing/GraphingExplorerActivity';

vi.mock('../components/graphing/GraphingCanvas', () => ({
  GraphingCanvas: ({
    functions,
    points,
    readonly,
  }: {
    functions?: unknown[];
    points?: unknown[];
    readonly?: boolean;
  }) => (
    <div
      data-testid="graphing-canvas"
      data-functions={JSON.stringify(functions ?? [])}
      data-points={JSON.stringify(points ?? [])}
      data-readonly={String(readonly ?? false)}
    />
  ),
}));

import { GraphingExplorerActivity } from '../components/graphing/GraphingExplorerActivity';

const firstEquation = 'y = -x^2 + 6x - 4';
const secondEquation = 'y = -3x^2 + 6x - 1';
const comparisonQuestion = 'The graph of f(x) is shown. Function g has a y-intercept of -1 and a vertex at (1, 2). Which function has the greater maximum value?';

const validCompareMaximumsProps: Omit<GraphingExplorerActivityProps, 'activityId' | 'mode'> = {
  equation: firstEquation,
  variant: 'compare_functions',
  responseVariant: 'compare_maximums' as GraphingExplorerActivityProps['responseVariant'],
  comparisonEquation: secondEquation,
  comparisonQuestion,
  comparisonAnswer: 'first',
  vertex: [1, 2],
  yIntercept: [0, -1],
  domain: [-2, 6],
  range: [-6, 8],
};

describe('GraphingExplorerActivity compare_maximums response', () => {
  it('renders the source-aligned teaching comparison', () => {
    render(
      <GraphingExplorerActivity
        {...validCompareMaximumsProps}
        activityId="graphing:compare-maximums-teaching"
        mode="teaching"
      />,
    );

    expect(screen.getByText('Compare Maximum Values')).toBeTruthy();
    expect(screen.getByText(comparisonQuestion)).toBeTruthy();

    const canvases = screen.getAllByTestId('graphing-canvas');
    expect(canvases).toHaveLength(2);
    expect(canvases[0].previousElementSibling?.textContent).toBe('Graph of f(x)');
    expect(canvases[1].previousElementSibling?.textContent).toBe('Completed graph of g(x)');
    expect(canvases.map(canvas => canvas.getAttribute('data-readonly'))).toEqual(['true', 'true']);
    expect(JSON.parse(canvases[0].getAttribute('data-functions') ?? '[]')).toEqual([
      { expression: firstEquation, color: '#3b82f6' },
    ]);
    expect(JSON.parse(canvases[1].getAttribute('data-functions') ?? '[]')).toEqual([
      { expression: secondEquation, color: '#ef4444' },
    ]);
    expect(JSON.parse(canvases[1].getAttribute('data-points') ?? '[]').map(({ x, y }: { x: number; y: number }) => ({ x, y }))).toEqual([
      { x: 1, y: 2 },
      { x: 0, y: -1 },
      { x: 2, y: -1 },
    ]);

    expect(Array.from(document.querySelectorAll('ol li')).map(step => step.textContent)).toEqual([
      'From the graph, f(x) has a maximum value of 5.',
      'The vertex of g is (1, 2), so its axis of symmetry is x = 1.',
      'Plot the y-intercept (0, -1). Reflect it across x = 1 to get (2, -1).',
      'Connect the three points with a smooth downward-opening curve. The maximum value of g is 2.',
      'Since 5 > 2, f(x) has the greater maximum value.',
    ]);

    expect(screen.queryByText(firstEquation)).toBeNull();
    expect(screen.queryByText(secondEquation)).toBeNull();
    expect(document.querySelector('table')).toBeNull();
    expect(document.querySelector('input[type="radio"]')).toBeNull();
    expect(screen.queryByText('Submit answer')).toBeNull();
  });

  it('teaches the second function when it has the greater maximum', () => {
    render(
      <GraphingExplorerActivity
        activityId="graphing:compare-maximums-second"
        mode="teaching"
        equation="y = -x^2 + 4x - 2"
        variant="compare_functions"
        responseVariant={'compare_maximums' as GraphingExplorerActivityProps['responseVariant']}
        comparisonEquation="y = -3x^2 + 6x + 2"
        comparisonQuestion="The graph of f(x) is shown. Function g has a y-intercept of 2 and a vertex at (1, 5). Which function has the greater maximum value?"
        comparisonAnswer="second"
        vertex={[1, 5]}
        yIntercept={[0, 2]}
        domain={[-2, 6]}
        range={[-4, 8]}
      />,
    );

    expect(screen.getByText('Since 2 < 5, g(x) has the greater maximum value.')).toBeTruthy();
  });

  const invalidInputs: Array<[string, Partial<GraphingExplorerActivityProps>]> = [
    ['missing comparison equation', { comparisonEquation: undefined }],
    ['missing comparison question', { comparisonQuestion: undefined }],
    ['missing comparison answer', { comparisonAnswer: undefined }],
    ['missing vertex', { vertex: undefined }],
    ['missing y-intercept', { yIntercept: undefined }],
    ['non-quadratic first equation', { equation: 'y = 2x + 1' }],
    ['upward first equation', { equation: 'y = x^2 - 2x + 1' }],
    ['non-quadratic second equation', { comparisonEquation: 'y = 2x + 1' }],
    ['upward second equation', { comparisonEquation: 'y = x^2 - 2x + 1' }],
  ];

  it.each(invalidInputs)('shows unavailable status for %s', (_label, overrides) => {
    render(
      <GraphingExplorerActivity
        {...validCompareMaximumsProps}
        {...overrides}
        activityId="graphing:compare-maximums-invalid"
        mode="teaching"
      />,
    );

    expect(screen.getByText('Compare-maximum activity is unavailable until valid source data is provided.')).toBeTruthy();
  });

  it('renders the exact Guided compare_maximums student contract', async () => {
    let resolveSubmission: (() => void) | undefined;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    }));
    const onComplete = vi.fn();

    render(
      <GraphingExplorerActivity
        {...validCompareMaximumsProps}
        activityId="graphing:compare-maximums-guided"
        mode="guided"
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByText(comparisonQuestion)).toBeTruthy();
    expect(screen.getByText('Find the highest point on the graph for f. Use the y-coordinate of g\'s vertex as its maximum.')).toBeTruthy();
    const canvases = screen.getAllByTestId('graphing-canvas');
    expect(canvases).toHaveLength(1);
    expect(canvases[0].getAttribute('data-readonly')).toBe('true');
    expect(JSON.parse(canvases[0].getAttribute('data-functions') ?? '[]')).toEqual([
      { expression: firstEquation, color: '#3b82f6' },
    ]);
    expect(JSON.parse(canvases[0].getAttribute('data-points') ?? '[]')).toEqual([]);
    expect(screen.getByText('Vertex of g: (1, 2)')).toBeTruthy();
    expect(screen.getByText('Y-intercept of g: (0, -1)')).toBeTruthy();
    expect(document.querySelectorAll('input[type="radio"]')).toHaveLength(2);
    expect(screen.getByLabelText('f(x)')).toBeTruthy();
    expect(screen.getByLabelText('g(x)')).toBeTruthy();
    expect(document.querySelectorAll('button')).toHaveLength(1);
    const guidedSubmitButton = screen.getByText('Submit answer') as HTMLButtonElement;
    expect(guidedSubmitButton.disabled).toBe(true);
    expect(screen.queryByText(firstEquation)).toBeNull();
    expect(screen.queryByText(secondEquation)).toBeNull();
    expect(document.querySelector('table')).toBeNull();
    expect(document.querySelector('input[type="number"]')).toBeNull();
    expect(screen.queryByText('Show hint')).toBeNull();
    expect(screen.queryByText(/correct|incorrect|solution/i)).toBeNull();

    fireEvent.click(screen.getByLabelText('f(x)'));
    expect(guidedSubmitButton.disabled).toBe(false);
    fireEvent.click(guidedSubmitButton);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const payload = (onSubmit.mock.calls[0] as unknown as [Record<string, unknown>])[0];
    expect(Object.keys(payload).sort()).toEqual([
      'activityId',
      'answers',
      'attemptNumber',
      'contractVersion',
      'mode',
      'parts',
      'status',
      'submittedAt',
    ].sort());
    expect(payload.contractVersion).toBe('practice.v1');
    expect(payload.activityId).toBe('graphing:compare-maximums-guided');
    expect(payload.mode).toBe('guided_practice');
    expect(payload.status).toBe('submitted');
    expect(payload.attemptNumber).toBe(1);
    expect(payload.answers).toEqual({ greater_maximum: 'first' });
    expect(payload.parts).toEqual([{ partId: 'greater_maximum', rawAnswer: 'first' }]);
    expect(payload.submittedAt).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/));
    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.queryByText(/correct|incorrect|solution/i)).toBeNull();

    resolveSubmission?.();
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });

  it('renders the exact Independent compare_maximums student contract and stays incomplete on rejection', async () => {
    const onSubmit = vi.fn(() => Promise.reject(new Error('storage rejected')));
    const onComplete = vi.fn();

    render(
      <GraphingExplorerActivity
        {...validCompareMaximumsProps}
        activityId="graphing:compare-maximums-independent"
        mode="practice"
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByText(comparisonQuestion)).toBeTruthy();
    expect(screen.queryByText('Find the highest point on the graph for f. Use the y-coordinate of g\'s vertex as its maximum.')).toBeNull();
    const canvases = screen.getAllByTestId('graphing-canvas');
    expect(canvases).toHaveLength(1);
    expect(canvases[0].getAttribute('data-readonly')).toBe('true');
    expect(JSON.parse(canvases[0].getAttribute('data-functions') ?? '[]')).toEqual([
      { expression: firstEquation, color: '#3b82f6' },
    ]);
    expect(JSON.parse(canvases[0].getAttribute('data-points') ?? '[]')).toEqual([]);
    expect(screen.getByText('Vertex of g: (1, 2)')).toBeTruthy();
    expect(screen.getByText('Y-intercept of g: (0, -1)')).toBeTruthy();
    expect(document.querySelectorAll('input[type="radio"]')).toHaveLength(2);
    expect(screen.getByLabelText('f(x)')).toBeTruthy();
    expect(screen.getByLabelText('g(x)')).toBeTruthy();
    expect(document.querySelectorAll('button')).toHaveLength(1);
    const independentSubmitButton = screen.getByText('Submit answer') as HTMLButtonElement;
    expect(independentSubmitButton.disabled).toBe(true);
    expect(screen.queryByText(firstEquation)).toBeNull();
    expect(screen.queryByText(secondEquation)).toBeNull();
    expect(document.querySelector('table')).toBeNull();
    expect(document.querySelector('input[type="number"]')).toBeNull();
    expect(screen.queryByText('Show hint')).toBeNull();
    expect(screen.queryByText(/correct|incorrect|solution/i)).toBeNull();

    fireEvent.click(screen.getByLabelText('g(x)'));
    fireEvent.click(independentSubmitButton);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const payload = (onSubmit.mock.calls[0] as unknown as [Record<string, unknown>])[0];
    expect(Object.keys(payload).sort()).toEqual([
      'activityId',
      'answers',
      'attemptNumber',
      'contractVersion',
      'mode',
      'parts',
      'status',
      'submittedAt',
    ].sort());
    expect(payload.contractVersion).toBe('practice.v1');
    expect(payload.activityId).toBe('graphing:compare-maximums-independent');
    expect(payload.mode).toBe('independent_practice');
    expect(payload.status).toBe('submitted');
    expect(payload.attemptNumber).toBe(1);
    expect(payload.answers).toEqual({ greater_maximum: 'second' });
    expect(payload.parts).toEqual([{ partId: 'greater_maximum', rawAnswer: 'second' }]);
    expect(payload.submittedAt).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('preserves the generic compare_functions path when compare_maximums is absent', () => {
    render(
      <GraphingExplorerActivity
        activityId="graphing:compare-functions"
        mode="practice"
        equation={firstEquation}
        variant="compare_functions"
        comparisonEquation={secondEquation}
        comparisonQuestion={comparisonQuestion}
        comparisonAnswer="first"
      />,
    );

    expect(screen.getByText('Compare the Functions')).toBeTruthy();
    expect(document.querySelectorAll('input[type="radio"]')).toHaveLength(2);
    expect(screen.getByText(`First function: ${firstEquation}`)).toBeTruthy();
    expect(screen.getByText(`Second function: ${secondEquation}`)).toBeTruthy();
  });
});
