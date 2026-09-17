import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const graphingCanvasProps = vi.hoisted(() => vi.fn());

vi.mock('../components/graphing/GraphingCanvas', () => ({
  GraphingCanvas: (props: {
    functions: unknown[];
    onPointAdd?: (point: { x: number; y: number }) => void;
  }) => {
    graphingCanvasProps(props);
    return (
      <div data-testid="mock-graphing-canvas">
        <button
          type="button"
          onClick={() => props.onPointAdd?.({ x: -2, y: -3 })}
        >
          Place point
        </button>
      </div>
    );
  },
}));

vi.mock('../components/graphing/InteractiveTableOfValues', () => ({
  InteractiveTableOfValues: (props: {
    onTableComplete: (points: Array<{ x: number; y: number }>) => void;
  }) => (
    <button
      type="button"
      onClick={() => props.onTableComplete([
        { x: -2, y: -3 },
        { x: -1, y: -4 },
        { x: 0, y: -3 },
        { x: 1, y: 0 },
        { x: 2, y: 5 },
      ])}
    >
      Complete table
    </button>
  ),
}));

import { GraphingExplorer } from '../components/graphing/GraphingExplorer';

const EQUATION = 'f(x) = x^2 + 2x - 3';
const ANSWER_FUNCTION = { expression: EQUATION, color: '#3b82f6' };
const TABLE_POINTS = [
  { x: -2, y: -3 },
  { x: -1, y: -4 },
  { x: 0, y: -3 },
  { x: 1, y: 0 },
  { x: 2, y: 5 },
];

afterEach(() => {
  graphingCanvasProps.mockClear();
});

describe('GraphingExplorer deferred table graph', () => {
  it.each(['guided', 'practice'] as const)(
    'conceals the answer curve in %s mode throughout table submission',
    async (mode) => {
      const onSubmit = vi.fn();
      render(
        <GraphingExplorer
          activityId={`example-1-${mode}`}
          mode={mode}
          responseVariant="table_graph"
          variant="plot_from_equation"
          equation={EQUATION}
          onSubmit={onSubmit}
        />,
      );

      expect(graphingCanvasProps).toHaveBeenCalled();
      expect(graphingCanvasProps.mock.calls[0][0].functions).toEqual([]);

      fireEvent.click(screen.getByRole('button', { name: 'Complete table' }));
      expect(graphingCanvasProps.mock.lastCall![0].functions).toEqual([]);

      fireEvent.click(screen.getByRole('button', { name: 'Place point' }));
      expect(graphingCanvasProps.mock.lastCall![0].functions).toEqual([]);

      await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Submit' })));
      expect(graphingCanvasProps.mock.lastCall![0].functions).toEqual([]);
      expect(screen.getByTestId('deferred-submission-recorded')).toBeTruthy();

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      expect(graphingCanvasProps.mock.lastCall![0].functions).toEqual([]);
      await act(async () => fireEvent.click(submitButton));
      expect(graphingCanvasProps.mock.lastCall![0].functions).toEqual([]);

      expect(onSubmit).toHaveBeenCalledTimes(2);
      expect(onSubmit.mock.calls[0][0]).toMatchObject({
        contractVersion: 'practice.v1',
        activityId: `example-1-${mode}`,
        mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
        status: 'submitted',
        answers: {
          table_values: TABLE_POINTS,
          placed_points: [{ x: -2, y: -3 }],
        },
        parts: [
          { partId: 'table_values', rawAnswer: TABLE_POINTS },
          { partId: 'placed_points', rawAnswer: [{ x: -2, y: -3 }] },
        ],
        artifact: {
          graphState: {
            equation: EQUATION,
            tableValues: TABLE_POINTS,
            placedPoints: [{ x: -2, y: -3 }],
          },
        },
      });
    },
  );

  it('keeps the answer curve in teaching mode', () => {
    render(
      <GraphingExplorer
        activityId="example-1-teaching"
        mode="teaching"
        responseVariant="table_graph"
        variant="plot_from_equation"
        equation={EQUATION}
      />,
    );

    expect(graphingCanvasProps.mock.lastCall![0].functions).toEqual([ANSWER_FUNCTION]);
  });

  it('keeps the answer curve for a non-table-graph practice variant', () => {
    render(
      <GraphingExplorer
        activityId="example-1-practice"
        mode="practice"
        responseVariant="quadratic_features"
        variant="plot_from_equation"
        equation={EQUATION}
      />,
    );

    expect(graphingCanvasProps.mock.lastCall![0].functions).toEqual([ANSWER_FUNCTION]);
  });
});
