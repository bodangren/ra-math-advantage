import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GraphingCanvasProps, Point } from '@math-platform/graphing-core/canvas-utils';

const { graphingCanvasSpy } = vi.hoisted(() => ({ graphingCanvasSpy: vi.fn() }));

vi.mock('../components/graphing/GraphingCanvas', () => ({
  GraphingCanvas: (props: GraphingCanvasProps) => {
    graphingCanvasSpy(props);
    return (
      <div data-testid="symmetry-graph-canvas">
        {[0, 1, 2, 3].map(index => (
          <button
            key={`add-${index}`}
            data-testid={`symmetry-graph-canvas-add-${index}`}
            type="button"
            onClick={() => props.onPointAdd?.({ x: index, y: index + 1 })}
          >
            Place point {index + 1}
          </button>
        ))}
        {props.points?.map((point, index) => (
          <button
            key={point.label ?? `${point.x}-${point.y}`}
            data-testid={`symmetry-graph-canvas-remove-${index}`}
            type="button"
            onClick={() => props.onPointRemove?.(point.label ?? '')}
          >
            Remove point {index + 1}
          </button>
        ))}
      </div>
    );
  },
}));

import { GraphingExplorerActivity } from '../components/graphing/GraphingExplorerActivity';

const WORKED_PROPS = {
  activityId: 'activities:symmetry-worked',
  mode: 'teaching' as const,
  equation: 'g(x) = -3x^2 + 6x - 1',
  vertex: [1, 2] as [number, number],
  yIntercept: [0, -1] as [number, number],
  domain: [-3, 5] as [number, number],
  range: [-10, 5] as [number, number],
  responseVariant: 'symmetry_graph' as const,
};

describe('GraphingExplorerActivity symmetry graph response', () => {
  it('shows an unavailable state when symmetry inputs are missing', () => {
    render(
      <GraphingExplorerActivity
        activityId="activities:symmetry-missing-input"
        mode="guided"
        responseVariant="symmetry_graph"
      />,
    );

    expect(screen.getByText('Symmetry graph activity is unavailable until vertex and y-intercept are provided.')).toBeTruthy();
    expect(screen.queryByTestId('symmetry-graph-canvas')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Submit graph' })).toBeNull();
  });

  it('renders the read-only Worked graph with the exact symmetry steps', () => {
    render(<GraphingExplorerActivity {...WORKED_PROPS} />);

    expect(screen.getByText('Graph by Using Symmetry')).toBeTruthy();
    expect(screen.getByText('Vertex: (1, 2)')).toBeTruthy();
    expect(screen.getByText('Y-intercept: (0, -1)')).toBeTruthy();
    expect(screen.getByText('Plot the vertex at (1, 2) and use the axis of symmetry x = 1.')).toBeTruthy();
    expect(screen.getByText('Plot the y-intercept at (0, -1).')).toBeTruthy();
    expect(screen.getByText('Reflect (0, -1) across x = 1 to get (2, -1).')).toBeTruthy();
    expect(screen.getByText('Draw the downward-opening parabola through (1, 2), (0, -1), and (2, -1).')).toBeTruthy();
    expect(screen.getByText('(0, -1) and (2, -1) are equally far from x = 1.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Submit graph' })).toBeNull();

    const canvasProps = graphingCanvasSpy.mock.calls.at(-1)?.[0] as GraphingCanvasProps;
    expect(canvasProps.functions).toEqual([
      { expression: WORKED_PROPS.equation, color: '#3b82f6' },
    ]);
    expect(canvasProps.points).toEqual([
      { x: 1, y: 2 },
      { x: 0, y: -1 },
      { x: 2, y: -1 },
    ]);
    expect(canvasProps.readonly).toBe(true);
  });

  it.each([
    ['Guided', 'guided' as const],
    ['practice', 'practice' as const],
  ])('renders %s symmetry graph input without equation text', (label, mode) => {
    render(
      <GraphingExplorerActivity
        activityId={`activities:symmetry-${label.toLowerCase()}`}
        mode={mode}
        equation="y = -x^2 + 4x - 1"
        vertex={[2, 3]}
        yIntercept={[0, -1]}
        domain={[-3, 7]}
        range={[-10, 6]}
        responseVariant="symmetry_graph"
      />,
    );

    expect(screen.getByText('Graph by Using Symmetry')).toBeTruthy();
    expect(screen.getByText('Vertex: (2, 3)')).toBeTruthy();
    expect(screen.getByText('Y-intercept: (0, -1)')).toBeTruthy();
    expect(screen.queryByText('y = -x^2 + 4x - 1')).toBeNull();
    expect(screen.getByText('Plot the vertex, the y-intercept, and its reflection across the axis of symmetry.')).toBeTruthy();
    if (label === 'Guided') {
      expect(screen.getByText('Reflect the y-intercept across the axis of symmetry x = 2.')).toBeTruthy();
    } else {
      expect(screen.queryByText('Reflect the y-intercept across the axis of symmetry x = 2.')).toBeNull();
    }

    const canvasProps = graphingCanvasSpy.mock.calls.at(-1)?.[0] as GraphingCanvasProps;
    expect(canvasProps.functions).toEqual([]);
    expect(canvasProps.points).toEqual([]);
    expect(canvasProps.readonly).toBe(false);
    expect(canvasProps.snapToGrid).toBe(true);
    expect((screen.getByRole('button', { name: 'Submit graph' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it.each([
    ['Guided', 'guided' as const, 'guided_practice' as const],
    ['practice', 'practice' as const, 'independent_practice' as const],
  ])('submits the exact %s placed-points envelope and completes after storage', async (_label, mode, envelopeMode) => {
    let resolveSubmission: (() => void) | undefined;
    const onSubmit = vi.fn<(payload: unknown) => Promise<void>>(() => new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    }));
    const onComplete = vi.fn();
    const activityId = `activities:symmetry-envelope-${mode}`;

    render(
      <GraphingExplorerActivity
        activityId={activityId}
        mode={mode}
        equation="y = -x^2 + 4x - 1"
        vertex={[2, 3]}
        yIntercept={[0, -1]}
        domain={[-3, 7]}
        range={[-10, 6]}
        responseVariant="symmetry_graph"
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByTestId('symmetry-graph-canvas-add-0'));
    fireEvent.click(screen.getByTestId('symmetry-graph-canvas-add-1'));
    fireEvent.click(screen.getByTestId('symmetry-graph-canvas-add-2'));
    expect((screen.getByRole('button', { name: 'Submit graph' }) as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(screen.getByTestId('symmetry-graph-canvas-remove-0'));
    expect((screen.getByRole('button', { name: 'Submit graph' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByTestId('symmetry-graph-canvas-add-3'));
    fireEvent.click(screen.getByTestId('symmetry-graph-canvas-add-3'));
    const latestCanvasCall = graphingCanvasSpy.mock.calls[graphingCanvasSpy.mock.calls.length - 1];
    expect(latestCanvasCall).toBeDefined();
    expect((latestCanvasCall[0] as GraphingCanvasProps).points).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: 'Submit graph' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0]).toEqual({
      contractVersion: 'practice.v1',
      activityId,
      mode: envelopeMode,
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: { placed_points: expect.any(Array) },
      parts: [{ partId: 'placed_points', rawAnswer: expect.any(Array) }],
      artifact: {
        graphState: {
          equation: 'y = -x^2 + 4x - 1',
          vertex: [2, 3],
          yIntercept: [0, -1],
          placedPoints: expect.any(Array),
          domain: [-3, 7],
          range: [-10, 6],
        },
      },
    });
    const payload = onSubmit.mock.calls[0][0] as Record<string, unknown>;
    const answers = payload.answers as { placed_points: Point[] };
    const parts = payload.parts as Array<{ rawAnswer: Point[] }>;
    expect(answers.placed_points).toEqual(parts[0].rawAnswer);
    expect(answers.placed_points).toHaveLength(3);
    expect(payload).not.toHaveProperty('score');
    expect(payload).not.toHaveProperty('maxScore');
    expect(parts[0]).not.toHaveProperty('isCorrect');
    expect(onComplete).not.toHaveBeenCalled();

    resolveSubmission?.();
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  });

  it('does not complete when symmetry graph storage rejects', async () => {
    const onSubmit = vi.fn<() => Promise<void>>(() => Promise.reject(new Error('storage failed')));
    const onComplete = vi.fn();

    render(
      <GraphingExplorerActivity
        activityId="activities:symmetry-rejected"
        mode="practice"
        vertex={[2, 3]}
        yIntercept={[0, -1]}
        responseVariant="symmetry_graph"
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByTestId('symmetry-graph-canvas-add-0'));
    fireEvent.click(screen.getByTestId('symmetry-graph-canvas-add-1'));
    fireEvent.click(screen.getByTestId('symmetry-graph-canvas-add-2'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit graph' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onComplete).not.toHaveBeenCalled();
  });
});
